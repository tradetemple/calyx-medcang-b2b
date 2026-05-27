import { PriceChart as B2BPriceChart } from '@/types/medical-product'; 

export function calculatePriceInfo(
  priceChart: B2BPriceChart | any | null,
  pricePerKg: number | null,
  isKgPrice: boolean
): { price: number; isTiered: boolean } {
  
  if (priceChart && Array.isArray(priceChart.tiers) && priceChart.tiers.length > 0) {
    const tierPrices = priceChart.tiers.map((t: any) => t.price);
    return {
      price: Math.min(...tierPrices), 
      isTiered: tierPrices.length > 1
    };
  }

  if (priceChart && typeof priceChart === 'object' && !Array.isArray(priceChart.tiers)) {
    const prices = Object.values(priceChart)
      .filter(price => typeof price === 'number' && price > 0) as number[];
    
    if (prices.length > 0) {
      const minPrice = Math.min(...prices);
      return {
        price: isKgPrice ? minPrice / 1000 : minPrice,
        isTiered: prices.length > 1
      };
    }
  }

  const numericBasePrice = typeof pricePerKg === 'string' ? parseFloat(pricePerKg) : (pricePerKg || 0);

  if (numericBasePrice > 0) {
    return {
      price: isKgPrice ? numericBasePrice / 1000 : numericBasePrice,
      isTiered: false
    };
  }

  return {
    price: 0,
    isTiered: false
  };
}