import { MetadataRoute } from "next";
import config from "@/i18n/config";
import { SupportedLocale, GroupedEntry } from "@/lib/sitemap/types";
import { getLastModifiedDate, createAddToGroup, getLocalizedPath } from "@/lib/sitemap/utils";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL;

export const revalidate = 3600;

export async function GET(): Promise<Response> {
  if (!BASE_URL) {
    console.error('NEXT_PUBLIC_SITE_URL is not defined');
    return new Response('NEXT_PUBLIC_SITE_URL is not defined', { status: 500 });
  }

  const locales = config.locales as SupportedLocale[];

  const staticPageRoutes = [
    { route: "", file: "app/[lang]/page.tsx" },
    { route: "products", file: "app/[lang]/products/page.tsx" },
    { route: "telemedicine", file: "app/[lang]/telemedicine/page.tsx" },
    { route: "audit", file: "app/[lang]/audit/page.tsx" },
    { route: "checkout", file: "app/[lang]/checkout/page.tsx" },
    { route: "privacy", file: "app/[lang]/privacy/page.tsx" },
    { route: "terms", file: "app/[lang]/terms/page.tsx" },
  ];

  const groupedRoutes: Record<string, GroupedEntry> = {};
  const addToGroup = createAddToGroup(groupedRoutes);

  await Promise.all(
    staticPageRoutes.flatMap((page) => {
      return locales.map(async (locale) => {
        const lastModified = await getLastModifiedDate(page.file);
        const localizedPath = getLocalizedPath(page.route, locale);

        const url = localizedPath && localizedPath !== ''
          ? `${BASE_URL}/${locale}/${localizedPath}`
          : `${BASE_URL}/${locale}`;

        addToGroup({
          groupId: `static-${page.route || 'home'}`,
          locale,
          url,
          lastModified,
          changeFrequency: 'weekly',
          priority: page.route === '' ? 1.0 : 0.8,
        });
      });
    })
  );

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
