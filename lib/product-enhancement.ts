
import { generateLocalizedUrl } from '@/i18n/path-utils';
import { getDictionary } from '@/app/[lang]/dictionaries';
import { z } from 'zod';
import { MedicalProductSchema, MedicalProduct } from '@/types/medical-product';

export const EnhancedProductSchema = MedicalProductSchema.extend({
  displayName: z.string(),
  productUrl: z.string(),
  categoryDisplay: z.string(),
  displayPrice: z.number(),
  moqDisplay: z.string(),
  rawPrice: z.number(),
  isTieredPrice: z.boolean(),
});

export type EnhancedProduct = z.infer<typeof EnhancedProductSchema>;

const generateSlug = (text: string): string => {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
};

const getPriceInfo = (priceChart: any, defaultPrice: number, isKgPrice: boolean) => {
  if (priceChart && Array.isArray(priceChart.tiers) && priceChart.tiers.length > 0) {
    const minPrice = Math.min(...priceChart.tiers.map((t: any) => t.price));
    return { price: minPrice, isTiered: true };
  }
  
  if (!priceChart || (typeof priceChart === 'object' && Object.keys(priceChart).length === 0)) {
    return { price: isKgPrice ? defaultPrice / 1000 : defaultPrice, isTiered: false };
  }
  
  if (typeof priceChart === 'object' && !Array.isArray(priceChart)) {
    const prices = Object.values(priceChart).filter((v): v is number => typeof v === 'number');
    if (prices.length > 0) {
        const minPrice = Math.min(...prices);
        return { price: minPrice, isTiered: true };
    }
  }

  return { price: isKgPrice ? defaultPrice / 1000 : defaultPrice, isTiered: false };
};

export async function enhanceProducts(
  products: MedicalProduct[],
  lang: string,
  categoryMap: Record<string, string> = {}
): Promise<EnhancedProduct[]> {
  const dict = await getDictionary(lang);
  const t = dict.productGrid;

  return products.map(product => {
    const displayName = product.name;
    const descriptiveName = product.descriptive_name || null;
    let displaySlug = product.slug;

    if (!displaySlug) {
      displaySlug = generateSlug(displayName || product.id);
    }

    const productUrl = generateLocalizedUrl('/products/[slug]', lang, { slug: displaySlug });

    const isKgPrice = product.kg_price !== false;

    let displayPrice: number;
    let originalPrice: number | null = product.original_price ?? null;
    let rawPrice: number;
    let isTieredPrice: boolean;

    if (isKgPrice) {
      const { price, isTiered } = getPriceInfo(product.price_chart, product.price_per_kg || 0, true);
      rawPrice = price;
      isTieredPrice = isTiered;
      displayPrice = Math.round(price * 100) / 100;
      if (originalPrice) {
        originalPrice = Math.round((originalPrice / 1000) * 100) / 100;
      }
    } else {
      rawPrice = product.price_per_kg || 0;
      isTieredPrice = false;
      displayPrice = product.price_per_kg || 0;
    }

    const moqDisplay = isKgPrice ? `${product.moq_grams}g` : `1 ${t.labels.unit}`;

    const enhanced = {
      ...product,
      displayName,
      descriptive_name: descriptiveName,
      displaySlug,
      productUrl,
      categoryDisplay: categoryMap[product.category] || product.category,
      isKgPrice,
      displayPrice,
      moqDisplay,
      original_price: originalPrice,
      commission_rate: null,
      price_chart: product.price_chart ?? { tiers: [] },
      rawPrice,
      isTieredPrice,
      description: product.description || '',
    };

    return EnhancedProductSchema.parse(enhanced);
  });
}
