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
