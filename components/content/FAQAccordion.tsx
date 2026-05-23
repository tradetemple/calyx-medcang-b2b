'use client'

import * as React from 'react'

interface FAQAccordionProps {
    children: React.ReactNode
}

/**
 * Minimal client component for FAQ accordion behavior
 * Only handles open/close state and DOM manipulation for animations
 */
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
                // Update button attributes
                button.setAttribute('aria-expanded', isOpen.toString())

                // Get the inner content for fade-in-up effect
                const innerContent = content.querySelector('.faq-inner-content') as HTMLDivElement

                // Animation timing
                const openDuration = '400ms'   // Smooth liquid open
                const closeDuration = '250ms'  // Faster close
                const iconDuration = '300ms'   // Icon rotation
                const contentDelay = '100ms'   // Slight delay for content fade-in

                if (isOpen) {
                    // Opening: smooth liquid expansion with fade-in-up
                    content.style.transition = `max-height ${openDuration} cubic-bezier(0.4, 0, 0.2, 1)`
                    icon.style.transition = `transform ${iconDuration} cubic-bezier(0.4, 0, 0.2, 1)`
                    
                    if (innerContent) {
                        innerContent.style.transition = `opacity ${openDuration} cubic-bezier(0.4, 0, 0.2, 1) ${contentDelay}, transform ${openDuration} cubic-bezier(0.4, 0, 0.2, 1) ${contentDelay}`
                    }
                    
                    // Apply open styles immediately for container
                    content.style.maxHeight = '32rem' // Increased for better liquid feel
                    icon.style.transform = 'rotate(180deg)'
                    
                    // Delayed content animation for fade-in-up effect
                    if (innerContent) {
                        // Start with content hidden and moved down
                        innerContent.style.opacity = '0'
                        innerContent.style.transform = 'translateY(10px)'
                        
                        // Animate to visible and in position
                        setTimeout(() => {
                            innerContent.style.opacity = '1'
                            innerContent.style.transform = 'translateY(0)'
                        }, 50) // Small delay for liquid effect
                    }
                } else {
                    // Closing: faster animation with fade-out-down
                    content.style.transition = `max-height ${closeDuration} cubic-bezier(0.4, 0, 0.6, 1)`
                    icon.style.transition = `transform ${iconDuration} cubic-bezier(0.4, 0, 0.6, 1)`
                    
                    if (innerContent) {
                        innerContent.style.transition = `opacity ${closeDuration} cubic-bezier(0.4, 0, 0.6, 1), transform ${closeDuration} cubic-bezier(0.4, 0, 0.6, 1)`
                        
                        // Immediate fade-out-down
                        innerContent.style.opacity = '0'
                        innerContent.style.transform = 'translateY(-5px)'
                    }
                    
                    // Close container after content starts fading
                    setTimeout(() => {
                        content.style.maxHeight = '0'
                    }, 50)
                    
                    icon.style.transform = 'rotate(0deg)'
                }

                // Add click handler
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