import { NextResponse, type NextRequest } from 'next/server'
import { i18n, type Locale } from './i18n/i18n-config'
import { resolveLocalizedUrlToInternal } from './i18n/path-utils'
import { checkRoleAccess } from '@/lib/role-interceptor'
import { UserRole } from '@/stores/userRoleStore';

export default function proxy(request: NextRequest) {
  // Skip middleware for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }
  
  // Check role-based access control for protected routes
  const roleResponse = handleRoleAccess(request)
  if (roleResponse) {
    return roleResponse
  }
  
  const i18nResponse = handleI18nRouting(request)
  return i18nResponse
}

/**
 * Handle role-based access control
 * Returns a response if access should be denied, null if allowed
 */
function handleRoleAccess(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl

  // Define protected routes and their required roles
  const PROTECTED_ROUTES: Record<string, UserRole[]> = {
    '/products': ['verified_pharmacy', 'medical_doctor'],
    '/products/[slug]': ['verified_pharmacy', 'medical_doctor'],
    '/checkout': ['verified_pharmacy', 'medical_doctor']
  }

  // Check if this route requires role protection
  const requiredRoles = Object.entries(PROTECTED_ROUTES).find(([route]) => {
    // Handle exact matches and prefix matches
    return pathname === route || pathname.startsWith(route + '/')
  })

  if (requiredRoles) {
    const [route, allowedRoles] = requiredRoles
    
    // Check if user has required role
    const response = checkRoleAccess(request, {
      allowedRoles,
      redirectPath: '/',
    })

    // If response is not null, it means access is denied
    if (response) {
      return response
    }
  }

  return null // Allow request to proceed
}

function handleI18nRouting(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for API routes
  if (pathname.startsWith('/api/') || pathname.startsWith('/docs/')) {
    return NextResponse.next()
  }

  // Extract locale from pathname
  const segments = pathname.split('/')
  const potentialLocale = segments[1]

  if (i18n.locales.includes(potentialLocale as Locale)) {
    // Check if we need to rewrite the path for localized routes
    const rewrittenPath = resolveLocalizedUrlToInternal(pathname, potentialLocale as Locale)

    if (rewrittenPath && rewrittenPath !== pathname) {
      // Rewrite the URL to the internal path
      const url = request.nextUrl.clone()
      url.pathname = rewrittenPath
      return NextResponse.rewrite(url)
    }

    return NextResponse.next()
  }

  // Handle missing locale (existing logic)
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  if (pathnameIsMissingLocale) {
    const locale = getLocale(request)
    return NextResponse.redirect(
      new URL(`/${locale}${encodeURI(pathname)}${request.nextUrl.search}`, request.url)
    )
  }

  return NextResponse.next()
}

import { getLocaleAndCurrencyFromCountry } from './lib/country-locale-mapping'

function getLocale(request: NextRequest) {
  // First try to get locale from country
  // Since you are on Cloudflare, 'cf-ipcountry' is highly reliable
  const country = request.headers.get('cf-ipcountry')

  if (country) {
    const { locale: countryLocale } = getLocaleAndCurrencyFromCountry(country)
    // Check if the country's locale is supported
    if (i18n.locales.includes(countryLocale as any)) {
      return countryLocale
    }
  }

  // Fallback to browser language negotiation using native lightweight parser
  const acceptLanguage = request.headers.get('accept-language')
  
  if (acceptLanguage) {
    // Parse "fr-CH, fr;q=0.9, en;q=0.8" natively
    const preferredLanguages = acceptLanguage
      .split(',')
      .map((lang) => {
        const codeWithRegion = lang.split(';')[0].trim(); 
        return codeWithRegion.split('-')[0].toLowerCase(); 
      });

    // Find the first browser language that matches your supported locales
    for (const lang of preferredLanguages) {
      // @ts-ignore locales are readonly
      if (i18n.locales.includes(lang as any)) {
        return lang;
      }
    }
  }

  return i18n.defaultLocale;
}


export const config = {
  matcher:[
    '/((?!api/|_next/static|_next/image|_vercel|favicon.ico|manifest.webmanifest|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webm|xml|txt|json)$).*)',
  ],
}
