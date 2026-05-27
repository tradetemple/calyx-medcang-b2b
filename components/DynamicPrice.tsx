'use client'
import { useEffect, useState, useMemo } from 'react'
import { formatCurrency } from '@/i18n/utils'
import { useCurrencyStore } from '@/stores/currencyStore'
import { useCurrencyContext } from '@/stores/CurrencyContext';

export default function DynamicPrice({
  basePrice,
  lang,
  isVatExempt = false,
  vatRate = 0.25,
  isB2B = false,
  fixedCurrency,
  fixedAmount
}: any) {
  const { currencyRates } = useCurrencyContext();
  
  const preferredCurrency = useCurrencyStore((state) => state.preferredCurrency);
  const detectedCountry = useCurrencyStore((state) => state.detectedCountry);
  const getActiveCurrency = useCurrencyStore((state) => state.getActiveCurrency);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const displayPrice = useMemo(() => {
    const defaultCurrency = 'EUR'; 
    
    if (!isMounted && !fixedCurrency) {
        return formatCurrency(basePrice || 0, lang, defaultCurrency);
    }

    const currentCurrency = fixedCurrency || getActiveCurrency(lang);
    
    if (fixedAmount !== undefined) {
      return formatCurrency(fixedAmount, lang, currentCurrency);
    }

    let amount = basePrice || 0;
    if (isB2B) {
      if (!isVatExempt) amount = amount * (1 + vatRate);
    } else {
      if (isVatExempt) amount = amount / (1 + vatRate);
    }

    const rate = currencyRates[currentCurrency] || 1;
    
    return formatCurrency(amount * rate, lang, currentCurrency);
  }, [basePrice, fixedAmount, fixedCurrency, isVatExempt, vatRate, isB2B, lang, isMounted, preferredCurrency, detectedCountry, getActiveCurrency, currencyRates]);

  return <span suppressHydrationWarning>{displayPrice}</span>
}