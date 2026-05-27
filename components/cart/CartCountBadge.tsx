'use client'

import { FiShoppingCart } from 'react-icons/fi'
import { useB2BCartStore } from '@/stores/optimized-cart-store'
import { useCallback } from 'react'
import { CLSSafeCartBadge } from './CLSSafeCartNotifications'

export default function CartCountBadge() {
  const { items, openSidebar } = useB2BCartStore()
  const itemCount = items.length
  
  const handleClick = useCallback(() => {
    openSidebar()
  }, [openSidebar])
  
  return (
    <button
      onClick={handleClick}
      className="relative p-2 md:p-2 text-text-main transition-colors duration-200 min-w-[36px] min-h-[36px] md:min-w-[44px] md:min-h-[44px]"
      aria-label={`View cart${itemCount > 0 ? ` (${itemCount} items)` : ''}`}
    >
      <FiShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
      <CLSSafeCartBadge count={itemCount} />
    </button>
  )
} 