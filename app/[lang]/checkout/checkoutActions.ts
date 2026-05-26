// lib/checkoutActions.ts
'use server'

import { z } from 'zod';
import { CheckoutInput, CheckoutState } from '@/types/checkout-types';
import { calculateCheckoutState } from '@/lib/checkout/calculator';
import { getSiteSettings } from '@/app/[lang]/utils/site-settings';
import { getCurrencyFromLocale } from '@/i18n/utils';
import { CartItemSchema, ShippingAddressSchema } from '@/types/cart'; 

// This is our gatekeeper. The server will validate the cart items sent from the client.
const CheckoutInputSchema = z.object({
  cartItems: z.array(CartItemSchema),
  locale: z.string(),
  targetCurrency: z.string().optional(),
  shippingAddress: ShippingAddressSchema.optional()
});

/**
 * A streamlined server action that calculates the final checkout state.
 * It trusts the cart item snapshots sent from the client after validating them.
 */
export async function getUpdatedCheckoutState(input: CheckoutInput): Promise<CheckoutState> {
  // 1. GATEKEEPER: Validate the incoming data against Zod schema.
  const validation = CheckoutInputSchema.safeParse(input);
  if (!validation.success) {
    console.error("Zod Validation Error in checkoutActions:", validation.error);
    throw new Error('Invalid checkout input data.');
  }
  
  const { cartItems, locale, targetCurrency: inputCurrency } = validation.data;

  // 2. We no longer need to re-fetch product data. The `cartItems` are already complete.
  
  const siteSettings = await getSiteSettings();
  if (!siteSettings) {
    throw new Error('Site settings not found');
  }

  const targetCurrency = inputCurrency || getCurrencyFromLocale(locale);

  // 3. The calculator now receives the fully-formed, validated cart items directly.
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