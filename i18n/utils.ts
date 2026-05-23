/**
 * Maps locale codes to their corresponding currency codes
 */
const localeToCurrency: Record<string, string> = {
  en: 'EUR',   // English - Euro (Default for B2B)
  de: 'EUR'   // German - Euro
};

/**
 * Default base currency for the application
 */
const BASE_CURRENCY = 'EUR';

/**
 * Gets the currency code for a given locale
 */
export function getCurrencyFromLocale(locale: string): string {
  return localeToCurrency[locale] || BASE_CURRENCY;
}

/**
 * Formats a price according to the specified locale and currency
 */
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
