import { 
  CheckoutInput, 
  CheckoutState, 
  ShippingMethod, 
  CheckoutInputSchema
} from '@/types/checkout-types';
import { CartItem } from '@/types/cart';
import { getDictionary } from '@/app/[lang]/dictionaries';
import { calculateTieredPrice, convertAmount } from '@/lib/checkout/pricing';

export async function calculateCheckoutState(input: CheckoutInput): Promise<CheckoutState> {
  const validation = CheckoutInputSchema.safeParse(input);
  const errors: string[] = [];
  
  if (!validation.success) {
    validation.error.issues.forEach((issue: any) => {
      const fieldPath = issue.path.join('.');
      const value = fieldPath.split('.').reduce((obj: any, key: string) => obj?.[key], input);
      const isNotEmpty = value !== undefined && value !== null && value !== '';
      
      if (issue.code === 'invalid_string' && issue.validation === 'email') {
        if (isNotEmpty) {
          errors.push('invalidEmail');
        }
      } else if (issue.code === 'too_small' || issue.code === 'invalid_type') {
        if (isNotEmpty) {
           errors.push('required');
        }
      } else {
        if (isNotEmpty) {
          errors.push(issue.message);
        }
      }
    });
  }

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

  const dict = await getDictionary(locale);
    
  const shippingMethodLabels = 'mockMethod' in dict.checkout.shipping
    ? dict.checkout.shipping.mockMethod
    : {
        title: 'GDP Secure Courier',
        description: 'High-security medical transport compliant with GDP.',
      };

  const GDP_SHIPPING_METHOD: ShippingMethod = {
    id: 'gdp-secure-courier',
    name: shippingMethodLabels.title,
    price: 45.00,
    description: shippingMethodLabels.description,
    convertedPrice: 0
  };

  const baseSubtotal = cartItems.reduce((total: number, item: CartItem) => {
    return total + calculateTieredPrice(item);
  }, 0);

  const shippingCost = shippingAddress?.country ? GDP_SHIPPING_METHOD.price : 0;
  
  const availableShippingMethods: ShippingMethod[] = shippingAddress?.country 
    ? [{
        ...GDP_SHIPPING_METHOD,
        convertedPrice: convertAmount(GDP_SHIPPING_METHOD.price, targetCurrency, currencyRates)
      }]
    : [];

  const feeAmount = 0;

  const finalTotal = baseSubtotal + shippingCost + feeAmount;

  const convertedSubtotal = convertAmount(baseSubtotal, targetCurrency, currencyRates);
  const convertedShippingCost = convertAmount(shippingCost, targetCurrency, currencyRates);
  const convertedFeeAmount = convertAmount(feeAmount, targetCurrency, currencyRates);
  const convertedFinalTotal = convertAmount(finalTotal, targetCurrency, currencyRates);
  
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
    cartItems,
  };
}