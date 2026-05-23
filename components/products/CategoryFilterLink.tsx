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

/**
 * Client component that navigates to products page and sets category filter via Zustand
 * Use this instead of direct links with ?category= query params
 */
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
    
    // Set the category in Zustand store
    setSelectedCategory(categorySlug)
    
    // Navigate to products page
    router.push(`/${lang}/products`)
    
    // Small delay to ensure navigation completes before scrolling
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
