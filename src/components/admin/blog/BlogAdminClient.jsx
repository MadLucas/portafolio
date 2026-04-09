'use client'

import React, { useCallback, useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { getFirebaseFirestore } from '../../../lib/firebase/client'
import { COL, BLOG_SUB } from '../../../lib/firebase/collections'
import { liquidGlassPanel } from '../../../lib/admin/glass'
import { formatPostDateShort } from '../../../lib/blog/formatPostDate'
import BlogModerationAdmin from './BlogModerationAdmin'

const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: '',
  active: true,
}

const slugify = (s) =>
  s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')

const BlogAdminClient = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const load = useCallback(async () => {
    const db = getFirebaseFirestore()
    if (!db) return
    setLoading(true)
    try {
      const q = query(collection(db, COL.blogPosts), orderBy('updatedAt', 'desc'))
      const snap = await getDocs(q)
      setItems(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      )
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleEdit = (row) => {
    setEditingId(row.id)
    setForm({
      title: row.title ?? '',
      slug: row.slug ?? '',
      excerpt: row.excerpt ?? '',
      content: row.content ?? '',
      coverImage: row.coverImage ?? '',
      active: row.active !== false,
    })
  }

  const handleNew = () => {
    setEditingId('new')
    setForm({ ...emptyForm })
  }

  const handleCancel = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const db = getFirebaseFirestore()
    if (!db) return
    let slug = form.slug.trim() ? slugify(form.slug) : slugify(form.title)
    if (!slug) slug = `post-${Date.now()}`
    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        slug,
        excerpt: form.excerpt.trim(),
        content: form.content,
        coverImage: form.coverImage.trim(),
        active: Boolean(form.active),
        updatedAt: serverTimestamp(),
      }
      if (editingId === 'new') {
        await addDoc(collection(db, COL.blogPosts), {
          ...payload,
          createdAt: serverTimestamp(),
        })
      } else if (editingId) {
        await updateDoc(doc(db, COL.blogPosts, editingId), payload)
      }
      handleCancel()
      await load()
    } catch (err) {
      console.error(err)
      alert('Error al guardar (¿slug duplicado o reglas?)')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este artículo, sus comentarios y valoraciones?')) return
    const db = getFirebaseFirestore()
    if (!db) return
    try {
      const postRef = doc(db, COL.blogPosts, id)
      const [cSnap, rSnap] = await Promise.all([
        getDocs(collection(postRef, BLOG_SUB.comments)),
        getDocs(collection(postRef, BLOG_SUB.ratings)),
      ])
      const refs = [...cSnap.docs.map((d) => d.ref), ...rSnap.docs.map((d) => d.ref), postRef]
      const chunk = 450
      for (let i = 0; i < refs.length; i += chunk) {
        const batch = writeBatch(db)
        refs.slice(i, i + chunk).forEach((r) => batch.delete(r))
        await batch.commit()
      }
      await load()
    } catch (e) {
      console.error(e)
      alert('No se pudo eliminar el artículo.')
    }
  }

  const handleToggle = async (row) => {
    const db = getFirebaseFirestore()
    if (!db) return
    try {
      await updateDoc(doc(db, COL.blogPosts, row.id), {
        active: !row.active,
        updatedAt: serverTimestamp(),
      })
      await load()
    } catch (e) {
      console.error(e)
    }
  }

  const publicOrigin =
    typeof window !== 'undefined' ? window.location.origin : ''

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Blog</h1>
          <p className="mt-1 text-sm text-[#8b949e]">
            Artículos públicos en <code className="text-white/80">/blog</code> si están activos
          </p>
        </div>
        <button
          type="button"
          onClick={handleNew}
          className="rounded-lg bg-gradient-to-r from-accent-orange to-accent-coral px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
        >
          Nuevo artículo
        </button>
      </div>

      {editingId ? (
        <form onSubmit={handleSave} className={`mb-10 space-y-4 p-6 ${liquidGlassPanel}`}>
          <h2 className="text-lg font-semibold">{editingId === 'new' ? 'Crear' : 'Editar'}</h2>
          <div className="grid gap-4">
            <div>
              <label className="mb-1 block text-xs text-[#8b949e]">Título</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full rounded-lg border border-surface-border bg-page px-3 py-2 text-sm text-white focus:border-accent-orange/50 focus:outline-none focus:ring-2 focus:ring-accent-orange/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#8b949e]">Slug (URL)</label>
              <input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="se genera del título si lo dejas vacío"
                className="w-full rounded-lg border border-surface-border bg-page px-3 py-2 text-sm text-white focus:border-accent-orange/50 focus:outline-none focus:ring-2 focus:ring-accent-orange/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#8b949e]">Resumen</label>
              <textarea
                rows={2}
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                className="w-full rounded-lg border border-surface-border bg-page px-3 py-2 text-sm text-white focus:border-accent-orange/50 focus:outline-none focus:ring-2 focus:ring-accent-orange/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#8b949e]">Contenido (Markdown / texto)</label>
              <textarea
                required
                rows={12}
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                className="w-full rounded-lg border border-surface-border bg-page px-3 py-2 font-mono text-sm text-white focus:border-accent-orange/50 focus:outline-none focus:ring-2 focus:ring-accent-orange/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#8b949e]">Imagen de portada (URL opcional)</label>
              <input
                value={form.coverImage}
                onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))}
                className="w-full rounded-lg border border-surface-border bg-page px-3 py-2 text-sm text-white focus:border-accent-orange/50 focus:outline-none focus:ring-2 focus:ring-accent-orange/20"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="blog-active"
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                className="h-4 w-4 rounded border-surface-border"
              />
              <label htmlFor="blog-active" className="text-sm text-[#c9d1d9]">
                Publicado (visible)
              </label>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 disabled:opacity-50"
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm text-[#c9d1d9]"
            >
              Cancelar
            </button>
            {editingId !== 'new' && form.slug ? (
              <a
                href={`${publicOrigin}/blog/${form.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto self-center text-sm text-accent-orange hover:underline"
              >
                Ver público ↗
              </a>
            ) : null}
          </div>
        </form>
      ) : null}

      <div className={`overflow-x-auto ${liquidGlassPanel}`}>
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent-orange border-t-transparent" />
          </div>
        ) : (
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase text-[#8b949e]">
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Activo</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id} className="border-b border-white/[0.06]">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-[#8b949e]">
                    {formatPostDateShort(row.updatedAt ?? row.createdAt) || '—'}
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-3 font-medium text-white">{row.title}</td>
                  <td className="px-4 py-3 text-[#8b949e]">{row.slug}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggle(row)}
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        row.active !== false ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-[#8b949e]'
                      }`}
                    >
                      {row.active !== false ? 'Sí' : 'No'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleEdit(row)}
                      className="mr-2 text-accent-orange hover:underline"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(row.id)}
                      className="text-red-400 hover:underline"
                    >
                      Borrar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && items.length === 0 ? (
          <p className="p-8 text-center text-[#8b949e]">No hay artículos.</p>
        ) : null}
      </div>

      <BlogModerationAdmin onChanged={load} />
    </div>
  )
}

export default BlogAdminClient
