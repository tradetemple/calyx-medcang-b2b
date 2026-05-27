import config from './config';

interface Pathnames {
  [key: string]: {
    [locale: string]: string;
  };
}

const pathnames: Pathnames = config.pathnames;

function getLocalizedPathname(internalPath: string, locale: string): string {
  const localizedPathMap = pathnames[internalPath];
  if (localizedPathMap && localizedPathMap[locale]) {
    return localizedPathMap[locale];
  }
  return internalPath;
}


export function generateLocalizedUrl(internalPath: string, locale: string, params: Record<string, string> = {}): string {
  let localizedPath = getLocalizedPathname(internalPath, locale);

  for (const key in params) {
    localizedPath = localizedPath.replace(`[${key}]`, params[key]);
  }

  return `/${locale}${localizedPath}`;
}

const compiledDynamicRoutes: Array<{
  locale: string;
  internalPattern: string;
  regex: RegExp;
}> =[];

for (const internalPathPattern in pathnames) {
  for (const locale in pathnames[internalPathPattern]) {
    const localizedPathPattern = pathnames[internalPathPattern][locale];
    
    if (localizedPathPattern && localizedPathPattern.includes('[')) {
      const regexStr = `^${localizedPathPattern.replace(/\[([^\]]+)\]/g, '(?<$1>[^/]+)')}$`;
      compiledDynamicRoutes.push({
        locale,
        internalPattern: internalPathPattern,
        regex: new RegExp(regexStr)
      });
    }
  }
}

export function resolveLocalizedUrlToInternal(incomingPath: string, locale: string): string | null {
  const decodedPath = decodeURIComponent(incomingPath);

  let pathWithoutLocale = decodedPath.startsWith(`/${locale}`) 
    ? decodedPath.substring(`/${locale}`.length) 
    : decodedPath;

  if (pathWithoutLocale === '') {
    pathWithoutLocale = '/';
  }

  for (const internalPathPattern in pathnames) {
    const localizedPathPattern = pathnames[internalPathPattern]?.[locale];
    if (localizedPathPattern === pathWithoutLocale) {
      return `/${locale}${internalPathPattern}`;
    }
  }

  for (const route of compiledDynamicRoutes) {
    if (route.locale !== locale) continue;

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

  return null;
}