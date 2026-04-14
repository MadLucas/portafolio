'use client'

import React, { useCallback, useEffect, useState } from 'react'
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { getFirebaseFirestore } from '../../../lib/firebase/client'
import { COL } from '../../../lib/firebase/collections'
import { liquidGlassPanel } from '../../../lib/admin/glass'

const emptyForm = {
  title: '',
  summary: '',
  imageUrl: '',
  sortOrder: 0,
  active: true,
}

const isValidOptionalHttpUrl = (s) => {
  const t = (s || '').trim()
  if (!t) return true
  try {
    const u = new URL(t)
    return u.protocol === 'https:' || u.protocol === 'http:'
  } catch {
    return false
  }
}

const SolutionsAdminClient = () => {
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
      const q = query(collection(db, COL.softwareSolutions), orderBy('sortOrder', 'asc'))
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
      summary: row.summary ?? '',
      imageUrl: typeof row.imageUrl === 'string' ? row.imageUrl : '',
      sortOrder: Number(row.sortOrder ?? 0),
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

    const title = form.title.trim()
    const summary = form.summary.trim()
    const imageUrl = form.imageUrl.trim()
    if (!title || !summary) {
      alert('Título y descripción son obligatorios.')
      return
    }
    if (!isValidOptionalHttpUrl(imageUrl)) {
      alert('La URL de imagen debe ser http(s) válida o dejarla vacía.')
      return
    }

    setSaving(true)
    try {
      const ref =
        editingId === 'new'
          ? doc(collection(db, COL.softwareSolutions))
          : doc(db, COL.softwareSolutions, editingId)

      const payload = {
        title,
        summary,
        imageUrl: imageUrl || '',
        sortOrder: Number(form.sortOrder) || 0,
        active: Boolean(form.active),
        updatedAt: serverTimestamp(),
      }

      if (editingId === 'new') {
        await setDoc(
          ref,
          {
            ...payload,
            createdAt: serverTimestamp(),
          },
          { merge: true }
        )
      } else if (editingId) {
        await updateDoc(ref, payload)
      }

      handleCancel()
      await load()
    } catch (err) {
      console.error(err)
      alert('Error al guardar. Revisa sesión y reglas de Firestore.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta solución?')) return
    const db = getFirebaseFirestore()
    if (!db) return
    try {
      await deleteDoc(doc(db, COL.softwareSolutions, id))
      if (editingId === id) handleCancel()
      await load()
    } catch (e) {
      console.error(e)
      alert('No se pudo eliminar.')
    }
  }

  const handleToggleActive = async (row) => {
    const db = getFirebaseFirestore()
    if (!db) return
    try {
      await updateDoc(doc(db, COL.softwareSolutions, row.id), {
        active: !row.active,
        updatedAt: serverTimestamp(),
      })
      await load()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Soluciones y servicios</h1>
          <p className="mt-1 text-sm text-[#8b949e]">
            CRUD · solo las activas se muestran en <span className="text-white/80">/soluciones</span>
          </p>
        </div>
        <button
          type="button"
          onClick={handleNew}
          className="rounded-lg bg-gradient-to-r from-accent-orange to-accent-coral px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
        >
          Nueva solución
        </button>
      </div>

      {editingId ? (
        <form onSubmit={handleSave} className={`mb-10 space-y-4 p-6 ${liquidGlassPanel}`}>
          <h2 className="text-lg font-semibold">
            {editingId === 'new' ? 'Crear solución' : 'Editar solución'}
          </h2>

          <div>
            <label className="mb-1 block text-xs text-[#8b949e]">Título</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full rounded-lg border border-white/[0.08] bg-page/80 px-3 py-2 text-sm text-white placeholder-[#6e7681] focus:border-accent-orange/40 focus:outline-none focus:ring-2 focus:ring-accent-orange/20"
              placeholder="Ej. Desarrollo web a medida"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-[#8b949e]">Descripción / detalle</label>
            <textarea
              value={form.summary}
              onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
              rows={5}
              className="w-full resize-y rounded-lg border border-white/[0.08] bg-page/80 px-3 py-2 text-sm text-white placeholder-[#6e7681] focus:border-accent-orange/40 focus:outline-none focus:ring-2 focus:ring-accent-orange/20"
              placeholder="Qué incluye el servicio, stack, entregables…"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-[#8b949e]">Imagen (URL opcional)</label>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              className="w-full rounded-lg border border-white/[0.08] bg-page/80 px-3 py-2 text-sm text-white placeholder-[#6e7681] focus:border-accent-orange/40 focus:outline-none focus:ring-2 focus:ring-accent-orange/20"
              placeholder="https://images.unsplash.com/photo-..."
              autoComplete="off"
            />
            <p className="mt-1 text-xs text-[#6e7681]">
              Pegá un enlace directo a la imagen (por ejemplo desde Unsplash → copiar URL de la imagen).
            </p>
            {isValidOptionalHttpUrl(form.imageUrl) && form.imageUrl.trim() ? (
              <div className="relative mt-3 h-36 w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-page">
                {/* eslint-disable-next-line @next/next/no-img-element -- preview de URL externa en admin */}
                <img
                  src={form.imageUrl.trim()}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-[#8b949e]">Orden (sortOrder)</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                className="w-full rounded-lg border border-white/[0.08] bg-page/80 px-3 py-2 text-sm text-white focus:border-accent-orange/40 focus:outline-none focus:ring-2 focus:ring-accent-orange/20"
              />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-[#c9d1d9]">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                  className="rounded border-white/20 bg-page text-accent-orange focus:ring-accent-orange/40"
                />
                Visible en el sitio público
              </label>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-gradient-to-r from-accent-orange to-accent-coral px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm text-[#c9d1d9] transition hover:bg-white/[0.06]"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent-orange border-t-transparent" />
        </div>
      ) : (
        <div className={`overflow-hidden rounded-2xl ${liquidGlassPanel}`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] text-[#8b949e]">
                  <th className="px-4 py-3 font-medium">Orden</th>
                  <th className="px-4 py-3 font-medium">Título</th>
                  <th className="px-4 py-3 font-medium">Activo</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-[#8b949e]">
                      No hay soluciones. Crea la primera.
                    </td>
                  </tr>
                ) : (
                  items.map((row) => (
                    <tr key={row.id} className="border-b border-white/[0.05] last:border-0">
                      <td className="px-4 py-3 tabular-nums text-[#c9d1d9]">{row.sortOrder ?? 0}</td>
                      <td className="max-w-md px-4 py-3">
                        <span className="font-medium text-white">{row.title || '—'}</span>
                        <p className="mt-1 line-clamp-2 text-xs text-[#8b949e]">{row.summary || ''}</p>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(row)}
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            row.active !== false
                              ? 'bg-emerald-500/15 text-emerald-200'
                              : 'bg-white/10 text-[#8b949e]'
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
                          className="text-rose-300/90 hover:underline"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default SolutionsAdminClient
