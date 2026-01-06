import { defaultLocale, locales, type Locale } from "./config"

export async function getMessages(locale: string) {
  const normalized = (locales.includes(locale as any) ? locale : defaultLocale) as Locale
  switch (normalized) {
    case "es":
      return (await import("./messages/es.json")).default
    case "fr":
      return (await import("./messages/fr.json")).default
    case "de":
      return (await import("./messages/de.json")).default
    case "hi":
      return (await import("./messages/hi.json")).default
    case "en":
    default:
      return (await import("./messages/en.json")).default
  }
}
