import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getCurrencyFromLocale } from '@/i18n/utils'
import { getLocaleAndCurrencyFromCountry } from '@/lib/country-locale-mapping'

interface CurrencyState {
  preferredCurrency: string | null
  detectedCountry: string | null

  setPreferredCurrency: (currency: string) => void
  clearPreferredCurrency: () => void
  setDetectedCountry: (country: string) => void

  getActiveCurrency: (locale: string) => string
  getCountryBasedCurrency: () => string | null
  isUsingCountryBasedCurrency: (locale: string) => boolean
}

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
        
        return preferredCurrency || 
               store.getCountryBasedCurrency() || 
               getCurrencyFromLocale(locale)
      },

      isUsingCountryBasedCurrency: (locale: string) => {
        const { preferredCurrency } = get()
        const store = get()
        
        return !preferredCurrency && !!store.getCountryBasedCurrency()
      }
    }),
    {
      name: 'currency-preference',
      storage: createJSONStorage(() => {
        if (isBrowser) {
          return localStorage
        }
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
      skipHydration: true
    }
  )
)

if (isBrowser) {
  setTimeout(() => {
    useCurrencyStore.persist.rehydrate()
  }, 0)
} 