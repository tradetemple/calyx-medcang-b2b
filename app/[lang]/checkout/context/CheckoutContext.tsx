'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CheckoutInput, CheckoutState } from '@/types/checkout-types';
import { CartItem } from '@/types/cart';
import { SiteSettings } from '@/types/database';
import { getUpdatedCheckoutState } from '../checkoutActions';
import { useB2BCartStore } from '@/stores/optimized-cart-store';
import { useAuditStore } from '@/stores/useAuditStore';

interface CheckoutContextType {
  step: number;
  setStep: (step: number) => void;
  checkoutInput: CheckoutInput;
  checkoutState: CheckoutState;
  updateInput: (updates: Partial<CheckoutInput>) => void;
  isLoading: boolean;
  refreshCheckoutState: () => Promise<void>;
  siteSettings: SiteSettings;
  dict: any;
  countryDict: any;
  locale: string;
  handleCheckout: (paymentMethod?: string) => Promise<void>;
  goToNextStep: () => Promise<boolean>;
  goToPreviousStep: () => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export function CheckoutProvider({
  children,
  initialInput,
  initialState,
  siteSettings,
  dict,
  countryDict,
  locale,
}: {
  children: ReactNode;
  initialInput: CheckoutInput;
  initialState: CheckoutState;
  siteSettings: SiteSettings;
  dict: any;
  countryDict: any;
  locale: string;
}) {
  const [step, setStep] = useState(1);
  const [checkoutInput, setCheckoutInput] = useState<CheckoutInput>(initialInput);
  const [checkoutState, setCheckoutState] = useState<CheckoutState>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  
  const cartItems = useB2BCartStore(state => state.items);
  const clearCart = useB2BCartStore(state => state.clearCart);
  const router = useRouter();
  const hasSyncedInitialCart = useRef(false);

  useEffect(() => {
    if (cartItems.length > 0 || hasSyncedInitialCart.current) {
      setCheckoutInput(prev => ({
        ...prev,
        cartItems: cartItems as CartItem[],
      }));
      hasSyncedInitialCart.current = true;
    }
  }, [cartItems]);

  const refreshCheckoutState = useCallback(async () => {
    if (checkoutInput.cartItems.length === 0 && hasSyncedInitialCart.current) return;
    setIsLoading(true);
    try {
      const newState = await getUpdatedCheckoutState({ ...checkoutInput, locale });
      setCheckoutState(newState);
    } catch (error) {
      console.error(dict.errors.checkoutState, error);
    } finally {
      setIsLoading(false);
    }
  }, [checkoutInput, locale]);

  useEffect(() => {
    if (hasSyncedInitialCart.current) {
      refreshCheckoutState();
    }
  }, [checkoutInput.cartItems, refreshCheckoutState]);

  const updateInput = useCallback((updates: Partial<CheckoutInput>) => {
    setCheckoutInput(prev => ({ ...prev, ...updates }));
  }, []);

  const goToNextStep = async () => {
    if (step === 1) {
      const { shippingAddress, userEmail } = checkoutInput;
      if (
        !userEmail ||
        !shippingAddress.address_line1 ||
        !shippingAddress.country ||
        !shippingAddress.vat_number ||
        !shippingAddress.pharmacy_license ||
        !shippingAddress.btm_license ||
        !shippingAddress.responsible_person
      ) {
        alert(dict.errors.missingFields);
        return false;
      }
    }
    
    setStep(prev => prev + 1);
    window.scrollTo(0, 0);
    return true;
  };

  const goToPreviousStep = () => {
    setStep(prev => (prev > 1 ? prev - 1 : prev));
    window.scrollTo(0, 0);
  };

  const handleCheckout = async (paymentMethod?: string) => {
    const addLog = useAuditStore.getState().addLog;
    setIsLoading(true);
    setTimeout(() => {
      const selectedPaymentMethod = paymentMethod || checkoutInput.paymentMethod || 'invoice_30';
      addLog('ORDER_CREATED', `Order successfully created for ${checkoutInput.companyName || checkoutInput.userEmail}. Total: ${checkoutState.targetCurrency} ${checkoutState.convertedFinalTotal.toFixed(2)}`, 'SUCCESS');
      const demoOrderData = {
        cartItems: checkoutInput.cartItems,
        shippingAddress: checkoutInput.shippingAddress,
        companyName: checkoutInput.companyName,
        userEmail: checkoutInput.userEmail,
        userPhone: checkoutInput.userPhone,
        paymentMethod: selectedPaymentMethod,
        total: checkoutState.convertedFinalTotal,
        subtotal: checkoutState.convertedSubtotal,
        currency: checkoutState.targetCurrency,
        shippingCost: checkoutState.convertedShippingCost,
        feeAmount: checkoutState.convertedFeeAmount
      };
      
      const demoOrderId = 'DEMO-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      sessionStorage.setItem(`demo_order_${demoOrderId}`, JSON.stringify(demoOrderData));
      
      clearCart();
      router.push(`/${locale}/orders/${demoOrderId}?placed=true&demo=true`);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <CheckoutContext.Provider value={{
      step, setStep, checkoutInput, checkoutState, updateInput, 
      isLoading, refreshCheckoutState, siteSettings, dict, countryDict, locale, 
      handleCheckout, goToNextStep, goToPreviousStep
    }}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (!context) throw new Error('useCheckout must be used within CheckoutProvider');
  return context;
}