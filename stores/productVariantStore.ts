import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface VariantSelection {
  [propertyId: number]: number;
}

interface ProductVariantState {
  selections: Record<string, VariantSelection>;
  variantImages: Record<string, string>;
  setVariantSelection: (productId: string, propertyId: number, valueId: number) => void;
  setVariantSelections: (productId: string, selections: VariantSelection) => void;
  getVariantSelections: (productId: string) => VariantSelection;
  setVariantImage: (productId: string, imageUrl: string) => void;
  getVariantImage: (productId: string) => string | null;
  clearProductSelections: (productId: string) => void;
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
