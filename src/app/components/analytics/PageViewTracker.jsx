'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

const shouldTrack = (pathname) => {
  if (!pathname) return false
  if (pathname.startsWith('/admin-login')) return false
  if (pathname.startsWith('/admin')) return false
  return true
}

const PageViewTracker = () => {
  const pathname = usePathname()
  const lastPath = useRef(null)

  useEffect(() => {
    if (!shouldTrack(pathname)) return
    if (lastPath.current === pathname) return
    lastPath.current = pathname

    fetch('/api/analytics/track', { method: 'POST', keepalive: true }).catch(() => {})
  }, [pathname])

  return null
}

export default PageViewTracker
