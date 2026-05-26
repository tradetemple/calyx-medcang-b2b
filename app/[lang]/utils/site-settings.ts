import { SiteSettings } from '@/types/database'
import { unstable_cache } from 'next/cache'
import { CACHE_TAGS, CACHE_TTL } from '@/lib/multi-layer-cache'

export const getSiteSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://calyx-medcang-b2b.gentle-leaf-7cab.workers.dev';

    const settings: SiteSettings = {
      // 1. Identity & Branding
      id: "1",
      site_name: "CALYX MEDICAL B2B",
      site_logo: "/full-logo.svg",
      dark_mode_logo: "/full-logo-dark.svg",
      email_site_logo: "/logo-clinical-email.png",
      email_dark_mode_logo: "/logo-clinical-invoice.png",
      favicon: "/favicon.ico?v=2",
      site_url: siteUrl,
      support_email: "tradetempleab@gmail.com",
      company_address: "ONI 747-N Billo, 106 43 Stockholm, Sweden",
      updated_at: new Date().toISOString(),
      is_b2b: true,
      
      // 2. Clinical Color Palette (Slate & Medical Blue)
      primary_color: "#2a76e0",
      secondary_color: "#235ff5",
      background_color: "#111111",
      text_color: "#f8fafc",

      static_black_color: "#000000",
      static_white_color: "#ffffff",

      // 6. i18n & Currency Logic
      locales: ['en', 'de'],
      default_locale: 'en',
      currency_conversion_rates: {
        'EUR': 1.0,
        'GBP': 0.86,
      },

      // 7. Localized SEO Addresses (JSON-LD)
      locale_addresses: {
        en: {
          streetAddress: "123 Pharma Logistics Way",
          postalCode: "10117",
          phoneNumber: "+49 30 12345678"
        },
        de: {
          streetAddress: "Friedrichstraße 123",
          postalCode: "10117",
          phoneNumber: "+49 30 12345678"
        }
      },

      // 8. Social Links
      social_links: {
        github: "https://github.com/tradetemple/calyx-medcang-b2b",
        linkedIn: "https://www.linkedin.com/in/rasmus-g-2ab12b349/",
      },

      // 9. B2B Payment & Logistics
      shipping_countries: ['DE', 'CZ', 'PL', 'AT'],
      payment_methods: {
        wire_transfer: true,
        sepa_debit: true,
        crypto: false,
        invoice_net30: true
      },
      payment_details: {
        wire: {
          bankName: "Deutsche Bank Berlin",
          accountNumber: "DUMMY12345678",
          iban: "DE89 1007 0024 1234 5678 00",
          swift: "DEUTDEBB"
        }
      }
    };

    return settings;
  },
  ['site-settings'],
  {
    tags: [CACHE_TAGS.SITE_SETTINGS],
    revalidate: CACHE_TTL.SITE_SETTINGS,
  }
);