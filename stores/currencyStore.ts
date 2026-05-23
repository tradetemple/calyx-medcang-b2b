import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getCurrencyFromLocale } from '@/i18n/utils'
import { getLocaleAndCurrencyFromCountry } from '@/lib/country-locale-mapping'

interface CurrencyState {
  // User's preferred currency (overrides locale default)
  preferredCurrency: string | null
  // Detected country from IP/headers
  detectedCountry: string | null

  // Actions
  setPreferredCurrency: (currency: string) => void
  clearPreferredCurrency: () => void
  setDetectedCountry: (country: string) => void

  // Computed: returns preferred currency, country-based currency, or locale default
  getActiveCurrency: (locale: string) => string
  getCountryBasedCurrency: () => string | null
  isUsingCountryBasedCurrency: (locale: string) => boolean
}

// Add a helper to check if we're in a browser environment
const isBrowser = typeof window !== 'undefined'

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      preferredCurrency: null,
      detectedCountry: null,

      setPreferredCurrency: (currency) => {
        set({ preferredCurrency: currency });
      },
      clearPreferredCurrency: () => set({ preferredCurrency: null }),
      setDetectedCountry: (country) => {
        set({ detectedCountry: country });
      },

      getCountryBasedCurrency: () => {
        const { detectedCountry } = get()
        if (detectedCountry) {
          const { currency } = getLocaleAndCurrencyFromCountry(detectedCountry)
          return currency
        }
        return null
      },

      getActiveCurrency: (locale: string) => {
        const { preferredCurrency } = get()
        const store = get()
        
        // Priority: 1. User preference, 2. Country-based (IP/VPN location), 3. Locale default
        return preferredCurrency || 
               store.getCountryBasedCurrency() || 
               getCurrencyFromLocale(locale)
      },

      isUsingCountryBasedCurrency: (locale: string) => {
        const { preferredCurrency } = get()
        const store = get()
        
        // Returns true if we're using country-based currency (no user preference set and country detected)
        return !preferredCurrency && !!store.getCountryBasedCurrency()
      }
    }),
    {
      name: 'currency-preference',
      storage: createJSONStorage(() => {
        // Only use localStorage in the browser
        if (isBrowser) {
          return localStorage
        }
        // Return a dummy storage for SSR
        return {
          getItem: () => null,
          setItem: () => { },
          removeItem: () => { }
        }
      }),
      partialize: (state) => ({
        preferredCurrency: state.preferredCurrency,
        detectedCountry: state.detectedCountry
      }),
      // Skip hydration to avoid SSR/client mismatch issues
      skipHydration: true
    }
  )
)

// Force hydration when the store is used for the first time in client components
if (isBrowser) {
  // Trigger hydration by accessing the store
  setTimeout(() => {
    useCurrencyStore.persist.rehydrate()
  }, 0)
} 