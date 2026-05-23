// lib/checkoutActions.ts
'use server'

import { z } from 'zod';
import { CheckoutInput, CheckoutState } from '@/types/checkout-types';
import { calculateCheckoutState } from '@/lib/checkout/calculator';
import { getSiteSettings } from '@/app/[lang]/utils/site-settings';
import { getCurrencyFromLocale } from '@/i18n/utils';
import { CartItemSchema, ShippingAddressSchema } from '@/types/cart'; // Import our Zod schema

// This is our new gatekeeper. The server will now validate the cart items sent from the client.
const CheckoutInputSchema = z.object({
  cartItems: z.array(CartItemSchema),
  // Add other expected input fields here for validation
  locale: z.string(),
  targetCurrency: z.string().optional(),
  shippingAddress: ShippingAddressSchema.optional(), // Strictly typed with centralized schema
  // etc.
});

/**
 * A streamlined server action that calculates the final checkout state.
 * It trusts the cart item snapshots sent from the client after validating them.
 */
export async function getUpdatedCheckoutState(input: CheckoutInput): Promise<CheckoutState> {
  // 1. GATEKEEPER: Validate the incoming data against our Zod schema.
  const validation = CheckoutInputSchema.safeParse(input);
  if (!validation.success) {
    console.error("Zod Validation Error in checkoutActions:", validation.error);
    throw new Error('Invalid checkout input data.');
  }
  
  const { cartItems, locale, targetCurrency: inputCurrency } = validation.data;

  // 2. We no longer need to re-fetch product data. The `cartItems` are already complete.
  // The `getProductDataForCheckout` call is completely removed.
  
  const siteSettings = await getSiteSettings();
  if (!siteSettings) {
    throw new Error('Site settings not found');
  }

  const targetCurrency = inputCurrency || getCurrencyFromLocale(locale);

  // 3. The calculator now receives the fully-formed, validated cart items directly.
  const calculatorInput: CheckoutInput = {
    ...input, // Pass through the rest of the input
    cartItems: cartItems, // Use the validated cart items
    userId: null,
    siteSettings: siteSettings,
    targetCurrency: targetCurrency,
    currencyRates: siteSettings.currency_conversion_rates || {},
  };

  const checkoutState = await calculateCheckoutState(calculatorInput);

  return {
    ...checkoutState,
    cartItems: cartItems, // Return the same validated items back
  };
}

// Note: The other functions like checkAndFilterRestrictedProducts and getShippingMethodsForCountry
// can be kept if needed, but they are not the source of the current error.