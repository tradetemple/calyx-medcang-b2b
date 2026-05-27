import React from 'react';
import Link from 'next/link';
import LanguageSwitcher from './LocaleCurrencyChanger';
import FooterLogo from './FooterLogo';

interface FooterProps {
  lang: string;
  dict: any;
  siteSettings: {
    site_name: string;
    site_logo: string;
    dark_mode_logo?: string;
    company_address?: string;
    support_email?: string;
    social_links?: {
      github?: string;
      linkedIn?: string;
    };
  };
}

const Footer: React.FC<FooterProps> = async ({
  lang,
  dict,
  siteSettings
}) => {
  const year = new Date().getFullYear();

  const textClass = "text-black text-sm md:text-base tracking-wide hover:underline transition block w-full py-1 md:py-0";
  const titleClass = "text-xs uppercase tracking-widest font-bold text-black";

  const ChevronIcon = () => (
    <svg 
      className="w-4 h-4 text-black transition-transform duration-300 group-open:rotate-180" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );

  const socialLinks = [
    { url: siteSettings.social_links?.github, label: dict.bottomRow?.githubAria || "GitHub" },
    { url: siteSettings.social_links?.linkedIn, label: dict.bottomRow?.linkedInAria || "LinkedIn" }
  ].filter(link => Boolean(link.url));

  return (
    <footer className="bg-bg-main px-4 sm:px-0">

      <div className="flex md:hidden justify-center items-center w-full md:items-center mt-16 mb-4 pb-6 border-b-2 border-gray-200">
        <div className="mb-6 md:mb-0">
          <div className="block w-[160px] h-[60px] self-center">
            <FooterLogo
              siteName={siteSettings.site_name}
              siteLogo={siteSettings.site_logo}
              darkModeLogo={siteSettings.dark_mode_logo}
            />
          </div>
        </div>
      </div>

      <div className="w-full"> 
        <div className="max-w-7xl mx-auto md:py-20"> 
          
          <div className="hidden md:grid md:grid-cols-4 gap-8">
            <div>
              <strong className={titleClass}>{dict.middleRow.sections[0].title}</strong>
              <ul className="space-y-3 mt-4">
                <li><Link href={`/${lang}/products`} className={textClass}>{dict.middleRow.sections[0].links.cta}</Link></li>
                <li><Link href={`/${lang}/telemedicine`} className={textClass}>{dict.middleRow.sections[0].links.cta1}</Link></li>
                <li><Link href={`/${lang}/audit`} className={textClass}>{dict.middleRow.sections[0].links.cta2}</Link></li>
                <li><Link href={`/${lang}/checkout`} className={textClass}>{dict.middleRow.sections[0].links.checkout}</Link></li>
              </ul>
            </div>

            <div>
              <strong className={titleClass}>{dict.middleRow.sections[1].title}</strong>
              <ul className="space-y-3 mt-4">
                <li><Link href={`/${lang}/privacy`} className={textClass}>{dict.middleRow.sections[1].links.privacyPolicy}</Link></li>
                <li><Link href={`/${lang}/terms`} className={textClass}>{dict.middleRow.sections[1].links.termsOfService}</Link></li>
              </ul>
            </div>

            <div>
              <strong className={titleClass}>{dict.middleRow.sections[2].title}</strong>
              <ul className="space-y-3 mt-4">
                <li><Link href={`https://wa.me/46732533373?text=Hi%2C%20I%20have%20a%20question%20about%20a%20piece%20of%20jewelry.`} className={textClass}>{dict.middleRow.sections[2].links.chatWithUs}</Link></li>
                <li><Link href={`mailto:${siteSettings.support_email}`} className={textClass}>{dict.middleRow.sections[2].links.emailUs}</Link></li>
              </ul>
            </div>
          </div>

          <div className="md:hidden flex flex-col w-full divide-y divide-gray-200 pb-8">
            
            <details className="group py-6">
              <summary className="flex justify-between items-center cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <strong className={titleClass}>{dict.middleRow.sections[0].title}</strong>
                <ChevronIcon />
              </summary>
              <ul className="mt-6 space-y-2">
                <li><Link href={`/${lang}/products`} className={textClass}>{dict.middleRow.sections[0].links.cta}</Link></li>
                <li><Link href={`/${lang}/telemedicine`} className={textClass}>{dict.middleRow.sections[0].links.cta1}</Link></li>
                <li><Link href={`/${lang}/audit`} className={textClass}>{dict.middleRow.sections[0].links.cta2}</Link></li>
                <li><Link href={`/${lang}/checkout`} className={textClass}>{dict.middleRow.sections[0].links.checkout}</Link></li>
              </ul>
            </details>

            <details className="group py-6">
              <summary className="flex justify-between items-center cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <strong className={titleClass}>{dict.middleRow.sections[1].title}</strong>
                <ChevronIcon />
              </summary>
              <ul className="mt-6 space-y-2">
                <li><Link href={`/${lang}/privacy`} className={textClass}>{dict.middleRow.sections[1].links.privacyPolicy}</Link></li>
                <li><Link href={`/${lang}/terms`} className={textClass}>{dict.middleRow.sections[1].links.termsOfService}</Link></li>
              </ul>
            </details>

            <details className="group py-6">
              <summary className="flex justify-between items-center cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <strong className={titleClass}>{dict.middleRow.sections[2].title}</strong>
                <ChevronIcon />
              </summary>
              <ul className="mt-6 space-y-2">
                <li><Link href={`https://wa.me/46732533373?text=Hi%2C%20I%20am%20interested%20in%%20scheduling%20a%20meeting.`} className={textClass}>{dict.middleRow.sections[2].links.chatWithUs}</Link></li>
                <li><Link href={`mailto:${siteSettings.support_email}`} className={textClass}>{dict.middleRow.sections[2].links.emailUs}</Link></li>
              </ul>
            </details>
          </div>
        </div> 
      </div> 

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 pt-6 md:pt-14 pb-12 md:border-y border-gray-200">
        <div className="flex flex-col sm:!flex-row items-center justify-between">
          
          <div className="flex flex-row items-center gap-6 justify-start md:w-1/3">
            <div className="text-black text-xs tracking-widest">
              <span className='text-sm'>&copy;</span> {siteSettings.site_name} {year}
            </div>
            <LanguageSwitcher direction="up" alignment='right-0 md:left-0' lang={lang} />
          </div>

          <div className='hidden md:flex w-1/3 justify-center items-center'>
            <div className="block w-[160px] h-[60px] self-center">
              <FooterLogo
                siteName={siteSettings.site_name}
                siteLogo={siteSettings.site_logo}
                darkModeLogo={siteSettings.dark_mode_logo}
              />
            </div>
          </div>

          <div className="hidden md:flex flex-row items-center justify-end gap-x-6 w-1/3">
            {socialLinks.map((link, idx) => (
              <a 
                key={idx} 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-black text-sm tracking-wide hover:underline transition"
              >
                {link.label}
              </a>
            ))}
          </div>

        </div>
      </div>

      <div data-nosnippet className='max-w-4xl mx-auto text-center text-[5px] md:text-[8px] uppercase tracking-wide py-4 text-black/70'>
          {dict.companyInformation}
          <br className='md:hidden'/>
          {dict.companyContactPrefix} +46 73 253 33 73 | tradetempleab@gmail.com | {siteSettings.company_address}. 
          <br/>
          {dict.companyLegalText}
      </div>
    </footer>
  );
};

export default Footer;