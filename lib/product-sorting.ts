import { EnhancedProduct } from './product-enhancement';

type SortBy = 'price' | 'name' | 'rating' | 'thc' | 'cbd' | 'batch' | 'irradiation' | 'liveStock';
type SortOrder = 'asc' | 'desc';

/**
 * Strips non-numeric chars from strings like "<1.0%" or "22.5%"
 */
const extractNumber = (str: string | undefined): number => {
  if (!str) return 0;
  const num = parseFloat(str.replace(/[^0-9.]/g, ''));
  return isNaN(num) ? 0 : num;
};

/**
 * Safely extracts a specification value by name
 */
const getSpecValue = (specs: any, name: string): string => {
  if (!specs) return '';
  const specArray = Array.isArray(specs) 
    ? specs 
    : typeof specs === 'string' 
      ? JSON.parse(specs || '[]') 
      : [];
  return specArray.find((s: any) => s.name?.toLowerCase().includes(name.toLowerCase()))?.value || '';
};

/**
 * Centralized product sorting logic shared between main products page and global search
 */
export const sortProducts = (
  products: EnhancedProduct[],
  sortBy: SortBy,
  sortOrder: SortOrder
): EnhancedProduct[] => {
  return [...products].sort((a, b) => {
    const isOosA = a.status === 'out_of_stock' || a.status === 'inactive';
    const isOosB = b.status === 'out_of_stock' || b.status === 'inactive';

    // 1. Push Out of Stock items to the bottom, always.
    if (isOosA && !isOosB) return 1;
    if (!isOosA && isOosB) return -1;
    
    let val = 0;
    
    // Parse JSON fields securely for sorting
    const specA = a.specifications;
    const specB = b.specifications;
    const testA: any = a.test_results || {};
    const testB: any = b.test_results || {};

    switch (sortBy) {
      case 'price':
        val = (a.price_per_kg || 0) - (b.price_per_kg || 0);
        break;
      case 'name':
        val = (a.displayName || '').localeCompare(b.displayName || '');
        break;
      case 'thc':
        val = extractNumber(getSpecValue(specA, 'THC')) - extractNumber(getSpecValue(specB, 'THC'));
        break;
      case 'cbd':
        val = extractNumber(getSpecValue(specA, 'CBD')) - extractNumber(getSpecValue(specB, 'CBD'));
        break;
      case 'liveStock': {
        const stockA = isOosA ? 0 : (a.live_stock_grams || 0);
        const stockB = isOosB ? 0 : (b.live_stock_grams || 0);
        val = stockA - stockB;
        break;
      }
      case 'irradiation': {
        const irradA = getSpecValue(specA, 'Irradiation') === 'Gamma-Irradiated' ? 1 : 0;
        const irradB = getSpecValue(specB, 'Irradiation') === 'Gamma-Irradiated' ? 1 : 0;
        val = irradA - irradB;
        break;
      }
      case 'batch': {
        const dateA = new Date(testA.expiry_date || '1970-01-01').getTime();
        const dateB = new Date(testB.expiry_date || '1970-01-01').getTime();
        val = dateA - dateB;
        break;
      }
      default:
        val = 0;
    }
    
    return sortOrder === 'asc' ? val : -val;
  });
};
