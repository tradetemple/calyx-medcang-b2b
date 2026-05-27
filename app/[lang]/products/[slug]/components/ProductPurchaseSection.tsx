'use client'

import { MedicalProduct } from '@/types/medical-product'
import DynamicPrice from '@/components/DynamicPrice';
import ProductVariantSelectors from './ProductVariantSelectors';

interface ProductPurchaseSectionProps {
  product: MedicalProduct
  translation?: {
    name?: string
    description?: string
    slug?: string
  }
  price: number
  isTiered: boolean
  isKgPrice: boolean
  shippingRestrictionsMessage?: string | null
  t: any
  affiliateId: string | undefined
  siteUrl: string
  locale: string
  siteSettings: any
}

export default function ProductPurchaseSection({
  product,
  price,
  isKgPrice,
  t,
  locale
}: ProductPurchaseSectionProps) {

  return (
    <div className="lg:min-h-[240px]">
      <div className="mb-6 hidden lg:block min-h-[40px]">
        
        <div className='inline-flex gap-4 items-center'>
          <div className="flex items-baseline gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold bg-secondary shadow-sm shadow-secondary/40 text-shadow-lg py-1 md:py-2 px-3 md:px-4 text-static-white tracking-wide">
                {isKgPrice && (t.productDetail.from || 'from')} <span className='uppercase'><DynamicPrice basePrice={price} lang={locale} /></span> {isKgPrice && (
              <span>/g</span>
            )}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="md:space-y-4 mb-2">
        <ProductVariantSelectors
          product={product as any}
          moqGrams={product.moq_grams}
          locale={locale}
          t={t.productDetail}
        />
      </div>
    </div>
  )
}
