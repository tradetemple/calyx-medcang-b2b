'use client'

import React from 'react';
import { useCheckout } from '../context/CheckoutContext';
import { ShippingMethod } from '@/types/checkout-types';

export default function Step2Shipping() {
  const { 
    checkoutState, 
    checkoutInput, 
    updateInput, 
    dict, 
    goToNextStep, 
    goToPreviousStep,
    isLoading
  } = useCheckout();

  const t = dict;
  const methods = checkoutState.availableShippingMethods || [];
  const selectedMethodId = checkoutInput.selectedShippingMethod?.id;

  const handleMethodSelect = (method: ShippingMethod) => {
    updateInput({ selectedShippingMethod: method });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await goToNextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-12 animate-in fade-in duration-500">
      <div className="space-y-6">
        {isLoading && methods.length === 0 ? (
           <div className="space-y-4">
                <div className="h-20 rounded-none bg-border-main/10 animate-pulse border border-static-black/5 flex items-center justify-center">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-static-black/20">{t.shipping.loadingMethods}</span>
                </div>
           </div>
        ) : methods.length > 0 ? (
          <div className="space-y-4">
            {methods.map((method) => {
              const localizedName = method.name;

              return (
                <label
                  key={method.id}
                  className={`block relative rounded-none border p-3 md:p-6 cursor-pointer transition-all ${
                    selectedMethodId === method.id
                      ? 'border-static-black bg-static-black/5'
                      : 'border-static-black/10 hover:border-static-black/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="shippingMethod"
                    className="sr-only"
                    checked={selectedMethodId === method.id}
                    onChange={() => handleMethodSelect(method)}
                  />
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <h3 className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold text-static-black">
                        {localizedName}
                      </h3>
                      <p className="text-[8px] md:text-[10px] text-text-main/40 uppercase tracking-widest font-bold">
                        {method.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] md:text-sm font-bold text-static-black tabular-nums">
                          {method.price === 0 
                          ? t.summary.free.toUpperCase() 
                          : `${checkoutState.targetCurrency} ${(method.convertedPrice ?? method.price).toFixed(2)}`
                        }
                      </span>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        ) : (
          <div className="p-8 rounded-none bg-static-black/5 text-static-black border border-static-black/10 text-xs uppercase tracking-widest text-center">
            {t.shipping.noMethodsAvailable}
          </div>
        )}
      </div>

      <div className="pt-8 flex justify-between items-center">
        <button
          type="button"
          onClick={goToPreviousStep}
          className="md:ml-1 text-[7px] md:text-[10px] uppercase tracking-[0.2em] font-bold text-static-black/40 hover:text-static-black transition-colors"
        >
          {t.actions.back}
        </button>
        <button
          type="submit"
          disabled={!selectedMethodId || (isLoading && methods.length === 0)}
          className="px-3 md:px-12 py-3 md:py-4 bg-static-black text-white text-[8px] md:text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-secondary transition-all rounded-none disabled:opacity-20 disabled:cursor-not-allowed"
        >
          {t.actions.continueToReview}
        </button>
      </div>
    </form>
  );
}
