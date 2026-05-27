"use client"

import { PhoneInput } from 'react-international-phone'
import 'react-international-phone/style.css'

const styles = `
  .react-international-phone-input-container {
    display: flex !important;
    background-color: transparent !important;
    border-radius: 0 !important;
    border: none !important;
    border-bottom: 1px solid hsl(var(--color-static-black) / 0.1) !important;
    overflow: visible !important;
    margin-top: 0 !important;
    position: relative !important;
    transition: all 0.2s ease !important;
    box-shadow: none !important;
  }
  .react-international-phone-input-container:focus-within {
    border-bottom-color: hsl(var(--color-static-black)) !important;
    box-shadow: none !important;
    outline: none !important;
  }
  .react-international-phone-country-selector-button {
    background-color: transparent !important;
    color: hsl(var(--color-static-black)) !important;
    border: none !important;
    padding: 0.75rem 0.5rem 0.75rem 0 !important;
    cursor: pointer !important;
    font-size: 0.875rem !important;
    border-radius: 0 !important;
    height: auto !important;
    display: flex !important;
    align-items: flex-end !important;
  }
  .react-international-phone-country-selector-button:hover {
    background-color: transparent !important;
  }
  .react-international-phone-input {
    background-color: transparent !important;
    color: hsl(var(--color-static-black)) !important;
    border: none !important;
    padding: 0.75rem 0 0.75rem 0 !important;
    flex: 1 !important;
    font-size: 0.875rem !important;
    outline: none !important;
    border-radius: 0 !important;
    height: auto !important;
  }
  .react-international-phone-input::placeholder {
    color: hsl(var(--color-static-black) / 0.1) !important;
  }
  .react-international-phone-country-selector-dropdown {
    position: absolute !important;
    background-color: hsl(var(--color-static-white)) !important;
    border: 0px solid hsl(var(--color-secondary)) !important;
    box-shadow: 0 4px 4px rgba(0,0,0,0.1), 0 0 0 1px hsl(var(--color-secondary) / 0.5), 0 0 20px hsl(var(--color-secondary) / 0.3) !important;
    border-radius: 0rem !important;
    margin-top: 0.25rem !important;
    z-index: 41 !important;
    max-height: 15rem !important;
    overflow-y: auto !important;
    overscroll-behavior: contain !important;
    -webkit-overflow-scrolling: touch !important;
    width: auto !important;
    min-width: 100% !important;
    top: 100% !important;
    left: 0 !important;
    outline: none !important;
  }
  .react-international-phone-country-selector-dropdown__list-item {
    padding: 0.5rem 0.75rem !important;
    border: none !important;
    cursor: pointer !important;
    color: hsl(var(--color-static-black)) !important;
    font-size: 0.875rem !important;
    display: flex !important;
    align-items: center !important;
    gap: 0.5rem !important;
    outline: none !important;
    white-space: nowrap !important;
  }
  .react-international-phone-country-selector-dropdown__list-item:nth-child(odd) {
    background-color: hsl(var(--color-static-black / 0.02)) !important;
  }
  .react-international-phone-country-selector-dropdown__list-item:nth-child(even) {
    background-color: hsl(var(--color-static-black) / 0.01) !important;
  }
  .react-international-phone-country-selector-dropdown__list-item:nth-child(odd):hover {
    background-color: hsl(var(--color-static-black) / 0.04) !important;
  }
  .react-international-phone-country-selector-dropdown__list-item:nth-child(even):hover {
    background-color: hsl(var(--color-static-black) / 0.03) !important;
  }
  .react-international-phone-country-selector-dropdown__list-item--selected {
    background-color: hsl(var(--color-secondary)) !important;
    color: hsl(var(--color-static-black)) !important;
  }
  .react-international-phone-country-selector-dropdown__list-item-country-name {
    color: hsl(var(--color-static-black)) !important;
    font-weight: 500 !important;
  }
  .react-international-phone-country-selector-dropdown__list-item-dial-code {
    color: hsl(var(--color-secondary)) !important;
    margin-left: auto !important;
  }
  .react-international-phone-country-selector-dropdown__list-item-flag-emoji {
    width: 1.25rem !important;
    height: 1.25rem !important;
  }
`;

interface PhoneInputFieldProps {
  value: string
  onChange: (value: string) => void
  required?: boolean
  error?: string
  onBlur?: () => void
  autoFocus?: boolean
  placeholder?: string
  requiredError?: string
}
export default function PhoneInputField({ value, onChange, required = false, error, onBlur, autoFocus = false, placeholder, requiredError }: PhoneInputFieldProps) {
  return (
    <>
      <style>{styles}</style>
      <div className="w-full relative z-[31]">
        <PhoneInput
          defaultCountry="se"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoFocus={autoFocus}
          inputClassName="react-international-phone-input"
          className="w-full text-sm"
        />
        {error && <p className="mt-1 text-[10px] uppercase font-bold text-status-error tracking-wider">{error}</p>}
        {required && !error && !value && (
          <p className="mt-1 text-[10px] uppercase font-bold text-status-error tracking-wider">{requiredError}</p>
        )}
      </div>
    </>
  )
}
