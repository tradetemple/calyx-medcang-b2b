import dynamic from 'next/dynamic'
import ProcessedContentServer from '@/components/content/ProcessedContentServer'
import { Specification } from '@/types/medical-product'

interface ProductInfoAccordionProps {
  displayName: string
  displayDescription?: string | null
  displaySpecifications?: string | Specification[] | null
  locale: string
  t: any
}

const ProductAccordion = dynamic(() => import('./ProductAccordion'), {
  loading: () => (
    <div className="space-y-4">
      <div className="animate-pulse">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-slate-50 border border-border/20 rounded-lg p-4 md:p-6">
            <div className="h-6 bg-border/20 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    </div>
  )
})

export default function ProductInfoAccordion({
  displayName,
  displayDescription,
  displaySpecifications,
  locale,
  t
}: ProductInfoAccordionProps) {
  // Filter valid sections
  const sections = []
  
  if (displayDescription) {
    sections.push({
      id: 'description',
      title: `${t.productDetail.about} ${displayName}`,
      content: displayDescription,
      type: 'description' as const,
      defaultOpen: true
    })
  }
  
  if (displaySpecifications) {
    sections.push({
      id: 'specifications',
      title: t.productDetail.tabs.specifications,
      content: displaySpecifications,
      type: 'specifications' as const,
      defaultOpen: false
    })
  }

  if (sections.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <ProductAccordion>
        {sections.map((section) => (
          <ProductInfoItem 
            key={section.id} 
            section={section} 
            locale={locale} 
          />
        ))}
      </ProductAccordion>
    </div>
  )
}

// Individual Product Info Item Component (Server Component)
function ProductInfoItem({ 
  section, 
  locale 
}: { 
  section: {
    id: string
    title: string
    content: string | Specification[]
    type: 'description' | 'specifications'
    defaultOpen: boolean
  }
  locale: string 
}) {
  return (
    <div className="bg-slate-50 border border-border/20 rounded-none shadow-sm hover:shadow-md transition-shadow duration-200 product-info-item">
      <button className="flex items-center justify-between w-full p-3 md:p-6 text-left focus:outline-none product-info-button">
        <h2 className="text-xs md:text-sm uppercase tracking-wide font-semibold text-text-main pr-4 flex-1">
          {section.title}
        </h2>
        <div className="flex-shrink-0 ml-4">
          <svg 
            className="w-5 h-5 text-text-secondary transition-transform duration-300 ease-in-out product-info-icon"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      <div className="overflow-hidden product-info-content">
        <div className="px-4 md:px-6 pb-4 md:pb-6 product-info-inner-content mt-3">
          {section.type === 'description' ? (
            <ProcessedContentServer 
              htmlContent={section.content as string}
              lang={locale}
              className="text-xs md:text-base text-black leading-relaxed prose prose-sm prose-a:text-secondary prose-a:no-underline md:prose-base max-w-none"
            />
          ) : (
            <>
              {typeof section.content === 'string' ? (
                <ProcessedContentServer 
                  htmlContent={section.content}
                  lang={locale}
                  className="text-xs md:text-base text-black leading-relaxed prose prose-sm prose-a:text-secondary prose-a:no-underline md:prose-base max-w-none"
                />
              ) : (
                <div className="space-y-3">
                  {(section.content as Specification[]).map((spec, index) => (
                    <div key={index} className="flex justify-between items-start border-b border-border/10 pb-2">
                      <span className="text-text-main font-semibold text-xs md:text-sm">{spec.name}</span>
                      <span className="text-text-secondary text-xs md:text-sm text-right ml-4">{spec.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
