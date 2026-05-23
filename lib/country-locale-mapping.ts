// Country to locale and currency mapping
interface CountryLocaleMapping {
  locale: string;
  currency: string;
}

const countryToLocaleMap: Record<string, CountryLocaleMapping> = {
  // English-speaking countries
  'US': { locale: 'en', currency: 'USD' },
  'GB': { locale: 'en', currency: 'GBP' },
  'CA': { locale: 'en', currency: 'CAD' },
  'AU': { locale: 'en', currency: 'AUD' },
  'NZ': { locale: 'en', currency: 'NZD' },
  'IE': { locale: 'en', currency: 'EUR' },
  
  // European countries
  'FR': { locale: 'fr', currency: 'EUR' },
  'ES': { locale: 'es', currency: 'EUR' },
  'DE': { locale: 'de', currency: 'EUR' },
  'IT': { locale: 'it', currency: 'EUR' },
  'NL': { locale: 'nl', currency: 'EUR' },
  'PL': { locale: 'pl', currency: 'PLN' },
  'CZ': { locale: 'cs', currency: 'CZK' }, // Czech Republic
  'GR': { locale: 'el', currency: 'EUR' },
  'DK': { locale: 'da', currency: 'DKK' },
  'SE': { locale: 'se', currency: 'SEK' },
  'NO': { locale: 'se', currency: 'NOK' }, // Using Swedish locale for Norway
  'CH': { locale: 'de', currency: 'CHF' }, // Using German locale for Switzerland
  'AT': { locale: 'de', currency: 'EUR' }, // Austria uses German locale
  'BE': { locale: 'fr', currency: 'EUR' }, // Belgium defaults to French
  'PT': { locale: 'es', currency: 'EUR' }, // Portugal uses Spanish locale
  'FI': { locale: 'se', currency: 'EUR' }, // Finland uses Swedish locale
  
  // Other regions
  'CN': { locale: 'en', currency: 'CNY' },
  'IN': { locale: 'en', currency: 'INR' },
  'BR': { locale: 'es', currency: 'BRL' }, // Using Spanish for Brazil
  'MX': { locale: 'es', currency: 'MXN' },
  'AR': { locale: 'es', currency: 'ARS' },
  'CL': { locale: 'es', currency: 'CLP' },
  'CO': { locale: 'es', currency: 'COP' },
  'PH': { locale: 'en', currency: 'PHP' },
  'RU': { locale: 'en', currency: 'RUB' },
  'TH': { locale: 'th', currency: 'THB' },
};

const defaultMapping: CountryLocaleMapping = { locale: 'en', currency: 'EUR' };

export function getLocaleAndCurrencyFromCountry(countryCode: string): CountryLocaleMapping {
  return countryToLocaleMap[countryCode.toUpperCase()] || defaultMapping;
}