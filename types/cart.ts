import { z } from 'zod';
import { MedicalProductSchema } from './medical-product';

export const CartItemSchema = z.object({
  id: z.string(),
  product: MedicalProductSchema,
  quantityGrams: z.number(),
  addedAt: z.number(),
});

export const ShippingAddressSchema = z.object({
  company_name: z.string(),
  address_line1: z.string(),
  address_line2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  postal_code: z.string(),
  country: z.string(),
  notes: z.string().optional(),
  vat_number: z.string().optional(),
  gln: z.string().optional(),
  pharmacy_license: z.string().optional(),
  btm_license: z.string().optional(),
  responsible_person: z.string().optional(),
  delivery_time_window: z.string().optional(),
});

export const AddToCartButtonPropsSchema = z.object({
  productId: z.string(),
  moqGrams: z.number(),
  addToCartText: z.string().optional(),
  quantityLabel: z.string().optional(),
  defaultUnit: z.string().optional(),
  unitOptions: z.array(z.object({
    value: z.string(),
    label: z.string()
  })).optional(),
  defaultQuantity: z.number().optional(),
  conversionFactor: z.number().optional(),
  kg_price: z.boolean().optional(),
  selectedSkuId: z.string().optional(),
  selectedOptionName: z.string().optional(),
  t: z.any(),
  disabled: z.boolean().optional(),
  product: z.any().optional(),
  selectedSku: z.any().optional(),
  selectedVariantImage: z.string().nullable().optional(),
  siteSettings: z.any().optional(),
  locale: z.string().optional(),
  price: z.number().optional(),
});

export type CartItem = z.infer<typeof CartItemSchema>;
export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;
export type AddToCartButtonProps = z.infer<typeof AddToCartButtonPropsSchema>;
