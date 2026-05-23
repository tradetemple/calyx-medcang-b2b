import { MetadataRoute } from "next";
import { supabaseStaticClient } from "@/lib/supabaseStaticClient";
import config from "@/i18n/config";
import { SupportedLocale, GroupedEntry, ChangeFreq, SitemapIndexEntry } from "@/lib/sitemap/types";
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
    // PRODUCT CATEGORY ROUTES

    // 1. Get all active English product categories for default locale
    const { data: productCategories, error: productCategoriesError } = await supabaseStaticClient
      .from('categories')
      .select('id, slug, updated_at')
      .eq('is_active', true);

    if (productCategoriesError) {
      console.error('Error fetching product categories:', productCategoriesError);
      return new Response('Error fetching product categories', { status: 500 });
    }

    if (productCategories && Array.isArray(productCategories)) {
      // Add English product category routes (canonical)
      for (const category of productCategories) {
        if (category.slug) {
          addToGroup({
            groupId: `product-category-${category.id}`,
            locale: 'en',
            url: `${BASE_URL}/en/products?category=${category.slug}`,
            lastModified: category.updated_at ? new Date(category.updated_at) : new Date(),
            changeFrequency: 'daily',
            priority: 0.7,
          });
        }
      }

      // Get list of active product category IDs
      const activeProductCategoryIds = productCategories.map(c => c.id);

      // Fetch translations for each supported locale separately
      for (const locale of locales) {
        // Skip English as we already processed it
        if (locale === 'en') continue;

        try {
          // Get translations for this specific locale
          const { data: localeTranslations, error } = await supabaseStaticClient
            .from('category_translations')
            .select('category_id, slug')
            .eq('locale', locale)
            .in('category_id', activeProductCategoryIds);

          if (error) {
            console.error(`Error fetching ${locale} product category translations:`, error);
            continue;
          }

          if (localeTranslations && Array.isArray(localeTranslations) && localeTranslations.length > 0) {
            // Override with translated slugs where they exist
            for (const translation of localeTranslations) {
              if (translation.slug) {
                addToGroup({
                  groupId: `product-category-${translation.category_id}`,
                  locale,
                  url: `${BASE_URL}/${locale}/products?category=${translation.slug}`,
                  lastModified: new Date(), // Use current date for translations
                  changeFrequency: 'daily',
                  priority: 0.7,
                });
              }
            }
          }
        } catch (localeError) {
          console.error(`Error processing ${locale} product category translations:`, localeError);
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

// Function to generate all product category sitemap pages for the sitemap index
export async function generateProductCategorySitemapPages(): Promise<SitemapIndexEntry[]> {
  const { data: productCategories, error: productCategoriesError } = await supabaseStaticClient
    .from('categories')
    .select('id')
    .eq('is_active', true);

  if (productCategoriesError) {
    console.error('Error fetching product category IDs for pagination:', productCategoriesError);
    return [];
  }

  const sitemapPages: SitemapIndexEntry[] = [];
  if (productCategories && productCategories.length > 0) {
    sitemapPages.push({
      url: `${BASE_URL}/sitemap-product-categories.xml`,
      lastModified: new Date(), // Consider a more accurate lastModified for the index entry
    });
  }
  return sitemapPages;
}
