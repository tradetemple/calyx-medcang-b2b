import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
        { userAgent: "*", allow: "/", disallow: ["/api/", "/audit/"] },
        {
            userAgent: 'Googlebot',
            allow: ['/'],
            disallow: ["/api/", "/audit/"]
        },
        {
            userAgent: ['Applebot', 'Bingbot'],
            allow: ['/'],
            disallow: ["/api/", "/audit/"]
        },
        {
            userAgent: 'GPTBot',
            allow: ['/'],
            disallow: ["/api/", "/audit/"]
        }
    ],
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
  }
  
}