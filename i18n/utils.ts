
const localeToCurrency: Record<string, string> = {
  en: 'EUR', 
  de: 'EUR'  
};

const BASE_CURRENCY = 'EUR';

export function getCurrencyFromLocale(locale: string): string {
  return localeToCurrency[locale] || BASE_CURRENCY;
}

export function formatCurrency(
  amount: number,
  locale: string,
  currency: string
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'code',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}
