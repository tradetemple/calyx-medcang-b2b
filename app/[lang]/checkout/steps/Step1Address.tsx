'use client'

import React, { useState } from 'react';
import { useCheckout } from '../context/CheckoutContext';
import { ShippingAddress } from '@/types/cart';
import GooglePlacesAutocomplete from '@/components/GooglePlacesAutocomplete';
import PhoneInputField from '../components/PhoneInput';

import { useEffect } from 'react';
import { useCurrencyStore } from '@/stores/currencyStore';

export default function Step1Address() {
  const { 
    checkoutInput, 
    updateInput, 
    dict, 
    countryDict,
    goToNextStep, 
    siteSettings
  } = useCheckout();

  const activeCurrency = useCurrencyStore((state) => state.getActiveCurrency);
  const currentCurrency = activeCurrency(checkoutInput.locale);

  useEffect(() => {
    if (currentCurrency && checkoutInput.targetCurrency !== currentCurrency) {
      updateInput({ targetCurrency: currentCurrency });
    }
  }, [currentCurrency, checkoutInput.targetCurrency, updateInput]);

  const [showManualFields, setShowManualFields] = useState(false);

  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    updateInput({
      shippingAddress: {
        ...checkoutInput.shippingAddress,
        [field]: value
      }
    });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateInput({ userEmail: e.target.value });
  };

  const onAddressSelected = (addr: any) => {
    updateInput({
      shippingAddress: {
        ...checkoutInput.shippingAddress,
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
    const success = await goToNextStep();
    if (!success) {
      console.error('Validation failed, cannot proceed to next step');
    }
  };
  
  const t = dict;

  const handleAutofill = () => {
    const mockData = {
      userEmail: "apotheke.demo@example.de",
      userPhone: "+49 30 12345678",
      companyName: "Marien-Apotheke am Markt e.K.",
      shippingAddress: {
        ...checkoutInput.shippingAddress,
        company_name: "Marien-Apotheke am Markt e.K.",
        address_line1: "Karl-Liebknecht-Str. 5",
        city: "Berlin",
        postal_code: "10178",
        country: "DE",
        vat_number: "DE123456789",
        pharmacy_license: "PH-BER-998877",
        btm_license: "BTM-G-112233",
        responsible_person: "Dr. Maximilian Schmidt",
        delivery_time_window: "morning"
      }
    };
    updateInput(mockData);
    setShowManualFields(true);
  };

  const inputClasses = "w-full px-0 py-3 text-static-black rounded-none border-b border-static-black/10 bg-transparent focus:border-static-black outline-none transition-all text-sm placeholder:text-slate-600/30";
  const labelClasses = "block text-[10px] uppercase tracking-[0.2em] font-bold text-slate-600 mb-1";

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleAutofill}
          className="text-[9px] uppercase tracking-widest font-bold text-slate-600 hover:text-black transition-colors border border-slate-600/30 px-3 py-2"
        >
          {t.actions.autofill}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
      {/* Contact Section */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-1">
            <label htmlFor="fullName" className={labelClasses}>
              {t.shipping.fields.fullName} <span className="text-status-error">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              required
              value={checkoutInput.shippingAddress.company_name || ''}
              onChange={(e) => {
                const fullName = e.target.value;
                updateInput({
                  shippingAddress: {
                    ...checkoutInput.shippingAddress,
                    company_name: fullName,
                  },
                  companyName: fullName
                });
              }}
              className={inputClasses}
              placeholder={(t.placeholders.fullName).toUpperCase()}
            />
          </div>
          
          <div className="space-y-1">
            <label htmlFor="email" className={labelClasses}>
              {t.shipping.fields.email} <span className="text-status-error">*</span>
            </label>
            <input
              type="email"
              id="email"
              required
              value={checkoutInput.userEmail}
              onChange={handleEmailChange}
              className={inputClasses}
              placeholder={t.placeholders.email}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-1">
            <label htmlFor="vatId" className={labelClasses}>
              {t.shipping.fields.vatId} <span className="text-status-error">*</span>
            </label>
            <input
              type="text"
              id="vatId"
              required
              value={checkoutInput.shippingAddress.vat_number || ''}
              onChange={(e) => handleAddressChange('vat_number', e.target.value)}
              className={inputClasses}
              placeholder={t.placeholders.vatId}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="gln" className={labelClasses}>
              {t.shipping.fields.gln}
            </label>
            <input
              type="text"
              id="gln"
              value={checkoutInput.shippingAddress.gln || ''}
              onChange={(e) => handleAddressChange('gln', e.target.value)}
              className={inputClasses}
              placeholder={t.placeholders.gln}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-1">
            <label htmlFor="pharmacyLicense" className={labelClasses}>
              {t.shipping.fields.pharmacyLicense} <span className="text-status-error">*</span>
            </label>
            <input
              type="text"
              id="pharmacyLicense"
              required
              value={checkoutInput.shippingAddress.pharmacy_license || ''}
              onChange={(e) => handleAddressChange('pharmacy_license', e.target.value)}
              className={inputClasses}
              placeholder={t.placeholders.pharmacyLicense}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="btmLicense" className={labelClasses}>
              {t.shipping.fields.btmLicense} <span className="text-status-error">*</span>
            </label>
            <input
              type="text"
              id="btmLicense"
              required
              value={checkoutInput.shippingAddress.btm_license || ''}
              onChange={(e) => handleAddressChange('btm_license', e.target.value)}
              className={inputClasses}
              placeholder={t.placeholders.btmLicense}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-1">
            <label htmlFor="responsiblePerson" className={labelClasses}>
              {t.shipping.fields.responsiblePerson} <span className="text-status-error">*</span>
            </label>
            <input
              type="text"
              id="responsiblePerson"
              required
              value={checkoutInput.shippingAddress.responsible_person || ''}
              onChange={(e) => handleAddressChange('responsible_person', e.target.value)}
              className={inputClasses}
              placeholder={t.placeholders.responsiblePerson}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="deliveryTimeWindow" className={labelClasses}>
              {t.shipping.fields.deliveryTimeWindow}
            </label>
            <select
              id="deliveryTimeWindow"
              value={checkoutInput.shippingAddress.delivery_time_window || ''}
              onChange={(e) => handleAddressChange('delivery_time_window', e.target.value)}
              className={inputClasses + " appearance-none"}
            >
              <option value="">{t.placeholders.deliveryTimeWindow}</option>
              <option value="morning">08:00 - 12:00 (Morning)</option>
              <option value="afternoon">12:00 - 17:00 (Afternoon)</option>
            </select>
          </div>
        </div>
        
        <div className="space-y-1">
          <label htmlFor="phone" className={labelClasses}>
            {t.shipping.fields.phone}
          </label>
          <PhoneInputField
            value={checkoutInput.userPhone}
            onChange={(value) => updateInput({ userPhone: value })}
            placeholder={t.placeholders.phone}
            requiredError={t.errors.phoneRequired}
          />
        </div>
      </div>

      {/* Address Section */}
      <div className="space-y-8">
        <div className="space-y-1">
          <GooglePlacesAutocomplete
            label={t.shipping.fields.addressLine1}
            onAddressSelected={onAddressSelected}
            onChange={(value) => handleAddressChange('address_line1', value)}
            defaultValue={checkoutInput.shippingAddress.address_line1}
            required
            className="w-full"
            onManualEntry={() => setShowManualFields(true)}
            placeholder={t.placeholders.address1}
            manualEntryLabel={t.actions.manualEntry}
          />
        </div>

        {(showManualFields || checkoutInput.shippingAddress.address_line1) && (
          <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <label htmlFor="address2" className={labelClasses}>
                  {t.shipping.fields.addressLine2} ({t.optional})
                </label>
                <input
                  type="text"
                  id="address2"
                  value={checkoutInput.shippingAddress.address_line2 || ''}
                  onChange={(e) => handleAddressChange('address_line2', e.target.value)}
                  className={inputClasses}
                  placeholder={t.placeholders.address2}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="city" className={labelClasses}>
                  {t.shipping.fields.city} <span className="text-status-error">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  required
                  value={checkoutInput.shippingAddress.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  className={inputClasses}
                  placeholder={t.placeholders.city}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-1">
                <label htmlFor="postalCode" className={labelClasses}>
                  {t.shipping.fields.postalCode} <span className="text-status-error">*</span>
                </label>
                <input
                  type="text"
                  id="postalCode"
                  required
                  value={checkoutInput.shippingAddress.postal_code}
                  onChange={(e) => handleAddressChange('postal_code', e.target.value)}
                  className={inputClasses}
                  placeholder={t.placeholders.postalCode}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="state" className={labelClasses}>
                  {t.shipping.fields.state}
                </label>
                <input
                  type="text"
                  id="state"
                  value={checkoutInput.shippingAddress.state || ''}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                  className={inputClasses}
                  placeholder={t.placeholders.state}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="country" className={labelClasses}>
                  {t.shipping.fields.country} <span className="text-status-error">*</span>
                </label>
                <select
                  id="country"
                  required
                  value={checkoutInput.shippingAddress.country}
                  onChange={(e) => handleAddressChange('country', e.target.value)}
                  className={inputClasses + " appearance-none"}
                >
                  <option value="">{t.placeholders.selectCountry}</option>
                  {siteSettings.shipping_countries?.map((code: string) => (
                    <option key={code} value={code}>
                      {(countryDict[code] || code).toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="pt-8">
        <button
          type="submit"
          className="w-full md:w-auto px-12 py-4 bg-static-black text-white text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-secondary transition-all rounded-none"
        >
          {t.actions.continueToShipping}
        </button>
      </div>
    </form>
    </div>
  );
}
