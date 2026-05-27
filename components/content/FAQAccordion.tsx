'use client'

import * as React from 'react'

interface FAQAccordionProps {
    children: React.ReactNode
}

export default function FAQAccordion({ children }: FAQAccordionProps) {
    const [openFaqId, setOpenFaqId] = React.useState<string | null>(null)
    const containerRef = React.useRef<HTMLDivElement>(null)

    const toggleFaq = (faqId: string) => {
        setOpenFaqId(openFaqId === faqId ? null : faqId)
    }

    React.useEffect(() => {
        if (!containerRef.current) return

        const faqItems = containerRef.current.querySelectorAll('.faq-item')

        faqItems.forEach((item, index) => {
            const childArray = React.Children.toArray(children)
            const child = childArray[index]
            const faqId = React.isValidElement(child) ? child.key as string : `faq-${index}`
            const button = item.querySelector('.faq-button') as HTMLButtonElement
            const content = item.querySelector('.faq-content') as HTMLDivElement
            const icon = item.querySelector('.faq-icon') as SVGElement
            const isOpen = openFaqId === faqId

            if (button && content && icon) {
                button.setAttribute('aria-expanded', isOpen.toString())

                const innerContent = content.querySelector('.faq-inner-content') as HTMLDivElement

                const openDuration = '400ms'
                const closeDuration = '250ms'
                const iconDuration = '300ms'
                const contentDelay = '100ms'

                if (isOpen) {
                    content.style.transition = `max-height ${openDuration} cubic-bezier(0.4, 0, 0.2, 1)`
                    icon.style.transition = `transform ${iconDuration} cubic-bezier(0.4, 0, 0.2, 1)`
                    
                    if (innerContent) {
                        innerContent.style.transition = `opacity ${openDuration} cubic-bezier(0.4, 0, 0.2, 1) ${contentDelay}, transform ${openDuration} cubic-bezier(0.4, 0, 0.2, 1) ${contentDelay}`
                    }
                    
                    content.style.maxHeight = '32rem'
                    icon.style.transform = 'rotate(180deg)'
                    
                    if (innerContent) {
                        innerContent.style.opacity = '0'
                        innerContent.style.transform = 'translateY(10px)'
                        
                        setTimeout(() => {
                            innerContent.style.opacity = '1'
                            innerContent.style.transform = 'translateY(0)'
                        }, 50)
                    }
                } else {
                    content.style.transition = `max-height ${closeDuration} cubic-bezier(0.4, 0, 0.6, 1)`
                    icon.style.transition = `transform ${iconDuration} cubic-bezier(0.4, 0, 0.6, 1)`
                    
                    if (innerContent) {
                        innerContent.style.transition = `opacity ${closeDuration} cubic-bezier(0.4, 0, 0.6, 1), transform ${closeDuration} cubic-bezier(0.4, 0, 0.6, 1)`
                        
                        innerContent.style.opacity = '0'
                        innerContent.style.transform = 'translateY(-5px)'
                    }
                    
                    setTimeout(() => {
                        content.style.maxHeight = '0'
                    }, 50)
                    
                    icon.style.transform = 'rotate(0deg)'
                }

                button.onclick = (e) => {
                    e.preventDefault()
                    toggleFaq(faqId)
                }
            }
        })
    }, [openFaqId, children])

    return (
        <div ref={containerRef} className="mx-auto space-y-4">
            {children}
        </div>
    )
}