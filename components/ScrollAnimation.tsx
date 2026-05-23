'use client'

import { useRef, useEffect, useState } from 'react'

interface ScrollAnimationProps {
  children: React.ReactNode
  animation?: 'fadeUp' | 'fadeLeft' | 'fadeRight'
  delay?: number // in seconds
}

export default function ScrollAnimation({ 
  children, 
  animation = 'fadeUp',
  delay = 0 
}: ScrollAnimationProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Trigger only once when the element comes into view
        if (entry.isIntersecting) {
          setIsVisible(true)
          // Disconnect after triggering to mimic { once: true }
          if (ref.current) observer.unobserve(ref.current)
        }
      },
      { 
        // Trigger when the element is 100px away from the bottom of the viewport
        rootMargin: "-100px" 
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) observer.unobserve(ref.current)
    }
  }, [])

  // Define initial states (Hidden) based on animation type
  // Corresponds to your old 'hidden' variants
  const getHiddenClasses = () => {
    switch (animation) {
      case 'fadeLeft':
        return '-translate-x-5 opacity-10 blur-[10px]' // x: -20
      case 'fadeRight':
        return 'translate-x-5 opacity-10 blur-[10px]'  // x: 20
      case 'fadeUp':
      default:
        return 'translate-y-8 opacity-10 blur-[10px]'  // y: 30
    }
  }

  // Define final states (Visible)
  // Corresponds to your old 'visible' variants
  const visibleClasses = 'translate-x-0 translate-y-0 opacity-100 blur-0'

  return (
    <div
      ref={ref}
      // 1. duration-700 matches ~0.5s-0.7s
      // 2. ease-[cubic-bezier(...)] matches your custom ease: [0.22, 1, 0.36, 1]
      // 3. will-change-transform helps performance
      className={`transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
        isVisible ? visibleClasses : getHiddenClasses()
      }`}
      style={{ 
        transitionDelay: `${delay}s` 
      }}
    >
      {children}
    </div>
  )
}