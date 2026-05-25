import { SitemapIndexEntry } from "@/lib/sitemap/types";
import { getLastModifiedDate } from "@/lib/sitemap/utils";
// Removed import for generateAuthorSitemapPages as it's no longer exported

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL;

export const revalidate = 3600; // Revalidate every hour

export async function GET(): Promise<Response> {
  if (!BASE_URL) {
    console.error('NEXT_PUBLIC_SITE_URL is not defined');
    return new Response('NEXT_PUBLIC_SITE_URL is not defined', { status: 500 });
  }

  const sitemapIndexEntries: SitemapIndexEntry[] = [];

  // Add static sitemap
  sitemapIndexEntries.push({
    url: `${BASE_URL}/sitemap-static.xml`,
    lastModified: await getLastModifiedDate('app/sitemap-static.xml/route.ts'),
  });

  // Add product sitemap
  sitemapIndexEntries.push({
    url: `${BASE_URL}/sitemap-products.xml`,
    lastModified: await getLastModifiedDate('app/sitemap-products.xml/route.ts'),
  });
  

  const sitemapIndexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapIndexEntries.map(
    (entry) => `  <sitemap>
    <loc>${entry.url}</loc>
    ${entry.lastModified ? `<lastmod>${(entry.lastModified as Date).toISOString()}</lastmod>` : ''}
  </sitemap>`
  ).join('\n')}
</sitemapindex>`;

  return new Response(sitemapIndexXml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
