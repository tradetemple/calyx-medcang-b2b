'use client'

import * as React from 'react'

interface ProductAccordionProps {
    children: React.ReactNode
}

/**
 * Client component for Product Info accordion behavior
 * Handles open/close state and DOM manipulation for animations
 * Only one accordion item can be open at a time
 */
export default function ProductAccordion({ children }: ProductAccordionProps) {
    const [openItemId, setOpenItemId] = React.useState<string | null>('description')
    const containerRef = React.useRef<HTMLDivElement>(null)

    const toggleItem = (itemId: string) => {
        setOpenItemId(openItemId === itemId ? null : itemId)
    }

    React.useEffect(() => {
        if (!containerRef.current) return

        const productItems = containerRef.current.querySelectorAll('.product-info-item')

        productItems.forEach((item, index) => {
            const childArray = React.Children.toArray(children)
            const child = childArray[index]
            const itemId = React.isValidElement(child) ? child.key as string : `product-info-${index}`
            const button = item.querySelector('.product-info-button') as HTMLButtonElement
            const content = item.querySelector('.product-info-content') as HTMLDivElement
            const icon = item.querySelector('.product-info-icon') as SVGElement
            const isOpen = openItemId === itemId

            if (button && content && icon) {
                // Update button attributes
                button.setAttribute('aria-expanded', isOpen.toString())

                // Get the inner content for fade-in-up effect
                const innerContent = content.querySelector('.product-info-inner-content') as HTMLDivElement

                // Animation timing - same as FAQ
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
                    content.style.maxHeight = '64rem' // Increased for better liquid feel
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
                    toggleItem(itemId)
                }
            }
        })
    }, [openItemId, children])

    return (
        <div ref={containerRef} className="space-y-4">
            {children}
        </div>
    )
}