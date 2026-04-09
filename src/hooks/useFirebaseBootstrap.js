'use client'

import { useEffect, useState } from 'react'
import { initFirebaseAppFromPublicConfig } from '../lib/firebase/client'

export const useFirebaseBootstrap = () => {
  const [status, setStatus] = useState('loading')
  const [missingEnv, setMissingEnv] = useState([])
  const [allowedAdminEmail, setAllowedAdminEmail] = useState(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await fetch('/api/config/firebase-public', { cache: 'no-store' })
        const data = await res.json()
        if (!alive) return
        if (!res.ok) {
          setMissingEnv(Array.isArray(data.missing) ? data.missing : [])
          setStatus('error')
          return
        }
        initFirebaseAppFromPublicConfig(data.config)
        setAllowedAdminEmail(data.adminEmail || null)
        setStatus('ready')
      } catch (e) {
        console.error(e)
        if (alive) setStatus('error')
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  return { status, missingEnv, allowedAdminEmail }
}
