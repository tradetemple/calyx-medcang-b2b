export const CACHE_TAGS = {
  PRODUCTS: 'products',
  PRODUCT_DETAIL: 'product-detail',
  CATEGORIES: 'categories',
  SITE_SETTINGS: 'site-settings',
  IMAGES: 'images',
  TRANSLATIONS: 'translations',
  REVIEWS: 'reviews'
} as const;

export const CACHE_TTL = {
  PRODUCTS: 604800,      
  PRODUCT_DETAIL: 604800,
  CATEGORIES: 604800,    
  SITE_SETTINGS: 3600,   
  IMAGES: 2592000,  
  TRANSLATIONS: 604800,
  REVIEWS: 3600
} as const;
