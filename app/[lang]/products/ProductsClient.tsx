'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { EnhancedProduct } from '@/lib/product-enhancement'
import ProductGrid from '@/components/products/ProductGrid'
import ScrollAnimation from '@/components/ScrollAnimation'
import { useScrollDirection } from '@/lib/hooks/useScrollDirection'
import { useProductFiltersStore } from '@/stores/productFiltersStore'
import { Category } from '@/types/medical-product'

interface ProductsClientProps {
  allProducts: EnhancedProduct[];
  categories: Category[];
  initialSearchTerm: string;
  lang: string;
  dict: any;
  vatNumber: string;
}

const ITEMS_PER_PAGE = 6;

export function ProductsClient({
  allProducts,
  categories,
  initialSearchTerm,
  lang,
  dict,
  vatNumber,
}: ProductsClientProps) {
  const locale = lang
  const t = dict.productsClient;
  const searchParams = useSearchParams();
  const urlCategory = searchParams?.get('category') || null;
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Use Zustand store instead of URL parameters
  const {
    selectedCategory: storeSelectedCategory,
    searchTerm: storeSearchTerm,
    sortBy,
    sortOrder,
    setSelectedCategory,
    setSearchTerm: setStoreSearchTerm,
    setSorting,
    resetFilters,
  } = useProductFiltersStore();

  // Reset filters when component unmounts (language change or leaving page)
  useEffect(() => {
    return () => {
      resetFilters();
    };
  }, [resetFilters]);

  // Initialize from query params on mount only, then Zustand takes over
  useEffect(() => {
    // Only run on initial mount (when storeSelectedCategory is still at default 'all')
    // and URL has a category
    if (urlCategory && storeSelectedCategory === 'all') {
      // Validate the category exists in current language
      const hasCategory = categories.some(cat => cat.id.toLowerCase() === urlCategory.toLowerCase());
      if (hasCategory) {
        setSelectedCategory(urlCategory);
      }
    }
  }, [urlCategory]); // Only depend on urlCategory to run once on mount

  // Use store value as the selected category (user interactions update Zustand)
  const activeCategorySlug = isMounted ? storeSelectedCategory : 'all';
  const activeSearchTerm = isMounted ? (storeSearchTerm || initialSearchTerm) : initialSearchTerm;
  const activeSortBy = isMounted ? sortBy : 'price'; 
  const activeSortOrder = isMounted ? sortOrder : 'asc';

  const [searchTerm, setSearchTerm] = useState(storeSearchTerm || initialSearchTerm);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const scrollDirection = useScrollDirection();
  const [isAtTop, setIsAtTop] = useState(true);
  const [isStuck, setIsStuck] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Track if we're at the top of the page
  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY < 10);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Detect when the header becomes sticky using Intersection Observer
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When sentinel is not visible, header is stuck
        setIsStuck(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '-96px 0px 0px 0px' } // Account for nav height
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Calculate transform based on nav visibility - only apply when header is stuck
  const navIsVisible = scrollDirection === 'up' || isAtTop;
  const translateY = (navIsVisible || !isStuck) ? '0px' : '-96px'; // Only move up when stuck AND nav is hidden

  const filteredProducts = useMemo(() => {
    let productsToFilter = allProducts.filter(product => product.status !== 'symbols');
    
    // 1. Filter Category
    if (activeCategorySlug !== 'all') {
      productsToFilter = productsToFilter.filter(product =>
        product.processedCategories?.some((cat: any) => cat.slug === activeCategorySlug)
      );
    }
    
    // 2. Filter Search
    if (activeSearchTerm) {
      const lower = activeSearchTerm.toLowerCase();
      productsToFilter = productsToFilter.filter(product =>
        product.displayName.toLowerCase().includes(lower) ||
        product.description?.toLowerCase().includes(lower)
      );
    }
    
    // 3. Apply Column Sorting
    productsToFilter = [...productsToFilter].sort((a, b) => {
      const isOosA = a.status === 'out_of_stock' || a.status === 'inactive';
      const isOosB = b.status === 'out_of_stock' || b.status === 'inactive';

      // Push Out of Stock items to the bottom, always.
      if (isOosA && !isOosB) return 1;
      if (!isOosA && isOosB) return -1;
      
      let val = 0;
      
      // Parse JSON fields securely for sorting
      const specA = typeof a.specifications === 'string' ? JSON.parse(a.specifications) : (a.specifications || []);
      const specB = typeof b.specifications === 'string' ? JSON.parse(b.specifications) : (b.specifications || []);
      const testA: any = a.test_results || {};
      const testB: any = b.test_results || {};

      // Helper to strip non-numeric chars from strings like "<1.0%" or "22.5%"
      const extractNumber = (str: string | undefined) => {
        if (!str) return 0;
        const num = parseFloat(str.replace(/[^0-9.]/g, ''));
        return isNaN(num) ? 0 : num;
      };

      const getSpecValue = (specs: any[], name: string) => {
        return specs.find((s: any) => s.name.toLowerCase().includes(name.toLowerCase()))?.value;
      };

      switch (activeSortBy) {
        case 'price':
          val = (a.price_per_kg || 0) - (b.price_per_kg || 0);
          break;
        case 'name':
          val = a.displayName.localeCompare(b.displayName);
          break;
        case 'thc':
          val = extractNumber(getSpecValue(Array.isArray(specA) ? specA : [], 'THC')) - extractNumber(getSpecValue(Array.isArray(specB) ? specB : [], 'THC'));
          break;
        case 'cbd':
          val = extractNumber(getSpecValue(Array.isArray(specA) ? specA : [], 'CBD')) - extractNumber(getSpecValue(Array.isArray(specB) ? specB : [], 'CBD'));
          break;
        case 'liveStock': {
          const stockA = isOosA ? 0 : (a.live_stock_grams || 0);
          const stockB = isOosB ? 0 : (b.live_stock_grams || 0);
          val = stockA - stockB;
          break;
        }
        case 'irradiation':
          const irradA = getSpecValue(Array.isArray(specA) ? specA : [], 'Irradiation') === 'Gamma-Irradiated' ? 1 : 0;
          const irradB = getSpecValue(Array.isArray(specB) ? specB : [], 'Irradiation') === 'Gamma-Irradiated' ? 1 : 0;
          val = irradA - irradB;
          break;
        case 'batch':
          const dateA = new Date(testA.expiry_date || '1970-01-01').getTime();
          const dateB = new Date(testB.expiry_date || '1970-01-01').getTime();
          val = dateA - dateB;
          break;
        default:
          val = 0;
      }
      
      return activeSortOrder === 'asc' ? val : -val;
    });
    
    return productsToFilter;
  }, [allProducts, activeCategorySlug, activeSearchTerm, activeSortBy, activeSortOrder]);

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [filteredProducts]);

  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filteredProducts.length) {
          setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredProducts.length));
        }
      },
      { rootMargin: '200px' } 
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [visibleCount, filteredProducts.length]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  return (
    <>
      <div ref={sentinelRef} className="h-px -mt-px" />

      <ScrollAnimation>
        <div className="bg-surface-hover/30 backdrop-blur-md rounded-xl overflow-visible mx-auto max-w-full">
          <div className="md:p-6">
            {filteredProducts.length > 0 ? (
              <>
                <ProductGrid 
                  products={visibleProducts}
                  vatNumber={vatNumber} 
                  lang={locale} 
                  dict={dict} 
                />
                
                {visibleCount < filteredProducts.length && (
                  <div ref={loadMoreRef} className="py-12 flex justify-center">
                    <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </>
            ) : (
              <div className="py-12 text-center">
                <div className="text-text-main mb-2 font-semibold">{t.noProductsFound}</div>
                <p className="text-text-main text-sm">{t.tryDifferentFilters}</p>
              </div>
            )}
          </div>
        </div>
      </ScrollAnimation>
    </>
  )
}
