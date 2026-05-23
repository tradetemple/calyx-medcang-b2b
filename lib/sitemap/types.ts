import { MetadataRoute } from "next";
import config from "@/i18n/config";

export type SupportedLocale = (typeof config.locales)[number];

// https://nextjs.org/docs/app/api-reference/functions/generate-sitemaps
// Supported change-freq values according to the spec
export type ChangeFreq =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never';

export interface GroupedEntry {
  url: string; // canonical (we expose the English variant by convention)
  lastModified: Date;
  changeFrequency: ChangeFreq;
  priority: number;
  alternates: Record<string, string>; // locale -> href
}

export interface SitemapIndexEntry {
  url: string;
  lastModified?: Date;
}
