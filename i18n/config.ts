
const conversionRates: Record<string, number> = {
  EUR: 1,
  GBP: 0.85,
};

function convertPrice(basePrice: number, targetCurrency: string): number {
  return basePrice * (conversionRates[targetCurrency] || 1);
}


const config = {
  locales: ['en', 'de'],
  defaultLocale: 'en',
  pathnames: {
    '/': {
      en: '/',
      de: '/'
    },
    '/about': {
      en: '/about',
      de: '/über-uns',
    },
    '/products': {
      en: '/products',
      de: '/produkte'
    },
    '/products/[slug]': {
      en: '/products/[slug]',
      de: '/produkte/[slug]',
    },
    '/privacy': {
      en: '/privacy',
      de: '/datenschutz'
    },
    '/terms': { 
      en: '/terms',
      de: '/nutzungsbedingungen'
    },
    '/orders': {
      en: '/orders',
      de: '/bestellungen',
    },
    '/orders/[id]': {
      en: '/orders/[id]',
      de: '/bestellungen/[id]'
    },
    '/checkout': {
      en: '/checkout',
      de: '/kasse',
    }
  },
  convertPrice,
};

export default config;
