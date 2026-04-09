'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { getFirebaseFirestore, getFirebaseApp, initFirebaseAppFromPublicConfig } from '../../lib/firebase/client'
import { COL } from '../../lib/firebase/collections'
import { formatPostDateShort, timestampToIso } from '../../lib/blog/formatPostDate'
import Navbar from '../components/Navbar'

const updatedAtToMillis = (t) => {
  if (!t || typeof t !== 'object') return 0
  if (typeof t.toMillis === 'function') return t.toMillis()
  if (typeof t.seconds === 'number') return t.seconds * 1000
  return 0
}

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

const BlogListClient = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [newestFirst, setNewestFirst] = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const ok = await ensureFirebase()
      if (!ok) {
        if (alive) {
          setError(true)
          setLoading(false)
        }
        return
      }
      const db = getFirebaseFirestore()
      if (!db) {
        if (alive) {
          setError(true)
          setLoading(false)
        }
        return
      }
      try {
        const q = query(collection(db, COL.blogPosts), where('active', '==', true))
        const snap = await getDocs(q)
        const list = snap.docs.map((d) => {
          const x = d.data()
          const updatedAt = x.updatedAt
          const createdAt = x.createdAt
          return {
            id: d.id,
            title: x.title ?? '',
            slug: x.slug ?? '',
            excerpt: x.excerpt ?? '',
            coverImage: x.coverImage ?? '',
            updatedAt,
            createdAt,
            updatedAtMs: updatedAtToMillis(updatedAt ?? createdAt),
          }
        })
        if (alive) setPosts(list)
      } catch (e) {
        console.warn(e)
        if (alive) setError(true)
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  const filteredPosts = useMemo(() => {
    let list = [...posts]
    const k = keyword.trim().toLowerCase()
    if (k) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(k) ||
          (p.excerpt || '').toLowerCase().includes(k) ||
          (p.slug || '').toLowerCase().includes(k)
      )
    }
    list.sort((a, b) => (newestFirst ? b.updatedAtMs - a.updatedAtMs : a.updatedAtMs - b.updatedAtMs))
    return list
  }, [posts, keyword, newestFirst])

  return (
    <main className="relative min-h-screen flex-col bg-page">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-hero-glow opacity-90" aria-hidden />
      <Navbar />
      <div className="container relative mx-auto max-w-3xl px-4 pb-20 pt-24 text-white sm:px-6 sm:pt-28">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Blog</h1>
        <p className="mt-2 text-sm text-[#8b949e]">Publicaciones activas del portafolio.</p>

        {!loading && !error ? (
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="min-w-0 flex-1">
              <label htmlFor="blog-filter-keyword" className="mb-1 block text-xs font-medium text-[#8b949e]">
                Palabra clave
              </label>
              <input
                id="blog-filter-keyword"
                type="search"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Buscar en título o resumen…"
                autoComplete="off"
                className="w-full rounded-lg border border-surface-border bg-page px-3 py-2 text-sm text-white placeholder-[#6e7681] focus:border-accent-orange/50 focus:outline-none focus:ring-2 focus:ring-accent-orange/20"
              />
            </div>
            <div>
              <label htmlFor="blog-sort" className="mb-1 block text-xs font-medium text-[#8b949e]">
                Orden por fecha
              </label>
              <select
                id="blog-sort"
                value={newestFirst ? 'desc' : 'asc'}
                onChange={(e) => setNewestFirst(e.target.value === 'desc')}
                className="w-full rounded-lg border border-surface-border bg-page px-3 py-2 text-sm text-white focus:border-accent-orange/50 focus:outline-none focus:ring-2 focus:ring-accent-orange/20 sm:w-auto"
              >
                <option value="desc">Más reciente primero</option>
                <option value="asc">Más antigua primero</option>
              </select>
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="mt-16 flex justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent-orange border-t-transparent" />
          </div>
        ) : null}

        {error && !loading ? (
          <p className="mt-10 text-sm text-[#8b949e]">
            No se pudieron cargar los artículos. Revisa la configuración de Firebase o las reglas de Firestore.
          </p>
        ) : null}

        {!loading && !error && posts.length === 0 ? (
          <p className="mt-10 text-sm text-[#8b949e]">Aún no hay publicaciones.</p>
        ) : null}

        {!loading && !error && posts.length > 0 && filteredPosts.length === 0 ? (
          <p className="mt-10 text-sm text-[#8b949e]">Ningún artículo coincide con la búsqueda.</p>
        ) : null}

        <ul className="mt-10 flex flex-col gap-6">
          {filteredPosts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/blog/${post.slug}`}
                className="group block overflow-hidden rounded-2xl border border-white/[0.08] bg-surface/[0.35] transition hover:border-white/[0.14] hover:bg-surface/[0.5]"
              >
                <div className="flex flex-col sm:flex-row">
                  {post.coverImage ? (
                    <div className="relative aspect-video w-full shrink-0 sm:aspect-auto sm:h-40 sm:w-52">
                      <Image
                        src={post.coverImage}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 208px"
                        unoptimized
                      />
                    </div>
                  ) : null}
                  <div className="flex flex-1 flex-col justify-center p-5">
                    <time
                      className="text-xs font-medium uppercase tracking-wide text-[#8b949e]"
                      dateTime={timestampToIso(post.updatedAt ?? post.createdAt)}
                    >
                      {formatPostDateShort(post.updatedAt ?? post.createdAt) || 'Sin fecha'}
                    </time>
                    <h2 className="mt-1 text-lg font-semibold text-white group-hover:text-accent-orange">
                      {post.title}
                    </h2>
                    {post.excerpt ? (
                      <p className="mt-2 line-clamp-2 text-sm text-[#8b949e]">{post.excerpt}</p>
                    ) : null}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}

export default BlogListClient
