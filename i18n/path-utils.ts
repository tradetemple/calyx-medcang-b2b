import config from './config';

interface Pathnames {
  [key: string]: {
    [locale: string]: string;
  };
}

const pathnames: Pathnames = config.pathnames;

/**
 * Converts an internal path (e.g., '/articles') to its localized version (e.g., '/artiklar' for 'se').
 * Handles dynamic segments like '[slug]'.
 * @param internalPath The internal path pattern (e.g., '/articles', '/articles/[slug]').
 * @param locale The target locale.
 * @returns The localized path pattern.
 */
function getLocalizedPathname(internalPath: string, locale: string): string {
  const localizedPathMap = pathnames[internalPath];
  if (localizedPathMap && localizedPathMap[locale]) {
    return localizedPathMap[locale];
  }
  return internalPath; // Fallback to internal path if no translation found
}

/**
 * Converts a localized path (e.g., '/artiklar' for 'se') back to its internal path (e.g., '/articles').
 * Handles dynamic segments like '[slug]'.
 * @param localizedPath The localized path pattern (e.g., '/artiklar', '/artiklar/[slug]').
 * @param locale The target locale.
 * @returns The internal path pattern.
 
function getInternalPathname(localizedPath: string, locale: string): string | undefined {
  for (const internalPath in pathnames) {
    const localizedPathMap = pathnames[internalPath];
    if (localizedPathMap && localizedPathMap[locale] === localizedPath) {
      return internalPath;
    }
  }
  return undefined; // No matching internal path found
}*/

/**
 * Generates a full localized URL for a given internal path and dynamic parameters.
 * @param internalPath The internal path pattern (e.g., '/articles/[slug]').
 * @param locale The target locale.
 * @param params An object containing dynamic segment values (e.g., { slug: 'my-article' }).
 * @returns The full localized URL (e.g., '/se/artiklar/my-article').
 */
export function generateLocalizedUrl(internalPath: string, locale: string, params: Record<string, string> = {}): string {
  let localizedPath = getLocalizedPathname(internalPath, locale);

  // Replace dynamic segments
  for (const key in params) {
    localizedPath = localizedPath.replace(`[${key}]`, params[key]);
  }

  return `/${locale}${localizedPath}`;
}

// 1. PRE-COMPILE ROUTE PATTERNS OUTSIDE THE FUNCTION
// This runs exactly ONCE when the Cloudflare Worker cold-starts.
const compiledDynamicRoutes: Array<{
  locale: string;
  internalPattern: string;
  regex: RegExp;
}> =[];

// Populate the pre-compiled arrays
for (const internalPathPattern in pathnames) {
  for (const locale in pathnames[internalPathPattern]) {
    const localizedPathPattern = pathnames[internalPathPattern][locale];
    
    if (localizedPathPattern && localizedPathPattern.includes('[')) {
      // Compile the regex ONCE
      const regexStr = `^${localizedPathPattern.replace(/\[([^\]]+)\]/g, '(?<$1>[^/]+)')}$`;
      compiledDynamicRoutes.push({
        locale,
        internalPattern: internalPathPattern,
        regex: new RegExp(regexStr)
      });
    }
  }
}

/**
 * Resolves an incoming localized URL path to its internal Next.js file system path.
 */
export function resolveLocalizedUrlToInternal(incomingPath: string, locale: string): string | null {
  const decodedPath = decodeURIComponent(incomingPath);

  let pathWithoutLocale = decodedPath.startsWith(`/${locale}`) 
    ? decodedPath.substring(`/${locale}`.length) 
    : decodedPath;

  if (pathWithoutLocale === '') {
    pathWithoutLocale = '/';
  }
  
  // 2. FAST PATH: Check exact matches first (No Regex needed)
  for (const internalPathPattern in pathnames) {
    const localizedPathPattern = pathnames[internalPathPattern]?.[locale];
    if (localizedPathPattern === pathWithoutLocale) {
      return `/${locale}${internalPathPattern}`;
    }
  }

  // 3. FAST REGEX MATCHING: Use the pre-compiled regexes
  for (const route of compiledDynamicRoutes) {
    if (route.locale !== locale) continue; // Skip if locale doesn't match

    const match = pathWithoutLocale.match(route.regex);

    if (match) {
      const params: Record<string, string> = match.groups || {};
      let rewrittenPath = route.internalPattern;
      
      for (const key in params) {
        rewrittenPath = rewrittenPath.replace(`[${key}]`, params[key]);
      }
      return `/${locale}${rewrittenPath}`;
    }
  }

  return null; // No rewrite needed
}