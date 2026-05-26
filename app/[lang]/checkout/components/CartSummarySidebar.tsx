'use client'
import { useState } from 'react';

import { useCheckout } from '../context/CheckoutContext';
import CheckoutManifestItem from './CartItemWithUpgrade';
import { formatCurrency } from '@/i18n/utils';

export default function CartSummarySidebar() {
  const { checkoutState, checkoutInput, dict, locale } = useCheckout();
  const t = dict;
  const [isExpanded, setIsExpanded] = useState(false);

  // Use cart items from checkoutState if available (contains translations), otherwise fallback to input
  const displayItems = checkoutState.cartItems || checkoutInput.cartItems;
  const totalItems = displayItems.reduce((acc, item) => acc + item.quantityGrams, 0);

  return (
    <div className="animate-in fade-in duration-700">
      {/* Mobile Header - Click to Expand/Collapse */}
      <div
        className="md:hidden flex items-center justify-between border-b border-static-black/10 pb-4 cursor-pointer active:opacity-70 transition-opacity"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-baseline gap-2">
          <h2 className="text-[10px] uppercase tracking-[0.4em] font-black text-static-black">
            {t.summary.orderSummary}
          </h2>
          <span className="text-[8px] text-slate-600 uppercase tracking-widest font-bold">
            {totalItems} {t.summary.units}
          </span>
        </div>
        <svg 
          className={`w-4 h-4 transition-transform duration-300 ease-out origin-center ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2.5} 
            d="M19 13l-7 7m0 0l-7-7m7-6v13" 
            className="text-static-black/60"
          />
        </svg>
      </div>

      {/* Desktop Header - Always Visible */}
      <div className="hidden md:flex items-baseline justify-between border-b border-static-black/10 pb-6">
        <h2 className="md:text-xs uppercase tracking-[0.4em] font-black text-static-black">
          {t.summary.orderSummary}
        </h2>
        <span className="text-xs text-text-main/40 uppercase tracking-widest font-bold">
          {totalItems} {t.summary.units}
        </span>
      </div>

      {/* Collapsible Content */}
      <div className={`py-2 space-y-10 ${isExpanded ? 'block' : 'hidden md:block'}`}>
        {displayItems.map((item) => (
          <CheckoutManifestItem key={item.id} item={item} />
        ))}
      </div>

      
      <div className={`border-t border-static-black/10 ${isExpanded ? 'block' : 'hidden md:block'}`}>
      
        {checkoutState.convertedShippingCost > 0 && (
          <div className="flex justify-between text-[10px] tracking-[0.3em] uppercase py-2">
            <span className="text-static-black/40 font-bold">{t.summary.shipping}</span>
            <span className="text-static-black font-black tabular-nums">
              {formatCurrency(checkoutState.convertedShippingCost, locale || checkoutState.locale || 'en', checkoutState.targetCurrency)}
            </span>
          </div>
        )}

        {checkoutState.convertedFeeAmount > 0 && (
          <div className="flex justify-between text-[10px] tracking-[0.3em] uppercase">
            <span className="text-static-black/40 font-bold">{t.summary.fee}</span>
            <span className="text-static-black font-black tabular-nums">
              {formatCurrency(checkoutState.convertedFeeAmount, locale || checkoutState.locale || 'en', checkoutState.targetCurrency)}
            </span>
          </div>
        )}

        <div className="pt-4 flex justify-between items-baseline">
          <span className="text-xs md:text-[14px] tracking-[0.5em] uppercase font-black text-static-black">{t.summary.total}</span>
          <div className="text-right">
            <span className="text-base md:text-2xl font-black text-static-black tabular-nums tracking-wide">
              {formatCurrency(checkoutState.convertedFinalTotal, locale || checkoutState.locale || 'en', checkoutState.targetCurrency)}
            </span>
            <p className="text-[6px] md:text-[9px] text-text-main/30 uppercase tracking-[0.3em] font-black md:mt-2">
              {t.summary.exVat}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
