'use client'

import React, { useEffect, useState } from 'react'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { getFirebaseAuth, initFirebaseAppFromPublicConfig } from '../../lib/firebase/client'

const AdminLoginClient = () => {
  const router = useRouter()
  const [bootStatus, setBootStatus] = useState('loading')
  const [missingEnv, setMissingEnv] = useState([])
  const [allowedAdminEmail, setAllowedAdminEmail] = useState(null)

  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await fetch('/api/config/firebase-public', { cache: 'no-store' })
        const data = await res.json()
        if (!alive) return
        if (!res.ok) {
          setMissingEnv(Array.isArray(data.missing) ? data.missing : [])
          setBootStatus('error')
          setAuthLoading(false)
          return
        }
        initFirebaseAppFromPublicConfig(data.config)
        setAllowedAdminEmail(data.adminEmail || null)
        setBootStatus('ready')
      } catch (e) {
        console.error(e)
        if (alive) {
          setBootStatus('error')
          setAuthLoading(false)
        }
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (bootStatus !== 'ready') return
    const auth = getFirebaseAuth()
    if (!auth) {
      setAuthLoading(false)
      return
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u && allowedAdminEmail && u.email !== allowedAdminEmail) {
        signOut(auth).catch(() => {})
        setAuthError('Esta cuenta no tiene acceso al panel.')
        setUser(null)
        setAuthLoading(false)
        return
      }
      setAuthError('')
      setUser(u)
      setAuthLoading(false)
    })
    return () => unsub()
  }, [bootStatus, allowedAdminEmail])

  useEffect(() => {
    if (authLoading) return
    if (user) {
      router.replace('/admin')
    }
  }, [authLoading, user, router])

  const handleLogin = async (e) => {
    e.preventDefault()
    setBusy(true)
    setAuthError('')
    const auth = getFirebaseAuth()
    if (!auth) {
      setAuthError('Firebase no está configurado.')
      setBusy(false)
      return
    }
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
    } catch (err) {
      const code = err?.code ?? ''
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
        setAuthError('Correo o contraseña incorrectos.')
      } else if (code === 'auth/too-many-requests') {
        setAuthError('Demasiados intentos. Prueba más tarde.')
      } else {
        setAuthError('No se pudo iniciar sesión.')
      }
    } finally {
      setBusy(false)
    }
  }

  if (bootStatus === 'loading') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-page text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent-orange border-t-transparent" />
        <p className="text-sm text-[#8b949e]">Cargando configuración…</p>
      </div>
    )
  }

  if (bootStatus === 'error') {
    return (
      <div className="min-h-screen bg-page px-4 py-16 text-white">
        <div className="mx-auto max-w-lg rounded-2xl border border-white/[0.1] bg-surface/60 p-8 backdrop-blur-xl">
          <h1 className="text-xl font-bold">Configuración pendiente</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#8b949e]">
            El servidor no encuentra las variables{' '}
            <code className="text-accent-orange">NEXT_PUBLIC_FIREBASE_API_KEY</code>,{' '}
            <code className="text-accent-orange">NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</code> y{' '}
            <code className="text-accent-orange">NEXT_PUBLIC_FIREBASE_PROJECT_ID</code>{' '}
            en <code className="text-white/80">.env.local</code>. Revisa nombres (mayúsculas y el prefijo{' '}
            <code className="text-white/80">NEXT_PUBLIC_</code>), que no queden comillas mal cerradas y que no haya
            líneas vacías con solo espacios.
          </p>
          <p className="mt-3 text-sm text-[#8b949e]">
            Después de guardar, <strong className="text-white">reinicia</strong>{' '}
            <code className="text-white/80">npm run dev</code>.
          </p>
          {missingEnv.length > 0 ? (
            <div className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-red-300">Faltan o están vacías</p>
              <ul className="mt-2 list-inside list-disc text-sm text-red-200/90">
                {missingEnv.map((key) => (
                  <li key={key}>
                    <code>{key}</code>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    )
  }

  if (authLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent-orange border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-page px-4 py-16 text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(249,115,22,0.12),transparent)]"
        aria-hidden
      />
      <div className="relative mx-auto w-full max-w-md">
        <div
          className={`rounded-2xl border border-white/[0.12] bg-[linear-gradient(180deg,rgba(255,255,255,0.07)_0%,transparent_38%),rgba(13,17,23,0.55)] p-8 shadow-[0_12px_44px_rgba(0,0,0,0.55)] backdrop-blur-2xl backdrop-saturate-150`}
        >
          <h1 className="text-2xl font-bold tracking-tight">Panel admin</h1>
          <p className="mt-2 text-sm text-[#8b949e]">Ingresa con tu cuenta de Firebase Auth.</p>
          <form className="mt-8 flex flex-col gap-4" onSubmit={handleLogin}>
            <div>
              <label htmlFor="admin-email" className="mb-1.5 block text-xs font-medium text-[#c9d1d9]">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-surface-border bg-page px-3 py-2.5 text-sm text-white placeholder-[#6e7681] focus:border-accent-orange/50 focus:outline-none focus:ring-2 focus:ring-accent-orange/20"
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="mb-1.5 block text-xs font-medium text-[#c9d1d9]">
                Contraseña
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-surface-border bg-page px-3 py-2.5 text-sm text-white placeholder-[#6e7681] focus:border-accent-orange/50 focus:outline-none focus:ring-2 focus:ring-accent-orange/20"
              />
            </div>
            {authError ? (
              <p className="text-sm text-red-400" role="alert">
                {authError}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={busy}
              className="mt-2 w-full rounded-lg bg-gradient-to-r from-accent-orange to-accent-coral py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
            >
              {busy ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginClient
