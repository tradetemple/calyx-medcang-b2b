'use client'

import * as React from 'react'

interface ProductAccordionProps {
    children: React.ReactNode
}

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
                button.setAttribute('aria-expanded', isOpen.toString())

                const innerContent = content.querySelector('.product-info-inner-content') as HTMLDivElement

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

                    content.style.maxHeight = '64rem'
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