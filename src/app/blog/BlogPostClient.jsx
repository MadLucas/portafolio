'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { getFirebaseFirestore, getFirebaseApp, initFirebaseAppFromPublicConfig } from '../../lib/firebase/client'
import { COL } from '../../lib/firebase/collections'
import { formatPostDate } from '../../lib/blog/formatPostDate'
import BlogEngagementPublic from '../../components/blog/BlogEngagementPublic'
import Navbar from '../components/Navbar'

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

const BlogPostClient = ({ slug }) => {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) {
      setNotFound(true)
      setLoading(false)
      return
    }
    let alive = true
    ;(async () => {
      const ok = await ensureFirebase()
      if (!ok) {
        if (alive) {
          setNotFound(true)
          setLoading(false)
        }
        return
      }
      const db = getFirebaseFirestore()
      if (!db) {
        if (alive) {
          setNotFound(true)
          setLoading(false)
        }
        return
      }
      try {
        // Misma query base que el listado: solo `active`, sin índice compuesto slug+active.
        const q = query(collection(db, COL.blogPosts), where('active', '==', true))
        const snap = await getDocs(q)
        const d = snap.docs.find((doc) => (doc.data().slug ?? '') === slug)
        if (!d) {
          if (alive) {
            setNotFound(true)
            setLoading(false)
          }
          return
        }
        const x = d.data()
        if (alive) {
          setPost({
            id: d.id,
            title: x.title ?? '',
            excerpt: x.excerpt ?? '',
            content: x.content ?? '',
            coverImage: x.coverImage ?? '',
            createdAt: x.createdAt,
            updatedAt: x.updatedAt,
          })
        }
      } catch (e) {
        console.warn(e)
        if (alive) setNotFound(true)
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [slug])

  return (
    <main className="relative min-h-screen flex-col bg-page">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-hero-glow opacity-90" aria-hidden />
      <Navbar />
      <article className="container relative mx-auto max-w-3xl px-4 pb-20 pt-24 text-white sm:px-6 sm:pt-28">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent-orange border-t-transparent" />
          </div>
        ) : null}

        {!loading && notFound ? (
          <div className="py-12">
            <p className="text-[#8b949e]">Este artículo no está disponible.</p>
            <Link href="/blog" className="mt-4 inline-block text-sm font-medium text-accent-orange hover:underline">
              Volver al blog
            </Link>
          </div>
        ) : null}

        {!loading && post ? (
          <>
            <Link href="/blog" className="text-sm font-medium text-[#8b949e] hover:text-white">
              ← Blog
            </Link>
            {post.coverImage ? (
              <div className="relative mt-6 aspect-video w-full overflow-hidden rounded-2xl border border-white/[0.08]">
                <Image
                  src={post.coverImage}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 768px"
                  priority
                  unoptimized
                />
              </div>
            ) : null}
            <h1 className="mt-8 text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
            <p className="mt-3 text-sm capitalize text-[#8b949e]">
              {formatPostDate(post.updatedAt ?? post.createdAt) || 'Fecha no disponible'}
            </p>
            {post.excerpt ? <p className="mt-4 text-lg text-[#8b949e]">{post.excerpt}</p> : null}
            <div className="prose prose-invert mt-10 max-w-none">
              <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-[#c9d1d9]">{post.content}</div>
            </div>
            <BlogEngagementPublic postId={post.id} />
          </>
        ) : null}
      </article>
    </main>
  )
}

export default BlogPostClient
