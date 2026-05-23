import { ShippingAddress, CartItem } from '@/types/cart';
import { SiteSettings } from './database';

export type { CartItem };

export interface ShippingMethod {
  id: string;
  name?: string;
  description?: string;
  price: number;
  convertedPrice?: number;
  currency?: string;
  ship_from_country?: string;
}

export interface CheckoutInput {
  cartItems: CartItem[];
  btmNumber?: string;
  shippingAddress: ShippingAddress;
  billingAddress: ShippingAddress;
  billingIsSameAsShipping: boolean;
  couponCode?: string;
  couponId?: string | null;
  paymentMethod: 'invoice_30' | 'sepa' ;
  userId?: string | null;
  locale: string;
  siteSettings: SiteSettings;
  userEmail: string;
  userPhone: string;
  companyName: string;
  selectedShippingMethod: ShippingMethod | null;
  userLoyaltyPoints: number;
  targetCurrency: string;
  currencyRates: Record<string, number>;
  discountExemptCategoryIds?: string[];
}

export interface CheckoutState {
  subtotal: number;
  shippingCost: number;
  feeAmount: number;
  finalTotal: number;
  errors: string[];
  warnings: string[];
  targetCurrency: string;
  locale: string;
  convertedSubtotal: number;
  convertedShippingCost: number;
  convertedFeeAmount: number;
  convertedFinalTotal: number;
  amountMinor: number;
  paymentMethod: string;
  availableShippingMethods?: ShippingMethod[];
  cartItems?: CartItem[];
}
