import { z } from 'zod';
import { ShippingAddressSchema, CartItemSchema } from '@/types/cart';
import { SiteSettingsSchema } from './database';

export const ShippingMethodSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  price: z.number(),
  convertedPrice: z.number().optional(),
  currency: z.string().optional(),
  ship_from_country: z.string().optional(),
});

export const CheckoutInputSchema = z.object({
  cartItems: z.array(CartItemSchema),
  btmNumber: z.string().optional(),
  shippingAddress: ShippingAddressSchema,
  billingAddress: ShippingAddressSchema,
  billingIsSameAsShipping: z.boolean(),
  couponCode: z.string().optional(),
  couponId: z.string().nullable().optional(),
  paymentMethod: z.enum(['invoice_30', 'sepa', 'sepa_invoice']).default('sepa_invoice'),
  userId: z.string().nullable().optional(),
  locale: z.string(),
  siteSettings: SiteSettingsSchema,
  userEmail: z.string().email(),
  userPhone: z.string(),
  companyName: z.string(),
  selectedShippingMethod: ShippingMethodSchema.nullable(),
  userLoyaltyPoints: z.number().default(0),
  targetCurrency: z.string(),
  currencyRates: z.record(z.string(), z.number()),
  discountExemptCategoryIds: z.array(z.string()).optional(),
});

export const CheckoutStateSchema = z.object({
  subtotal: z.number(),
  shippingCost: z.number(),
  feeAmount: z.number(),
  finalTotal: z.number(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
  targetCurrency: z.string(),
  locale: z.string(),
  convertedSubtotal: z.number(),
  convertedShippingCost: z.number(),
  convertedFeeAmount: z.number(),
  convertedFinalTotal: z.number(),
  amountMinor: z.number(),
  paymentMethod: z.string(),
  availableShippingMethods: z.array(ShippingMethodSchema).optional(),
  cartItems: z.array(CartItemSchema).optional(),
});

export type ShippingMethod = z.infer<typeof ShippingMethodSchema>;
export type CheckoutInput = z.infer<typeof CheckoutInputSchema>;
export type CheckoutState = z.infer<typeof CheckoutStateSchema>;
