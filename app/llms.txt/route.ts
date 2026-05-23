import { NextResponse } from 'next/server';
import config from "@/i18n/config";
import { getDictionary } from '@/app/[lang]/dictionaries';
import { getSiteSettings } from '@/app/[lang]/utils/site-settings';
import { getLocalizedPath } from "@/lib/sitemap/utils";
import { SupportedLocale } from "@/lib/sitemap/types";

export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL;
  
  if (!BASE_URL) {
    return new NextResponse('NEXT_PUBLIC_SITE_URL is not defined', { status: 500 });
  }

  // Use default locale for the main listing
  const defaultLocale = config.defaultLocale as SupportedLocale;
  
  // Fetch site data
  let siteName = "ZEYANA";
  let siteDescription = "Luxury jewellery for every occasion. Discover our exquisite collection of necklaces, bracelets, earrings, and rings crafted with precision and passion. Shop now for timeless elegance and unparalleled craftsmanship.";
  
  try {
    const [dict, siteSettings] = await Promise.all([
      getDictionary(defaultLocale),
      getSiteSettings().catch(() => null)
    ]);
    
    if (siteSettings?.site_name) {
      siteName = siteSettings.site_name;
    } else if (dict.Metadata.title) {
      siteName = dict.Metadata.title;
    }
    
    if (dict.Metadata.description) {
      siteDescription = dict.Metadata.description;
    }
  } catch (error) {
    console.error("Error fetching site data for llms.txt", error);
    // Fallback values already set
  }

  // Static pages from sitemap-static.xml/route.ts
  const staticPageRoutes = [
    { route: "", title: "Home" },
    { route: "about", title: "About Us" },
    { route: "products", title: "Products" },
    { route: "articles", title: "Articles" },
    { route: "contact", title: "Contact" },
    { route: "affiliate", title: "Affiliate Program" },
    { route: "our-promise", title: "Our Promise" },
    { route: "privacy", title: "Privacy Policy" },
    { route: "terms", title: "Terms & Conditions" },
  ];

  let content = `# ${siteName}\n\n`;
  if (siteDescription) {
    content += `> ${siteDescription}\n\n`;
  }

  content += `## Sitemaps\n\n`;
  content += `- [Main SitemapIndex](${BASE_URL}/sitemap.xml)\n`;
  content += `- [Static Pages](${BASE_URL}/sitemap-static.xml)\n`;
  content += `- [Products](${BASE_URL}/sitemap-products.xml)\n`;
  content += `- [Articles](${BASE_URL}/sitemap-articles.xml)\n`;
  content += `- [Product Categories](${BASE_URL}/sitemap-product-categories.xml)\n`;
  content += `- [Article Categories](${BASE_URL}/sitemap-article-categories.xml)\n`;
  content += `- [Authors](${BASE_URL}/sitemap-authors.xml)\n`;
  
  content += `\n## Main Pages\n\n`;

  // Generate links for default locale
  for (const page of staticPageRoutes) {
    // getLocalizedPath handles finding the path for the locale from config
    // Note: getLocalizedPath implementation details might vary, but assuming it returns the path segment
    const localizedPath = getLocalizedPath(page.route, defaultLocale);
    
    // Sometimes getLocalizedPath returns undefined if not found, but for static routes it should exist if they are in config.pathnames
    // If localizedPath is just the path (e.g. "about"), we prepend locale if needed.
    // Based on sitemap-static: 
    // const url = localizedPath && localizedPath !== '' ? `${BASE_URL}/${locale}/${localizedPath}` : `${BASE_URL}/${locale}`;
    
    let url = `${BASE_URL}/${defaultLocale}`;
    if (localizedPath && localizedPath !== '') {
        // localizedPath might already have leading slash or not. 
        // In sitemap-static they do `${BASE_URL}/${locale}/${localizedPath}` which implies it doesn't have leading slash or they handle double slash.
        // Let's assume standard behavior.
        // If localizedPath starts with /, remove it to avoid double slash with /${locale}/
        const cleanPath = localizedPath.startsWith('/') ? localizedPath.substring(1) : localizedPath;
        url = `${BASE_URL}/${defaultLocale}/${cleanPath}`;
    }

    content += `- [${page.title}](${url})\n`;
  }

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
