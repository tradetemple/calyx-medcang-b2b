import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  compress: true,
  serverExternalPackages: [],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns:[],
    localPatterns: [
      { pathname: '/**' },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    optimizePackageImports:[
      'react-icons',
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-toast',
      '@radix-ui/react-slot',
      'react-international-phone',
      'zustand',
      'immer',
      'clsx',
      'tailwind-merge',
      'isomorphic-dompurify',
      'uuid'
    ]
  },
  turbopack: { root: process.cwd()},
  async redirects() {
    return[
      { source: '/apple-touch-icon.png', destination: '/apple-icon.png', permanent: true },
      { source: '/apple-touch-icon-precomposed.png', destination: '/apple-icon.png', permanent: true },
    ]
  },
  async headers() {

    const googleDomains =[
      "https://*.google.com",
      "https://*.googleapis.com",
      "https://*.gstatic.com",
      "https://*.google-analytics.com",
      "https://*.analytics.google.com",
      "https://*.googletagmanager.com",
      "https://*.doubleclick.net",
      "https://*.g.doubleclick.net",
      "https://*.merchant-center-analytics.goog",
      "https://*.googlesyndication.com", 
      "https://*.googleadservices.com",
      "https://*.google.co.uk",
      "https://*.google.de",
      "https://static.cloudflareinsights.com",
      "https://www.googletagmanager.com"
    ];

    const cspDirectives = {
      'default-src': ["'self'"],
      'script-src':[
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https://cdn.jsdelivr.net",
        ...googleDomains
      ],
      'style-src':[
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        ...googleDomains,
      ],
      'img-src':[
        "'self'",
        "blob:",
        "data:",
        "https://*",
      ],
      'media-src':[
        "'self'",
        "blob:",
        "data:",
        "https://*",
        "*.supabase.co",
      ],
      'object-src': ["'self'", "data:"],
      'connect-src':[
        "'self'",
        "https://api.vatcheckapi.com",
        ...googleDomains
      ],
      'font-src':[
        "'self'",
        "https://fonts.gstatic.com",
      ],
      'frame-src':[
        "'self'",
        ...googleDomains
      ],
      'worker-src': ["'self'", "blob:"],
    };

    const cspValue = Object.entries(cspDirectives)
      .map(([directive, sources]) => {
        const validSources = sources.filter(Boolean);
        const uniqueSources = [...new Set(validSources)];
        return `${directive} ${uniqueSources.join(' ')}`;
      })
      .join('; ');

    return[
      {
        source: "/(.*)",
        headers:[
          {
            key: "Content-Security-Policy",
            value: cspValue
          }
        ],
      },
      {
        source: "/(.*)\\.(js|css|woff|woff2|ttf|eot|ico|png|jpg|jpeg|gif|webp|avif|svg)",
        headers:[
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" }
        ],
      },
    ];
  },
};

if (process.env.NODE_ENV === 'development') {
  import("@opennextjs/cloudflare").then(({ initOpenNextCloudflareForDev }) => {
    initOpenNextCloudflareForDev();
  }).catch(e => console.error("Failed to init OpenNext Dev:", e));
}

export default nextConfig;