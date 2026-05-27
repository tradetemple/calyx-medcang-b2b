import Link from 'next/link';
import CartCountBadgeServer from './CartCountBadgeServer'
import MobileMenu from './MobileMenu';
import NavigationLogo from './NavigationLogo';
import LocaleCurrencyChanger from './LocaleCurrencyChanger';
import { Suspense } from 'react';
import NavigationAuth from './NavigationAuth';
import NavigationBarWrapper from './NavigationBarWrapper';
import AnimatedBanner from './AnimatedBanner';
import { UserRolePill } from './UserRolePill';
import { NavbarActions } from './NavbarActions';

interface NavigationBarProps {
  lang: string;
  dict: any;
  siteSettings: {
    site_name: string;
    site_logo: string;
    dark_mode_logo?: string;
    support_email?: string;
    social_links?: {
      github?: string;
      linkedIn?: string;
    };
  };
}

interface NavigationItem {
  name: string;
  href: string;
  isCategory?: boolean;
}

export default function NavigationBarOptimized({
  lang,
  dict,
  siteSettings
}: NavigationBarProps) {
  const baseNavigation: NavigationItem[] = [
    { name: dict.navigation.cta, href: `/${lang}/products` },
    { name: dict.navigation.cta1, href: `/${lang}/telemedicine` },
    { name: dict.navigation.cta2, href: `/${lang}/audit` },
  ];

  const ariaLabels = {
    home: dict.navigation.home
  };
  
  const navbarDict = {
    navigation: {
      banner: dict.navigation.banner,
      home: dict.navigation.home,
      cta: dict.navigation.cta,
      cta1: dict.navigation.cta1,
      cta2: dict.navigation.cta2
    },
    mobileMenu: {
      open: dict.navigation.mobileMenu.open,
      close: dict.navigation.mobileMenu.close
    }
  };

  const tFooter = dict.footer;

  const rawBanner = dict.navigation?.banner || [];
  const bannerTexts = Array.isArray(rawBanner) 
    ? rawBanner.map((item: any) => typeof item === 'string' ? item : item?.content).filter(Boolean)
    : [];

  return (
    <CartCountBadgeServer>
      <NavigationBarWrapper>
        <nav className="w-full">
          <div className='flex w-full h-8 bg-secondary items-center justify-center'>
            <AnimatedBanner texts={bannerTexts} intervalMs={3500} />
          </div>
          
          <div className="w-full mx-auto">
            <div className="bg-bg-main/60 backdrop-blur-xl border-b border-text-main/5">
              
              <div className="relative flex h-16 items-center justify-between px-3 md:px-6">

                <Suspense fallback={
                  <MobileMenu
                    navigation={baseNavigation}
                    user={null}
                    isAdmin={false}
                    pathname={`/${lang}`}
                    lang={lang}
                    dict={navbarDict}
                    siteSettings={siteSettings}
                    footerDict={tFooter}
                    extraElements={[
                      <LocaleCurrencyChanger key="locale-currency-mobile" direction="up" isLocaleChanger lang={lang} />
                    ]}
                  />
                }>
                  <NavigationAuth
                    baseNavigation={baseNavigation}
                    lang={lang}
                    dict={navbarDict}
                    siteSettings={siteSettings}
                    footerDict={tFooter}
                  />
                </Suspense>

                <div className="flex-shrink-0 hidden md:block absolute left-1/2 transform -translate-x-1/2">
                  <Link href={`/${lang}`} className="flex items-center space-x-0" aria-label={ariaLabels.home}>
                    <NavigationLogo
                      siteName={siteSettings.site_name}
                      siteLogo={siteSettings.site_logo}
                      darkModeLogo={siteSettings.dark_mode_logo}
                    />
                  </Link>
                </div>

                <div className="flex items-center space-x-2 md:space-x-4">
                  <UserRolePill dict={dict.navigation.userRolePill} />
                  <NavbarActions lang={lang} dict={dict} />
                </div>
              </div>
            </div>
          </div>
        </nav>
      </NavigationBarWrapper>
    </CartCountBadgeServer>
  )
}