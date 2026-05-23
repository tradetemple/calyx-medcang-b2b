import { CartItem } from '@/types/cart'

export function calculateTieredPrice(item: CartItem): number {
  const tiers = item.product.price_chart?.tiers
  if (!tiers || tiers.length === 0) return 0

  const sortedTiers = [...tiers].sort((a, b) => b.min - a.min)
  const applicableTier = sortedTiers.find(t => item.quantityGrams >= t.min)
  const pricePerGram = applicableTier ? applicableTier.price : sortedTiers[sortedTiers.length - 1].price

  return pricePerGram * item.quantityGrams
}

export function convertAmount(amount: number, targetCurrency: string, currencyRates: Record<string, number>): number {
  const rate = currencyRates[targetCurrency] || 1;
  return parseFloat((amount * rate).toFixed(2));
}

function calculatePricePerKg(quantityGrams: number, priceChart: any, basePrice: number): number {
  try {
    if (typeof basePrice !== 'number' || isNaN(basePrice)) {
      return 0;
    }
    if (!priceChart) return basePrice;
    if (typeof quantityGrams !== 'number' || isNaN(quantityGrams) || quantityGrams <= 0) {
      return basePrice;
    }

    if (Array.isArray(priceChart.tiers)) {
        const sortedTiers = [...priceChart.tiers].sort((a, b) => b.min - a.min);
        const applicableTier = sortedTiers.find((t: any) => quantityGrams >= t.min);
        return applicableTier ? applicableTier.price * 1000 : sortedTiers[sortedTiers.length - 1].price * 1000;
    }

    return basePrice;
  } catch (error) {
    console.error('Error calculating price per kg:', error);
    return basePrice;
  }
}

export function calculateApiItemPrice(item: any): number {
  try {
    if (!item || !item.product || typeof item.product.price_per_kg !== 'number') {
      return 0;
    }

    const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
    if (quantity <= 0) {
      return 0;
    }

    const isKgPrice = item.product.kg_price !== false;
    const quantityKg = isKgPrice ? quantity / 1000 : quantity;

    const basePricePerKg = calculatePricePerKg(
      quantity,
      item.product?.price_chart,
      item.product.price_per_kg
    );

    return isKgPrice ? quantityKg * basePricePerKg : basePricePerKg * quantity;
  } catch (error) {
    console.error('Error calculating item price:', error);
    return 0;
  }
}
