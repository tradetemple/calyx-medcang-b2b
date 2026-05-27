import CheckoutClient from './CheckoutClient';
import { getHomeData } from '@/app/[lang]/utils/page-data';
import { getProductDataForCheckout } from '@/lib/optimized-products';
import { calculateCheckoutState } from '@/lib/checkout/calculator';
import { CheckoutInput } from '@/types/checkout-types';
import { CartItem } from '@/types/cart';
import { getSiteSettings } from '@/app/[lang]/utils/site-settings';
import { getCurrencyFromLocale } from '@/i18n/utils';
import RoleGuard from '@/components/RoleGuard';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { lang } = await params;
  const resolvedSearchParams = await searchParams;
  const locale = lang;

  const siteSettings = await getSiteSettings();
  if (!siteSettings) {
    throw new Error('Site settings not found');
  }
  
  const directProductId = resolvedSearchParams.product as string | undefined;
  const directQuantity = resolvedSearchParams.quantity ? parseInt(resolvedSearchParams.quantity as string) : 1;
  const isDirectCheckout = !!directProductId;

  let profile: {
    company_name?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    loyalty_points?: number;
    phone?: string;
  } = {};

  let cartItems: CartItem[] = [];
  
  if (isDirectCheckout && directProductId) {
    try {
      const productsForCheckout = await getProductDataForCheckout([directProductId], locale);
      const product = productsForCheckout[0];
      
      if (product) {
        
        const cartItem = {
          id: `direct-${directProductId}-${Date.now()}`,
          productId: directProductId,
          quantityGrams: directQuantity > 0 ? directQuantity : 1,
          product: {
            ...product,
            name: product?.name || 'Unknown Product',
            descriptive_name: (product as any)?.descriptive_name,
            product_image: (product as any)?.product_image,
          } as any,
          addedAt: Date.now(),
        };
        
        cartItems = [cartItem];
      } else {
        console.error('Product not found for direct checkout:', directProductId);
      }
    } catch (error) {
      console.error('Error setting up direct checkout:', error);
    }
  } 

  const { dict } = await getHomeData(locale);
  const targetCurrency = getCurrencyFromLocale(locale);
  const currencyRates = siteSettings.currency_conversion_rates || {};

  const initialCheckoutInput: CheckoutInput = {
    cartItems: cartItems,
    shippingAddress: {
      company_name: profile.company_name || '',
      address_line1: profile.address_line1 || '',
      address_line2: profile.address_line2 || '',
      city: profile.city || '',
      state: profile.state || '',
      postal_code: profile.postal_code || '',
      country: profile.country || '',
      notes: '',
    },
    billingAddress: {
      company_name: profile.company_name || '',
      address_line1: profile.address_line1 || '',
      address_line2: profile.address_line2 || '',
      city: profile.city || '',
      state: profile.state || '',
      postal_code: profile.postal_code || '',
      country: profile.country || '',
      notes: '',
    },
    billingIsSameAsShipping: true,
    paymentMethod: 'sepa',
    userId: null,
    locale: locale,
    siteSettings: siteSettings,
    userEmail: '',
    userPhone: profile.phone || '',
    companyName: profile.company_name || '',
    selectedShippingMethod: null,
    userLoyaltyPoints: profile.loyalty_points || 0,
    targetCurrency: targetCurrency,
    currencyRates: currencyRates,
  };

  const initialCheckoutState = await calculateCheckoutState(initialCheckoutInput);

  return (
    <div className="bg-bg-main min-h-screen">
      <RoleGuard allowedRoles={['verified_pharmacy']} dict={dict.roleGuard}>
        <CheckoutClient
          initialInput={initialCheckoutInput}
          initialState={initialCheckoutState}
          siteSettings={siteSettings}
          dict={dict.checkout}
          countryDict={dict.countries}
          locale={locale}
        />
      </RoleGuard>
    </div>
  );
}
