'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/** Una sola cuenta por pestaña hasta cerrarla (navegar A→B no suma de nuevo) */
const SESSION_KEY = 'portfolio_analytics_session'

const shouldTrack = (pathname) => {
  if (!pathname) return false
  if (pathname.startsWith('/admin-login')) return false
  if (pathname.startsWith('/admin')) return false
  return true
}

const PageViewTracker = () => {
  const pathname = usePathname()

  useEffect(() => {
    if (!shouldTrack(pathname)) return
    if (typeof window === 'undefined') return

    try {
      if (sessionStorage.getItem(SESSION_KEY)) return
      /** Marca ya antes del fetch: evita doble POST en React Strict Mode y no reintenta en cada ruta */
      sessionStorage.setItem(SESSION_KEY, '1')
    } catch {
      return
    }

    fetch('/api/analytics/track', { method: 'POST', keepalive: true }).catch(() => {})
  }, [pathname])

  return null
}

export default PageViewTracker
