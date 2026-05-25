/* eslint-disable @typescript-eslint/no-explicit-any */
import { cache } from 'react';
import { mockProducts } from './mock-data';
import { MedicalProduct } from '@/types/medical-product';

/**
 * Function #1: Lightweight product list for grids/cards
 */
export const getProductsForListView = cache(async (
  locale: string, 
  limit = 50, 
  is_featured = false, 
  category?: string
): Promise<MedicalProduct[]> => {
  try {
    let filteredProducts = [...mockProducts];

    if (is_featured) {
      filteredProducts = filteredProducts.filter(p => p.is_featured === true);
    }
    
    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }

    filteredProducts = filteredProducts.slice(0, limit);

    const processedProducts = filteredProducts.map((product: MedicalProduct) => {
      const processed: MedicalProduct = { ...product };

      // Check for translations
      if (locale !== 'en' && product.translations && product.translations.length > 0) {
        const translation = product.translations.find((t) => t.locale === locale);
        if (translation) {
          processed.name = translation.name || product.name;
          processed.descriptive_name = translation.descriptive_name || product.descriptive_name;
          processed.slug = translation.slug || product.slug;
          processed.displaySlug = translation.slug || product.slug;
        }
      }

      return processed;
    });

    return processedProducts;

  } catch (error) {
    console.error('Error in getProductsForListView:', error);
    return [];
  }
});

/**
 * Function #2: Complete product details for single product page
 */
export const getProductDetailsBySlug = cache(async (locale: string, slug: string): Promise<MedicalProduct | null> => {
  try {
    let product = mockProducts.find(p => p.slug === slug);

    if (!product && locale !== 'en') {
      product = mockProducts.find(p => 
        p.translations?.some((t) => t.locale === locale && t.slug === slug)
      );
    }

    if (!product) return null;

    const processed = { ...product } as MedicalProduct;
    processed.displaySlug = product.slug;

    // Apply translations
    if (locale !== 'en' && product.translations && product.translations.length > 0) {
      const translation = product.translations.find((t) => t.locale === locale);
      if (translation) {
        processed.name = translation.name || product.name;
        processed.descriptive_name = translation.descriptive_name || product.descriptive_name;
        processed.description = translation.description || product.description;
        processed.slug = translation.slug || product.slug;
        processed.displaySlug = translation.slug || product.slug;
      }
    }

    return processed;

  } catch (error) {
    console.error('Error in getProductDetailsBySlug:', error);
    return null;
  }
});

/**
 * Function #3: Secure checkout validation
 */
export const getProductDataForCheckout = cache(async (productIds: string[], locale: string = 'en') => {
  if (!productIds || productIds.length === 0) return [];
  
  const products = mockProducts.filter(p => productIds.includes(p.id));
  return products.map(p => ({
    id: p.id,
    name: p.name,
    price_per_kg: p.price_per_kg,
    price_chart: p.price_chart
  }));
});

/**
 * Function #5: Get similar products 
 */
export const getSimilarProducts = cache(async (productId: string, categoryId: string | null, locale: string, limit = 8) => {
  return getProductsForListView(locale, limit, false, categoryId || undefined); 
});

/**
 * Function #4: Get product slugs for content link processing
 */
export const getProductSlugsForContent = cache(async (productIds: string[], locale: string): Promise<Map<string, string>> => {
  const slugMap = new Map<string, string>();

  if (!productIds || productIds.length === 0) {
    return slugMap;
  }

  try {
    const products = mockProducts.filter(p => productIds.includes(p.id));

    products.forEach((product: MedicalProduct) => {
      let slug = product.slug;

      if (locale !== 'en' && product.translations && Array.isArray(product.translations) && product.translations.length > 0) {
        const translation = product.translations.find((t) => t.locale === locale);
        if (translation && translation.slug) {
          slug = translation.slug;
        }
      }

      slugMap.set(product.id, slug);
    });

    return slugMap;

  } catch (error) {
    console.error('Error in getProductSlugsForContent:', error);
    return slugMap;
  }
});
