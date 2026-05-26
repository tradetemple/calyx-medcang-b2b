/* eslint-disable @typescript-eslint/no-explicit-any */
import { Metadata } from 'next'
import Head from 'next/head';
import { calculatePriceInfo } from './utils'
import { redirect } from 'next/navigation'
import { handleUuidRedirect } from '@/app/[lang]/utils/redirectUtils'
import { MedicalProduct, PriceChart } from '@/types/medical-product'
import { getProductDetailsBySlug } from '@/lib/optimized-products';
import { cache } from 'react';
import config from '@/i18n/config';
import { formatCurrency, getCurrencyFromLocale } from '@/i18n/utils';
import { getHomeData } from '@/app/[lang]/utils/page-data';
import RoleGuard from '@/components/RoleGuard';

// Shared cache for the request lifecycle
const getSharedProduct = cache(async (locale: string, slug: string) => {
  return await getProductDetailsBySlug(locale, slug);
});

// ISR Configuration - Static generation
export const dynamic = 'force-static';
export const revalidate = false;

// --- HARDCODED B2B DATA ---
const mockSiteSettings = {
  site_name: 'B2B Pharma Portal',
  locales: ['en', 'de'],
  currency_conversion_rates: { EUR: 1, GBP: 0.85 },
  locale_addresses: {
    en: { address: '123 Pharma Logistics Way, Berlin, Germany' },
    de: { address: 'Pharma-Logistik-Weg 123, Berlin, Deutschland' }
  },
  shipping_countries: ['DE'],
  primary_color: '#0f172a',
  is_b2b: true
};

export async function generateMetadata(props: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const params = await Promise.resolve(props.params);
  const { lang } = params;
  const slug = decodeURIComponent(params.slug); 
  const locale = lang;

  const productPromise = getSharedProduct(lang, slug);
  const locationPromise = getLocaleLocationData(lang);

  const [product, locationData] = await Promise.all([productPromise, locationPromise]);

  const redirectSlug = await handleUuidRedirect({ slug, lang }, 'products');
  if (redirectSlug) {
    return {};
  }

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found'
    }
  }

  const { dict } = await getHomeData(lang);
  const t = dict.Metadata;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.yourb2bportal.com';
  const currency = getCurrencyFromLocale(locale);
  const rates = mockSiteSettings.currency_conversion_rates as Record<string, number>;
  const rate = rates[currency] || 1;
  const isKgPrice = product.kg_price !== false;

  const { price: calculatedBasePrice } = calculatePriceInfo(
    product.price_chart as PriceChart | null,
    product.price_per_kg || 0,
    isKgPrice
  );
  const convertedPrice = calculatedBasePrice * rate;
  const priceFormatted = formatCurrency(convertedPrice, locale, currency);

  const title = product.seo_title || product.name;
  let description = product.seo_description || product.description || '';

  description = `${description} ${t.productMetadataDescription
    .replace('{price}', priceFormatted)
    .replace('{cities}', locationData.formattedCities)
    .replace('{country}', locationData.country)}`;

  const categoryName = product.category || (locale === 'de' ? 'Medizinische Blüten' : 'Medical Flower');
  const keywords = product.seo_keywords || `${product.name}, premium, medical cannabis, wholesale, ${categoryName}`;

  const languageAlternates: Record<string, string> = {};
  if (mockSiteSettings.locales && Array.isArray(mockSiteSettings.locales)) {
    const translationMap: Record<string, string> = {};
    if (product.translations && Array.isArray(product.translations)) {
      product.translations.forEach((t: any) => {
        if (t.slug) translationMap[t.locale] = t.slug;
      });
    }
    translationMap['en'] = product.slug;

    const i18nConfig = await import('@/i18n/config');
    const pathnames = i18nConfig.default.pathnames;

    mockSiteSettings.locales.forEach((localeCode: string) => {
      const translatedSlug = translationMap[localeCode] || product.slug;
      let translatedProductsPath = '/products';
      try {
        const productsPathMap = pathnames['/products/[slug]'] as Record<string, string>;
        if (productsPathMap && productsPathMap[localeCode]) {
          translatedProductsPath = productsPathMap[localeCode];
        }
      } catch (e) {
        console.error('Error accessing translated path:', e);
      }
      const finalPath = translatedProductsPath.replace('[slug]', translatedSlug);
      languageAlternates[localeCode] = `${siteUrl}/${localeCode}${finalPath.startsWith('/') ? '' : '/'}${finalPath}`;
    });
  }

  let canonicalPath = `/products/${slug}`;
  try {
    const pathnames = (await import('@/i18n/config')).default.pathnames;
    const productsPathMap = pathnames['/products/[slug]'] as Record<string, string>;
    if (productsPathMap && productsPathMap[locale]) {
      canonicalPath = productsPathMap[locale].replace('[slug]', slug);
      if (!canonicalPath.startsWith('/')) {
        canonicalPath = '/' + canonicalPath;
      }
    }
  } catch (e) {
    console.error('Error generating canonical URL:', e);
  }

  canonicalPath = `/${locale}${canonicalPath}`;

  const metadataAuthors = [{ name: mockSiteSettings.site_name }];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `${siteUrl}${canonicalPath.startsWith('/') ? '' : '/'}${canonicalPath}`,
      languages: languageAlternates
    },
    openGraph: {
      title,
      description,
      type: 'website',
      images: [
        {
          url: product.product_image || '/default-product-image.jpg',
          width: 500,
          height: 500,
          alt: product.name
        }
      ],
      url: `${siteUrl}${canonicalPath.startsWith('/') ? '' : '/'}${canonicalPath}`
    },
    authors: metadataAuthors
  }
}

// Imports for UI
import ProductHero from './components/ProductHero';
import BelowFoldContent from './components/BelowFoldContent';
import { getLocaleLocationData, getCountryGeoCoordinates } from '@/i18n/location-utils';
import { getSimilarProducts } from '@/lib/optimized-products';
import { enhanceProducts, EnhancedProduct } from '@/lib/product-enhancement';
import { buildCanonicalOrgSchema, generateProductSchema, countryCodeMap, getEnglishCountryName, combineSchemas } from '@/lib/json-ld';
import dynamicImport from 'next/dynamic';
import MobileStickyPurchase from './components/MobileStickyPurchase';

const ProductPurchaseSection = dynamicImport(() => import('./components/ProductPurchaseSection'), {
  loading: () => (
    <div className="bg-primary/10 rounded-none p-6 md:p-8 shadow-sm animate-pulse min-h-[400px]">
      <div className="space-y-4">
        <div className="h-8 bg-slate-200 rounded-none w-32"></div>
        <div className="h-12 bg-slate-200 rounded-none"></div>
        <div className="h-10 bg-slate-200 rounded-none"></div>
      </div>
    </div>
  )
});

export default async function ProductDetailPage(props: {
  params: Promise<{ lang: string; slug: string }>;
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const params = await Promise.resolve(props.params);
  const { lang } = params;
  const slug = decodeURIComponent(params.slug); 
  const locale = lang;

  const productPromise = getSharedProduct(lang, slug);
  const locationPromise = getLocaleLocationData(lang);

  const [product, locationData] = await Promise.all([
    productPromise,
    locationPromise
  ]);

  const redirectSlug = await handleUuidRedirect({ slug, lang }, 'products');
  if (redirectSlug) {
    redirect(`/${locale}/products/${redirectSlug}`);
  }

  const { dict } = await getHomeData(lang);

  if (!product) {
    redirect(`/${locale}/products/`);
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-red-500">Batch not found</div>
    </div>
  }

  const primaryCategory = product.processedCategories?.find((cat: any) => cat.isPrimary);
  const categoryId = primaryCategory?.id || null;

  const rawSimilarProducts = await getSimilarProducts(product.id, categoryId, locale, 6);
  const siteSettings = mockSiteSettings;

  const serverTranslation = locale !== 'en' ? {
    name: product.name,
    descriptive_name: product.descriptive_name || undefined,
    description: product.description || undefined,
    slug: product.slug,
    specifications: product.specifications,
    locale: locale
  } : null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.yourb2bportal.com';

  const enhanceSimilarProducts = async (productsToEnhance: MedicalProduct[], currentLocale: string): Promise<EnhancedProduct[]> => {
    const categoryMap: Record<string, string> = {};
    productsToEnhance.forEach(product => {
      if (product.processedCategories) {
        product.processedCategories.forEach((cat: any) => {
          categoryMap[cat.originalSlug] = cat.name;
        });
      }
    });
    return enhanceProducts(productsToEnhance, currentLocale, categoryMap);
  };

  const enhancedSimilarProducts = await enhanceSimilarProducts(rawSimilarProducts, locale);

  const isKgPrice = product.kg_price !== false;

  const { price, isTiered } = calculatePriceInfo(
    product.price_chart as PriceChart | null,
    product.price_per_kg || 0,
    isKgPrice
  );

  const displayCategory = product.category || (locale === 'de' ? 'Medizinische Blüten' : 'Medical Flower');
  const categorySlugForUrl = product.category?.toLowerCase() || 'flower';

  let translatedProductSlugPath = '/products/[slug]';
  try {
    const productsSlugPathMap = config.pathnames['/products/[slug]'] as Record<string, string>;
    if (productsSlugPathMap && productsSlugPathMap[locale]) {
      translatedProductSlugPath = productsSlugPathMap[locale];
    }
  } catch (e) {
    console.error('Error accessing translated path:', e);
  }

  const finalLocalizedPath = translatedProductSlugPath.replace('[slug]', (serverTranslation?.slug || slug));
  const productUrl = `${siteUrl}/${locale}${finalLocalizedPath.startsWith('/') ? '' : '/'}${finalLocalizedPath}`;

  const englishCountryName = await getEnglishCountryName(locationData.country, locale, dict as any);
  const countryCode = countryCodeMap[englishCountryName] || 'DE';
  const geoCoordinates = getCountryGeoCoordinates(englishCountryName);
  const localeAddress = (siteSettings.locale_addresses as any)?.[locale] || {};

  const canonicalSchemaOptions = {
    siteSettings,
    locationData,
    locale,
    dict: dict as any,
    siteUrl,
    countryCode,
    geoCoordinates,
    localeAddress,
  };

  const canonicalOrgSchema = buildCanonicalOrgSchema(canonicalSchemaOptions);

  const productSchema = await generateProductSchema({
    product: product as any,
    locale,
    siteSettings,
    locationData,
    dict: dict as any,
    productUrl,
    displayCategory,
    serverTranslation: serverTranslation as any,
    vatNumber: '',
    mainEntityOfPageId: canonicalOrgSchema['@id'],
    author: { display_name: "Pharma Quality Assurance", slug: "qa" } as any,
    includeFAQ: false,
    faqData: null,
  });

  const jsonLdGraph = {
    '@context': 'https://schema.org',
    '@graph': combineSchemas(
      canonicalOrgSchema,
      productSchema
    ),
  };

  // Create an empty mock reviews array
  const mockReviews: any[] = [];

  const heroSiteSettings = {
    currency_conversion_rates: siteSettings.currency_conversion_rates,
    shipping_countries: siteSettings?.shipping_countries,
    primary_color: siteSettings.primary_color,
    is_b2b: siteSettings.is_b2b
  };

  const purchaseDict = {
    productDetail: dict.productDetail
  }

  return (
    <RoleGuard allowedRoles={['verified_pharmacy', 'medical_doctor']} dict={dict.roleGuard}>
      <main className="w-full bg-white relative">

        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }}
          />
        </Head>
        
        <div className="relative max-w-7xl mx-auto bg-white pb-[200px] lg:pb-0">
            <div className="relative w-full">
              <div className="flex flex-col lg:flex-row">

                <div className="w-full lg:w-[55%] flex flex-col space-y-2 md:space-y-8">
                  <ProductHero
                    product={product}
                    translation={serverTranslation as any}
                    locale={locale}
                    t={dict as any}
                    price={price}
                    siteUrl={siteUrl}
                  />
                  
                  <div>
                    <BelowFoldContent
                      product={product as any}
                      translation={serverTranslation as any}
                      displayCategory={displayCategory}
                      categorySlugForUrl={categorySlugForUrl}
                      locale={locale}
                      reviews={mockReviews}
                      similarProducts={enhancedSimilarProducts}
                      siteSettings={heroSiteSettings}
                      vatNumber={''}
                      vatRate={0.0} 
                      isKgPrice={isKgPrice}
                      t={dict as any}
                      author={{ display_name: "Pharma QA", slug: "qa", role: "Quality Control" } as any} 
                    />
                  </div>
                </div>

                <div className="hidden lg:block lg:w-[45%] lg:border-l lg:border-slate-200 lg:py-6 lg:px-10 bg-white">
                  <div className="lg:sticky lg:top-28 lg:flex lg:flex-col lg:gap-4">
                    
                    <div>
                      <h1 className="text-2xl font-bold leading-tight text-slate-900">
                        <span className="leading-wide font-medium">
                          <span className='font-bold tracking-wide'>{serverTranslation?.name || product.name}</span> <br/>
                          <span className='text-lg text-slate-500 tracking-wide font-normal'>{serverTranslation?.descriptive_name || product.descriptive_name}</span>
                        </span>
                      </h1>
                    </div>

                    <div>
                        <ProductPurchaseSection
                          product={product}
                          translation={serverTranslation as any}
                          price={price}
                          isTiered={isTiered}
                          affiliateId={undefined}
                          isKgPrice={isKgPrice}
                          shippingRestrictionsMessage={null}
                          t={purchaseDict as any}
                          siteUrl={siteUrl}
                          locale={locale}
                          siteSettings={heroSiteSettings}
                        />
                    </div>
                  </div>
                </div>

              </div>

              <MobileStickyPurchase>
                <ProductPurchaseSection
                  product={product}
                  translation={serverTranslation as any}
                  price={price}
                  isTiered={isTiered}
                  affiliateId={undefined}
                  isKgPrice={isKgPrice}
                  shippingRestrictionsMessage={null}
                  t={purchaseDict as any}
                  siteUrl={siteUrl}
                  locale={locale}
                  siteSettings={heroSiteSettings}
                />
              </MobileStickyPurchase>
            </div>
        </div>
                      
      </main>
    </RoleGuard>
  );
}
