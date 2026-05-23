/**
 * Product Filters Store
 * Manages product filtering, sorting, and search state without URL query parameters
 * Uses localStorage for persistence across page navigations
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProductFiltersState {
  // Category filtering
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  
  // Search
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  
  // Sorting
  sortBy: 'price' | 'name' | 'rating' | 'thc' | 'cbd' | 'batch' | 'irradiation' | 'liveStock';
  sortOrder: 'asc' | 'desc';
  setSorting: (sortBy: ProductFiltersState['sortBy'], sortOrder: ProductFiltersState['sortOrder']) => void;
  
  // Reset all filters
  resetFilters: () => void;
}

const initialState = {
  selectedCategory: 'all',
  searchTerm: '',
  sortBy: 'price' as const,
  sortOrder: 'asc' as const,
};

export const useProductFiltersStore = create<ProductFiltersState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      
      setSearchTerm: (term) => set({ searchTerm: term }),
      
      setSorting: (sortBy, sortOrder) => set({ sortBy, sortOrder }),
      
      resetFilters: () => set(initialState),
    }),
    {
      name: 'product-filters-storage',
      // Only persist for the current session to avoid stale data
      partialize: (state) => ({
        selectedCategory: state.selectedCategory,
        searchTerm: state.searchTerm,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
      }),
    }
  )
);
