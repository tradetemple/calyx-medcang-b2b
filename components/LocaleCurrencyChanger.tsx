import 'server-only';
import { getDictionary } from '@/app/[lang]/dictionaries';
import LocaleCurrencyChangerClient from './LocaleCurrencyChangerClient';

interface LocaleCurrencyChangerProps {
  lang: string;
  direction?: 'up' | 'down';
  alignment?: string;
  closeMenu?: () => void;
  isLocaleChanger?: boolean;
}

export default async function LocaleCurrencyChanger({ lang, ...props }: LocaleCurrencyChangerProps) {
  const dict = await getDictionary(lang);
  
  const translations = {
    language: dict.languageCurrencyChanger.language,
    currencyChanger: {
      title: dict.languageCurrencyChanger.currencyChanger.title,
      detected: dict.languageCurrencyChanger.currencyChanger.detected,
      auto: dict.languageCurrencyChanger.currencyChanger.auto,
    },
    currencies: dict.languageCurrencyChanger.currencies,
  };

  return <LocaleCurrencyChangerClient {...props} lang={lang} translations={translations} />;
}
