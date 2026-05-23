import config from "@/i18n/config";
import { SupportedLocale, ChangeFreq, GroupedEntry } from "./types";

/**
 * Helper function to get the last modified date of a given file.
 */
export async function getLastModifiedDate(filePath: string): Promise<Date> {
  return new Date();
}

/**
 * Utility that aggregates locale variants of the same logical page under a
 * single sitemap entry so that we can attach <xhtml:link> alternate tags.
 */
export function createAddToGroup(grouped: Record<string, GroupedEntry>) {
  return function addToGroup(params: {
    groupId: string;
    locale: SupportedLocale;
    url: string;
    lastModified: Date;
    changeFrequency: ChangeFreq;
    priority: number;
  }) {
    const {
      groupId,
      locale,
      url,
      lastModified,
      changeFrequency,
      priority,
    } = params;

    // Bootstrap the group if necessary
    if (!grouped[groupId]) {
      grouped[groupId] = {
        url, // first variant becomes canonical until we maybe hit 'en'
        lastModified,
        changeFrequency,
        priority,
        alternates: {},
      };
    }

    const group = grouped[groupId];

    // Prefer the English variant as canonical when available
    if (locale === 'en') {
      group.url = url;
    }

    // Track the most recent modification date across variants
    if (lastModified > group.lastModified) {
      group.lastModified = lastModified;
    }

    // Attach/overwrite the alternate mapping for this locale
    group.alternates[locale] = url;
  };
}

/**
 * Helper function to get the localized path for a route
 */
export function getLocalizedPath(routeKey: string, locale: SupportedLocale): string {
  // Special case for home page
  if (routeKey === "") {
    return "";
  }

  // Check if the path exists in config's pathnames
  const pathnameKey = `/${routeKey}` as keyof typeof config.pathnames;
  const pathnameConfig = config.pathnames[pathnameKey];

  if (pathnameConfig && typeof pathnameConfig === 'object' && locale in pathnameConfig) {
    // Type assertion to access the locale property safely
    const localizedPath = (pathnameConfig as Record<string, string>)[locale]?.replace(/^\//, '');
    return localizedPath || routeKey; // Fallback to original if translation not found
  }

  return routeKey; // Default fallback to original route
}
