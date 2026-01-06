export const locales = ["en", "es", "fr", "de", "hi"] as const
export type Locale = typeof locales[number]

export const defaultLocale: Locale = "en"
