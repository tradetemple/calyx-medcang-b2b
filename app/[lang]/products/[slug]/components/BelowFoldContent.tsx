import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { TrendingDown } from 'lucide-react';
import { EnhancedProduct } from '@/lib/product-enhancement';
const ProductDescription = dynamic(() => import('./ProductDesc'));
const DynamicPrice = dynamic(() => import('@/components/DynamicPrice'), { 
  loading: () => <span className="opacity-50">...</span>
});
import { PriceChart as B2BPriceChart, Tier as PriceTier } from '@/types/medical-product';
import ProductInfoAccordion from './ProductInfoAccordion';

interface CustomSpecification {
  name: string;
  value: string;
}

interface TabData {
  specifications: {
    title: string;
    content?: CustomSpecification[] | Record<string, string | number | boolean | null>;
  };
  testResults?: {
    title: string;
    content?: Record<string, unknown> | null;
    labels?: {
      batchNumber: string;
      testDate: string;
      expirationDate: string;
      downloadCoa: string;
      na: string;
    };
  };
}

interface BelowFoldContentProps {
  product: {
    id: string;
    name: string;
    price_chart?: Record<string, number>;
    description?: string;
    specifications?: string;
    detailed_desc?: string;
    author_id?: string;
    faq?: Array<{ id: string; question: string; answer: string }> | string | null;
  };
  translation?: {
    name?: string;
    detailed_desc?: string;
    description?: string;
    specifications?: string;
    faq?: Array<{ id: string; question: string; answer: string }> | string | null;
  };
  author?: {
    display_name: string;
    slug: string;
  };
  displayCategory: string;
  categorySlugForUrl: string;
  locale: string;
  reviews: Array<{
    id: string;
    rating: number;
    title: string;
    content: string;
    created_at: string;
    reported: boolean;
    profiles: { name: string };
  }>;
  similarProducts: EnhancedProduct[] | undefined;
  siteSettings: any;
  vatNumber: string;
  vatRate: number;
  isKgPrice: boolean;
  t: any;
}

function PriceChartLoading() {
  return (
    <div className="bg-slate-50 p-4 md:py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="h-8 w-48 bg-slate-50 animate-pulse rounded mb-8 mx-auto"></div>
          <div className="bg-slate-50/30 rounded-xl border border-border overflow-hidden">
            <div className="p-6 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="grid grid-cols-2 gap-4">
                  <div className="h-6 bg-slate-100 animate-pulse rounded"></div>
                  <div className="h-6 bg-slate-100 animate-pulse rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BelowFoldContent({
  product,
  translation,
  displayCategory,
  categorySlugForUrl,
  t,
  locale
}: BelowFoldContentProps) {
  const detailedDesc = translation?.detailed_desc || product.detailed_desc;
  const displayName = translation?.name || product.name;

  const chart = product.price_chart as unknown as B2BPriceChart

  const accordionDict = {
    productDetail: {
      about: t.productDetail.about,
      tabs: {
        specifications: t.productDetail.tabs.specifications
      }
    }
  }

  return (
    <>
      <Suspense fallback={
        <div className="w-full py-8">
          <div className="max-w-4xl space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-slate-50 border border-border/20 rounded-lg p-4">
                <div className="h-6 bg-slate-100 animate-pulse rounded mb-2"></div>
                <div className="h-4 bg-slate-100 animate-pulse rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      }>
        <div className='w-full space-y-2 md:mt-8 py-4 md:py-8 px-3 md:px-8'>
          <ProductInfoAccordion
            displayName={displayName}
            displaySpecifications={product.specifications}
            locale={locale}
            t={accordionDict}
          />
        </div>
      </Suspense>

      {detailedDesc && (
        <Suspense fallback={
          <div className="w-full bg-white p-3 md:p-8">
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 bg-slate-50 animate-pulse rounded w-full"></div>
              ))}
            </div>
          </div>
        }>
          <div className="w-full bg-white p-3 md:p-8 mb-12">
            
            <nav className="text-[10px] md:text-xs uppercase tracking-wide text-text-secondary mb-2 md:mb-4">
              <a href={`/${locale}/products`} className="hover:text-secondary transition-colors">
                {t.productDetail.products}
              </a>
              <span className="mx-1">&gt;</span>
              <a
                href={`/${locale}/products?category=${categorySlugForUrl}`}
                className="hover:text-secondary transition-colors"
              >
                {displayCategory}
              </a>
              <span className="mx-1">&gt;</span>
              <span className="text-text-main font-bold">{displayName}</span>
            </nav>

            <div className="md:pt-2 flex flex-col">
              <input type="checkbox" id="desc-toggle" className="peer hidden" aria-hidden="true" />
              
              <div className="relative overflow-hidden max-h-[80px] peer-checked:max-h-[3000px] peer-checked:[&>.fade-overlay]:opacity-0 transition-all duration-500 ease-in-out md:!max-h-none">
                
                <ProductDescription description={detailedDesc} lang={locale} />

                <div className="fade-overlay absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none transition-opacity duration-300 md:hidden"></div>
              </div>

              <label 
                htmlFor="desc-toggle" 
                className="md:hidden inline-flex items-center self-center text-secondary font-medium text-sm cursor-pointer mt-2 peer-checked:hidden w-max"
              >
                {t.productDetail.more}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="m6 9 6 6 6-6"/></svg>
              </label>

              <label 
                htmlFor="desc-toggle" 
                className="md:hidden hidden items-center text-secondary self-center font-medium text-sm cursor-pointer mt-4 peer-checked:flex w-max"
              >
                {t.productDetail.showLess}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="m18 15-6-6-6 6"/></svg>
              </label>
            </div>
          </div>
        </Suspense>
      )}

      {product.price_chart?.tiers && chart.tiers.length > 0 && (
        <Suspense fallback={<PriceChartLoading />}>
          <section className="bg-white py-12">
            <div className="max-w-3xl mx-auto px-4 md:px-8">
              <div className="flex items-center gap-3 mb-6 justify-center">
                <TrendingDown className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-800">
                  {t.productDetail.priceChart || 'Wholesale Price Matrix'}
                </h3>
              </div>
              
              <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        {t.productDetail.labels.quantity || 'Min. Volume'}
                      </th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">
                        {t.productDetail.labels.price || 'Unit Price'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {chart.tiers
                      .sort((a: PriceTier, b: PriceTier) => a.min - b.min)
                      .map((tier: PriceTier, index: number) => (
                        <tr key={index} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-mono font-bold text-slate-700 text-sm">
                              {tier.min}+ g
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right tracking-wider">
                            <span className="font-mono font-black text-black">
                              <DynamicPrice basePrice={tier.price} lang={locale} />
                              <span className="text-xs ml-1">/g</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
                  <p className="text-[10px] text-slate-600 uppercase font-bold tracking-wider">
                    {t.productDetail.btmRates}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </Suspense>
      )}

    </>
  );
}