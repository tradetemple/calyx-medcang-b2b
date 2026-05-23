'use client'

import Image from 'next/image'
import { CartItem } from '@/stores/optimized-cart-store'

interface CartItemImageProps {
  item: CartItem
}

export default function CartItemImage({ item }: CartItemImageProps) {
  const imageUrl = item.product.product_image
  const productName = item.product.name

  return (
    <div className="relative w-16 h-16 bg-slate-50 border border-slate-200 p-1 flex-shrink-0">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={productName}
          fill
          className="object-contain"
          sizes="64px"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 font-mono text-[9px] uppercase tracking-wider">
          No Image
        </div>
      )}
    </div>
  )
}