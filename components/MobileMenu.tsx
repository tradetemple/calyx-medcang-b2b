'use client'

import MobileMenuButtons from './MobileMenuClient';
import React from 'react';

interface MobileMenuProps {
  navigation: Array<{ name: string; href: string }>;
  user: any;
  isAdmin: boolean;
  pathname: string;
  lang: string;
  dict: any;
  extraElements?: React.ReactNode[];
  closeMenu?: () => void;
  siteSettings?: {
    support_email?: string;
    social_links?: {
      github?: string;
      linkedIn?: string;
    };
  };
  footerDict?: any;
}

export default function MobileMenu({
  navigation,
  user,
  lang,
  dict,
  extraElements,
  closeMenu,
  siteSettings,
  footerDict
}: MobileMenuProps) {
  
  const socialLinks = siteSettings ? [
    { url: siteSettings.social_links?.github, label: footerDict?.bottomRow?.githubAria || "Github" },
    { url: siteSettings.social_links?.linkedIn, label: footerDict?.bottomRow?.linkedInAria || "LinkedIn" },
  ].filter(link => Boolean(link.url)) : [];

  const menuSections = [
    {
      id: 'site',
      title: footerDict?.middleRow?.sections?.[0]?.title || 'Account',
      items: [
        { name: footerDict?.middleRow?.sections?.[0]?.links?.cta || 'Products', href: `/${lang}/products` },
        { name: footerDict?.middleRow?.sections?.[0]?.links?.cta1 || 'Products', href: `/${lang}/telemedicine` },
        { name: footerDict?.middleRow?.sections?.[0]?.links?.cta2 || 'Products', href: `/${lang}/audit` },
        { name: footerDict?.middleRow?.sections?.[0]?.links?.checkout || 'Checkout', href: `/${lang}/checkout` },
      ]
    },
    {
      id: 'company',
      title: footerDict?.middleRow?.sections?.[1]?.title || 'Company',
      items: [
        { name: footerDict?.middleRow?.sections?.[1]?.links?.privacyPolicy || 'Privacy Policy', href: `/${lang}/privacy` },
        { name: footerDict?.middleRow?.sections?.[1]?.links?.termsOfService || 'Terms of Service', href: `/${lang}/terms` },
      ]
    },
    {
      id: 'support',
      title: footerDict?.middleRow?.sections?.[2]?.title || 'Support',
      items: [
        { name: footerDict?.middleRow?.sections?.[2]?.links?.chatWithUs || 'Chat With Us', href: `https://wa.me/46732533373?text=Hi%2C%20I%20am%20interested%20in%%20scheduling%20a%20meeting.`, external: true },
        { name: footerDict?.middleRow?.sections?.[2]?.links?.emailUs || 'Email Us', href: `mailto:${siteSettings?.support_email || 'tradetempleab@gmail.com'}`, external: true },
      ]
    },
    ...(socialLinks.length > 0 ? [{
      id: 'social',
      title: footerDict?.followUs || 'Follow Us',
      items: socialLinks.map(link => ({
        name: link.label,
        href: link.url || '#',
        external: true
      }))
    }] : [])
  ];

  return (
    <div className="relative">
      <div className="flex items-center">
        <MobileMenuButtons
          openLabel={dict.mobileMenu.open}
          closeLabel={dict.mobileMenu.close}
          closeMenu={closeMenu}
          user={user}
          lang={lang}
          dict={dict}
          navigation={navigation}
          menuSections={menuSections}
          extraElements={extraElements}
        />
      </div>
    </div>
  );
}
