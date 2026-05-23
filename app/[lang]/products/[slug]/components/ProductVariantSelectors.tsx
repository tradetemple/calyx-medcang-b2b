'use client'

import { useState, useMemo } from 'react';
import { Plus, Minus, Info, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/i18n/utils';
import QuotaMeter from '@/components/cart/QuotaMeter';
import { useB2BCartStore } from '@/stores/optimized-cart-store';
import { useAuditStore } from '@/stores/useAuditStore';
import AddToCartButton from './AddToCartButton'; // Direct import since we stripped the wrapper

// Cleaned up props: Removed useless B2C props like siteSettings, isKgPrice
interface ProcurementControllerProps {
  product: any; // Ideally typed to MedicalProduct from our Zod schema
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
  // --- LIVE REGULATORY QUOTA FROM CART ---
  const items = useB2BCartStore(state => state.items);
  const addAuditLog = useAuditStore(state => state.addLog);
  
  // O(n) simple calculation since items now hold quantityGrams directly!
  const currentUsageGrams = useMemo(() => {
    return items.reduce((total, item) => total + item.quantityGrams, 0);
  }, [items]);

  const remainingQuota = MONTHLY_QUOTA_GRAMS - currentUsageGrams;

  // State for the procurement volume slider
  const [quantity, setQuantity] = useState<number>(moqGrams);

  // --- DYNAMIC PRICING ENGINE ---
  const tiers = product?.price_chart?.tiers || [];
  const fallbackPrice = (product?.price_per_kg || 0) / 1000; // Convert kg price to gram price if no tiers exist

  const currentUnitPrice = useMemo(() => {
    if (tiers.length === 0) return fallbackPrice;

    // Sort tiers descending to find the highest 'min' that is <= quantity
    const activeTier = [...tiers]
      .sort((a, b) => b.min - a.min)
      .find(tier => quantity >= tier.min);

    return activeTier ? activeTier.price : tiers[0].price;
  }, [quantity, tiers, fallbackPrice]);

  const totalPrice = quantity * currentUnitPrice;

  // --- LOGIC ---
  const handleIncrement = () => {
    setQuantity(prev => {
      const next = prev + 50; // B2B Med increments usually step by 50g
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

  // Status check
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
    <div className="space-y-6">
      {/* 1. REGULATORY QUOTA METER */}
      <QuotaMeter t={t} pendingGrams={quantity} />

      {/* 2. QUANTITY CONTROLLER */}
      <div className="space-y-3 p-4 bg-slate-50 border border-slate-200">
        <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-800 block">
              {t.quantityControl.title}
            </label>
            <span className="text-[10px] font-bold text-slate-900 bg-slate-200 px-2 py-0.5 border border-slate-300 font-mono">
                {t.quantityControl.currentRate} {formatCurrency(currentUnitPrice, locale, 'EUR')}/g
            </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-slate-300 bg-white">
            <button 
              onClick={handleDecrement}
              className="p-3 hover:bg-slate-100 transition-colors border-r border-slate-300 disabled:opacity-30 text-slate-700"
              disabled={quantity <= moqGrams}
            >
              <Minus className="w-4 h-4" />
            </button>
            
            <input 
              type="number" 
              value={quantity}
              readOnly
              className="w-24 text-center font-mono bg-white font-bold text-lg focus:outline-none text-slate-900"
            />

            <button 
              onClick={handleIncrement}
              className="p-3 hover:bg-slate-100 transition-colors border-l border-slate-300 disabled:opacity-30 text-slate-700"
              disabled={quantity + 50 > remainingQuota}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-500">{t.quantityControl.moq}</span>
            <span className="text-sm font-mono font-bold text-slate-800">{moqGrams}g</span>
          </div>
        </div>
      </div>

      {/* 3. PRICE BREAKDOWN */}
      <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">{t.quantityControl.estTotal}</span>
          <p className="text-2xl font-mono font-bold text-slate-900">
            {formatCurrency(totalPrice, locale, 'EUR')}
          </p>
        </div>
        
        {/* Visual cue that they hit a discount tier */}
        {tiers.length > 1 && quantity >= tiers[1]?.min && (
            <div className="flex items-center gap-1 text-emerald-600">
                <TrendingDown className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase italic tracking-wider">{t.quantityControl.volDiscount}</span>
            </div>
        )}
      </div>

      {/* 4. ADD TO CART ACTION */}
      <div className="pt-2">
        <AddToCartButton
          productId={product.id}
          moqGrams={moqGrams}
          defaultQuantity={quantity} 
          t={t}
          product={product}
          selectedVariantImage={product.product_image || ''}
          locale={locale}
          disabled={quantity < moqGrams || quantity > remainingQuota}
          price={currentUnitPrice}
        />
      </div>

      <div className="flex items-center gap-2 justify-center py-2 text-slate-400">
        <Info className="w-3 h-3" />
        <span className="text-[10px] uppercase tracking-widest font-bold">
          {t.quantityControl.auditTrail}
        </span>
      </div>
    </div>
  );
}