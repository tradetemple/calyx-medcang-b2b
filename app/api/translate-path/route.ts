import config from '@/i18n/config';
import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { rateLimit, getCorsHeaders } from '@/lib/api-protection';

// Get locales from config
const LOCALES = config.locales;
type Locale = typeof LOCALES[number];

// Type for the pathname config
type PathnameConfig = {
  [key: string]: {
    [K in Locale]: string;
  };
};

// Get product and article routes from config
const PRODUCT_ROUTES: Record<Locale, string> = Object.fromEntries(
  LOCALES.map(locale => [
    locale, 
    ((config.pathnames as PathnameConfig)['/products']?.[locale] || 'products').replace(/^\//, '')
  ])
) as Record<Locale, string>;

// Add these types at the top of the file
type PathConfig = typeof config.pathnames;
type PathKey = keyof PathConfig;

// Configure the cache options
const ONE_HOUR = 60 * 60;
const ONE_DAY = 24 * ONE_HOUR;

// Helper function to get the canonical path pattern from a localized path
function getCanonicalPathPattern(path: string, locale: Locale): string | null {
  // Path should already be decoded at this point
  // Remove the locale prefix
  const pathWithoutLocale = path.replace(new RegExp(`^/${locale}`), '');
  
  // Handle empty path (home page)
  if (pathWithoutLocale === '' || pathWithoutLocale === '/') {
    return '/';
  }
  
  // Check for direct matches in the pathnames config
  for (const [pattern, localizations] of Object.entries(config.pathnames)) {
    if ((localizations as Record<Locale, string>)[locale] === pathWithoutLocale) {
      return pattern;
    }
  }
  
  // Handle product routes - compare decoded segments
  const productRoute = PRODUCT_ROUTES[locale];
  if (pathWithoutLocale.startsWith(`/${productRoute}/`)) {
    return '/products/[id]';
  }

  
  return null;
}

const translatePathSchema = z.object({
  currentLocale: z.enum(config.locales as [string, ...string[]]),
  targetLocale: z.enum(config.locales as [string, ...string[]]),
  pathname: z.string().min(1).default('/'),
});

/**
 * API route handler with optimized caching
 */
export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  try {
    const rateLimiter = rateLimit(100, 60000); // 100 requests per minute
    const rateResult = rateLimiter(request);
    
    if (!rateResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: getCorsHeaders(origin) }
      );
    }

    const { searchParams } = new URL(request.url);
    const params = {
      currentLocale: searchParams.get('currentLocale'),
      targetLocale: searchParams.get('targetLocale'),
      pathname: searchParams.get('pathname') || '/',
    };

    const validation = translatePathSchema.safeParse(params);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request parameters', 
          details: validation.error.format() 
        },
        { status: 400, headers: getCorsHeaders(origin) }
      );
    }

    const { currentLocale, targetLocale, pathname } = validation.data;
    
    // Quick return for same locale
    if (currentLocale === targetLocale) {
    return NextResponse.json(
      { translatedPath: pathname },
      {
        status: 200,
        headers: {
          'Cache-Control': `public, max-age=${ONE_HOUR}, s-maxage=${ONE_HOUR}, stale-while-revalidate=${ONE_DAY}`
        }
      }
    );
  }
  
  // Determine the cache strategy based on path type
  let cacheControl = `public, max-age=${ONE_HOUR}, s-maxage=${ONE_HOUR}, stale-while-revalidate=${ONE_DAY}`;
  
  // For dynamic content (products/articles), use shorter cache times with stale-while-revalidate
  if (pathname.includes('/products/') || pathname.includes('/articles/')) {
    cacheControl = `public, max-age=${30 * 60}, s-maxage=${ONE_HOUR}, stale-while-revalidate=${ONE_DAY}`;
  }
  
  // Ensure pathname starts with a slash
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  
  // Decode the pathname to handle non-Latin characters properly
  const decodedPath = decodeURIComponent(normalizedPath);
  
  // Split the path into segments
  const segments = decodedPath.split('/');
  
  // Replace the locale segment
  if (segments.length >= 2) {
    segments[1] = targetLocale;
  } else {
    segments.push(targetLocale);
  }
  
  const canonicalPattern = getCanonicalPathPattern(decodedPath, currentLocale);
  
  if (canonicalPattern && (canonicalPattern in config.pathnames)) {
    const targetPath = (config.pathnames[canonicalPattern as PathKey] as Record<Locale, string>)[targetLocale];
    if (targetPath && !targetPath.includes('[id]')) {
      // If it's a standard route, return the localized path
      return NextResponse.json(
        { translatedPath: `/${targetLocale}${targetPath}` },
        {
          status: 200,
          headers: {
            'Cache-Control': cacheControl
          }
        }
      );
    }
  }
  
  // Handle product routes
  if (segments.length >= 4 && segments[2] === PRODUCT_ROUTES[currentLocale]) {
    segments[2] = PRODUCT_ROUTES[targetLocale];
    // segments[3] (the slug) remains the same since we use mock-data and slugs are identical
  }
  // For other routes, just replace the locale segment
  else if (segments.length >= 3) {
    // Try to map the route using the config
    const routeKey = `/${segments[2]}`;
    if (routeKey in config.pathnames) {
      const localeMap = config.pathnames[routeKey as PathKey] as Record<Locale, string>;
      const targetRoute = localeMap[targetLocale];
      if (targetRoute) {
        segments[2] = targetRoute.substring(1); // Remove leading slash
      }
    }
  }

  const translatedPath = segments.join('/').replace(/\/{2,}/g, '/');
  
  return NextResponse.json(
    { translatedPath },
    {
      status: 200,
      headers: {
        'Cache-Control': cacheControl
      }
    }
  );
  } catch (error) {
    console.error('[translate-path] Critical error:', error);
    
    // Fallback headers to ensure this catch block never fails
    const fallbackHeaders = {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Content-Type': 'application/json'
    };

    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : String(error),
        path: request.nextUrl.pathname,
        timestamp: new Date().toISOString()
      },
      { 
        status: 500, 
        headers: fallbackHeaders
      }
    );
  }
}

/**
 * Enable on-demand revalidation for specific paths
 * This can be called when products or articles are updated
 */
export async function POST(request: Request) {
  try {
    const { path, type } = await request.json();
    
    // Only allow revalidation from server-side authenticated requests
    // This would typically check for a valid API key or authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // In a real implementation, you would validate the token and use server actions
    // to properly clear any cache entries related to this path
    
    return NextResponse.json({ 
      revalidated: true, 
      path,
      type,
      message: "In production, this would trigger revalidation of the specified path/type"
    });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
