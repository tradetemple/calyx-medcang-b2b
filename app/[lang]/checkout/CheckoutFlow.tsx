'use client'

import { useCheckout } from './context/CheckoutContext';
import Step1Address from './steps/Step1Address';
import Step2Shipping from './steps/Step2Shipping';
import Step3Review from './steps/Step3Review';
import Step4Payment from './steps/Step4Payment';
import { useB2BCartStore } from '@/stores/optimized-cart-store'
import CartSummarySidebar from './components/CartSummarySidebar';

export default function CheckoutFlow({ lang }: { lang: string }) {
  const { step, isLoading, checkoutState, dict, checkoutInput } = useCheckout();
  const { items } = useB2BCartStore();
  
  // Check if this is a direct checkout (from URL params)
  const isDirectCheckout = checkoutInput.cartItems.length > 0 && 
    checkoutInput.cartItems[0]?.id?.startsWith('direct-');
  
  // For direct checkout, use checkoutInput.cartItems instead of store items
  const effectiveCartItems = isDirectCheckout ? checkoutInput.cartItems : items;

  if (effectiveCartItems.length === 0 && !isLoading) {
      return (
         <div className="text-center py-20">
            <h2 className="uppercase font-semibold tracking-wider text-static-black mb-8">{dict.errors.emptyCart}</h2>
            <a href={`/${lang}/products`} className="py-4 px-6 bg-static-black text-static-white uppercase font-semibold tracking-widest hover:bg-secondary">{dict.actions.catalogue}</a>
         </div>
      );
  }

  const stepTitles = [
    dict.steps.address,
    dict.steps.shipping,
    dict.steps.review,
    dict.steps.payment
  ];

  return (
    <>
      <div className="max-w-full mx-auto px-2 md:px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-20">
          <div className="flex-1 min-w-0">
            {/* Clinical Progress Bar */}
            <div className="mb-4 md:mb-12">
              {/* Titles Container: Changed to flex with gap-1 to match the bars exactly */}
              <div className="flex gap-1 items-end mb-2">
                {stepTitles.map((title, i) => (
                  <div key={i} className="flex-1"> {/* Each title now occupies exactly 1/4 of the width */}
                    <div className={`text-[7px] md:text-[10px] uppercase tracking-[0.2em] font-bold ${step === i + 1 ? 'text-static-black' : 'text-slate-600'}`}>
                      {title}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bars Container */}
              <div className="flex gap-1 h-[2px] bg-border-main/20">
                {[1, 2, 3, 4].map((s) => (
                  <div 
                    key={s} 
                    className={`flex-1 transition-colors duration-500 ${
                      step >= s ? 'bg-static-black' : 'bg-slate-600/30'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-none border border-static-black/10 p-3 md:p-10">
              {/* Error Display moved inside the clinical container */}
              {checkoutState.errors.length > 0 && (
                  <div className="mb-8 space-y-2 p-6 bg-status-error/5 border border-status-error/20 text-status-error text-[10px] uppercase tracking-widest font-bold">
                    {checkoutState.errors.map((err, i) => (
                        <div key={i}>{dict.checkout?.errors?.[err] || dict.errors?.validation?.[err] || err}</div>
                    ))}
                  </div>
              )}

              {step === 1 && <Step1Address />}
              {step === 2 && <Step2Shipping />}
              {step === 3 && <Step3Review />}
              {step === 4 && <Step4Payment />}
            </div>
          </div>

          {/* Right Sidebar - 1/3 Summary */}
          <div className="lg:w-1/3 space-y-8 order-first lg:order-last">
             <div className="lg:sticky lg:top-24">
                <CartSummarySidebar />
             </div>
          </div>
        </div>
      </div>
    </>
  );
}
