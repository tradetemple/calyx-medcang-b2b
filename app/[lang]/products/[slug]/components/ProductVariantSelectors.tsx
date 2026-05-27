'use client'

import { useState, useMemo } from 'react';
import { Plus, Minus, Info, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/i18n/utils';
import QuotaMeter from '@/components/cart/QuotaMeter';
import { useB2BCartStore } from '@/stores/optimized-cart-store';
import { useAuditStore } from '@/stores/useAuditStore';
import AddToCartButton from './AddToCartButton';

interface ProcurementControllerProps {
  product: any;
  moqGrams: number;
  t: any;
  locale: string;
}

const MONTHLY_QUOTA_GRAMS = 5000;

export default function ProcurementController({
  product,
  moqGrams,
  t,
  locale
}: ProcurementControllerProps) {
  const items = useB2BCartStore(state => state.items);
  const addAuditLog = useAuditStore(state => state.addLog);
  
  const currentUsageGrams = useMemo(() => {
    return items.reduce((total, item) => total + item.quantityGrams, 0);
  }, [items]);

  const remainingQuota = MONTHLY_QUOTA_GRAMS - currentUsageGrams;

  const [quantity, setQuantity] = useState<number>(moqGrams);

  const tiers = product?.price_chart?.tiers || [];
  const fallbackPrice = (product?.price_per_kg || 0) / 1000; 

  const currentUnitPrice = useMemo(() => {
    if (tiers.length === 0) return fallbackPrice;

    const activeTier = [...tiers]
      .sort((a, b) => b.min - a.min)
      .find(tier => quantity >= tier.min);

    return activeTier ? activeTier.price : tiers[0].price;
  }, [quantity, tiers, fallbackPrice]);

  const totalPrice = quantity * currentUnitPrice;

  const handleIncrement = () => {
    setQuantity(prev => {
      const next = prev + 50; 
      if (next > remainingQuota) {
        addAuditLog('QUOTA_EXCEEDED', `Attempted to exceed monthly BtM limit with ${next}g of ${product.name}`, 'FAILURE');
        return prev;
      }
      return next;
    });
  };

  const handleDecrement = () => {
    setQuantity(prev => (prev - 50 >= moqGrams ? prev - 50 : prev));
  };

  if (product.status === 'inactive' || product.status === 'outofstock') {
    return (
      <div className="p-4 bg-slate-100 border border-slate-200 rounded-none">
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider text-center">
          {t?.outOfStock || 'Batch Exhausted'}
        </p>
      </div>
    );
  }

  return (
    <div className="md:space-y-6">
      <QuotaMeter t={t} pendingGrams={quantity} />

      <div className="space-y-2 md:space-y-3 p-3 md:p-4 bg-white md:bg-slate-50 md:border border-slate-200">
        <label className="hidden lg:block text-xs font-bold uppercase tracking-widest text-slate-800 block">
          {t.quantityControl.title}
        </label>
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-slate-300 bg-white">
            <button 
              onClick={handleDecrement}
              className="p-2 md:p-3 hover:bg-slate-100 transition-colors border-r border-slate-300 disabled:opacity-30 text-slate-700"
              disabled={quantity <= moqGrams}
              aria-label={t.quantityControl.decrement}
            >
              <Minus className="w-4 h-4" />
            </button>
            
            <input 
              type="number" 
              value={quantity}
              aria-label={`${t.quantityControl.selected} ${quantity}`}
              readOnly
              className="w-16 md:w-24 text-center font-mono bg-white font-bold text-xs md:text-lg focus:outline-none text-slate-900"
            />

            <button 
              onClick={handleIncrement}
              className="p-2 md:p-3 hover:bg-slate-100 transition-colors border-l border-slate-300 disabled:opacity-30 text-slate-700"
              disabled={quantity + 50 > remainingQuota}
              aria-label={t.quantityControl.increment}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-500">{t.quantityControl.moq}</span>
            <span className="text-sm font-mono font-bold text-slate-800">{moqGrams}g</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-900 bg-slate-200 px-2 py-0.5 border border-slate-300 font-mono">
                {t.quantityControl.currentRate} {formatCurrency(currentUnitPrice, locale, 'EUR')}/g
            </span>
        </div>
        </div>
      </div>

      <div className="md:pt-4 md:border-t border-slate-200 flex items-center justify-between px-2">
        <div className='hidden md:block'>
          <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">{t.quantityControl.estTotal}</span>
          <p className="text-2xl font-mono font-bold text-slate-900">
            {formatCurrency(totalPrice, locale, 'EUR')}
          </p>
        </div>
        
        {tiers.length > 1 && quantity >= tiers[1]?.min && (
            <div className="flex items-center gap-1 text-emerald-600 m-auto md:m-0">
                <TrendingDown className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase italic tracking-wider">{t.quantityControl.volDiscount}</span>
            </div>
        )}
      </div>

      <div className="pt-2 px-2">
        <AddToCartButton
          productId={product.id}
          moqGrams={moqGrams}
          defaultQuantity={quantity} 
          t={t}
          product={product}
          selectedVariantImage={product.product_image || ''}
          locale={locale}
          disabled={quantity < moqGrams || quantity > remainingQuota}
          price={totalPrice}
        />
      </div>

      <div className="flex items-center gap-2 justify-center py-2 text-slate-600">
        <Info className="w-3 h-3" />
        <span className="text-[10px] uppercase tracking-widest font-bold">
          {t.quantityControl.auditTrail}
        </span>
      </div>
    </div>
  );
}