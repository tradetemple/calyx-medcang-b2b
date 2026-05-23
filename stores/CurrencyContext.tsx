'use client';

import { createContext, useContext } from 'react';

interface CurrencyContextType {
  currencyRates: Record<string, number>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function useCurrencyContext() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrencyContext must be used within a CurrencyProvider');
  }
  return context;
}

export default CurrencyContext;
