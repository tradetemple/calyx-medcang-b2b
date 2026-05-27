
import { getSiteSettings } from '@/app/[lang]/utils/site-settings';
import CurrencyClientProvider from './CurrencyClientProvider';
import React from 'react';

export default async function CurrencyProvider({ children }: { children: React.ReactNode }) {
  let currencyRates: Record<string, number> = {};
  try {
    const siteSettings = await getSiteSettings();
    currencyRates = siteSettings.currency_conversion_rates || {};
  } catch (error) {
    console.error("Failed to fetch site settings for CurrencyProvider:", error);
  }

  return (
    <CurrencyClientProvider currencyRates={currencyRates}>
      {children}
    </CurrencyClientProvider>
  );
}
