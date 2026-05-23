export const i18n = {
  locales: ['en', 'de'] as const,
  defaultLocale: 'en',
} as const

export type Locale = (typeof i18n)['locales'][number]
