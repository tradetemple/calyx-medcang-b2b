import MobileMenu from './MobileMenu';
import { headers } from 'next/headers';
import LocaleCurrencyChanger from './LocaleCurrencyChanger';

interface NavigationItem {
  name: string;
  href: string;
  isCategory?: boolean;
}

interface NavigationAuthProps {
  baseNavigation: NavigationItem[];
  lang: string;
  dict: any;
  siteSettings?: {
    site_name: string;
    site_logo: string;
    dark_mode_logo?: string;
    support_email?: string;
    social_links?: {
      github?: string;
      linkedIn?: string;
    };
  };
  footerDict?: any;
}

export default async function NavigationAuth({
  baseNavigation,
  lang,
  dict,
  siteSettings,
  footerDict
}: NavigationAuthProps) {

  // Get the current URL from headers
  const headersList = await headers();
  const requestUrl = headersList.get('x-url') ||
    headersList.get('x-pathname') ||
    headersList.get('referer') ||
    `/${lang}`;

  let pathname = '';

  try {
    if (requestUrl.startsWith('http')) {
      const url = new URL(requestUrl);
      pathname = url.pathname;
    } else {
      pathname = requestUrl;
    }
  } catch {
    pathname = `/${lang}`;
  }

  if (!pathname || pathname === '/') {
    pathname = `/${lang}`;
  }

  let user = null;
  let isAdmin = false;

  // Build full navigation with auth-dependent items
  const navigation: NavigationItem[] = [
    ...baseNavigation,
  ];

  return (
    <MobileMenu
      navigation={navigation}
      user={user}
      isAdmin={isAdmin}
      pathname={pathname}
      lang={lang}
      dict={dict}
      siteSettings={siteSettings}
      footerDict={footerDict}
      extraElements={[
        <LocaleCurrencyChanger key="locale-currency-mobile" direction="up" isLocaleChanger lang={lang} />
      ]}
    />
  );
}