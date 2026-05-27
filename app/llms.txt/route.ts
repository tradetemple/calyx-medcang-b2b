import { NextResponse } from 'next/server';
import config from "@/i18n/config";
import { getDictionary } from '@/app/[lang]/dictionaries';
import { getSiteSettings } from '@/app/[lang]/utils/site-settings';
import { getLocalizedPath } from "@/lib/sitemap/utils";
import { SupportedLocale } from "@/lib/sitemap/types";

export const revalidate = 3600;

export async function GET() {
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL;
  
  if (!BASE_URL) {
    return new NextResponse('NEXT_PUBLIC_SITE_URL is not defined', { status: 500 });
  }

  const defaultLocale = config.defaultLocale as SupportedLocale;
  
  let siteName = "Calyx Medical B2B Prototype";
  let siteDescription = "A live technical demonstration of compliant healthcare infrastructure. Calyx Medical features FHIR-based prescription triage, a GDP-compliant B2B pharmacy procurement and manifest checkout system, and an audit-ready immutable ledger. Purpose-built for businesses requiring strict cryptographic traceability, data privacy, and technical auditability.";
  
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
  }

  const staticPageRoutes = [
    { route: "", title: "Home" },
    { route: "products", title: "Products" },
    { route: "telemedicine", title: "FHIR Triad" },
    { route: "audit", title: "Audit Vault" },
    { route: "checkout", title: "Secure Checkout" },
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
  
  content += `\n## Main Pages\n\n`;

  for (const page of staticPageRoutes) {
    const localizedPath = getLocalizedPath(page.route, defaultLocale);
    
    let url = `${BASE_URL}/${defaultLocale}`;
    if (localizedPath && localizedPath !== '') {
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
