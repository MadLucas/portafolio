'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { getFirebaseAuth } from '../../lib/firebase/client'
import { useFirebaseBootstrap } from '../../hooks/useFirebaseBootstrap'
import AdminSidebar, { adminSidebarWidths } from './AdminSidebar'

const AdminShell = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const { status, missingEnv, allowedAdminEmail } = useFirebaseBootstrap()
  const [authLoading, setAuthLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (status !== 'ready') {
      if (status === 'error') setAuthLoading(false)
      return
    }
    const auth = getFirebaseAuth()
    if (!auth) {
      setAuthLoading(false)
      router.replace('/admin-login')
      return
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u && allowedAdminEmail && u.email !== allowedAdminEmail) {
        signOut(auth).catch(() => {})
        setUser(null)
        setAuthLoading(false)
        router.replace('/admin-login')
        return
      }
      if (!u) {
        setUser(null)
        setAuthLoading(false)
        router.replace('/admin-login')
        return
      }
      setUser(u)
      setAuthLoading(false)
    })
    return () => unsub()
  }, [status, allowedAdminEmail, router])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const apply = () => setSidebarOpen(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page text-white flex-col gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent-orange border-t-transparent" />
        <p className="text-sm text-[#8b949e]">Cargando…</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-page px-4 py-16 text-white">
        <div className="mx-auto max-w-lg rounded-2xl border border-white/[0.1] bg-surface/60 p-8">
          <h1 className="text-xl font-bold">Configuración Firebase</h1>
          <p className="mt-2 text-sm text-[#8b949e]">Revisa <code className="text-white">.env.local</code> y reinicia el servidor.</p>
          {missingEnv.length > 0 ? (
            <ul className="mt-4 list-inside list-disc text-sm text-red-300">
              {missingEnv.map((k) => (
                <li key={k}>{k}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    )
  }

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent-orange border-t-transparent" />
      </div>
    )
  }

  const handleSignOut = () => {
    const auth = getFirebaseAuth()
    if (auth) signOut(auth).then(() => router.replace('/admin-login'))
  }

  return (
    <div className="min-h-screen bg-page text-white">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(249,115,22,0.06),transparent)]"
        aria-hidden
      />
      <AdminSidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
        onSignOut={handleSignOut}
        userEmail={user.email}
      />
      <div
        className="relative z-0 min-h-screen pr-4 pb-12 pt-8 transition-[padding-left] duration-500 ease-out sm:pr-8"
        style={{
          paddingLeft: `calc(0.75rem + ${sidebarOpen ? adminSidebarWidths.expanded : adminSidebarWidths.collapsed} + 1rem)`,
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default AdminShell
