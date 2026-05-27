import Link from 'next/link'
import Head from 'next/head'
import { getHomeData } from '@/app/[lang]/utils/page-data'

import { safeJsonStringify } from '@/lib/json-ld'
import { getSiteSettings } from './utils/site-settings'

export const revalidate = false
export const dynamic = 'force-static'

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;

  const { dict } = await getHomeData(lang);
  const siteSettings = await getSiteSettings();

  if (!siteSettings) throw new Error('Site settings not found');

  const t = dict.home;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://calyx.thelynx.ai';
  
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/${lang}#website`,
    url: `${siteUrl}/${lang}`,
    name: `${siteSettings.site_name}`,
    description: dict.Metadata?.description || '', 
    inLanguage: lang,
  };

  const validSchemas = [websiteSchema].filter(Boolean);

  const finalSchema = validSchemas.length === 1 
    ? validSchemas[0] 
    : {
        '@context': 'https://schema.org',
        '@graph': validSchemas
      };

  return (
    <div className="bg-bg-main text-static-black selection:bg-secondary selection:text-white">

      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ 
            __html: safeJsonStringify(finalSchema as any) 
          }}
        />
      </Head>

      <div className="relative min-h-[70vh] md:min-h-[92vh] flex items-center justify-center overflow-hidden">
        
        <div className="absolute inset-0 bg-slate-50 z-10" />

        <div className="relative z-20 max-w-5xl mx-auto text-center px-4 flex flex-col items-center py-20 gap-2 md:gap-6 mb-4 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-regular tracking-wide font-merriweather-main text-black tracking-tight leading-[1.1] drop-shadow-2xl">
            {t.hero.headline.part1} <br className="hidden md:block" /> 
            <span className='italic font-bold from-secondary to-black text-black pr-1 md:pr-2'>
              {t.hero.headline.highlight} 
            </span> 
            {t.hero.headline.part2}
          </h1>
          <p className="text-sm md:text-xl text-charcoal-700 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-md">
            {t.hero.subheadline}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 mt-8 gap-4 md:gap-6 w-full">
            <Link 
              href={`/${lang}/products`}
              aria-label={t.hero.ariaLabel}
              className="col-span-1 md:col-span-2 group relative overflow-hidden bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-0.5"
            >  
              <div className='flex items-center p-6 sm:p-8 h-full'>
                <div className='p-3 md:p-4 bg-slate-50 text-primary rounded-xl group-hover:scale-105 transition-transform duration-300 shadow-sm'>
                  <svg xmlns="http://www.w3.org/2000/svg" className='w-6 md:w-10 h-auto' viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v1.258"/><path d="M16 3v5.46"/><path d="M21 9.118V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5.75"/><path d="M22 17.5c0 2.499-1.75 3.749-3.83 4.474a.5.5 0 0 1-.335-.005c-2.085-.72-3.835-1.97-3.835-4.47V14a.5.5 0 0 1 .5-.499c1 0 2.25-.6 3.12-1.36a.6.6 0 0 1 .76-.001c.875.765 2.12 1.36 3.12 1.36a.5.5 0 0 1 .5.5z"/><path d="M3 15h7"/><path d="M3 9h12.142"/><path d="M8 15v6"/><path d="M8 3v6"/></svg>
                </div>
                <div className='flex flex-col items-start pl-6 border-l text-left border-slate-200 ml-6'>
                  <h2 className='font-bold text-slate-800 tracking-tight text-base md:text-xl mb-1 group-hover:text-primary transition-colors'>{t.hero.cta}</h2>
                  <span className='font-normal text-left text-xs md:text-sm text-slate-500 leading-relaxed max-w-xl'>
                    {t.hero.ctaSubtitle}
                  </span>
                </div>
              </div>
            </Link>

            <Link 
              href={`/${lang}/telemedicine`}
              aria-label={t.hero.ariaLabel}
              className="col-span-1 group relative overflow-hidden bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl hover:border-emerald-400/40 transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-0.5"
            >  
              <div className='flex items-center p-6 h-full'>
                <div className='p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-105 transition-transform duration-300 mr-5 shadow-sm'>
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 9a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4a1 1 0 0 1 1 1v4a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-4a1 1 0 0 1 1-1h4a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-4a1 1 0 0 1-1-1V4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4a1 1 0 0 1-1 1z"/></svg>
                </div>
                <div className='flex flex-col items-start'>
                  <h3 className='font-bold text-slate-800 tracking-tight text-sm md:text-lg group-hover:text-emerald-600 transition-colors'>{t.hero.cta1}</h3>
                  <span className='text-xs md:text-sm text-slate-500 mt-1 text-left'>
                    {t.hero.cta1Subtitle}
                  </span>
                </div>
              </div>
            </Link>

            <Link 
              href={`/${lang}/audit`}
              aria-label={t.hero.ariaLabel}
              className="col-span-1 group relative overflow-hidden bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl hover:border-blue-400/40 transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-0.5"
            >  
              <div className='flex items-center p-6 h-full'>
                <div className='p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-105 transition-transform duration-300 mr-5 shadow-sm'>
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15h6"/><path d="M9 11h6"/></svg>
                </div>
                <div className='flex flex-col items-start'>
                  <h3 className='font-bold text-slate-800 tracking-tight text-sm md:text-lg group-hover:text-blue-600 transition-colors'>{t.hero.cta2}</h3>
                  <span className='text-xs md:text-sm text-slate-500 mt-1 text-left'>
                    {t.hero.cta2Subtitle}
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}