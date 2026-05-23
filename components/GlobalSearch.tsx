'use client'

import { useState, useEffect, useRef, useCallback } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import { EnhancedProduct } from '@/lib/product-enhancement';

const ProductGrid = dynamic(() => import('./products/ProductGrid'), {
  loading: () => (
    <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
    </div>
  ),
  ssr: false
});

interface GlobalSearchProps {
  lang: string;
  dict: any;
}

export default function GlobalSearch({ lang, dict }: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<EnhancedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const openSearch = useCallback(() => {
    setIsOpen(true);
    document.body.style.overflow = 'hidden';
    
    // Fetch products if not already fetched
    if (products.length === 0 && !isLoading) {
      setIsLoading(true);
      fetch(`/api/products/search?locale=${lang}`)
        .then(res => res.json())
        .then(data => {
          if (data.products) {
            setProducts(data.products);
          }
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch search products:', err);
          setIsLoading(false);
        });
    }
  }, [lang, products.length, isLoading]);

  const closeSearch = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    document.body.style.overflow = '';
  }, []);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeSearch();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeSearch]);

  const filteredProducts = query.trim() === '' 
    ? [] 
    : products.filter(p => {
        const searchLower = query.toLowerCase();
        const specificationsStr = typeof p.specifications === 'string' 
          ? p.specifications 
          : JSON.stringify(p.specifications || '');
          
        return (
          p.name.toLowerCase().includes(searchLower) ||
          (p.descriptive_name && p.descriptive_name.toLowerCase().includes(searchLower)) ||
          (p.description && p.description.toLowerCase().includes(searchLower)) ||
          (specificationsStr && specificationsStr.toLowerCase().includes(searchLower))
        );
      });

  return (
    <>
      <button
        onClick={openSearch}
        className="relative p-2 text-text-main transition-colors duration-200 min-w-[36px] min-h-[36px] md:min-w-[44px] md:min-h-[44px]"
        aria-label={dict?.navigation?.search || "Search products"}
      >
        <FiSearch className="h-5 w-5 md:h-6 md:w-6" />
      </button>

      {mounted && isOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex flex-col bg-white">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex-1 max-w-3xl mx-auto relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={dict?.navigation?.searchPlaceholder || "Search products..."}
                className="w-full py-3 bg-white border-b border-gray-300 focus:outline-none focus:ring-none text-black"
              />
            </div>
            <button 
              onClick={closeSearch}
              className="p-2 ml-2 text-black hover:text-status-error transition-colors"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-1 md:p-4">
            <div className="max-w-7xl mx-auto">
              {isLoading && query && (
                <div className="text-center py-8 text-gray-500">
                  {dict?.navigation?.loading || "Loading..."}
                </div>
              )}
              
              {!isLoading && query && filteredProducts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {dict?.navigation?.noProductsFoundFor || "No products found for"} "{query}"
                </div>
              )}

              {filteredProducts.length > 0 && (
                <div onClick={closeSearch}>
                  <ProductGrid 
                    products={filteredProducts} 
                    vatNumber="" 
                    lang={lang} 
                    dict={dict} 
                  />
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}