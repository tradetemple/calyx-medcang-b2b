import { MetadataRoute } from "next";
import { supabaseStaticClient } from "@/lib/supabaseStaticClient";
import config from "@/i18n/config";
import { SupportedLocale, GroupedEntry, ChangeFreq } from "@/lib/sitemap/types";
import { createAddToGroup } from "@/lib/sitemap/utils";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL;

export const revalidate = 3600; // Revalidate every hour

export async function GET(): Promise<Response> {
  if (!BASE_URL) {
    console.error('NEXT_PUBLIC_SITE_URL is not defined');
    return new Response('NEXT_PUBLIC_SITE_URL is not defined', { status: 500 });
  }

  const locales = config.locales as SupportedLocale[];

  const groupedRoutes: Record<string, GroupedEntry> = {};
  const addToGroup = createAddToGroup(groupedRoutes);

  try {
    // PRODUCT ROUTES

    // 1. Get all active English products for default locale
    const { data: products, error: productsError } = await supabaseStaticClient
      .from('products')
      .select('id, slug, updated_at')
      .eq('status', 'active');

    if (productsError) {
      console.error('Error fetching products:', productsError);
      return new Response('Error fetching products', { status: 500 });
    }

    if (products && Array.isArray(products)) {
      // Get the dynamic route paths for each locale
      const productPathMap: Record<SupportedLocale, string> = {} as Record<SupportedLocale, string>;

      for (const locale of locales) {
        // Get the products path from config (without slug)
        const productsPathKey = '/products' as keyof typeof config.pathnames;
        const pathnameConfig = config.pathnames[productsPathKey];

        if (pathnameConfig && typeof pathnameConfig === 'object' && locale in pathnameConfig) {
          const localePath = (pathnameConfig as Record<string, string>)[locale];
          const productsPath = localePath?.replace(/^\//, '') || 'products';
          productPathMap[locale] = productsPath;
        } else {
          productPathMap[locale] = 'products'; // fallback
        }
      }

      // Add English product routes (canonical)
      for (const product of products) {
        if (product.slug) {
          addToGroup({
            groupId: `product-${product.id}`,
            locale: 'en',
            url: `${BASE_URL}/en/${productPathMap.en}/${product.slug}`,
            lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
            changeFrequency: 'daily',
            priority: 0.7,
          });
        }
      }

      // Get list of active product IDs
      const activeProductIds = products.map(p => p.id);

      // Fetch translations for each supported locale separately
      for (const locale of locales) {
        // Skip English as we already processed it
        if (locale === 'en') continue;

        try {
          // Get translations for this specific locale - removed updated_at
          const { data: localeTranslations, error } = await supabaseStaticClient
            .from('product_translations')
            .select('product_id, slug')
            .eq('locale', locale)
            .in('product_id', activeProductIds);

          if (error) {
            console.error(`Error fetching ${locale} product translations:`, error);
            continue;
          }

          if (localeTranslations && Array.isArray(localeTranslations) && localeTranslations.length > 0) {
            // Override with translated slugs where they exist
            for (const translation of localeTranslations) {
              if (translation.slug) {
                addToGroup({
                  groupId: `product-${translation.product_id}`,
                  locale,
                  url: `${BASE_URL}/${locale}/${productPathMap[locale]}/${translation.slug}`,
                  lastModified: new Date(), // Use current date for translations
                  changeFrequency: 'daily',
                  priority: 0.7,
                });
              }
            }
          }
        } catch (localeError) {
          console.error(`Error processing ${locale} product translations:`, localeError);
        }
      }
    }
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new Response('Sitemap generation error', { status: 500 });
  }

  const sitemapArray: MetadataRoute.Sitemap = Object.values(groupedRoutes).map(
    (entry) => ({
      url: entry.url,
      lastModified: entry.lastModified,
      changeFrequency: entry.changeFrequency,
      priority: entry.priority,
      alternates: {
        languages: Object.fromEntries([
          ...Object.entries(entry.alternates).map(([loc, href]) => [
            loc === 'se' ? 'sv' : loc,
            href,
          ]),
          ['x-default', entry.url],
        ]),
      },
    })
  );

  const validSitemapArray = sitemapArray.filter(entry =>
    entry.url &&
    entry.url.startsWith(BASE_URL) &&
    entry.lastModified instanceof Date
  );

  validSitemapArray.sort((a, b) => a.url.localeCompare(b.url));

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${validSitemapArray.map(
    (entry) => `  <url>
    <loc>${entry.url}</loc>
    ${entry.lastModified ? `<lastmod>${(entry.lastModified as Date).toISOString()}</lastmod>` : ''}
    ${entry.changeFrequency ? `<changefreq>${entry.changeFrequency}</changefreq>` : ''}
    ${entry.priority ? `<priority>${entry.priority}</priority>` : ''}
    ${Object.entries(entry.alternates?.languages || {})
      .map(([lang, href]) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${href}"/>`)
      .join('\n    ')}
  </url>`
  ).join('\n')}
</urlset>`;

  return new Response(sitemapXml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
