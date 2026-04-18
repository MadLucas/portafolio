'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'
import { CalendarDaysIcon, CpuChipIcon } from '@heroicons/react/24/outline'
import Navbar from '../components/Navbar'
import SolucionMeetingModal from './SolucionMeetingModal'
import { getFirebaseFirestore, getFirebaseApp, initFirebaseAppFromPublicConfig } from '../../lib/firebase/client'
import { COL } from '../../lib/firebase/collections'

const ensureFirebase = async () => {
  if (getFirebaseApp()) return true
  try {
    const res = await fetch('/api/config/firebase-public', { cache: 'no-store' })
    const data = await res.json()
    if (!res.ok) return false
    initFirebaseAppFromPublicConfig(data.config)
    return true
  } catch {
    return false
  }
}

const mapDoc = (id, data) => ({
  id,
  title: typeof data.title === 'string' ? data.title : '',
  summary: typeof data.summary === 'string' ? data.summary : '',
  imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl.trim() : '',
  sortOrder: Number(data.sortOrder ?? 0),
  active: data.active !== false,
})

const isHttpUrl = (s) => {
  if (typeof s !== 'string' || !s.trim()) return false
  try {
    const u = new URL(s.trim())
    return u.protocol === 'https:' || u.protocol === 'http:'
  } catch {
    return false
  }
}

const isUnsplashImageUrl = (s) => {
  if (!isHttpUrl(s)) return false
  try {
    return new URL(s.trim()).hostname === 'images.unsplash.com'
  } catch {
    return false
  }
}

const SolucionesClient = () => {
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')
  const [meetingFor, setMeetingFor] = useState(null)

  const handleOpenMeeting = (item) => {
    setMeetingFor({
      id: item.id,
      title: (item.title || 'Sin título').trim(),
    })
  }

  const handleCloseMeeting = () => {
    setMeetingFor(null)
  }

  useEffect(() => {
    let alive = true
    ;(async () => {
      const ok = await ensureFirebase()
      if (!ok) {
        if (alive) {
          setItems([])
          setError('No se pudo cargar la configuración.')
        }
        return
      }
      const db = getFirebaseFirestore()
      if (!db) {
        if (alive) setItems([])
        return
      }
      try {
        const q = query(
          collection(db, COL.softwareSolutions),
          where('active', '==', true),
          orderBy('sortOrder', 'asc')
        )
        const snap = await getDocs(q)
        const list = snap.docs.map((d) => mapDoc(d.id, d.data()))
        if (alive) {
          setItems(list)
          setError('')
        }
      } catch (e) {
        console.warn('Soluciones:', e)
        if (alive) {
          setItems([])
          setError('No se pudieron cargar las soluciones.')
        }
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  return (
    <main className="relative flex min-h-screen flex-col bg-page">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-hero-glow opacity-90" aria-hidden />
      <Navbar />
      <div className="container relative mx-auto max-w-6xl px-4 pt-16 pb-20 sm:px-6 sm:pt-20 lg:px-8">
        <header className="mb-12 text-center sm:mb-16">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Soluciones y servicios
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-[#8b949e] sm:text-lg">
          Sitios web para negocios que quieren crecer
          o pymes, empresas y profesionales que quieren tener presencia online o incorporar tecnologia a sus procesos. {' '}
          </p>
        </header>

        {items === null ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent-orange border-t-transparent" />
          </div>
        ) : null}

        {error ? (
          <p className="text-center text-sm text-rose-300/90" role="alert">
            {error}
          </p>
        ) : null}

        {items && items.length === 0 && !error ? (
          <div className="rounded-2xl border border-white/[0.08] bg-surface/40 px-6 py-12 text-center">
            <CpuChipIcon className="mx-auto h-12 w-12 text-[#8b949e]" aria-hidden />
            <p className="mt-4 text-[#c9d1d9]">Pronto publicaremos soluciones y servicios aquí.</p>
            <Link
              href="/#contacto"
              className="mt-6 inline-flex rounded-full border border-accent-orange/40 bg-accent-orange/10 px-5 py-2 text-sm font-medium text-accent-orange transition hover:bg-accent-orange/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange/50"
            >
              Contactar
            </Link>
          </div>
        ) : null}

        {items && items.length > 0 ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const imgSrc = item.imageUrl
              const showPhoto = isHttpUrl(imgSrc)
              const useNextImage = isUnsplashImageUrl(imgSrc)
              return (
                <li key={item.id}>
                  <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-surface-elevated/40 shadow-card ring-1 ring-white/[0.04] transition hover:border-white/[0.1]">
                    {showPhoto ? (
                      <div className="relative aspect-[16/10] w-full bg-page">
                        {useNextImage ? (
                          <Image
                            src={imgSrc}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element -- URLs externas arbitrarias (no solo Unsplash)
                          <img
                            src={imgSrc}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                    ) : (
                      <div className="flex aspect-[16/10] w-full items-center justify-center bg-gradient-to-br from-accent-orange/15 via-page to-surface">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-orange/15 text-accent-orange">
                          <CpuChipIcon className="h-6 w-6" aria-hidden />
                        </div>
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-6">
                      {!showPhoto ? (
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-orange/15 text-accent-orange">
                          <CpuChipIcon className="h-5 w-5" aria-hidden />
                        </div>
                      ) : null}
                      <h2 className="text-lg font-semibold text-white">{item.title || 'Sin título'}</h2>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-[#8b949e]">{item.summary}</p>
                      <button
                        type="button"
                        onClick={() => handleOpenMeeting(item)}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-accent-orange/35 bg-accent-orange/10 py-2.5 text-sm font-semibold text-accent-orange transition hover:border-accent-orange/50 hover:bg-accent-orange/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange/50"
                        aria-label={`Agendar reunión: ${item.title || 'servicio'}`}
                      >
                        <CalendarDaysIcon className="h-4 w-4 shrink-0" aria-hidden />
                        Agendar reunión
                      </button>
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>
        ) : null}

        {items && items.length > 0 ? (
          <div className="mt-14 text-center">
            <Link
              href="/#contacto"
              className="inline-flex rounded-full bg-gradient-to-r from-accent-orange to-accent-coral px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange/50"
            >
              Hablemos de tu proyecto
            </Link>
          </div>
        ) : null}
      </div>

      <SolucionMeetingModal solution={meetingFor} onClose={handleCloseMeeting} />
    </main>
  )
}

export default SolucionesClient
