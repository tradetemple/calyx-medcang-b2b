'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { FiX } from 'react-icons/fi'
import { useB2BCartStore } from '@/stores/optimized-cart-store'
import { useAuditStore } from '@/stores/useAuditStore'
import { useUserRoleStore } from '@/stores/userRoleStore'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { QuantityControl, DeleteButton } from '@/app/[lang]/cart/CartClient'
import CartItemImage from '@/components/cart/CartItemImage'
import { calculateTieredPrice } from '@/lib/checkout/pricing'
import DynamicPrice from '@/components/DynamicPrice'

export default function CartSidebar( { dict, lang }: { dict: any; lang: string }) {
  const router = useRouter()
  const pathname = usePathname()

  const t = dict

  const isSidebarOpen = useB2BCartStore((state) => state.isSidebarOpen)
  const closeSidebar = useB2BCartStore((state) => state.closeSidebar)
  const items = useB2BCartStore((state) => state.items)
  const addLog = useAuditStore((state) => state.addLog)
  const { userRole } = useUserRoleStore()

  useEffect(() => {
    closeSidebar()
  }, [pathname, closeSidebar])

  const handleCheckout = () => {
    const totalGrams = items.reduce((sum, item) => sum + item.quantityGrams, 0)
    addLog('CHECKOUT_INITIATED', `User initiated checkout with ${items.length} items (${totalGrams}g).`, 'SUCCESS')
    closeSidebar()
    router.push(`/${lang}/checkout`)
  }

  const totalGrams = items.reduce((sum, item) => sum + item.quantityGrams, 0)
  const baseTotal = items.reduce((sum, item) => sum + calculateTieredPrice(item), 0)

  return (
    <Dialog.Root open={isSidebarOpen} onOpenChange={(open) => !open && closeSidebar()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[120] bg-slate-900/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-0 right-0 bottom-0 w-full md:max-w-md bg-white shadow-2xl z-[125] flex flex-col">
          
          <div className="p-3 md:p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <Dialog.Title className="text-sm font-bold uppercase tracking-widest text-slate-800 font-mono">
              {t.hero.title} ({totalGrams}g {t.hero.total})
            </Dialog.Title>
            <Dialog.Close className="text-slate-400 hover:text-slate-800 ml-2">
              <FiX size={20} />
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto p-3 md:p-5 space-y-4">
            {items.length === 0 ? (
              <p className="text-slate-500 text-sm font-mono text-center mt-10">
                {t.empty.title}
              </p>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex gap-4 p-2 md:p-3 border border-slate-200">
                  <CartItemImage item={item} />
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate text-xs md:text-sm">
                      {item.product.name}
                    </h3>
                    {item.product.test_results && (
                      <div className="text-[10px] text-slate-500 font-mono mt-1 space-y-0.5">
                        <p>{t.item.batch}{item.product.test_results.batch_number}</p>
                        <p>{t.item.expiry}{item.product.test_results.expiry_date}</p>
                      </div>
                    )}
                    
                    <div className="mt-3 flex items-center justify-between">
                      <QuantityControl dict={dict} item={item} />
                      <span className="font-mono text-xs md:text-sm font-bold text-slate-900 ml-2 md:ml-0">
                        <DynamicPrice 
                          basePrice={calculateTieredPrice(item)} 
                          lang={lang}
                          isB2B={true}
                          isVatExempt={true}
                        />
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <DeleteButton itemId={item.id} aria={t.item.removeAria} />
                  </div>
                </div>
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-slate-50">
              <div className="flex justify-between font-mono text-sm text-slate-800 mb-4">
                <span className='text-xs md:text-sm mr-4'>{t.summary.total}</span>
                <span className="font-bold">
                  <DynamicPrice 
                    basePrice={baseTotal} 
                    lang={lang}
                    isB2B={true}
                    isVatExempt={true}
                  />
                </span>
              </div>
              <button
                className={`w-full h-12 uppercase tracking-widest font-bold text-sm transition-colors ${
                  userRole === 'medical_doctor'
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
                onClick={userRole === 'medical_doctor' ? undefined : handleCheckout}
                disabled={userRole === 'medical_doctor'}
                aria-label={t.checkout.button}
              >
                {userRole === 'medical_doctor' ? t.checkout.blocked : t.checkout.button}
              </button>
              {userRole === 'medical_doctor' && (
                <p className="mt-2 text-[8px] text-rose-500 font-mono text-center leading-tight uppercase tracking-tighter">
                  {t.checkout.doctorNotice}
                </p>
              )}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}