interface CountryLocaleMapping {
  locale: string;
  currency: string;
}

const countryToLocaleMap: Record<string, CountryLocaleMapping> = {
  'GB': { locale: 'en', currency: 'GBP' },
  'DE': { locale: 'de', currency: 'EUR' }
};

const defaultMapping: CountryLocaleMapping = { locale: 'en', currency: 'EUR' };

export function getLocaleAndCurrencyFromCountry(countryCode: string): CountryLocaleMapping {
  return countryToLocaleMap[countryCode.toUpperCase()] || defaultMapping;
}