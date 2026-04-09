'use client'

import React, { useCallback, useEffect, useState } from 'react'
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
} from 'firebase/firestore'
import { getFirebaseFirestore } from '../../../lib/firebase/client'
import { COL, BLOG_SUB } from '../../../lib/firebase/collections'
import { liquidGlassPanel } from '../../../lib/admin/glass'
import { formatPostDateShort } from '../../../lib/blog/formatPostDate'

const toMs = (t) => {
  if (!t || typeof t !== 'object') return 0
  if (typeof t.toMillis === 'function') return t.toMillis()
  if (typeof t.seconds === 'number') return t.seconds * 1000
  return 0
}

const BlogModerationAdmin = ({ onChanged }) => {
  const [comments, setComments] = useState([])
  const [ratings, setRatings] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const db = getFirebaseFirestore()
    if (!db) return
    setLoading(true)
    try {
      const postsQ = query(collection(db, COL.blogPosts), orderBy('updatedAt', 'desc'))
      const postsSnap = await getDocs(postsQ)
      const commentRows = []
      const ratingRows = []
      await Promise.all(
        postsSnap.docs.map(async (p) => {
          const title = p.data().title ?? '(sin título)'
          const postId = p.id
          const [cSnap, rSnap] = await Promise.all([
            getDocs(collection(doc(db, COL.blogPosts, postId), BLOG_SUB.comments)),
            getDocs(collection(doc(db, COL.blogPosts, postId), BLOG_SUB.ratings)),
          ])
          cSnap.docs.forEach((c) => {
            const x = c.data()
            commentRows.push({
              id: c.id,
              postId,
              postTitle: title,
              text: x.text ?? '',
              authorName: x.authorName ?? '',
              createdAt: x.createdAt,
              sortMs: toMs(x.createdAt),
            })
          })
          rSnap.docs.forEach((r) => {
            const x = r.data()
            ratingRows.push({
              id: r.id,
              postId,
              postTitle: title,
              stars: x.stars,
              createdAt: x.createdAt,
              sortMs: toMs(x.createdAt),
            })
          })
        })
      )
      commentRows.sort((a, b) => b.sortMs - a.sortMs)
      ratingRows.sort((a, b) => b.sortMs - a.sortMs)
      setComments(commentRows)
      setRatings(ratingRows)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleDeleteComment = async (postId, commentId) => {
    if (!confirm('¿Eliminar este comentario?')) return
    const db = getFirebaseFirestore()
    if (!db) return
    try {
      await deleteDoc(doc(db, COL.blogPosts, postId, BLOG_SUB.comments, commentId))
      await load()
      onChanged?.()
    } catch (e) {
      console.error(e)
      alert('No se pudo eliminar el comentario.')
    }
  }

  const handleDeleteRating = async (postId, ratingId) => {
    if (!confirm('¿Eliminar esta valoración?')) return
    const db = getFirebaseFirestore()
    if (!db) return
    try {
      await deleteDoc(doc(db, COL.blogPosts, postId, BLOG_SUB.ratings, ratingId))
      await load()
      onChanged?.()
    } catch (e) {
      console.error(e)
      alert('No se pudo eliminar la valoración.')
    }
  }

  return (
    <div className={`mt-10 space-y-8 p-6 ${liquidGlassPanel}`}>
      <div>
        <h2 className="text-lg font-semibold text-white">Moderación</h2>
        <p className="mt-1 text-sm text-[#8b949e]">
          Elimina comentarios o valoraciones que no quieras mostrar en público.
        </p>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="mt-3 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-[#c9d1d9] hover:bg-white/5 disabled:opacity-50"
        >
          {loading ? 'Actualizando…' : 'Actualizar lista'}
        </button>
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8b949e]">
          Comentarios ({comments.length})
        </h3>
        {loading ? (
          <div className="mt-4 flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-orange border-t-transparent" />
          </div>
        ) : comments.length === 0 ? (
          <p className="mt-3 text-sm text-[#8b949e]">No hay comentarios.</p>
        ) : (
          <ul className="mt-4 max-h-80 space-y-3 overflow-y-auto pr-1">
            {comments.map((c) => (
              <li
                key={`${c.postId}_${c.id}`}
                className="rounded-lg border border-white/[0.06] bg-page/40 px-3 py-2 text-sm"
              >
                <p className="text-xs text-[#8b949e]">
                  <span className="font-medium text-white/90">{c.postTitle}</span>
                  {' · '}
                  {formatPostDateShort(c.createdAt)}
                </p>
                <p className="mt-1 text-xs text-[#c9d1d9]">
                  <span className="text-white/80">{c.authorName || 'Anónimo'}:</span> {c.text}
                </p>
                <button
                  type="button"
                  onClick={() => handleDeleteComment(c.postId, c.id)}
                  className="mt-2 text-xs text-red-400 hover:underline"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8b949e]">
          Valoraciones ({ratings.length})
        </h3>
        {!loading && ratings.length === 0 ? (
          <p className="mt-3 text-sm text-[#8b949e]">No hay votos.</p>
        ) : null}
        {!loading && ratings.length > 0 ? (
          <ul className="mt-4 max-h-60 space-y-2 overflow-y-auto pr-1">
            {ratings.map((r) => (
              <li
                key={`${r.postId}_${r.id}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-page/40 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-white">{r.postTitle}</p>
                  <p className="text-xs text-[#8b949e]">
                    {r.stars} ★ · {formatPostDateShort(r.createdAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteRating(r.postId, r.id)}
                  className="text-xs text-red-400 hover:underline"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  )
}

export default BlogModerationAdmin
