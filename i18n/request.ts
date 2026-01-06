import { cookies } from "next/headers"
import { getRequestConfig } from "next-intl/server"

import { defaultLocale, locales, type Locale } from "../lib/i18n/config"
import { getMessages as loadMessages } from "../lib/i18n"

export default getRequestConfig(async () => {
  const store = await cookies()
  const cookieLocale = store.get("lang")?.value

  const locale: Locale = locales.includes(cookieLocale as Locale)
    ? (cookieLocale as Locale)
    : defaultLocale

  return {
    locale,
    messages: await loadMessages(locale),
  }
})
