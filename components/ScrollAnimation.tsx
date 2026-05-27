'use client'

import { useRef, useEffect, useState } from 'react'

interface ScrollAnimationProps {
  children: React.ReactNode
  animation?: 'fadeUp' | 'fadeLeft' | 'fadeRight'
  delay?: number
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
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (ref.current) observer.unobserve(ref.current)
        }
      },
      { 
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

  const getHiddenClasses = () => {
    switch (animation) {
      case 'fadeLeft':
        return '-translate-x-5 opacity-10 blur-[10px]'
      case 'fadeRight':
        return 'translate-x-5 opacity-10 blur-[10px]'
      case 'fadeUp':
      default:
        return 'translate-y-8 opacity-10 blur-[10px]'
    }
  }

  const visibleClasses = 'translate-x-0 translate-y-0 opacity-100 blur-0'

  return (
    <div
      ref={ref}
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