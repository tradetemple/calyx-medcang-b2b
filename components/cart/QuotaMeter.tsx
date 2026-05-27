'use client';

import { useMemo } from 'react';
import { ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useB2BCartStore } from '@/stores/optimized-cart-store';

interface QuotaMeterProps {
  className?: string;
  showLabel?: boolean;
  pendingGrams?: number;
  t: any;
}

const MONTHLY_QUOTA_GRAMS = 5000;

export default function QuotaMeter({ className, showLabel = true, pendingGrams = 0, t }: QuotaMeterProps) {
  const items = useB2BCartStore(state => state.items);

  const currentUsageGrams = useMemo(() => {
    return items.reduce((total, item) => total + item.quantityGrams, 0);
  }, [items]);

  const projectedUsage = currentUsageGrams + pendingGrams;
  
  const usagePercent = Math.min((projectedUsage / MONTHLY_QUOTA_GRAMS) * 100, 100);
  const isNearLimit = usagePercent > 80;
  const isOverLimit = projectedUsage > MONTHLY_QUOTA_GRAMS;

  return (
    <div className={cn("p-3 md:p-4 bg-white md:bg-slate-50 border border-slate-200 rounded-none space-y-2 md:space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className={cn(
            "w-4 h-auto", 
            isOverLimit ? "text-red-600" : isNearLimit ? "text-amber-500" : "text-blue-600"
          )} />
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-700">
            {t.quotaMeter.title}
          </span>
        </div>
        <span className={cn(
          "text-[10px] md:text-xs font-mono font-medium",
          isOverLimit ? "text-red-600 font-bold" : "text-slate-500"
        )}>
          {projectedUsage} / {MONTHLY_QUOTA_GRAMS}g
        </span>
      </div>

      <div className="h-1 md:h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-500",
            isOverLimit ? "bg-red-600" : isNearLimit ? "bg-amber-500" : "bg-slate-900"
          )}
          style={{ width: `${usagePercent}%` }}
        />
      </div>

      {showLabel && (
        <p className="hidden md:block text-[10px] text-slate-500 leading-relaxed italic">
          {t.quotaMeter.description}
        </p>
      )}
    </div>
  );
}