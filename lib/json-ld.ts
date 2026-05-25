/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCurrencyFromLocale } from '@/i18n/utils';
import { getCountryGeoCoordinates } from '@/i18n/location-utils';
import config from '@/i18n/config';
import { calculatePriceInfo } from '@/app/[lang]/products/[slug]/utils'; // Assuming this utility is universal enough

// Helper function to get the English country name based on the localized name
export async function getEnglishCountryName(localizedCountryName: string, currentLocale: string, dict: any): Promise<string> {
  if (currentLocale === 'en') return localizedCountryName;

  const countryKeys = ['United Kingdom', 'France', 'Spain', 'Germany', 'Italy', 'Sweden', 'Netherlands', 'Poland', 'Canada', 'Czechia', 'Denmark', 'Finland', 'Ireland', 'Japan', 'United States', 'Greece'];

  const tLocale: Record<string, string> = dict.countries;
  for (const key of countryKeys) {
    if (tLocale[key] === localizedCountryName) {
      return key;
    }
  }
  return 'United Kingdom'; // Default fallback
}

// ISO 3166-1 alpha-2 country code map
export const countryCodeMap: Record<string, string> = {
  'United Kingdom': 'GB',
  'France': 'FR',
  'Spain': 'ES',
  'Germany': 'DE',
  'Italy': 'IT',
  'Sweden': 'SE',
  'Netherlands': 'NL',
  'Poland': 'PL',
  'Czechia': 'CZ',
  'Denmark': 'DK',
  'Finland': 'FI',
  'Ireland': 'IE',
  'Japan': 'JP',
  'United States': 'US',
  'Canada': 'CA'
};

// Safely extract plain text from HTML content
function extractPlainText(htmlContent: string | null | undefined): string {
  if (!htmlContent) return '';
  try {
    return htmlContent
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 500);
  } catch (error) {
    console.error('Error extracting plain text:', error);
    return '';
  }
}

// Safely format a date to ISO string
function safeFormatDate(date: string | null | undefined): string {
  if (!date) return new Date().toISOString();
  try {
    return new Date(date).toISOString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return new Date().toISOString();
  }
}

// Function to get the translated path for a given pathname and locale
async function getTranslatedPath(pathname: string, locale: string): Promise<string> {
  let translatedPath = pathname;
  try {
    const pathnames = config.pathnames as Record<string, Record<string, string>>;
    if (pathnames[pathname] && pathnames[pathname][locale]) {
      translatedPath = pathnames[pathname][locale];
    }
    if (!translatedPath.startsWith('/')) {
      translatedPath = '/' + translatedPath;
    }
  } catch (e) {
    console.error(`Error accessing translated path for ${pathname}:`, e);
  }
  return translatedPath;
}

// Safe JSON stringification function
export function safeJsonStringify(obj: Record<string, any>) {
  try {
    const sanitizedObj = JSON.parse(JSON.stringify(obj));
    return JSON.stringify(sanitizedObj);
  } catch (error) {
    console.error('Failed to stringify JSON-LD:', error);
    return JSON.stringify({}); // Return empty object as fallback
  }
}

// FAQ interface for type safety
interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

// How-To interfaces for type safety
interface HowToStep {
  id: string;
  name: string;
  text: string;
  image?: string;
  url?: string;
}

interface HowToItem {
  id: string;
  name: string;
  description?: string;
  totalTime?: string;
  prepTime?: string;
  performTime?: string;
  supply?: string[];
  tool?: string[];
  steps: HowToStep[];
}

// Helper function to convert JSONB format to FAQ array (same as admin component)
function jsonbToFaqs(jsonb: any): FAQItem[] {
  if (!jsonb) return [];

  try {
    const parsed = typeof jsonb === 'string' ? JSON.parse(jsonb) : jsonb;
    if (Array.isArray(parsed)) {
      return parsed.map((item, index) => ({
        id: index.toString(),
        question: item.question || '',
        answer: item.answer || ''
      }));
    }
  } catch (error) {
    console.error('Error parsing FAQ JSONB:', error);
  }

  return [];
}

/**
 * Convert JSONB How-To data to array format
 * @param jsonb - How-To data from database (JSONB format)
 * @returns Array of How-To items
 */
function jsonbToHowTos(jsonb: any): HowToItem[] {
  if (!jsonb) return [];

  try {
    const parsed = typeof jsonb === 'string' ? JSON.parse(jsonb) : jsonb;
    if (Array.isArray(parsed)) {
      return parsed.map((item, index) => ({
        id: index.toString(),
        name: item.name || '',
        description: item.description || '',
        totalTime: item.totalTime || '',
        prepTime: item.prepTime || '',
        performTime: item.performTime || '',
        supply: item.supply || [],
        tool: item.tool || [],
        steps: (item.steps || []).map((step: any, stepIndex: number) => ({
          id: stepIndex.toString(),
          name: step.name || '',
          text: step.text || '',
          image: step.image || '',
          url: step.url || ''
        }))
      }));
    }
  } catch (error) {
    console.error('Error parsing How-To JSONB:', error);
  }

  return [];
}

/**
 * Generate FAQ JSON-LD schema from FAQ JSONB data
 * @param faqData - FAQ data from database (JSONB format)
 * @returns FAQ schema object or null if no valid FAQs
 */
function generateFAQSchema(faqData: any): Record<string, any> | null {
  if (!faqData) return null;

  const faqs = jsonbToFaqs(faqData);

  // Filter out empty FAQs
  const validFaqs = faqs.filter(faq =>
    faq.question && faq.question.trim() !== '' &&
    faq.answer && faq.answer.trim() !== ''
  );

  if (validFaqs.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: validFaqs.map(faq => ({
      '@type': 'Question',
      name: extractPlainText(faq.question),
      acceptedAnswer: {
        '@type': 'Answer',
        text: extractPlainText(faq.answer)
      }
    }))
  };
}

/**
 * Generate standalone FAQ JSON-LD schema with additional context
 * Useful for pages that are primarily FAQ pages
 */
interface GenerateStandaloneFAQSchemaOptions {
  faqData: any;
  pageUrl: string;
  pageTitle: string;
  locale: string;
  siteSettings?: any;
  locationData?: any;
}

/**
 * Utility function to combine multiple JSON-LD schemas into a single script tag
 * Filters out null schemas automatically
 */
export function combineSchemas(...schemas: (Record<string, any> | null)[]): Record<string, any>[] {
  return schemas.filter(schema => schema !== null) as Record<string, any>[];
}


interface CanonicalSchemaOptions {
  siteSettings: any;
  locationData: any;
  locale: string;
  dict: any;
  siteUrl: string;
  countryCode: string;
  geoCoordinates: { latitude: number; longitude: number };
  localeAddress: Record<string, any>;
}

export function buildCanonicalOrgSchema({
  siteSettings,
  locationData,
  localeAddress,
  countryCode,
  siteUrl,
  geoCoordinates,
  dict
}: CanonicalSchemaOptions) {
  const schemaT = dict.articleDetail?.schema || 'Schema';
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'LocalBusiness'],
    '@id': `${siteUrl}/#organization`,
    name: `${siteSettings.site_name} ${locationData.country}`,
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}${siteSettings.site_logo || '/full-logo.webp'}`
    },
    image: `${siteUrl}${siteSettings.site_logo || '/full-logo.webp'}`,
    description: schemaT.provider?.description?.replace('{cities}', locationData.formattedCities).replace('{country}', locationData.country) || '',
    priceRange: 'Affordable',
    address: {
      '@type': 'PostalAddress',
      addressLocality: locationData.mainCity,
      addressRegion: locationData.area,
      addressCountry: countryCode,
      ...(localeAddress.streetAddress && { streetAddress: localeAddress.streetAddress }),
      ...(localeAddress.postalCode && { postalCode: localeAddress.postalCode })
    },
    ...(localeAddress.phoneNumber && { telephone: localeAddress.phoneNumber }),
    geo: {
      '@type': 'GeoCoordinates',
      latitude: geoCoordinates.latitude,
      longitude: geoCoordinates.longitude
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '17:00'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: schemaT.contactPoint?.type || 'Customer Support',
      email: siteSettings.support_email
    },
    sameAs: [
      siteSettings.facebook || siteSettings.social_links?.facebook || `https://facebook.com/${siteSettings.site_name?.toLowerCase().replace(/\s+/g, '')}`,
      siteSettings.twitter || siteSettings.social_links?.twitter || `https://twitter.com/${siteSettings.site_name?.toLowerCase().replace(/\s+/g, '')}`,
      siteSettings.instagram || siteSettings.social_links?.instagram || `https://instagram.com/${siteSettings.site_name?.toLowerCase().replace(/\s+/g, '')}`
    ].filter(Boolean)
  };
}

interface GenerateProductSchemaOptions {
  product: any;
  locale: string;
  siteSettings: any;
  locationData: any;
  dict: any;
  productUrl: string;
  displayCategory: string;
  serverTranslation?: any;
  vatNumber?: string;
  mainEntityOfPageId?: string; // New optional parameter for referencing the main organization
  brandName?: string; // New optional parameter for product-specific brand
  author?: { display_name: string; slug: string }; // Add author to product schema options (legacy)
  authors?: { id: string; display_name: string | null; slug: string }[]; // Add authors array for multiple authors
  includeFAQ?: boolean; // Whether to include FAQ schema in the product schema
  faqData?: any; // Optional FAQ data to use instead of product.faq (for translations)
}

export async function generateProductSchema({
  product,
  locale,
  siteSettings,
  locationData,
  dict,
  productUrl,
  displayCategory,
  serverTranslation,
  vatNumber = '',
  mainEntityOfPageId, // Destructure new parameter
  brandName, // Destructure new parameter
  author, // Destructure new author parameter (legacy)
  authors, // Destructure new authors parameter
  includeFAQ = false, // Destructure new FAQ parameter
  faqData // Destructure new FAQ data parameter
}: GenerateProductSchemaOptions): Promise<Record<string, any>> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.zeyana.com';
  const currency = getCurrencyFromLocale(locale);
  const rates = siteSettings.currency_conversion_rates || {};
  const rate = rates[currency] || 1;

  const isKgPrice = product.kg_price !== false;
  const { price: calculatedBasePrice, isTiered } = calculatePriceInfo(
    product.price_chart as Record<string, number>,
    product.price_per_kg,
    isKgPrice
  );
  const convertedPrice = calculatedBasePrice * rate;
  const englishCountryName = await getEnglishCountryName(locationData.country, locale, dict);
  const countryCode = countryCodeMap[englishCountryName] || 'GB';
  const geoCoordinates = getCountryGeoCoordinates(englishCountryName);
  const localeAddress = siteSettings.locale_addresses?.[locale] || {};
  const tSchema = dict?.schema;

  const displayName = serverTranslation?.name || product.name;
  const displayDescription = serverTranslation?.description || product.description;

  let additionalImages: string[] = [];
  if (product.additional_images) {
    if (typeof product.additional_images === 'string') {
      try {
        const parsed = JSON.parse(product.additional_images);
        if (Array.isArray(parsed)) {
          additionalImages = parsed;
        }
      } catch (e) {
        console.error('Failed to parse additional_images:', e);
        // Try to repair common JSON issues
        try {
          const repaired = product.additional_images
            .replace(/,\s*]/g, ']')  // Remove trailing commas
            .replace(/,\s*}/g, '}');
          const parsed = JSON.parse(repaired);
          if (Array.isArray(parsed)) {
            additionalImages = parsed;
          }
        } catch (repairError) {
          console.error('Failed to repair JSON:', repairError);
        }
      }
    } else if (Array.isArray(product.additional_images)) {
      additionalImages = product.additional_images;
    }
  }
  
  additionalImages = additionalImages.filter(url => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  });

  const hasCoaData = product.test_results &&
    typeof product.test_results === 'object' &&
    'coa' in product.test_results &&
    product.test_results.coa;

  const enhancedDescription = `${displayDescription || ''} ${tSchema?.product?.availability
    .replace('{cities}', locationData.formattedCities)
    .replace('{country}', locationData.country)}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': productUrl,
    name: `${displayName} - ${locationData.mainCity}, ${locationData.country}`,
    description: enhancedDescription,
    image: [
      product.product_image,
      ...additionalImages
    ].filter(Boolean),
    category: displayCategory,
    url: productUrl,
    sku: product.id,
    productID: product.id,
    ...(product.review_count > 0 && product.average_rating > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: Number(product.average_rating).toFixed(1),
        reviewCount: product.review_count,
        bestRating: '5',
        worstRating: '1'
      }
    }),
    brand: (brandName && brandName !== `${siteSettings.site_name} ${locationData.country}`) ? {
      '@type': 'Brand',
      name: brandName,
      logo: `${siteUrl}${siteSettings.site_logo || '/full-logo.webp'}`, // Assuming brand logo is the same as site logo for now
      description: `${brandName} ${tSchema?.provider.qualityValue?.replace('{country}', locationData.country) || ''}`
    } : {
      '@type': 'Brand',
      name: `${siteSettings.site_name} ${locationData.country}`,
      logo: `${siteUrl}${siteSettings.site_logo || '/full-logo.webp'}`,
      description: `${tSchema?.provider.qualityValue?.replace('{country}', locationData.country) || ''}`
    },
    manufacturer: mainEntityOfPageId ? { '@type': 'Organization', '@id': mainEntityOfPageId } : undefined,
    ...((authors && authors.length > 0) ? {
      author: authors.length === 1 ? {
        '@type': 'Person',
        name: authors[0].display_name || 'Anonymous',
        url: `${siteUrl}/${locale}/authors/${authors[0].slug}`
      } : authors.map(authorItem => ({
        '@type': 'Person',
        name: authorItem.display_name || 'Anonymous',
        url: `${siteUrl}/${locale}/authors/${authorItem.slug}`
      }))
    } : (author && {
      author: {
        '@type': 'Person',
        name: author.display_name,
        url: `${siteUrl}/${locale}/authors/${author.slug}`
      }
    })),
    offers: (() => {
      // Parse options and SKUs to generate variant offers
      let parsedOptions: any[] = [];
      let parsedSkus: any[] = [];

      try {
        parsedOptions = typeof product.options === 'string' ? JSON.parse(product.options) : (product.options || []);
        parsedSkus = typeof product.skus === 'string' ? JSON.parse(product.skus) : (product.skus || []);
      } catch (e) {
        console.error('Error parsing product options/skus for JSON-LD:', e);
      }

      // Base offer properties that apply to all variants
      const baseOfferProps = {
        priceCurrency: currency,
        priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        itemCondition: 'https://schema.org/NewCondition',
        deliveryLeadTime: {
          '@type': 'QuantitativeValue',
          minValue: '1',
          maxValue: '5',
          unitCode: 'DAY'
        },
        handlingTime: {
          '@type': 'QuantitativeValue',
          minValue: '0',
          maxValue: '1',
          unitCode: 'DAY'
        },
        areaServed: {
          '@type': 'GeoCircle',
          geoMidpoint: {
            '@type': 'GeoCoordinates',
            addressCountry: countryCode,
            latitude: geoCoordinates.latitude,
            longitude: geoCoordinates.longitude
          },
          description: tSchema?.areaServed?.shippingDescription
            .replace('{country}', locationData.country)
            .replace('{cities}', locationData.formattedCities)
        },
        shippingDetails: {
          '@type': 'OfferShippingDetails',
          shippingRate: {
            '@type': 'MonetaryAmount',
            value: '0',
            currency: currency
          },
          shippingDestination: {
            '@type': 'DefinedRegion',
            addressCountry: countryCode
          },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            businessDays: {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
            },
            transitTime: {
              '@type': 'QuantitativeValue',
              minValue: '1',
              maxValue: '5',
              unitCode: 'DAY'
            },
            handlingTime: {
              '@type': 'QuantitativeValue',
              minValue: '0',
              maxValue: '1',
              unitCode: 'DAY'
            }
          }
        },
        hasMerchantReturnPolicy: {
          '@type': 'MerchantReturnPolicy',
          applicableCountry: countryCode,
          returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
          merchantReturnDays: 14,
          returnMethod: 'https://schema.org/ReturnByMail',
          returnFees: 'https://schema.org/FreeReturn',
          returnShippingFeesAmount: {
            '@type': 'MonetaryAmount',
            value: '0',
            currency: currency
          }
        },
        seller: mainEntityOfPageId ? { '@type': 'Organization', '@id': mainEntityOfPageId } : undefined,
        ...(isKgPrice && {
          eligibleQuantity: {
            '@type': 'QuantitativeValue',
            minValue: product.moq_grams?.toString(),
            unitCode: 'GRM',
            unitText: tSchema?.units?.grams
          }
        })
      };

      // Generate individual offers for variants
      const generateVariantOffers = () => {
        if (parsedSkus.length === 0 || parsedOptions.length === 0) {
          // Fallback to single offer if no variants
          return [{
            '@type': 'Offer',
            ...baseOfferProps,
            sku: product.id,
            price: convertedPrice.toFixed(2),
            url: productUrl,
            availability: 'https://schema.org/InStock',
            name: displayName,
            ...(isTiered && product.price_chart && {
              priceSpecification: {
                '@type': 'PriceSpecification',
                valueAddedTaxIncluded: true,
                priceCurrency: currency,
                eligibleQuantity: {
                  '@type': 'QuantitativeValue',
                  unitCode: 'GRM',
                  unitText: tSchema?.units?.grams
                }
              }
            })
          }];
        }

        return parsedSkus.map((sku: any) => {
          // Parse SKU attributes to get variant properties using the same logic as ProductVariantEngine
          const skuProperties: Record<string, any> = {};
          const urlParams: Record<string, string> = {};
          let variantColor = '';
          let variantSize = '';
          let variantImage = '';

          // Build property ID mapping (AliExpress propertyId -> internal propertyId)
          const aliExpressToInternalMap: Record<number, number> = {};

          // First pass: build the mapping by finding matching valueIds between options and SKU attributes
          for (const option of parsedOptions) {
            for (const value of option.values) {
              if (sku.skuAttr) {
                const attrParts = sku.skuAttr.split(';');
                for (const part of attrParts) {
                  const [aliExpressPropIdStr, aliExpressValueIdStr] = part.split('#')[0].split(':');
                  const aliExpressPropId = Number(aliExpressPropIdStr);
                  const aliExpressValueId = Number(aliExpressValueIdStr);

                  if (aliExpressValueId === value.valueId) {
                    aliExpressToInternalMap[aliExpressPropId] = option.propertyId;
                    break;
                  }
                }
              }
            }
          }

          // Second pass: parse this SKU's attributes using the mapping to get actual variant properties
          if (sku.skuAttr) {
            const attrParts = sku.skuAttr.split(';');
            attrParts.forEach((part: string) => {
              const [aliExpressPropIdStr, valueIdStr] = part.split('#')[0].split(':');
              const aliExpressPropId = Number(aliExpressPropIdStr);
              const valueId = Number(valueIdStr);

              const internalPropId = aliExpressToInternalMap[aliExpressPropId];
              if (internalPropId) {
                const option = parsedOptions.find((opt: any) => opt.propertyId === internalPropId);
                if (option) {
                  const value = option.values.find((val: any) => val.valueId === valueId);
                  if (value) {
                    skuProperties[option.propertyName] = value.name;

                    const paramKey = option.propertyName.toLowerCase().replace(/\s+/g, '_');
                    const paramValue = value.name.toLowerCase()
                      .replace(/\s+/g, '_')
                      .replace(/[^a-z0-9_.-]/g, '');
                    urlParams[paramKey] = paramValue;

                    const propNameLower = option.propertyName.toLowerCase();
                    if (propNameLower === 'color') {
                      variantColor = value.name;
                      variantImage = value.image || '';
                    } else if (propNameLower === 'size') {
                      variantSize = value.name;
                    }
                  }
                }
              }
            });
          }

          // Fallback to specifications for color if not found in options
          if (!variantColor) {
            try {
              const specs = typeof product.specifications === 'string'
                ? JSON.parse(product.specifications)
                : (product.specifications || []);

              if (Array.isArray(specs)) {
                const colorSpec = specs.find((spec: any) =>
                  spec.name && spec.name.toLowerCase() === 'color'
                );
                if (colorSpec) {
                  variantColor = colorSpec.value;
                }
              }
            } catch (e) {
              console.error('Error parsing specifications for color fallback:', e);
            }
          }

          // Build variant URL with query parameters
          const variantParams = new URLSearchParams();
          Object.entries(urlParams).forEach(([key, value]) => {
            if (value) {
              variantParams.append(key, value);
            }
          });
          const variantUrl = variantParams.toString()
            ? `${productUrl}?${variantParams.toString()}`
            : productUrl;

          // Build comprehensive variant name
          const variantNameParts = [];
          if (variantColor) variantNameParts.push(variantColor);
          if (variantSize) variantNameParts.push(`Size ${variantSize}`);

          const variantName = variantNameParts.length > 0
            ? `${displayName} - ${variantNameParts.join(', ')}`
            : `${displayName} - ${sku.displayName || 'Variant'}`;

          // Calculate variant price
          const variantPrice = convertedPrice;

          // Build variant-specific additionalProperty array (only unique variant data)
          const additionalProperties: Array<{ '@type': string; name: string; value: string }> = [];

          // Add only SKU-specific properties (variant-unique data like Color, Size, Carat)
          Object.entries(skuProperties).forEach(([name, value]) => {
            if (value) {
              additionalProperties.push({
                '@type': 'PropertyValue',
                name,
                value: String(value)
              });
            }
          });

          // Note: Shared product specifications (Model, Metal, Ring Weight, etc.) are now 
          // handled at the parent Product level to avoid redundancy across all variant offers

          // Return individual offer with variant details as direct properties (no itemOffered)
          return {
            '@type': 'Offer',
            ...baseOfferProps,
            sku: sku.skuId,
            name: variantName,
            price: variantPrice.toFixed(2),
            url: variantUrl,
            availability: sku.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            ...(variantImage && { image: variantImage }),
            ...(variantColor && { color: variantColor }),
            ...(variantSize && { size: variantSize }),
            additionalProperty: additionalProperties
          };
        });
      };

      const individualOffers = generateVariantOffers();

      // If we have multiple offers, use AggregateOffer pattern
      if (individualOffers.length > 1) {
        const prices = individualOffers.map(offer => parseFloat(offer.price));
        const lowPrice = Math.min(...prices);
        const highPrice = Math.max(...prices);

        return {
          '@type': 'AggregateOffer',
          priceCurrency: currency,
          lowPrice: lowPrice.toFixed(2),
          highPrice: highPrice.toFixed(2),
          offerCount: individualOffers.length,
          offers: individualOffers
        };
      }

      // Single offer - return it directly
      return individualOffers[0];
    })(),
    additionalProperty: (() => {
      const props: any[] = [
        { '@type': 'PropertyValue', name: tSchema?.properties?.quality, value: tSchema?.properties?.qualityValue?.replace('{country}', locationData.country) },
        {
          '@type': 'PropertyValue', name: tSchema?.properties?.availability, value: tSchema?.product?.availability
            .replace('{cities}', locationData?.formattedCities)
            .replace('{country}', locationData?.country)
        },
        {
          '@type': 'PropertyValue',
          name: tSchema?.properties?.businessType,
          value: !siteSettings?.is_b2b
            ? tSchema?.provider?.businessTypeB2C
            : tSchema?.provider?.businessTypeB2B
        }
      ];

      // Parse specifications and extract required JSON-LD fields
      // Always use English specifications for JSON-LD structured data
      const displaySpecifications = product.specifications;
      let colorValue = '';

      if (displaySpecifications) {
        try {
          const parsedSpecs = typeof displaySpecifications === 'string'
            ? JSON.parse(displaySpecifications)
            : displaySpecifications;

          if (Array.isArray(parsedSpecs)) {
            parsedSpecs.forEach(spec => {
              if (typeof spec === 'object' && spec !== null &&
                typeof spec.name === 'string' &&
                typeof spec.value !== 'undefined' && spec.value !== null) {

                // Extract color for reference but exclude gender and age group from additionalProperty
                if (spec.name.toLowerCase() === 'color') {
                  colorValue = String(spec.value);
                }

                // Add shared specifications to parent Product (excludes Gender/Age group/Color)
                // Gender/Age group are top-level properties, Color varies by variant
                if (spec.name !== 'Gender' && spec.name !== 'Age group' && spec.name !== 'Color') {
                  props.push({
                    '@type': 'PropertyValue',
                    name: spec.name,
                    value: String(spec.value)
                  });
                }
              }
            });
          } else if (typeof parsedSpecs === 'object' && parsedSpecs !== null) {
            Object.entries(parsedSpecs).forEach(([name, value]) => {
              if (value !== null && value !== undefined) {
                // Extract color for reference but exclude gender and age group from additionalProperty
                if (name === 'Color') {
                  colorValue = String(value);
                }

                // Add shared specifications to parent Product (excludes Gender/Age group/Color)
                // Gender/Age group are top-level properties, Color varies by variant
                if (name !== 'Gender' && name !== 'Age group' && name !== 'Color') {
                  props.push({
                    '@type': 'PropertyValue',
                    name,
                    value: String(value)
                  });
                }
              }
            });
          }
        } catch (e) {
          console.error("Error parsing product specifications for JSON-LD:", e);
          if (typeof displaySpecifications === 'string' && displaySpecifications.length < 200) {
            props.push({
              '@type': 'PropertyValue',
              name: 'Specifications',
              value: displaySpecifications
            });
          }
        }
      }

      return props.filter(prop => prop.value);
    })(),
    // Extract gender and ageGroup for top-level Schema.org properties
    ...((() => {
      // Always use English specifications for JSON-LD structured data
      const displaySpecifications = product.specifications;
      let genderValue = '';
      let ageGroupValue = '';

      if (displaySpecifications) {
        try {
          const parsedSpecs = typeof displaySpecifications === 'string'
            ? JSON.parse(displaySpecifications)
            : displaySpecifications;

          if (Array.isArray(parsedSpecs)) {
            parsedSpecs.forEach(spec => {
              if (typeof spec === 'object' && spec !== null &&
                typeof spec.name === 'string' &&
                typeof spec.value !== 'undefined' && spec.value !== null) {

                if (spec.name === 'Gender') {
                  genderValue = String(spec.value).toLowerCase();
                } else if (spec.name === 'Age group') {
                  ageGroupValue = String(spec.value).toLowerCase();
                }
              }
            });
          } else if (typeof parsedSpecs === 'object' && parsedSpecs !== null) {
            Object.entries(parsedSpecs).forEach(([name, value]) => {
              if (value !== null && value !== undefined) {
                if (name === 'Gender') {
                  genderValue = String(value).toLowerCase();
                } else if (name === 'Age group') {
                  ageGroupValue = String(value).toLowerCase();
                }
              }
            });
          }
        } catch (e) {
          console.error("Error parsing specifications for structured data:", e);
        }
      }

      const structuredProps: Record<string, any> = {};

      if (genderValue) {
        structuredProps.gender = genderValue;
      }

      if (ageGroupValue) {
        structuredProps.ageGroup = ageGroupValue;
      }

      return structuredProps;
    })()),
    keywords: `${displayName}, ${displayCategory}, premium quality, wholesale, ${locationData.mainCity}, ${locationData.country}`,
    inLanguage: locale,
    ...(includeFAQ && (() => {
      const faqSource = faqData || product.faq;
      if (faqSource) {
        const faqSchema = generateFAQSchema(faqSource);
        return faqSchema ? { faqPage: faqSchema } : {};
      }
      return {};
    })())
  };
}

interface GenerateProductListSchemaOptions {
  products: any[];
  locale: string;
  siteSettings: any;
  locationData: any;
  dict: any;
  mainEntityOfPageId?: string; // Add this
  authors?: { id: string; display_name: string | null; slug: string }[]; // Add authors array
}

export async function generateProductListSchema({
  products,
  locale,
  siteSettings,
  locationData,
  dict,
  mainEntityOfPageId, // Destructure new parameter
  authors // Destructure authors array
}: GenerateProductListSchemaOptions): Promise<Record<string, any>> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.zeyana.com';
  const t = dict.productsClient;
  const tSchema = dict.schema;

  const translatedProductsBasePath = await getTranslatedPath('/products', locale);

  const itemListElement = await Promise.all(products.slice(0, 10).map(async (product, index) => {
    const categoryData = product.processedCategories?.find((cat: any) => cat.isPrimary) || product.processedCategories?.[0];
    const displayCategory = categoryData?.name || product.category || 'Product';

    const productSlug = product.translations?.find((t: any) => t.locale === locale)?.slug || product.slug;
    const productUrl = `${siteUrl}/${locale}${translatedProductsBasePath.replace('/products', '')}/${productSlug}`;

    const productSchema = await generateProductSchema({
      product,
      locale,
      siteSettings,
      locationData,
      dict,
      productUrl,
      displayCategory,
      serverTranslation: product.translations?.find((t: any) => t.locale === locale),
      mainEntityOfPageId, // Pass through
      authors: product.author_id ? authors?.filter(author => author.id === product.author_id) : undefined, // Pass authors array if available
    });

    return {
      '@type': 'ListItem',
      position: index + 1,
      item: productSchema
    };
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${t.catalogTitle} - ${locationData.mainCity}, ${locationData.country}`,
    description: `${t.catalogDescription} ${tSchema?.product?.availability?.replace('{cities}', locationData?.formattedCities)?.replace('{country}', locationData?.country)}`,
    url: `${siteUrl}/${locale}${translatedProductsBasePath}`,
    publisher: mainEntityOfPageId ? { '@type': 'Organization', '@id': mainEntityOfPageId } : {
      '@type': 'Organization',
      name: `${siteSettings.site_name} ${locationData.country}`,
      logo: `${siteUrl}${siteSettings.site_logo || '/full-logo.webp'}`
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: itemListElement
    },
    inLanguage: locale
  };
}

interface GenerateArticleSchemaOptions {
  article: any;
  locale: string;
  siteSettings: any;
  locationData: any;
  dict: any;
  articleUrl: string;
  primaryCategory: string;
  productReference?: Record<string, any>;
  articleCategoriesMap: Record<string, string[]>;
  localizedCategories: any[];
  mainEntityOfPageId?: string; // New optional parameter for referencing the main organization
  author?: { display_name: string; slug: string }; // Add author to schema options (legacy)
  authors?: { id: string; display_name: string | null; slug: string }[]; // Add authors array for multiple authors
  includeFAQ?: boolean; // Whether to include FAQ schema in the article schema
  faqData?: any; // Optional FAQ data to use instead of article.faq (for translations)
  includeHowTo?: boolean; // Whether to include How-To schema in the article schema
  howToData?: any; // Optional How-To data to use instead of article.how_to (for translations)
}

