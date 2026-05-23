import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
        { userAgent: "*", allow: "/", disallow: ["/api/", "/dashboard/"] },
        {
            userAgent: 'Googlebot',
            allow: ['/'],
            disallow: ["/api/", "/dashboard/"]
        },
        {
            userAgent: ['Applebot', 'Bingbot'],
            allow: ['/'],
            disallow: ["/api/", "/dashboard/"]
        },
        {
            userAgent: 'GPTBot',
            allow: ['/'],
            disallow: ["/api/", "/dashboard/"]
        }
    ],
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
  }
  
}