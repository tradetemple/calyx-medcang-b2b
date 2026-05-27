'use client';

import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { createPortal } from 'react-dom';
import { Loader } from '@googlemaps/js-api-loader';

const styles = `
  .google-places-dropdown {
    background-color: hsl(var(--color-static-white)) !important;
    border: 0px solid hsl(var(--color-secondary)) !important;
    border-radius: 0.000rem !important;
    box-shadow: 0 4px 4px rgba(0,0,0,0.1), 0 0 0 1px hsl(var(--color-secondary) / 0.5), 0 0 20px hsl(var(--color-secondary) / 0.3) !important;
    z-index: 40 !important;
    max-height: 15rem !important;
    overflow-y: auto !important;
    width: var(--dropdown-width) !important;
    min-width: var(--dropdown-width) !important;
    outline: none !important;
  }
  .google-places-item {
    padding: 0.5rem 0.75rem !important;
    border: none !important;
    cursor: pointer !important;
    color: hsl(var(--color-static-black)) !important;
    font-size: 0.875rem !important;
    display: flex !important;
    align-items: center !important;
    outline: none !important;
    white-space: nowrap !important;
    padding-left: 8px !important;
    padding-right: 8px !important;
  }
  .google-places-item:nth-child(odd) {
    background-color: hsl(var(--color-static-black) / 0.02 ) !important;
  }
  .google-places-item:nth-child(even) {
    background-color: hsl(var(--color-static-black) / 0.01) !important;
  }
  .google-places-item:nth-child(odd):hover {
    background-color: hsl(var(--color-static-black) / 0.04) !important;
  }
  .google-places-item:nth-child(even):hover {
    background-color: hsl(var(--color-static-black) / 0.03) !important;
  }
  .google-places-main-text {
    color: hsl(var(--color-static-black)) !important;
    font-size: 0.875rem !important;
    font-weight: 500 !important;
  }
  @media (max-width: 767px) {
    .google-places-item, .google-places-secondary-text, .google-places-main-text{
    font-size: 0.7rem !important;
    padding-top: 3px !important;
    padding-bottom: 3px !important;
    }

    .google-places-item {
      padding-left: 4px !important;
      padding-right: 4px !important;
    }
  }
  .google-places-secondary-text {
    color: hsl(var(--color-secondary)) !important;
    margin-left: 0.25rem !important;
  }
`;

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...rest }, ref) => (
  <label
    ref={ref}
    {...rest}
    className={`block text-[10px] uppercase tracking-[0.2em] font-bold text-slate-600 mb-1 ${className ?? ''}`}
  />
));
Label.displayName = 'Label';

interface Address {
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface Prediction {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text?: string;
  };
  _place?: any;
}

interface GooglePlacesAutocompleteProps {
  onAddressSelected: (addr: Address) => void;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  id?: string;
  className?: string;
  onFocus?: () => void;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onManualEntry?: () => void;
  manualEntryLabel?: string;
}

export default function GooglePlacesAutocomplete({
  onAddressSelected,
  label,
  placeholder = '',
  defaultValue = '',
  required = false,
  id = 'address-autocomplete',
  className = '',
  onFocus,
  onChange,
  onBlur,
  onManualEntry,
  manualEntryLabel = 'Manual Entry',
}: GooglePlacesAutocompleteProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const placesRef = useRef<any>(null);
  const sessionTokenRef = useRef<any>(null);

  const debounceTimerRef = useRef<number | undefined>(undefined);
  const manualEntryTimerRef = useRef<NodeJS.Timeout | null>(null);
  const positionUpdateTimerRef = useRef<number | undefined>(undefined);
  const [showManualEntry, setShowManualEntry] = useState(false);

  const clearManualEntryTimer = () => {
    if (manualEntryTimerRef.current) {
      clearTimeout(manualEntryTimerRef.current);
      manualEntryTimerRef.current = null;
    }
  };

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_AUTOCOMPLETE_API_KEY!,
      version: 'weekly',
    });
    loader.importLibrary('places').then((places: any) => {
      placesRef.current = places;
      sessionTokenRef.current = new places.AutocompleteSessionToken();
    }).catch((err) => console.error("Error loading Google Maps API:", err));
  }, []);

  const updateDropdownPosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollX = window.scrollX || document.documentElement.scrollLeft;

      setDropdownStyle({
        position: 'absolute',
        top: rect.bottom + scrollY + 4,
        left: rect.left + scrollX,
        '--dropdown-width': `${rect.width}px`,
      } as React.CSSProperties);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (onChange) {
      onChange(value);
    }

    clearManualEntryTimer();
    if (onManualEntry) {
      manualEntryTimerRef.current = setTimeout(() => setShowManualEntry(true), 3000);
    }

    clearTimeout(debounceTimerRef.current);
    if (!placesRef.current || value.length < 3) {
      setPredictions([]);
      return;
    }

    debounceTimerRef.current = window.setTimeout(async () => {
      try {
        const response = await placesRef.current.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: value,
          sessionToken: sessionTokenRef.current,
        });

        if (response.suggestions) {
          const mappedPredictions: Prediction[] = response.suggestions
            .filter((s: any) => s.placePrediction)
            .map((s: any) => {
              const p = s.placePrediction;
              return {
                place_id: p.placeId,
                description: p.text.text,
                structured_formatting: {
                  main_text: p.mainText.text,
                  secondary_text: p.secondaryText?.text,
                },
                _place: p.toPlace(),
              };
            });
            
          setPredictions(mappedPredictions);
          updateDropdownPosition();
          clearManualEntryTimer();
          setShowManualEntry(false);
        } else {
          setPredictions([]);
        }
      } catch (error) {
        console.error("Autocomplete error:", error);
        setPredictions([]);
      }
    }, 300);
  };

  const handleSelect = async (prediction: Prediction) => {
    if (!placesRef.current || !prediction._place) return;

    try {
      const place = prediction._place;
      
      await place.fetchFields({ fields: ['addressComponents', 'formattedAddress'] });

      if (place.addressComponents) {
        const address: Address = {
          address_line1: '',
          city: '',
          state: '',
          postal_code: '',
          country: '',
        };
        let streetNumber = '';
        let route = '';

        for (const comp of place.addressComponents) {
          const types = comp.types;
          if (types.includes('street_number')) streetNumber = comp.longText;
          if (types.includes('route')) route = comp.longText;
          if (types.includes('locality') || types.includes('postal_town')) address.city = comp.longText;
          if (types.includes('administrative_area_level_1')) address.state = comp.longText;
          if (types.includes('postal_code')) address.postal_code = comp.longText;
          if (types.includes('country')) address.country = comp.shortText;
        }

        address.address_line1 = [streetNumber, route].filter(Boolean).join(' ');
        if (!address.address_line1 && place.formattedAddress) {
          address.address_line1 = place.formattedAddress.split(',')[0].trim();
        }

        if (inputRef.current) inputRef.current.value = address.address_line1;
        onAddressSelected(address);
        setPredictions([]);
        
        sessionTokenRef.current = new placesRef.current.AutocompleteSessionToken();
        clearManualEntryTimer();
        setShowManualEntry(false);
      }
    } catch (error) {
      console.error("Place Details error:", error);
    }
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setPredictions([]);
      }
    };

    const onScrollOrResize = () => {
      if (predictions.length > 0) {
        if (positionUpdateTimerRef.current) {
          clearTimeout(positionUpdateTimerRef.current);
        }
        positionUpdateTimerRef.current = window.setTimeout(() => {
          updateDropdownPosition();
        }, 16);
      }
    };

    document.addEventListener('mousedown', onClick);
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', onClick);
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
      if (positionUpdateTimerRef.current) {
        clearTimeout(positionUpdateTimerRef.current);
      }
      clearManualEntryTimer();
    };
  }, [predictions.length]);

  return (
    <>
      <style>{styles}</style>
      <div ref={wrapperRef} className={`relative overflow-visible items-center ${className}`} style={{ zIndex: 30 }}>
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-status-error ml-1">*</span>}
        </Label>
        <div className="relative">
          <input
            ref={inputRef}
            id={id}
            type="text"
            placeholder={placeholder || 'START TYPING AN ADDRESS...'}
            defaultValue={defaultValue}
            required={required}
            className="w-full px-0 py-3 rounded-none border-b text-static-black border-static-black/10 bg-transparent focus:border-static-black outline-none transition-all text-sm placeholder:text-text-main/20 placeholder:uppercase"
            onChange={handleChange}
            onFocus={() => {
              if (onFocus) onFocus();
              updateDropdownPosition();
              if (onManualEntry) {
                clearManualEntryTimer();
                manualEntryTimerRef.current = setTimeout(() => setShowManualEntry(true), 3000);
              }
            }}
            onBlur={() => {
              if (onBlur) onBlur();
              clearManualEntryTimer();
            }}
          />
          {showManualEntry && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <button
                type="button"
                onClick={() => {
                  if (onManualEntry) onManualEntry();
                  setShowManualEntry(false);
                }}
                className="pointer-events-auto text-[10px] uppercase tracking-widest font-bold text-static-black hover:text-secondary bg-secondary/5 px-3 py-1 rounded-none border border-secondary/30 hover:border-secondary/50 transition-colors"
              >
                {manualEntryLabel}
              </button>
            </div>
          )}
        </div>
        {predictions.length > 0 && typeof document !== 'undefined' && createPortal(
          <ul ref={dropdownRef} className="google-places-dropdown" style={dropdownStyle}>
            {predictions.map(pred => (
              <li
                key={pred.place_id}
                onClick={() => handleSelect(pred)}
                className="google-places-item"
              >
                <span className="google-places-main-text">{pred.structured_formatting.main_text}</span>
                {pred.structured_formatting.secondary_text && (
                  <span className="google-places-secondary-text">{pred.structured_formatting.secondary_text}</span>
                )}
              </li>
            ))}
          </ul>,
          document.body
        )}
      </div>
    </>
  );
}