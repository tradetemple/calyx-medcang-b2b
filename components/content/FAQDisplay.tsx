import dynamic from 'next/dynamic'
import ProcessedContentServer from './ProcessedContentServer'

interface FAQItem {
  id: string
  question: string
  answer: string
}

interface FAQDisplayProps {
  faqs: FAQItem[]
  lang: string
  className?: string
  title?: string
}

// Dynamically import the client component
const FAQAccordion = dynamic(() => import('./FAQAccordion'), {
  loading: () => (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-slate-50 border border-border/20 rounded-lg p-4 md:p-6">
            <div className="h-6 bg-border/20 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    </div>
  )
})

/**
 * FAQ Display Component - Server Component
 * Renders FAQ section with dynamically imported client-side accordion functionality
 */
export default async function FAQDisplay({
  faqs,
  lang,
  className = '',
  title = 'Frequently Asked Questions'
}: FAQDisplayProps) {
  // Filter out empty FAQs
  const validFaqs = faqs.filter(faq =>
    faq.question && faq.question.trim() !== '' &&
    faq.answer && faq.answer.trim() !== ''
  )

  if (validFaqs.length === 0) {
    return null
  }

  return (
    <section className={`faq-section ${className}`}>
      <div className="container mx-auto">
        <h2 className="text-2xl md:text-3xl font-medium tracking-wide font-merriweather-main text-text-main mb-6 text-center">
          {title}
        </h2>
        
        <FAQAccordion>
          {validFaqs.map((faq) => (
            <FAQItem key={faq.id} faq={faq} lang={lang} />
          ))}
        </FAQAccordion>
      </div>
    </section>
  )
}

// Individual FAQ Item Component (Server Component)
async function FAQItem({ faq, lang }: { faq: FAQItem; lang: string }) {
  return (
    <div className="bg-slate-50 border border-border/20 rounded-none shadow-sm hover:shadow-md transition-shadow duration-200 faq-item">
      <button className="flex items-center justify-between w-full p-3 md:p-6 text-left focus:outline-none faq-button">
        <ProcessedContentServer 
          htmlContent={faq.question}
          lang={lang}
          className="text-xs md:text-sm uppercase tracking-wide font-semibold text-text-main pr-4 flex-1"
        />
        <div className="flex-shrink-0 ml-4">
          <svg 
            className="w-5 h-5 text-text-secondary transition-transform duration-300 ease-in-out faq-icon"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      <div className="overflow-hidden max-h-0 faq-content">
        <div className="px-4 md:px-6 pb-4 md:pb-6 faq-inner-content">
          <ProcessedContentServer 
            htmlContent={faq.answer}
            lang={lang}
            className="text-xs md:text-base text-text-secondary leading-relaxed prose prose-sm prose-a:text-secondary prose-a:no-underline md:prose-base max-w-none"
          />
        </div>
      </div>
    </div>
  )
}