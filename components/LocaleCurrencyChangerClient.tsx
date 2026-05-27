'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { getCurrencyFromLocale } from '@/i18n/utils';
import { useCurrencyStore } from '@/stores/currencyStore';

interface Language {
  locale: string;
  name: string;
  flag: string;
}

interface Currency {
  code: string;
  symbol: string;
  name: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  { locale: 'en', name: 'English', flag: '🇬🇧' },
  { locale: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

const CURRENCIES: Currency[] = [
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'Pound Sterling', flag: '🇬🇧' },
];

// Path translation cache
const pathTranslationCache: Record<string, string> = {};

interface LocaleCurrencyChangerClientProps {
  direction?: 'up' | 'down';
  alignment?: string;
  closeMenu?: () => void;
  isLocaleChanger?: boolean;
  translations: {
    language: string;
    currencyChanger: {
      title: string;
      detected: string;
      auto: string;
    };
    currencies: Record<string, string>;
  };
  lang: string;
}

export default function LocaleCurrencyChangerClient({
  direction = 'down',
  alignment = 'left-0',
  closeMenu,
  translations,
  lang
}: LocaleCurrencyChangerClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { preferredCurrency, getActiveCurrency, setPreferredCurrency, setDetectedCountry, getCountryBasedCurrency } = useCurrencyStore();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'language' | 'currency'>('language');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const t = translations;

  useEffect(() => {
    setMounted(true);

    const urlParams = new URLSearchParams(window.location.search);
    const countryFromUrl = urlParams.get('country');
    if (countryFromUrl) {
      setDetectedCountry(countryFromUrl);
    }
  }, [setDetectedCountry]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!mounted) {
    return (
      <div className="w-20 h-10 rounded-none bg-bg-main/20 backdrop-blur-sm animate-pulse" />
    );
  }

  const currentLanguage = LANGUAGES.find(language => language.locale === lang) || LANGUAGES[0];
  const activeCurrency = getActiveCurrency(lang);
  const selectedCurrency = CURRENCIES.find(c => c.code === activeCurrency);
  const localeDefaultCurrency = getCurrencyFromLocale(lang);

  const switchLocale = async (newLocale: string) => {
    if (newLocale === lang || !pathname) return;

    try {
      setIsLoading(prev => ({ ...prev, [newLocale]: true }));

      const cacheKey = `${lang}-${newLocale}-${pathname}`;

      let translatedPath;
      if (pathTranslationCache[cacheKey]) {
        translatedPath = pathTranslationCache[cacheKey];
      } else {
        const response = await fetch(
          `/api/translate-path?currentLocale=${lang}&targetLocale=${newLocale}&pathname=${encodeURIComponent(pathname)}`
        );

        const data = await response.json();
        translatedPath = data.translatedPath;
        pathTranslationCache[cacheKey] = translatedPath;
      }

      router.push(translatedPath);

      setIsOpen(false);
      if (closeMenu) {
        closeMenu();
      }
    } catch {
      router.push(`/${newLocale}`);
    } finally {
      setIsLoading(prev => ({ ...prev, [newLocale]: false }));
    }
  };

  const handleCurrencyChange = (selectedCurrencyCode: string) => {
    setPreferredCurrency(selectedCurrencyCode);
    setIsOpen(false);
    if (closeMenu) {
      closeMenu();
    }
  };

  const handleDropdownToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setActiveTab('language');
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="relative inline-block text-left"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={handleDropdownToggle}
        className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-none bg-bg-main/20 backdrop-blur-sm border border-text-main/10 hover:bg-bg-main/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 min-w-0"
        title={`${currentLanguage.name} - ${selectedCurrency?.name || activeCurrency}`}
      >
        <span className="text-base">{currentLanguage.flag}</span>
        <span className="text-sm font-medium text-text-main">
          {selectedCurrency?.symbol || activeCurrency}
        </span>
        <svg
          className={`w-3 h-3 text-text-secondary transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''
            }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className={`${direction === 'up' ? 'absolute bottom-full mb-2' : 'absolute top-full mt-2'} 
          ${alignment} 
          w-52 sm:w-80 md:w-96 rounded-none shadow-xl bg-bg-main/95 backdrop-blur-xl border border-text-main/10 ring-1 ring-primary/5 z-50 max-h-[80vh] overflow-hidden
          ${direction === 'up' ? 'origin-bottom' : 'origin-top'} animate-in fade-in-0 zoom-in-95 duration-200`}
        >
          <div className="sm:hidden">
            <div className="flex border-b border-text-main/10 bg-bg-main/50">
              <button
                onClick={() => setActiveTab('language')}
                className={`flex-1 px-3 py-2.5 text-xs font-medium transition-all duration-200 relative ${activeTab === 'language'
                    ? 'text-secondary'
                    : 'text-text-secondary hover:text-text-main'
                  }`}
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>{currentLanguage.flag}</span>
                  <span>{t.language}</span>
                </div>
                {activeTab === 'language' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('currency')}
                className={`flex-1 px-3 py-2.5 text-xs font-medium transition-all duration-200 relative ${activeTab === 'currency'
                    ? 'text-secondary'
                    : 'text-text-secondary hover:text-text-main'
                  }`}
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>{selectedCurrency?.symbol}</span>
                  <span>{t.currencyChanger.title}</span>
                </div>
                {activeTab === 'currency' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary" />
                )}
              </button>
            </div>
          </div>

          <div className="sm:grid sm:grid-cols-2 sm:divide-x sm:divide-text-main/10">
            <div className={`${activeTab === 'language' ? 'block' : 'hidden'} sm:block`}>
              <h3 className="hidden sm:block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 md:pt-3 md:px-3">
                {t.language}
              </h3>
              <div className="max-h-48 sm:max-h-60 overflow-y-auto pb-3">
                {LANGUAGES.map((language) => (
                  <button
                    key={language.locale}
                    onClick={() => switchLocale(language.locale)}
                    disabled={isLoading[language.locale]}
                    className={`flex items-center w-full px-4 py-3 text-sm transition-colors ${language.locale === lang
                        ? 'bg-secondary/20 text-secondary'
                        : 'text-text-main hover:bg-secondary/10'
                      } disabled:opacity-50`}
                  >
                    <span className="mr-2 text-base">{language.flag}</span>
                    <span className="flex-1 text-left truncate">{language.name}</span>
                    {isLoading[language.locale] && (
                      <div className="ml-2 w-3 h-3 animate-spin rounded-full border border-current border-r-transparent" />
                    )}
                    {language.locale === lang && (
                      <div className="ml-2 w-1.5 h-1.5 bg-secondary rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className={`${activeTab === 'currency' ? 'block' : 'hidden'} sm:block`}>
              <h3 className="hidden sm:block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 md:pt-3 md:px-3">
                {t.currencyChanger.title}
              </h3>
              <div className="max-h-48 sm:max-h-60 overflow-y-auto pb-3">
                {CURRENCIES.map((currency) => {
                  const isSelected = currency.code === activeCurrency;
                  const isCountryBased = currency.code === getCountryBasedCurrency() && !preferredCurrency;
                  const isLocaleDefault = currency.code === localeDefaultCurrency && !isCountryBased && !preferredCurrency;

                  return (
                    <button
                      key={currency.code}
                      onClick={() => handleCurrencyChange(currency.code)}
                      className={`flex items-center w-full px-2 py-1.5 text-sm transition-colors ${isSelected
                          ? 'bg-secondary/20 text-secondary'
                          : 'text-text-main hover:bg-secondary/10'
                        }`}
                    >
                      <span className="mr-2 text-base">{currency.flag}</span>
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">{currency.code}</span>
                          <span className="text-text-secondary text-xs">{currency.symbol}</span>
                          {isCountryBased && (
                            <span className="text-xs bg-green-500/20 text-green-600 px-1 py-0.5 rounded text-[10px]">
                              📍
                            </span>
                          )}
                          {isLocaleDefault && !isCountryBased && (
                            <span className="text-xs bg-secondary/20 text-secondary px-1 py-0.5 rounded text-[10px]">
                              Auto
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-text-secondary truncate">
                          {t.currencies[currency.code] || currency.name}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="ml-2 w-1.5 h-1.5 bg-secondary rounded-full flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
