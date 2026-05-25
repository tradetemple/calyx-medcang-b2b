import { z } from 'zod';

export const TierSchema = z.object({
  min: z.number(),
  price: z.number(),
});

export const PriceChartSchema = z.object({
  tiers: z.array(TierSchema),
});

export const SpecificationSchema = z.object({
  name: z.string(),
  value: z.string(),
});

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

const ProductCategoryJunctionSchema = z.object({
  category_id: z.string(),
  is_primary: z.boolean(),
  category: CategorySchema.optional(),
  originalSlug: z.string().optional(),
});

const ProductTranslationSchema = z.object({
  locale: z.string(),
  name: z.string(),
  descriptive_name: z.string().optional(),
  description: z.string().optional(),
  slug: z.string().optional(),
});

export const MedicalProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  descriptive_name: z.string().nullable().optional(),
  slug: z.string(),
  displaySlug: z.string().optional(),
  description: z.string().nullable().optional(),
  detailed_desc: z.string().nullable().optional(),
  price_per_kg: z.number().optional(),
  kg_price: z.boolean().default(true),
  product_image: z.string().nullable(),
  category: z.string(),
  status: z.string(), 
  moq_grams: z.number().default(50),
  live_stock_grams: z.number().optional(),
  is_featured: z.boolean().default(false),
  price_chart: PriceChartSchema.nullable().optional(),
  specifications: z.array(SpecificationSchema).optional(),
  test_results: z.any().optional(), 
  translations: z.array(ProductTranslationSchema).optional(),
  categories: z.array(ProductCategoryJunctionSchema).optional(),
  processedCategories: z.array(z.any()).optional(),
  original_price: z.number().nullable().optional(),
  review_count: z.number().optional(),
  average_rating: z.number().optional(),
  seo_title: z.string().nullable().optional(),
  seo_description: z.string().nullable().optional(),
  seo_keywords: z.string().nullable().optional(),
});

export type Tier = z.infer<typeof TierSchema>;
export type PriceChart = z.infer<typeof PriceChartSchema>;
export type Specification = z.infer<typeof SpecificationSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type MedicalProduct = z.infer<typeof MedicalProductSchema>;
