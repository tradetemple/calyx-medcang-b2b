'use server'

import { z } from 'zod';
import { CheckoutInput, CheckoutState } from '@/types/checkout-types';
import { calculateCheckoutState } from '@/lib/checkout/calculator';
import { getSiteSettings } from '@/app/[lang]/utils/site-settings';
import { getCurrencyFromLocale } from '@/i18n/utils';
import { CartItemSchema, ShippingAddressSchema } from '@/types/cart'; 

const CheckoutInputSchema = z.object({
  cartItems: z.array(CartItemSchema),
  locale: z.string(),
  targetCurrency: z.string().optional(),
  shippingAddress: ShippingAddressSchema.optional()
});

export async function getUpdatedCheckoutState(input: CheckoutInput): Promise<CheckoutState> {
  const validation = CheckoutInputSchema.safeParse(input);
  if (!validation.success) {
    console.error("Zod Validation Error in checkoutActions:", validation.error);
    throw new Error('Invalid checkout input data.');
  }
  
  const { cartItems, locale, targetCurrency: inputCurrency } = validation.data;

  const siteSettings = await getSiteSettings();
  if (!siteSettings) {
    throw new Error('Site settings not found');
  }

  const targetCurrency = inputCurrency || getCurrencyFromLocale(locale);

  const calculatorInput: CheckoutInput = {
    ...input,
    cartItems: cartItems,
    userId: null,
    siteSettings: siteSettings,
    targetCurrency: targetCurrency,
    currencyRates: siteSettings.currency_conversion_rates || {},
  };

  const checkoutState = await calculateCheckoutState(calculatorInput);

  return {
    ...checkoutState,
    cartItems: cartItems,
  };
}