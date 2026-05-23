'use client'

import React, { useState } from 'react';
import { useCheckout } from '../context/CheckoutContext';
import { ShippingAddress } from '@/types/cart';
import GooglePlacesAutocomplete from '@/components/GooglePlacesAutocomplete';

export default function Step3Review() {
  const { 
    dict, 
    countryDict,
    goToNextStep, 
    goToPreviousStep,
    checkoutInput,
    updateInput,
    siteSettings,
  } = useCheckout();

  const t = dict;
  const [showBilling, setShowBilling] = useState(!checkoutInput.billingIsSameAsShipping);
  const [showManualFields, setShowManualFields] = useState(false);

  const handleBillingToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isSame = e.target.checked;
    updateInput({ billingIsSameAsShipping: isSame });
    setShowBilling(!isSame);
  };

  const handleBillingAddressChange = (field: keyof ShippingAddress, value: string) => {
    updateInput({
      billingAddress: {
        ...checkoutInput.billingAddress,
        [field]: value
      }
    });
  };

  const onAddressSelected = (addr: any) => {
    updateInput({
      billingAddress: {
        ...checkoutInput.billingAddress,
        address_line1: addr.address_line1,
        city: addr.city,
        state: addr.state,
        postal_code: addr.postal_code,
        country: addr.country
      }
    });
    setShowManualFields(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await goToNextStep();
  };

  const labelClasses = "text-[8px] md:text-[10px] uppercase tracking-[0.2em] font-bold text-static-black/40 block mb-1 md:mb-2";
  const valueClasses = "text-[10px] md:text-sm text-static-black uppercase tracking-wider";
  const inputClasses = "w-full px-0 py-3 text-static-black rounded-none border-b border-static-black/10 bg-transparent focus:border-static-black outline-none transition-all text-sm placeholder:text-text-main/20";

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="border-b border-static-black/10 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-12 mb-4 md:mb-12">
          <div>
            <span className={labelClasses}>{t.shipping.contactInfo}</span>
            <div className="md:space-y-1">
              <p className={valueClasses}>{checkoutInput.companyName}</p>
              <p className={valueClasses}>{checkoutInput.userEmail}</p>
              {checkoutInput.userPhone && <p className={valueClasses}>{checkoutInput.userPhone}</p>}
            </div>
          </div>
          <div>
            <span className={labelClasses}>{t.shipping.shippingAddress}</span>
            <div className="md:space-y-1">
              <p className={valueClasses}>{checkoutInput.shippingAddress.address_line1}</p>
              {checkoutInput.shippingAddress.address_line2 && <p className={valueClasses}>{checkoutInput.shippingAddress.address_line2}</p>}
              <p className={valueClasses}>{checkoutInput.shippingAddress.city}, {checkoutInput.shippingAddress.postal_code}</p>
              <p className={valueClasses}>{(countryDict[checkoutInput.shippingAddress.country] || checkoutInput.shippingAddress.country).toUpperCase()}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-12 mb-4 md:mb-12">
          <div>
            <span className={labelClasses}>{t.shipping.complianceDetails}</span>
            <div className="md:space-y-1">
              <p className={valueClasses}><span className="opacity-50">{t.shipping.review.fields.vat}:</span> {checkoutInput.shippingAddress.vat_number}</p>
              {checkoutInput.shippingAddress.gln && (
                <p className={valueClasses}><span className="opacity-50">{t.shipping.review.fields.gln}:</span> {checkoutInput.shippingAddress.gln}</p>
              )}
              <p className={valueClasses}><span className="opacity-50">{t.shipping.review.fields.responsible}:</span> {checkoutInput.shippingAddress.responsible_person}</p>
            </div>
          </div>
          <div>
            <span className={labelClasses}>{t.shipping.operatingLicense}</span>
            <div className="md:space-y-1">
              <p className={valueClasses}><span className="opacity-50">{t.shipping.review.fields.pharmacy}:</span> {checkoutInput.shippingAddress.pharmacy_license}</p>
              <p className={valueClasses}><span className="opacity-50">{t.shipping.review.fields.btm}:</span> {checkoutInput.shippingAddress.btm_license}</p>
              {checkoutInput.shippingAddress.delivery_time_window && (
                <p className={valueClasses}><span className="opacity-50">{t.shipping.review.fields.delivery}:</span> {checkoutInput.shippingAddress.delivery_time_window}</p>
              )}
            </div>
          </div>
        </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-12">
            <div>
              <span className={labelClasses}>{t.shipping.shippingMethod}</span>
              <p className={valueClasses}>
                {checkoutInput.selectedShippingMethod 
                  ? (checkoutInput.selectedShippingMethod.name)
                  : (t.shipping.methods.standard.name)
                }
              </p>
            </div>
            {checkoutInput.shippingAddress.delivery_time_window && (
              <div>
                <span className={labelClasses}>{t.shipping.fields.deliveryTimeWindow}</span>
                <p className={valueClasses}>
                  {checkoutInput.shippingAddress.delivery_time_window === 'morning' ? '08:00 - 12:00 (Morning)' : '12:00 - 17:00 (Afternoon)'}
                </p>
              </div>
            )}
          </div>

        <div className="mt-4 md:mt-12 pt-4 md:pt-8 border-t border-static-black/5">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={checkoutInput.billingIsSameAsShipping}
                  onChange={handleBillingToggle}
                  className="peer sr-only"
                />
                <div className="w-3 h-3 md:w-5 md:h-5 border border-static-black/20 peer-checked:bg-static-black transition-colors" />
                <svg className="absolute w-2 h-2 md:w-3 md:h-3 text-white left-0.5 md:left-1 opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold text-static-black/60 group-hover:text-static-black transition-colors">
                {t.shipping.sameAsShipping}
              </span>
            </label>

            {showBilling && (
              <div className="mt-4 md:mt-8 space-y-6 animate-in fade-in duration-500 md:pt-8 border-t border-static-black/5">

                <GooglePlacesAutocomplete
                  label={t.shipping.fields.addressLine1}
                  onAddressSelected={onAddressSelected}
                  defaultValue={checkoutInput.billingAddress.address_line1}
                  onChange={(value) => handleBillingAddressChange('address_line1', value)}
                  required
                  className="w-full"
                  onManualEntry={() => setShowManualFields(true)}
                  placeholder={t.placeholders.address1}
                  manualEntryLabel={t.actions.manualEntry}
                />

                {(showManualFields || checkoutInput.billingAddress.address_line1) && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                    
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-1">
                        <label className={labelClasses}>{t.shipping.fields.city}</label>
                        <input
                          type="text"
                          required={!checkoutInput.billingIsSameAsShipping}
                          value={checkoutInput.billingAddress.city}
                          onChange={(e) => handleBillingAddressChange('city', e.target.value)}
                          className={inputClasses}
                          placeholder={t.placeholders.city}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className={labelClasses}>{t.shipping.fields.postalCode}</label>
                        <input
                          type="text"
                          required={!checkoutInput.billingIsSameAsShipping}
                          value={checkoutInput.billingAddress.postal_code}
                          onChange={(e) => handleBillingAddressChange('postal_code', e.target.value)}
                          className={inputClasses}
                          placeholder={t.placeholders.postalCode}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className={labelClasses}>{t.shipping.fields.country}</label>
                      <select
                        required={!checkoutInput.billingIsSameAsShipping}
                        value={checkoutInput.billingAddress.country}
                        onChange={(e) => handleBillingAddressChange('country', e.target.value)}
                        className={inputClasses + " appearance-none"}
                      >
                        <option value="">{t.placeholders.selectCountry}</option>
                        {siteSettings.shipping_countries?.map((code: string) => (
                          <option key={code} value={code}>
                            {(dict.countries[code] || code).toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>


      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={goToPreviousStep}
          className="md:ml-1 text-[7px] md:text-[10px] uppercase tracking-[0.2em] font-bold text-static-black/40 hover:text-static-black transition-colors"
        >
          {t.actions.back}
        </button>
        <button
          onClick={handleSubmit}
          className="px-3 md:px-12 py-3 md:py-4 bg-static-black text-white text-[8px] md:text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-secondary transition-all rounded-none"
        >
          {t.actions.continueToPayment}
        </button>
      </div>
    </div>
  );
}
