import { PriceChart as B2BPriceChart } from '@/types/medical-product'; // Ensure your types are imported

/**
 * Calculates price information for a B2B Medical Product
 * Handles the transition from Object-based pricing to Tiered-Array pricing
 */
export function calculatePriceInfo(
  priceChart: B2BPriceChart | any | null,
  pricePerKg: number | null,
  isKgPrice: boolean
): { price: number; isTiered: boolean } {
  
  // 1. Handle the NEW B2B Tiered Array (Priority)
  // Logic: Use the lowest available tier price for the catalog/feed display
  if (priceChart && Array.isArray(priceChart.tiers) && priceChart.tiers.length > 0) {
    const tierPrices = priceChart.tiers.map((t: any) => t.price);
    return {
      price: Math.min(...tierPrices), 
      isTiered: tierPrices.length > 1
    };
  }

  // 2. Handle LEGACY Object-based Price Chart (Backward Compatibility)
  if (priceChart && typeof priceChart === 'object' && !Array.isArray(priceChart.tiers)) {
    const prices = Object.values(priceChart)
      .filter(price => typeof price === 'number' && price > 0) as number[];
    
    if (prices.length > 0) {
      const minPrice = Math.min(...prices);
      return {
        // If it was stored as a full KG price in an object, convert to gram
        price: isKgPrice ? minPrice / 1000 : minPrice,
        isTiered: prices.length > 1
      };
    }
  }

  // 3. Fallback to base price_per_kg
  const numericBasePrice = typeof pricePerKg === 'string' ? parseFloat(pricePerKg) : (pricePerKg || 0);

  if (numericBasePrice > 0) {
    return {
      // If it's 4200.00 and isKgPrice is true, return 4.20 (the gram price)
      price: isKgPrice ? numericBasePrice / 1000 : numericBasePrice,
      isTiered: false
    };
  }

  // 4. Absolute Fallback
  return {
    price: 0,
    isTiered: false
  };
}