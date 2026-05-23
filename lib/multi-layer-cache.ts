/**
 * Multi-layer caching strategy implementation
 * Provides ISR, database query caching, image caching, and cache invalidation
 * 
 * NOTE: Product fetching has been consolidated to lib/optimized-products.ts
 * This file now only handles reviews and category display names
 */

import { unstable_cache } from 'next/cache';

// Cache tags for organized invalidation
export const CACHE_TAGS = {
  PRODUCTS: 'products',
  PRODUCT_DETAIL: 'product-detail',
  CATEGORIES: 'categories',
  SITE_SETTINGS: 'site-settings',
  IMAGES: 'images',
  TRANSLATIONS: 'translations',
  REVIEWS: 'reviews'
} as const;

// Cache TTL configurations (in seconds)
export const CACHE_TTL = {
  PRODUCTS: 604800,       // 7 days
  PRODUCT_DETAIL: 604800, // 7 days
  CATEGORIES: 604800,     // 7 days
  SITE_SETTINGS: 3600,    // 1 hour
  IMAGES: 2592000,        // 30 days
  TRANSLATIONS: 604800,   // 7 days
  REVIEWS: 3600           // 1 hour
} as const;
