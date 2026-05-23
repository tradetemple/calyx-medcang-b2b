import type { NextConfig } from "next";

// Define your Next.js configuration
const nextConfig: NextConfig = {
  compress: true,
  serverExternalPackages: [
    'twitter-api-v2', 
    'jspdf', 
    'fflate' // Add fflate here specifically
  ],
  typescript: {
    // !! WARN !!
    // This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns:[
      { protocol: 'https', hostname: 'fcbnaprqvjfyzzredkgy.supabase.co' },
      { protocol: 'https', hostname: 'ae01.alicdn.com' }
    ],
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
      '@heroicons/react',
      'date-fns',
      'lodash',
      '@radix-ui/react-dialog',
      '@radix-ui/react-toast',
      '@radix-ui/react-tabs',
      '@radix-ui/react-switch',
      '@stripe/react-stripe-js',
      '@stripe/stripe-js',
      'react-hook-form',
      'react-international-phone',
      'zustand',
      'immer',
      'clsx',
      'tailwind-merge',
      '@hello-pangea/dnd',
      'isomorphic-dompurify',
      'stripe',
      'swr',
      'uuid'
    ]
  },
  // 🚀 PERFORMANCE FIX: Empty turbopack config to silence webpack warning
  // Turbopack handles chunking automatically and more efficiently than webpack
  turbopack: { root: process.cwd()},
  async redirects() {
    return[
      { source: '/apple-touch-icon.png', destination: '/apple-icon.png', permanent: true },
      { source: '/apple-touch-icon-precomposed.png', destination: '/apple-icon.png', permanent: true },
    ]
  },
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';

    // 1. Group external domains logically so you never have to repeat them
    const googleDomains =[
      "https://*.google.com",
      "https://*.googleapis.com",
      "https://*.gstatic.com",
      "https://*.google-analytics.com",
      "https://*.analytics.google.com", // Fixes: region1.analytics.google.com
      "https://*.googletagmanager.com",
      "https://*.doubleclick.net",
      "https://*.g.doubleclick.net",    // Fixes: googleads.g.doubleclick.net
      "https://*.merchant-center-analytics.goog",
      "https://*.googlesyndication.com", 
      "https://*.googleadservices.com",
      "https://*.google.co.uk",
      "https://*.google.de",
      "https://static.cloudflareinsights.com",
      "https://www.googletagmanager.com",
      "https://wsrv.nl"
    ];

    const stripeDomains =[
      "https://*.stripe.com",
      "https://api.stripe.com",
      "https://js.stripe.com",
      "https://m.stripe.com",
      "https://q.stripe.com",
      "https://r.stripe.com",
    ];

    const truevoDomains =[
      "https://*.truevo.com",
    ];

    // 2. Build CSP as an Object (Extremely easy to read and manage)
    const cspDirectives = {
      'default-src': ["'self'"],
      'script-src':[
        "'self'",
        "'unsafe-inline'",
        isDev ? "'unsafe-eval'" : "", // Dynamically adds eval only in Dev
        "https://cdn.jsdelivr.net",
        "https://*.alicdn.com",
        ...googleDomains,
        ...stripeDomains,
        ...truevoDomains,
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
        "https://*",     // This wildcard natively allows ALL https:// images
        "*.alicdn.com",  // Preserved from your config to allow non-protocol specific requests
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
        "https://fcbnaprqvjfyzzredkgy.supabase.co",
        "wss://fcbnaprqvjfyzzredkgy.supabase.co",
        "https://api.vatcheckapi.com",
        ...googleDomains,
        ...stripeDomains,
        ...truevoDomains,
      ],
      'font-src':[
        "'self'",
        "https://fonts.gstatic.com",
      ],
      'frame-src':[
        "'self'",
        ...googleDomains,
        ...stripeDomains,
        ...truevoDomains,
      ],
      'worker-src': ["'self'", "blob:"],
    };

    // 3. Auto-generate the CSP string and filter duplicates natively
    const cspValue = Object.entries(cspDirectives)
      .map(([directive, sources]) => {
        // Filter out empty strings (like 'unsafe-eval' when in production)
        const validSources = sources.filter(Boolean);
        // Remove accidental duplicates using Set
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
        source: "/api/image-proxy",
        headers:[
          { key: "Cache-Control", value: "public, max-age=2592000, immutable" },
          { key: "CDN-Cache-Control", value: "public, max-age=31536000" }
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