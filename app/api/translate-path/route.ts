import config from '@/i18n/config';
import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { rateLimit, getCorsHeaders } from '@/lib/api-protection';

const LOCALES = config.locales;
type Locale = typeof LOCALES[number];

type PathnameConfig = {
  [key: string]: {
    [K in Locale]: string;
  };
};

const PRODUCT_ROUTES: Record<Locale, string> = Object.fromEntries(
  LOCALES.map(locale => [
    locale, 
    ((config.pathnames as PathnameConfig)['/products']?.[locale] || 'products').replace(/^\//, '')
  ])
) as Record<Locale, string>;

type PathConfig = typeof config.pathnames;
type PathKey = keyof PathConfig;

const ONE_HOUR = 60 * 60;
const ONE_DAY = 24 * ONE_HOUR;

function getCanonicalPathPattern(path: string, locale: Locale): string | null {
  const pathWithoutLocale = path.replace(new RegExp(`^/${locale}`), '');
  
  if (pathWithoutLocale === '' || pathWithoutLocale === '/') {
    return '/';
  }
  
  for (const [pattern, localizations] of Object.entries(config.pathnames)) {
    if ((localizations as Record<Locale, string>)[locale] === pathWithoutLocale) {
      return pattern;
    }
  }
  
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

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  try {
    const rateLimiter = rateLimit(100, 60000);
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
  
  let cacheControl = `public, max-age=${ONE_HOUR}, s-maxage=${ONE_HOUR}, stale-while-revalidate=${ONE_DAY}`;
  
  if (pathname.includes('/products/') || pathname.includes('/articles/')) {
    cacheControl = `public, max-age=${30 * 60}, s-maxage=${ONE_HOUR}, stale-while-revalidate=${ONE_DAY}`;
  }
  
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  
  const decodedPath = decodeURIComponent(normalizedPath);
  
  const segments = decodedPath.split('/');
  
  if (segments.length >= 2) {
    segments[1] = targetLocale;
  } else {
    segments.push(targetLocale);
  }
  
  const canonicalPattern = getCanonicalPathPattern(decodedPath, currentLocale);
  
  if (canonicalPattern && (canonicalPattern in config.pathnames)) {
    const targetPath = (config.pathnames[canonicalPattern as PathKey] as Record<Locale, string>)[targetLocale];
    if (targetPath && !targetPath.includes('[id]')) {
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
  
  if (segments.length >= 4 && segments[2] === PRODUCT_ROUTES[currentLocale]) {
    segments[2] = PRODUCT_ROUTES[targetLocale];
  }
  else if (segments.length >= 3) {
    const routeKey = `/${segments[2]}`;
    if (routeKey in config.pathnames) {
      const localeMap = config.pathnames[routeKey as PathKey] as Record<Locale, string>;
      const targetRoute = localeMap[targetLocale];
      if (targetRoute) {
        segments[2] = targetRoute.substring(1);
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

export async function POST(request: Request) {
  try {
    const { path, type } = await request.json();
    
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
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
