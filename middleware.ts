import { NextResponse, type NextRequest } from 'next/server'
import { i18n, type Locale } from './i18n/i18n-config'
import { resolveLocalizedUrlToInternal } from './i18n/path-utils'
import { checkRoleAccess } from '@/lib/role-interceptor'
import { UserRole } from '@/stores/userRoleStore';

export default function proxy(request: NextRequest) {

  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }
  
  const roleResponse = handleRoleAccess(request)
  if (roleResponse) {
    return roleResponse
  }
  
  const i18nResponse = handleI18nRouting(request)
  return i18nResponse
}

function handleRoleAccess(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl

  const PROTECTED_ROUTES: Record<string, UserRole[]> = {
    '/products': ['verified_pharmacy', 'medical_doctor'],
    '/products/[slug]': ['verified_pharmacy', 'medical_doctor'],
    '/checkout': ['verified_pharmacy', 'medical_doctor']
  }

  const requiredRoles = Object.entries(PROTECTED_ROUTES).find(([route]) => {
    return pathname === route || pathname.startsWith(route + '/')
  })

  if (requiredRoles) {
    const [route, allowedRoles] = requiredRoles
    
    const response = checkRoleAccess(request, {
      allowedRoles,
      redirectPath: '/',
    })

    if (response) {
      return response
    }
  }

  return null
}

function handleI18nRouting(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/api/') || pathname.startsWith('/docs/')) {
    return NextResponse.next()
  }

  const segments = pathname.split('/')
  const potentialLocale = segments[1]

  if (i18n.locales.includes(potentialLocale as Locale)) {
    const rewrittenPath = resolveLocalizedUrlToInternal(pathname, potentialLocale as Locale)

    if (rewrittenPath && rewrittenPath !== pathname) {
      const url = request.nextUrl.clone()
      url.pathname = rewrittenPath
      return NextResponse.rewrite(url)
    }

    return NextResponse.next()
  }

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

  const country = request.headers.get('cf-ipcountry')

  if (country) {
    const { locale: countryLocale } = getLocaleAndCurrencyFromCountry(country)
    if (i18n.locales.includes(countryLocale as any)) {
      return countryLocale
    }
  }

  const acceptLanguage = request.headers.get('accept-language')
  
  if (acceptLanguage) {
    const preferredLanguages = acceptLanguage
      .split(',')
      .map((lang) => {
        const codeWithRegion = lang.split(';')[0].trim(); 
        return codeWithRegion.split('-')[0].toLowerCase(); 
      });

    for (const lang of preferredLanguages) {
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
