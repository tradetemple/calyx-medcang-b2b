/**
 * Product Variant Store
 * Manages product variant selections (color, size, etc.) without URL query parameters
 * Uses sessionStorage for persistence within the same browsing session
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface VariantSelection {
  [propertyId: number]: number; // propertyId -> valueId
}

interface ProductVariantState {
  // Map of productId to variant selections
  selections: Record<string, VariantSelection>;
  
  // Map of productId to selected variant image
  variantImages: Record<string, string>;
  
  // Set variant selection for a product
  setVariantSelection: (productId: string, propertyId: number, valueId: number) => void;
  
  // Set multiple variant selections at once
  setVariantSelections: (productId: string, selections: VariantSelection) => void;
  
  // Get variant selections for a product
  getVariantSelections: (productId: string) => VariantSelection;
  
  // Set variant image for a product
  setVariantImage: (productId: string, imageUrl: string) => void;
  
  // Get variant image for a product
  getVariantImage: (productId: string) => string | null;
  
  // Clear selections for a product
  clearProductSelections: (productId: string) => void;
  
  // Clear all selections
  clearAllSelections: () => void;
}

export const useProductVariantStore = create<ProductVariantState>()(
  persist(
    (set, get) => ({
      selections: {},
      variantImages: {},
      
      setVariantSelection: (productId, propertyId, valueId) => {
        set((state) => ({
          selections: {
            ...state.selections,
            [productId]: {
              ...state.selections[productId],
              [propertyId]: valueId,
            },
          },
        }));
      },
      
      setVariantSelections: (productId, selections) => {
        set((state) => ({
          selections: {
            ...state.selections,
            [productId]: selections,
          },
        }));
      },
      
      getVariantSelections: (productId) => {
        return get().selections[productId] || {};
      },
      
      setVariantImage: (productId, imageUrl) => {
        set((state) => ({
          variantImages: {
            ...state.variantImages,
            [productId]: imageUrl,
          },
        }));
      },
      
      getVariantImage: (productId) => {
        return get().variantImages[productId] || null;
      },
      
      clearProductSelections: (productId) => {
        set((state) => {
          const newSelections = { ...state.selections };
          const newImages = { ...state.variantImages };
          delete newSelections[productId];
          delete newImages[productId];
          return {
            selections: newSelections,
            variantImages: newImages,
          };
        });
      },
      
      clearAllSelections: () => {
        set({ selections: {}, variantImages: {} });
      },
    }),
    {
      name: 'product-variant-storage',
      // Use sessionStorage for variants (cleared when browser closes)
      storage: {
        getItem: (name) => {
          const str = sessionStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => sessionStorage.setItem(name, JSON.stringify(value)),
        removeItem: (name) => sessionStorage.removeItem(name),
      },
    }
  )
);
