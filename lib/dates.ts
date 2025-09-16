// lib/dates.ts
export function formatLocalFromUTC(
  utcString?: string,
  opts: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
) {
  if (!utcString) return ''
  // Ensure we parse as UTC even if the API forgot the trailing 'Z'
  const normalized = /[zZ]|[+-]\d{2}:\d{2}$/.test(utcString) ? utcString : `${utcString}Z`
  const date = new Date(normalized)
  if (isNaN(date.getTime())) return ''

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  try {
    return new Intl.DateTimeFormat(undefined, { ...opts, timeZone }).format(date)
  } catch {
    // very old browsers: fall back to default locale without forcing timeZone
    return date.toLocaleString()
  }
}

export function timeAgoFromUTC(utcString?: string) {
  if (!utcString) return ''
  const normalized = /[zZ]|[+-]\d{2}:\d{2}$/.test(utcString) ? utcString : `${utcString}Z`
  const then = new Date(normalized).getTime()
  if (isNaN(then)) return ''

  const now = Date.now()
  const diffMs = then - now
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })

  const divisions: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 1000 * 60 * 60 * 24 * 365],
    ['month', 1000 * 60 * 60 * 24 * 30],
    ['week', 1000 * 60 * 60 * 24 * 7],
    ['day', 1000 * 60 * 60 * 24],
    ['hour', 1000 * 60 * 60],
    ['minute', 1000 * 60],
    ['second', 1000],
  ]

  for (const [unit, ms] of divisions) {
    const value = diffMs / ms
    if (Math.abs(value) >= 1 || unit === 'second') {
      return rtf.format(Math.round(value), unit)
    }
  }
  return ''
}
