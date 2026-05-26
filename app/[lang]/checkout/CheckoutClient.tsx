'use client'

import { CheckoutProvider } from './context/CheckoutContext';
import CheckoutFlow from './CheckoutFlow';
import { CheckoutInput, CheckoutState } from '@/types/checkout-types';
import { SiteSettings } from '@/types/database';

interface CheckoutClientProps {
  initialInput: CheckoutInput;
  initialState: CheckoutState;
  siteSettings: SiteSettings;
  dict: any;
  countryDict: any;
  locale: string;
}

export default function CheckoutClient({
  initialInput,
  initialState,
  siteSettings,
  dict,
  countryDict,
  locale
}: CheckoutClientProps) {

  return (
    <CheckoutProvider
      initialInput={initialInput}
      initialState={initialState}
      siteSettings={siteSettings}
      dict={dict}
      countryDict={countryDict}
      locale={locale}
    >
      <div className="min-h-screen pt-6 md:p-8">
         <div className="max-w-full mx-auto">
            <h1 className="text-xl md:text-3xl font-semibold text-center font-merriweather-main tracking-wide text-text-main">{dict.title || 'Checkout'}</h1>
            <CheckoutFlow lang={locale} />
         </div>
      </div>
    </CheckoutProvider>
  );
}
