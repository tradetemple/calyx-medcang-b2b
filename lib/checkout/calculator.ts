import { 
  CheckoutInput, 
  CheckoutState, 
  ShippingMethod, 
  CheckoutInputSchema
} from '@/types/checkout-types';
import { CartItem } from '@/types/cart';
import { getDictionary } from '@/app/[lang]/dictionaries';
import { z } from 'zod';
import { calculateTieredPrice, convertAmount } from '@/lib/checkout/pricing';

/**
 * B2B Medical Checkout Calculator
 */
export async function calculateCheckoutState(input: CheckoutInput): Promise<CheckoutState> {
  const validation = CheckoutInputSchema.safeParse(input);
  const errors: string[] = [];
  
  if (!validation.success) {
    validation.error.issues.forEach((issue: any) => {
      const fieldPath = issue.path.join('.');
      const value = fieldPath.split('.').reduce((obj: any, key: string) => obj?.[key], input);
      const isNotEmpty = value !== undefined && value !== null && value !== '';
      
      // Suppress validation errors for empty fields on initial load
      // We only show "invalid" errors if the user has actually entered something
      if (issue.code === 'invalid_string' && issue.validation === 'email') {
        if (isNotEmpty) {
          errors.push('invalidEmail');
        }
      } else if (issue.code === 'too_small' || issue.code === 'invalid_type') {
        // Only push 'required' if we have some data but it's invalid (e.g. too short)
        // Note: For initial empty fields, we don't push anything to the errors array
        if (isNotEmpty) {
           errors.push('required');
        }
      } else {
        // Fallback for other Zod errors
        if (isNotEmpty) {
          errors.push(issue.message);
        }
      }
    });
  }

  // Use validated data if successful, otherwise fallback to raw input for calculations
  const data = validation.success ? validation.data : input;

  const {
    cartItems,
    shippingAddress,
    paymentMethod,
    locale,
    targetCurrency = 'EUR',
    currencyRates = { 'EUR': 1 },
  } = data;

  const warnings: string[] = [];

  // 1. Dictionaries for B2B specific messaging
  const dict = await getDictionary(locale);
    
  /**
   * REGULATORY MOCK DATA
   * In a real B2B Medical setup, shipping is a flat, high-security fee 
   * compliant with GDP (Good Distribution Practice).
   */
  const shippingMethodLabels = 'mockMethod' in dict.checkout.shipping
    ? dict.checkout.shipping.mockMethod
    : {
        title: 'GDP Secure Courier',
        description: 'High-security medical transport compliant with GDP.',
      };

  const GDP_SHIPPING_METHOD: ShippingMethod = {
    id: 'gdp-secure-courier',
    name: shippingMethodLabels.title,
    price: 45.00, // Flat fee in EUR for high-security medical transport
    description: shippingMethodLabels.description,
    convertedPrice: 0 // Will be calculated per currency
  };

  // 2. Base Subtotal Calculation
  // Iterates through snapshots and applies B2B tier logic (e.g. 500g price vs 50g price)
  const baseSubtotal = cartItems.reduce((total: number, item: CartItem) => {
    return total + calculateTieredPrice(item);
  }, 0);

  // 3. GDP Shipping Calculation
  // In this B2B demo, we use a flat GDP fee if a country is selected
  const shippingCost = shippingAddress?.country ? GDP_SHIPPING_METHOD.price : 0;
  
  const availableShippingMethods: ShippingMethod[] = shippingAddress?.country 
    ? [{
        ...GDP_SHIPPING_METHOD,
        convertedPrice: convertAmount(GDP_SHIPPING_METHOD.price, targetCurrency, currencyRates)
      }]
    : [];

  // 4. Payment Fees (B2B Context: Invoices are free, Credit Cards carry processing fees)
  const feeAmount = 0;

  // 5. Total Calculation (B2B is usually VAT Exempt/Reverse Charge)
  const finalTotal = baseSubtotal + shippingCost + feeAmount;

  // 6. Currency Conversions (Strictly typed conversion using targetCurrency)
  const convertedSubtotal = convertAmount(baseSubtotal, targetCurrency, currencyRates);
  const convertedShippingCost = convertAmount(shippingCost, targetCurrency, currencyRates);
  const convertedFeeAmount = convertAmount(feeAmount, targetCurrency, currencyRates);
  const convertedFinalTotal = convertAmount(finalTotal, targetCurrency, currencyRates);
  
  // Stripe/Payment Provider minor units
  const amountMinor = Math.round(convertedFinalTotal * 100);

  return {
    subtotal: baseSubtotal,
    shippingCost,
    feeAmount,
    finalTotal,
    errors,
    warnings,
    paymentMethod: paymentMethod || 'sepa_invoice',
    targetCurrency,
    locale,
    convertedSubtotal,
    convertedShippingCost,
    convertedFeeAmount,
    convertedFinalTotal,
    amountMinor,
    availableShippingMethods,
    cartItems, // Return items as validated snapshots
  };
}