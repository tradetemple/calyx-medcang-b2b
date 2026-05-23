'use client';

import { usePathname } from 'next/navigation';
import { useUserRoleStore } from '@/stores/userRoleStore';
import { useEffect, useState } from 'react';
import GlobalSearch from './GlobalSearch';
import CartCountBadge from '@/components/cart/CartCountBadge';
import config from '@/i18n/config';

interface NavbarActionsProps {
  lang: string;
  dict: any;
}

export function NavbarActions({ lang, dict }: NavbarActionsProps) {
  const pathname = usePathname();
  const { userRole, isLoaded } = useUserRoleStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) return null;

  // Only show if user is authenticated (not a guest)
  if (userRole === 'guest') return null;

  // Check if current path matches allowed paths
  const decodedPathname = decodeURIComponent(pathname);

  // Get localized path segments from config
  const productsPath = (config.pathnames['/products'] as any)?.[lang] || '/products';
  const productsSlugPath = (config.pathnames['/products/[slug]'] as any)?.[lang] || '/products/[slug]';
  const checkoutPath = (config.pathnames['/checkout'] as any)?.[lang] || '/checkout';

  // Helper to check if pathname matches a localized pattern
  // Note: patterns like /produkte/[slug] need to be handled by checking the prefix
  const productsSlugPrefix = productsSlugPath.replace('[slug]', '');

  const isAllowedPath = 
    decodedPathname === `/${lang}${productsPath}` || 
    decodedPathname.startsWith(`/${lang}${productsSlugPrefix}`) || 
    decodedPathname === `/${lang}${checkoutPath}` ||
    // Also support fallback/default paths just in case
    decodedPathname === `/${lang}/products` || 
    decodedPathname.startsWith(`/${lang}/products/`) || 
    decodedPathname === `/${lang}/checkout`;

  if (!isAllowedPath) return null;

  return (
    <>
      <GlobalSearch lang={lang} dict={dict} />
      <CartCountBadge />
    </>
  );
}
