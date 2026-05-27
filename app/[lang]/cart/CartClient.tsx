'use client'

import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi'
import { useB2BCartStore, CartItem } from '@/stores/optimized-cart-store'

const PHARMACY_QUOTA_GRAMS = 5000

export function DeleteButton({ itemId, aria }: { itemId: string, aria: string }) {
  const removeItem = useB2BCartStore((state) => state.removeItem)
  return (
    <button
      onClick={() => removeItem(itemId)}
      className="text-slate-400 hover:text-red-600 transition-colors"
      aria-label={aria}
    >
      <FiTrash2 className="w-5 h-5" />
    </button>
  )
}

export function QuantityControl({ item, dict }: { item: CartItem, dict: any }) {
  const updateQuantity = useB2BCartStore((state) => state.updateQuantity)
  const items = useB2BCartStore((state) => state.items)

  const t = dict

  const moq = item.product.moq_grams
  const step = 50

  const handleIncrease = () => {
    const currentTotal = items.reduce((sum, i) => sum + i.quantityGrams, 0)
    if (currentTotal + step > PHARMACY_QUOTA_GRAMS) {
      alert(`${t.item.quota.replace('{quota}', PHARMACY_QUOTA_GRAMS)}`)
      return
    }
    updateQuantity(item.id, item.quantityGrams + step)
  }

  const handleDecrease = () => {
    if (item.quantityGrams - step < moq) {
      return
    }
    updateQuantity(item.id, item.quantityGrams - step)
  }

  return (
    <div className="flex items-center space-x-3 font-mono border border-slate-200 bg-slate-50 p-1">
      <button
        onClick={handleDecrease}
        disabled={item.quantityGrams <= moq}
        aria-label={t.item.decreaseQuantity}
        className="text-slate-500 hover:text-slate-900 disabled:opacity-30"
      >
        <FiMinus className="w-4 h-4" />
      </button>
      <span className="text-sm font-semibold w-12 text-center text-slate-800">
        {item.quantityGrams}g
      </span>
      <button
        onClick={handleIncrease}
        aria-label={t.item.increaseQuantity}
        className="text-slate-500 hover:text-slate-900"
      >
        <FiPlus className="w-4 h-4" />
      </button>
    </div>
  )
}