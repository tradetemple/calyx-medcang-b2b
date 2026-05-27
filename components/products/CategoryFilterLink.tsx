'use client'

import { useProductFiltersStore } from '@/stores/productFiltersStore'
import { useRouter } from 'next/navigation'

interface CategoryFilterLinkProps {
  categorySlug: string
  lang: string
  children: React.ReactNode
  className?: string
  ariaLabel?: string
}

export default function CategoryFilterLink({ 
  categorySlug, 
  lang, 
  children, 
  className,
  ariaLabel 
}: CategoryFilterLinkProps) {
  const setSelectedCategory = useProductFiltersStore((state) => state.setSelectedCategory)
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    
    setSelectedCategory(categorySlug)
    
    router.push(`/${lang}/products`)
    
    setTimeout(() => {
      const productsGrid = document.getElementById('products-grid')
      if (productsGrid) {
        productsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  return (
    <a
      href={`/${lang}/products`}
      onClick={handleClick}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </a>
  )
}
