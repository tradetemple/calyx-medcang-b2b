// components/checkout/CartItemWithUpgrade.tsx
'use client'

import Image from 'next/image';
import { CartItem } from '@/stores/optimized-cart-store';
import { useCheckout } from '../context/CheckoutContext';
import { calculateTieredPrice } from '@/lib/checkout/pricing'; // We will use our centralized B2B pricing!
import { formatCurrency } from '@/i18n/utils';

interface CheckoutManifestItemProps {
  item: CartItem;
}

export default function CheckoutManifestItem({ item }: CheckoutManifestItemProps) {
  const { checkoutState, dict, locale } = useCheckout();
  const t = dict.summary;

  const imageUrl = item.product.product_image;
  const batchInfo = item.product.test_results;

  const baseItemTotal = calculateTieredPrice(item);
  const basePricePerGram = baseItemTotal / (item.quantityGrams || 1);

  const conversionRatio = checkoutState.finalTotal > 0 
    ? checkoutState.convertedFinalTotal / checkoutState.finalTotal 
    : 1;

  const itemTotal = baseItemTotal * conversionRatio;
  const pricePerGram = basePricePerGram * conversionRatio;

  return (
    <div className="flex gap-4 py-4 border-b border-slate-200">
      <div className="relative w-20 h-20 bg-slate-50 border border-slate-200 p-1 flex-shrink-0">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={item.product.name}
            fill
            className="object-contain"
            sizes="80px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 004.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5v-5.714c0-.597-.237-1.17-.659-1.591L14.25 3.104m-4.5 0a24.301 24.301 0 004.5 0m-4.5 0a24.295 24.295 0 00-4.5 0m0 0a24.301 24.301 0 00-4.5 0m4.5 0v5.714c0 .597-.237 1.17-.659 1.591L5 14.5m14 0l-5.041-5.041a2.25 2.25 0 00-3.182 0L5 14.5" /></svg>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-slate-900 truncate">{item.product.name}</h3>
        
        {batchInfo && (
          <div className="mt-1 space-y-0.5 text-xs text-slate-500 font-mono">
            <p>{t.batch} <span className="font-semibold text-slate-700">{batchInfo.batch_number}</span></p>
            <p>{t.expires} <span className="font-semibold text-slate-700">{batchInfo.expiry_date}</span></p>
          </div>
        )}

        <div className="mt-2 text-sm text-slate-600">
          {item.quantityGrams}g
          <span className="text-slate-400 mx-2">×</span>
          {formatCurrency(pricePerGram, locale || checkoutState.locale || 'en', checkoutState.targetCurrency)} / {t.unit}
        </div>
      </div>

      <div className="text-right">
        <p className="font-mono font-bold text-slate-900">
          {formatCurrency(itemTotal, locale || checkoutState.locale || 'en', checkoutState.targetCurrency)}
        </p>
      </div>
    </div>
  );
}