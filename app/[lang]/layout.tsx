import './globals.css'
import NavigationBarOptimized from '@/components/NavigationBarOptimized'
import ClientProviders from './ClientProviders'
import { inter } from './fonts'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Viewport } from 'next'

export const viewport: Viewport = {
  themeColor: '#102f5b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

import Footer from '@/components/footer'
import StoreHydration from '@/components/StoreHydration'
import CurrencyProvider from '@/components/CurrencyProvider'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from './ThemeProvider'
import { ThemeInitializer } from './ThemeInitializer'

import NavigationSkeleton from '@/components/NavigationSkeleton'
import FooterSkeleton from '@/components/FooterSkeleton'

import { getMetadataData, getMinimalLayoutData } from './utils/layout-data'
import { getSiteSettings } from './utils/site-settings'

async function NavigationWithCategories({ lang, dict, siteSettings }: { lang: string; dict: any; siteSettings: any; }) {
  const navbarSiteSettings = {
    site_name: siteSettings.site_name,
    site_logo: siteSettings.site_logo,
    dark_mode_logo: siteSettings.dark_mode_logo,
    support_email: siteSettings.support_email,
    social_links: siteSettings.social_links,
  }
  return <NavigationBarOptimized lang={lang} dict={dict} siteSettings={navbarSiteSettings} />
}

async function FooterWithCategories({ lang, dict, siteSettings }: { lang: string; dict: any; siteSettings: any; }) {
  const footerSiteSettings = {
    social_links: siteSettings.social_links,
    site_name: siteSettings.site_name,
    site_logo: siteSettings.site_logo,
    dark_mode_logo: siteSettings.dark_mode_logo,
    support_email: siteSettings.support_email,
    company_address: siteSettings.company_address
  }
  return <Footer lang={lang} dict={dict} siteSettings={footerSiteSettings} />
}

const siteSettings = await getSiteSettings();

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const { dictionary } = await getMetadataData(lang);
  const siteUrl = siteSettings.site_url || process.env.NEXT_PUBLIC_SITE_URL;
  const languageAlternates: Record<string, string> = {};
  
  siteSettings.locales?.forEach((localeCode: string) => {
    languageAlternates[localeCode] = `/${localeCode}`;
  });

  return {
    metadataBase: new URL(siteUrl || 'https://www.zeyana.net'),
    title: dictionary.Metadata.title,
    description: dictionary.Metadata.description,
    icons: {
      icon: [
        { url: siteSettings.favicon || '/favicon.ico?v=2', sizes: 'any' },
        { url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/icon-96x96.png', sizes: '96x96', type: 'image/png' },
        { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icon-310x310.png', sizes: '310x310', type: 'image/png' }
      ],
      apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
      shortcut: siteSettings.favicon || '/favicon.ico?v=2'
    },
    alternates: {
      canonical: `/${lang}`,
      languages: languageAlternates
    },
    openGraph: {
      title: dictionary.Metadata.ogTitle,
      description: dictionary.Metadata.ogDescription,
      url: siteUrl,
      type: 'website',
      images: [{ url: siteSettings.site_logo, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: dictionary.Metadata.twitterTitle,
      description: dictionary.Metadata.twitterDescription,
      images: [{ url: siteSettings.site_logo, width: 1200, height: 630 }],
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    authors: [{ name: "Rasmus Granquist" }]
  };
}

export async function generateStaticParams() {
  return [
    { lang: 'en' }, { lang: 'de' }
  ];
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  const { dictionary } = await getMinimalLayoutData(lang);

  return (
    <html lang={lang} className={`${inter.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: 'window.__name = window.__name || ((f, n) => f);' }} />
        <ThemeInitializer />
      </head>
      <body className={`${inter.className}`}>

        <CurrencyProvider>
          <ThemeProvider initialSettings={siteSettings}>
            <div className="flex flex-col min-h-screen bg-bg-main">
              <StoreHydration />

              <Suspense fallback={<NavigationSkeleton />}>
                <NavigationWithCategories lang={lang} dict={dictionary} siteSettings={siteSettings} />
              </Suspense>

              <ClientProviders lang={lang} dict={dictionary.cart}>
                
                <main className="flex-grow">
                  {children}
                </main>
                
              </ClientProviders>

              <Suspense fallback={<FooterSkeleton />}>
                <FooterWithCategories lang={lang} dict={dictionary.footer} siteSettings={siteSettings} />
              </Suspense>

              <Toaster />

            </div>
          </ThemeProvider>
        </CurrencyProvider>

      </body>
    </html>
  )
}