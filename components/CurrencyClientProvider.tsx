'use client';

import React from 'react';
import CurrencyContext from '@/stores/CurrencyContext';

interface CurrencyClientProviderProps {
  currencyRates: Record<string, number>;
  children: React.ReactNode;
}

export default function CurrencyClientProvider({ currencyRates, children }: CurrencyClientProviderProps) {
  return (
    <CurrencyContext.Provider value={{ currencyRates }}>
      {children}
    </CurrencyContext.Provider>
  );
}
