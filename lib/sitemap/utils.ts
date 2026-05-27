import config from "@/i18n/config";
import { SupportedLocale, ChangeFreq, GroupedEntry } from "./types";

export async function getLastModifiedDate(filePath: string): Promise<Date> {
  return new Date();
}

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

    if (!grouped[groupId]) {
      grouped[groupId] = {
        url,
        lastModified,
        changeFrequency,
        priority,
        alternates: {},
      };
    }

    const group = grouped[groupId];

    if (locale === 'en') {
      group.url = url;
    }

    if (lastModified > group.lastModified) {
      group.lastModified = lastModified;
    }

    group.alternates[locale] = url;
  };
}

export function getLocalizedPath(routeKey: string, locale: SupportedLocale): string {

  if (routeKey === "") {
    return "";
  }

  const pathnameKey = `/${routeKey}` as keyof typeof config.pathnames;
  const pathnameConfig = config.pathnames[pathnameKey];

  if (pathnameConfig && typeof pathnameConfig === 'object' && locale in pathnameConfig) {
    const localizedPath = (pathnameConfig as Record<string, string>)[locale]?.replace(/^\//, '');
    return localizedPath || routeKey;
  }

  return routeKey;
}
