'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { StarIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'
import {
  addDoc,
  collection,
  doc,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore'
import { getFirebaseFirestore } from '../../lib/firebase/client'
import { COL, BLOG_SUB } from '../../lib/firebase/collections'
import { formatPostDateShort, timestampToIso } from '../../lib/blog/formatPostDate'

const RATING_STORAGE_PREFIX = 'blog_rated_'

const sortByCreated = (a, b) => {
  const ma = a.createdAtMs ?? 0
  const mb = b.createdAtMs ?? 0
  return ma - mb
}

const toCreatedMs = (t) => {
  if (!t || typeof t !== 'object') return 0
  if (typeof t.toMillis === 'function') return t.toMillis()
  if (typeof t.seconds === 'number') return t.seconds * 1000
  return 0
}

const BlogEngagementPublic = ({ postId }) => {
  const [comments, setComments] = useState([])
  const [avgStars, setAvgStars] = useState(0)
  const [ratingCount, setRatingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submittingComment, setSubmittingComment] = useState(false)
  const [submittingRating, setSubmittingRating] = useState(false)
  const [commentAuthor, setCommentAuthor] = useState('')
  const [commentText, setCommentText] = useState('')
  const [hoverStar, setHoverStar] = useState(0)
  const [hasRatedLocal, setHasRatedLocal] = useState(false)

  const load = useCallback(async () => {
    const db = getFirebaseFirestore()
    if (!db || !postId) return
    setLoading(true)
    try {
      const base = doc(db, COL.blogPosts, postId)
      const [cSnap, rSnap] = await Promise.all([
        getDocs(collection(base, BLOG_SUB.comments)),
        getDocs(collection(base, BLOG_SUB.ratings)),
      ])
      const list = cSnap.docs.map((d) => {
        const x = d.data()
        return {
          id: d.id,
          authorName: (x.authorName ?? '').trim() || 'Anónimo',
          text: x.text ?? '',
          createdAt: x.createdAt,
          createdAtMs: toCreatedMs(x.createdAt),
        }
      })
      list.sort(sortByCreated)
      setComments(list)

      let sum = 0
      let n = 0
      rSnap.docs.forEach((d) => {
        const v = Number(d.data().stars)
        if (v >= 1 && v <= 5) {
          sum += v
          n += 1
        }
      })
      setAvgStars(n ? Math.round((sum / n) * 10) / 10 : 0)
      setRatingCount(n)
    } catch (e) {
      console.warn(e)
    } finally {
      setLoading(false)
    }
  }, [postId])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (typeof window === 'undefined' || !postId) return
    setHasRatedLocal(window.localStorage.getItem(`${RATING_STORAGE_PREFIX}${postId}`) === '1')
  }, [postId])

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    const text = commentText.trim()
    if (text.length < 2) {
      alert('Escribe un comentario un poco más largo')
      return
    }
    if (text.length > 2000) {
      alert('Máximo 2000 caracteres')
      return
    }
    const db = getFirebaseFirestore()
    if (!db) return
    setSubmittingComment(true)
    try {
      await addDoc(collection(doc(db, COL.blogPosts, postId), BLOG_SUB.comments), {
        text,
        authorName: commentAuthor.trim().slice(0, 80) || '',
        createdAt: serverTimestamp(),
      })
      setCommentText('')
      setCommentAuthor('')
      await load()
    } catch (err) {
      console.error(err)
      alert('No se pudo publicar el comentario.')
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleRate = async (stars) => {
    if (hasRatedLocal) return
    const db = getFirebaseFirestore()
    if (!db) return
    setSubmittingRating(true)
    try {
      await addDoc(collection(doc(db, COL.blogPosts, postId), BLOG_SUB.ratings), {
        stars,
        createdAt: serverTimestamp(),
      })
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(`${RATING_STORAGE_PREFIX}${postId}`, '1')
      }
      setHasRatedLocal(true)
      await load()
    } catch (err) {
      console.error(err)
      alert('No se pudo registrar la valoración.')
    } finally {
      setSubmittingRating(false)
    }
  }

  const displayAvg = avgStars > 0 ? avgStars.toFixed(1) : '—'

  return (
    <div className="mt-14 space-y-10 border-t border-white/[0.08] pt-10">
      <section aria-labelledby="blog-ratings-heading">
        <h2 id="blog-ratings-heading" className="text-lg font-semibold text-white">
          Valoración
        </h2>
        <p className="mt-1 text-sm text-[#8b949e]">
          Promedio: <span className="font-medium text-white">{displayAvg}</span> / 5
          {ratingCount > 0 ? (
            <span className="text-[#8b949e]">
              {' '}
              · {ratingCount} {ratingCount === 1 ? 'voto' : 'votos'}
            </span>
          ) : null}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Calificar artículo">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              disabled={hasRatedLocal || submittingRating || loading}
              onMouseEnter={() => setHoverStar(n)}
              onMouseLeave={() => setHoverStar(0)}
              onClick={() => handleRate(n)}
              className="rounded-full p-1 text-accent-orange transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={`${n} estrellas de 5`}
            >
              {(hoverStar || 0) >= n ? (
                <StarIcon className="h-8 w-8" />
              ) : (
                <StarOutlineIcon className="h-8 w-8 opacity-60" />
              )}
            </button>
          ))}
        </div>
        {hasRatedLocal ? (
          <p className="mt-2 text-xs text-emerald-400/90">Gracias por tu valoración.</p>
        ) : (
          <p className="mt-2 text-xs text-[#8b949e]">Elige de 1 a 5 estrellas (un voto por navegador).</p>
        )}
      </section>

      <section aria-labelledby="blog-comments-heading">
        <h2 id="blog-comments-heading" className="text-lg font-semibold text-white">
          Comentarios
        </h2>
        <form onSubmit={handleSubmitComment} className="mt-4 space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
          <div>
            <label htmlFor="comment-author" className="mb-1 block text-xs text-[#8b949e]">
              Nombre (opcional)
            </label>
            <input
              id="comment-author"
              type="text"
              maxLength={80}
              value={commentAuthor}
              onChange={(e) => setCommentAuthor(e.target.value)}
              className="w-full rounded-lg border border-surface-border bg-page px-3 py-2 text-sm text-white focus:border-accent-orange/50 focus:outline-none focus:ring-2 focus:ring-accent-orange/20"
            />
          </div>
          <div>
            <label htmlFor="comment-text" className="mb-1 block text-xs text-[#8b949e]">
              Tu comentario
            </label>
            <textarea
              id="comment-text"
              required
              rows={4}
              maxLength={2000}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full rounded-lg border border-surface-border bg-page px-3 py-2 text-sm text-white focus:border-accent-orange/50 focus:outline-none focus:ring-2 focus:ring-accent-orange/20"
            />
          </div>
          <button
            type="submit"
            disabled={submittingComment}
            className="rounded-lg bg-gradient-to-r from-accent-orange to-accent-coral px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
          >
            {submittingComment ? 'Publicando…' : 'Publicar comentario'}
          </button>
        </form>

        <ul className="mt-8 space-y-4">
          {loading ? (
            <li className="text-sm text-[#8b949e]">Cargando comentarios…</li>
          ) : comments.length === 0 ? (
            <li className="text-sm text-[#8b949e]">Aún no hay comentarios. Sé el primero.</li>
          ) : (
            comments.map((c) => (
              <li
                key={c.id}
                className="rounded-xl border border-white/[0.06] bg-surface/[0.25] px-4 py-3"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-medium text-white">{c.authorName}</p>
                  <time className="text-xs text-[#8b949e]" dateTime={timestampToIso(c.createdAt) ?? undefined}>
                    {formatPostDateShort(c.createdAt)}
                  </time>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#c9d1d9]">{c.text}</p>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  )
}

export default BlogEngagementPublic
