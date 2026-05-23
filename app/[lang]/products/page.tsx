import { ProductsClient } from './ProductsClient'
import { getLocaleLocationData, getCountryGeoCoordinates } from '@/i18n/location-utils'
import { generateLocalizedStaticParams } from '@/i18n/routing'
import type { Metadata } from 'next';
import Head from 'next/head';
import { EnhancedProduct, enhanceProducts } from '@/lib/product-enhancement';
import { getProductsForListView } from '@/lib/optimized-products';
import { generateProductListSchema, buildCanonicalOrgSchema, countryCodeMap, getEnglishCountryName } from '@/lib/json-ld';
import FAQDisplay from '@/components/content/FAQDisplay'
import { Suspense } from 'react';
import config from '@/i18n/config';
import { getHomeData } from '@/app/[lang]/utils/page-data';
import RoleGuard from '@/components/RoleGuard';

export const dynamic = 'force-static';
export const revalidate = false;

export async function generateStaticParams() {
  return generateLocalizedStaticParams();
}

// --- HARDCODED B2B DATA (Replaces Supabase Calls) ---

const mockSiteSettings = {
  locales: ['en', 'de'],
  locale_addresses: {
    en: { address: '123 Pharma Logistics Way, Berlin, Germany' },
    de: { address: 'Pharma-Logistik-Weg 123, Berlin, Deutschland' }
  }
};

const getCategories = (locale: string) => {
  const isDe = locale === 'de';
  return [
    { id: 'all', slug: 'all', name: isDe ? 'Alle Chargen' : 'All Batches' },
    { id: 'flower', slug: 'flower', name: isDe ? 'Medizinische Blüten' : 'Medical Flower', category_image: null },
    { id: 'non-irradiated', slug: 'non-irradiated', name: isDe ? 'Unbestrahlt' : 'Non-Irradiated', category_image: null },
    { id: 'irradiated', slug: 'irradiated', name: isDe ? 'Bestrahlt' : 'Irradiated', category_image: null },
    { id: 'high-thc', slug: 'high-thc', name: 'High THC (>22%)', category_image: null },
    { id: 'balanced', slug: 'balanced', name: isDe ? 'Ausgeglichen (THC/CBD)' : 'Balanced (THC/CBD)', category_image: null }
  ];
};

const getFaqContent = (locale: string) => {
  const isDe = locale === 'de';
  return {
    title: isDe ? 'Häufig gestellte Fragen (BtM & MedCanG)' : 'Frequently Asked Questions (BtM & MedCanG)',
    faqs: isDe ? [
      { 
        id: 'faq-msv3', 
        question: 'Wie funktioniert die Bestellung über MSV3?', 
        answer: 'Unsere Plattform unterstützt den direkten Export von MSV3-Bestelldateien zur nahtlosen Integration in Ihr Apothekenmanagementsystem.' 
      },
      { 
        id: 'faq-gmp', 
        question: 'Sind alle Chargen GMP-zertifiziert?', 
        answer: 'Ja. Jede Charge enthält ein herunterladbares Certificate of Analysis (CoA) und ist vollständig GDP/GMP-konform.' 
      },
      { 
        id: 'faq-btm', 
        question: 'Welche BtM-Dokumentation ist erforderlich?', 
        answer: 'Bitte verifizieren Sie Ihre Apothekenerlaubnis und MedCanG-Nummer beim Checkout.' 
      }
    ] : [
      { 
        id: 'faq-msv3', 
        question: 'How does MSV3 ordering work?', 
        answer: 'Our platform supports direct export of MSV3 order files for seamless integration into your pharmacy management system.' 
      },
      { 
        id: 'faq-gmp', 
        question: 'Are all batches GMP certified?', 
        answer: 'Yes. Every batch includes a downloadable Certificate of Analysis (CoA) and is fully GDP/GMP compliant.' 
      },
      { 
        id: 'faq-btm', 
        question: 'What documentation is required?', 
        answer: 'Please verify your pharmacy license and MedCanG number at checkout.' 
      }
    ]
  };
};

// --- METADATA GENERATION ---

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale = lang;
  const { dict } = await getHomeData(lang);
  const t = dict.Metadata.products;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.yourb2bportal.com';

  let translatedProductsPath = '/products';
  try {
    const productsPathMap = config.pathnames['/products'] as Record<string, string>;
    if (productsPathMap && productsPathMap[locale]) {
      translatedProductsPath = productsPathMap[locale];
    }
  } catch (e) {
    console.error('Error accessing translated path:', e);
  }

  const canonicalUrl = `${siteUrl}/${locale}${translatedProductsPath.startsWith('/') ? '' : '/'}${translatedProductsPath}`;

  const languageAlternates: Record<string, string> = {};
  mockSiteSettings.locales.forEach((localeCode: string) => {
    let alternatePath = '/products';
    const productsPathMap = config.pathnames['/products'] as Record<string, string>;
    if (productsPathMap && productsPathMap[localeCode]) {
      alternatePath = productsPathMap[localeCode];
    }
    languageAlternates[localeCode] = `${siteUrl}/${localeCode}${alternatePath.startsWith('/') ? '' : '/'}${alternatePath}`;
  });

  return {
    title: t.title,
    description: t.description,
    keywords: t.keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: languageAlternates
    },
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      url: canonicalUrl,
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: t.twitterTitle,
      description: t.twitterDescription
    },
    authors: { name: "B2B RegTech Architect" }
  };
}

// --- MAIN COMPONENT ---

interface ProductsPageProps {
  params: Promise<{ lang: string }>;
}

export default async function ProductsPage(props: ProductsPageProps) {
  const params = await props.params;
  const { lang } = params;
  const locale = lang;

  // 1. Load Hardcoded Data
  const { dict } = await getHomeData(lang);
  const categories = getCategories(locale);
  const faqContent = getFaqContent(locale);
  const siteSettings = mockSiteSettings;

  // 2. Fetch Products (Now uses mock-data.ts, zero latency)
  const [allProducts, locationData] = await Promise.all([
    getProductsForListView(locale, 100), 
    getLocaleLocationData(locale),
  ]);

  const faqData = faqContent.faqs;
  const faqTitle = faqContent.title;
  const vatNumber = ''; 
  const t = dict.productsClient;

  // 3. Category Mapping
  const categoryMap: Record<string, string> = {};
  allProducts.forEach(product => {
    if (product.processedCategories) {
      product.processedCategories.forEach((cat: any) => {
        categoryMap[cat.originalSlug] = cat.name;
      });
    }
  });

  categories.forEach((cat: any) => {
    if (!categoryMap[cat.slug]) categoryMap[cat.slug] = cat.name;
  });

  const enhancedAllProducts: EnhancedProduct[] = await enhanceProducts(allProducts, lang, categoryMap);

  // 4. Schema org logic
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.yourb2bportal.com';
  const englishCountryName = await getEnglishCountryName(locationData.country, locale, dict as any);
  const countryCode = countryCodeMap[englishCountryName] || 'DE'; // Default to DE for cannabis market
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

  const productListSchema = await generateProductListSchema({
    products: allProducts as any,
    locale,
    siteSettings,
    locationData,
    dict: dict as any,
    mainEntityOfPageId: canonicalOrgSchema['@id']
  });

  const jsonLdGraph = {
    '@context': 'https://schema.org',
    '@graph': [canonicalOrgSchema, productListSchema],
  };

  const optimisedDict = {
    productGrid: dict.productGrid,
    productsClient: dict.productsClient,
    cart: { checkout: { processing: dict.cart.checkout.processing } }
  }

  return (
    <RoleGuard allowedRoles={['verified_pharmacy', 'medical_doctor']} dict={dict.roleGuard}>
      <div className="min-h-screen max-w-screen bg-slate-50">

      <Head>      
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }}
        />
      </Head>

      <div className="relative w-full bg-white border-b border-slate-200">
        <div className="relative h-full flex flex-col items-center justify-center mx-auto py-8">

          <div className='my-4 text-center'>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 whitespace-nowrap">
              {t.catalogTitle}
            </h2>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="tracking-wide uppercase text-slate-500 text-xs font-medium">
                  {t.showingProducts.replace('{count}', String(allProducts.length))}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <Suspense fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <div id="products-grid" className="w-full mx-auto py-6 px-4 sm:px-6">
          <ProductsClient
            allProducts={enhancedAllProducts}
            categories={categories.map((cat: any) => ({ id: cat.slug, name: categoryMap[cat.slug] || cat.name, slug: cat.slug }))}
            initialSearchTerm=""
            lang={locale}
            dict={optimisedDict as any}
            vatNumber={vatNumber}
          />
        </div>
      </Suspense>

      {faqData && faqData.length > 0 && (
        <Suspense fallback={<div className="h-40 animate-pulse bg-white" />}>
          <section className="py-20 px-4 bg-white border-t border-slate-200">
            <FAQDisplay
              faqs={faqData}
              lang={lang}
              title={faqTitle}
            />
          </section>
        </Suspense>
      )}

      </div>
    </RoleGuard>
  )
}
