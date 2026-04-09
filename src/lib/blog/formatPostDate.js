/** Fecha legible para artículos (es-CL por defecto). */
export const formatPostDate = (ts, locale = 'es') => {
  if (!ts || typeof ts !== 'object') return ''
  const d = typeof ts.toDate === 'function' ? ts.toDate() : null
  if (!d || Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const formatPostDateShort = (ts, locale = 'es') => {
  if (!ts || typeof ts !== 'object') return ''
  const d = typeof ts.toDate === 'function' ? ts.toDate() : null
  if (!d || Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' })
}

export const timestampToIso = (ts) => {
  if (!ts || typeof ts.toDate !== 'function') return undefined
  try {
    return ts.toDate().toISOString()
  } catch {
    return undefined
  }
}
