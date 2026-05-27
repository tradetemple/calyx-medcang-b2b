import config from "@/i18n/config";

export type SupportedLocale = (typeof config.locales)[number];

export type ChangeFreq =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never';

export interface GroupedEntry {
  url: string;
  lastModified: Date;
  changeFrequency: ChangeFreq;
  priority: number;
  alternates: Record<string, string>;
}

export interface SitemapIndexEntry {
  url: string;
  lastModified?: Date;
}
