'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
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
import { getFirebaseFirestore, getFirebaseStorage } from '../../../lib/firebase/client'
import { COL } from '../../../lib/firebase/collections'
import { liquidGlassPanel } from '../../../lib/admin/glass'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

const sanitizeStorageFileName = (name) => {
  const n = (name || 'imagen').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 96)
  return n || 'imagen'
}

const emptyForm = {
  title: '',
  description: '',
  image: '',
  gitUrl: '',
  previewUrl: '',
  sortOrder: 0,
  active: true,
}

const ProjectsAdminClient = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState('')

  const load = useCallback(async () => {
    const db = getFirebaseFirestore()
    if (!db) return
    setLoading(true)
    try {
      const q = query(collection(db, COL.portfolioProjects), orderBy('sortOrder', 'asc'))
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

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl('')
      return
    }
    const url = URL.createObjectURL(imageFile)
    setImagePreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [imageFile])

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) {
      setImageFile(null)
      return
    }
    if (!file.type.startsWith('image/')) {
      alert('El archivo debe ser una imagen (JPEG, PNG, WebP, etc.)')
      e.target.value = ''
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      alert('La imagen no debe superar 5 MB')
      e.target.value = ''
      return
    }
    setImageFile(file)
  }

  const handleEdit = (row) => {
    setImageFile(null)
    setEditingId(row.id)
    setForm({
      title: row.title ?? '',
      description: row.description ?? '',
      image: row.image ?? '',
      gitUrl: row.gitUrl ?? '',
      previewUrl: row.previewUrl ?? '',
      sortOrder: Number(row.sortOrder ?? 0),
      active: row.active !== false,
    })
  }

  const handleNew = () => {
    setImageFile(null)
    setEditingId('new')
    setForm({ ...emptyForm })
  }

  const handleCancel = () => {
    setEditingId(null)
    setForm(emptyForm)
    setImageFile(null)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const db = getFirebaseFirestore()
    if (!db) return
    let imageUrl = form.image.trim()
    if (imageFile) {
      const storage = getFirebaseStorage()
      if (!storage) {
        alert('Configura NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET en .env.local y reinicia el servidor')
        return
      }
    }
    if (!imageUrl && !imageFile) {
      alert('Añade una imagen subiendo un archivo o pegando una URL')
      return
    }
    setSaving(true)
    try {
      const projectRef =
        editingId === 'new'
          ? doc(collection(db, COL.portfolioProjects))
          : doc(db, COL.portfolioProjects, editingId)

      if (imageFile) {
        const storage = getFirebaseStorage()
        if (!storage) throw new Error('Storage no disponible')
        const baseName = imageFile.name.replace(/\.[^/.]+$/, '')
        const rawExt = imageFile.name.includes('.') ? imageFile.name.split('.').pop().toLowerCase() : 'jpg'
        const ext = /^[a-z0-9]{2,5}$/.test(rawExt || '') ? rawExt : 'jpg'
        const safe = sanitizeStorageFileName(baseName)
        const path = `portfolio-projects/${projectRef.id}/${Date.now()}_${safe}.${ext}`
        const storageRef = ref(storage, path)
        await uploadBytes(storageRef, imageFile, {
          contentType: imageFile.type || 'image/jpeg',
        })
        imageUrl = await getDownloadURL(storageRef)
      }

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        image: imageUrl,
        gitUrl: form.gitUrl.trim(),
        previewUrl: form.previewUrl.trim(),
        sortOrder: Number(form.sortOrder) || 0,
        active: Boolean(form.active),
        updatedAt: serverTimestamp(),
      }

      if (editingId === 'new') {
        await setDoc(projectRef, {
          ...payload,
          createdAt: serverTimestamp(),
        })
      } else if (editingId) {
        await updateDoc(projectRef, payload)
      }
      handleCancel()
      await load()
    } catch (err) {
      console.error(err)
      alert(
        'Error al guardar. Revisa sesión, reglas de Firestore y Storage (portfolio-projects/*) y que exista el bucket.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este proyecto?')) return
    const db = getFirebaseFirestore()
    if (!db) return
    try {
      await deleteDoc(doc(db, COL.portfolioProjects, id))
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
      await updateDoc(doc(db, COL.portfolioProjects, row.id), {
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
          <h1 className="text-2xl font-bold sm:text-3xl">Proyectos</h1>
          <p className="mt-1 text-sm text-[#8b949e]">CRUD · solo activos se muestran en el portafolio público</p>
        </div>
        <button
          type="button"
          onClick={handleNew}
          className="rounded-lg bg-gradient-to-r from-accent-orange to-accent-coral px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
        >
          Nuevo proyecto
        </button>
      </div>

      {editingId ? (
        <form
          onSubmit={handleSave}
          className={`mb-10 space-y-4 p-6 ${liquidGlassPanel}`}
        >
          <h2 className="text-lg font-semibold">{editingId === 'new' ? 'Crear proyecto' : 'Editar proyecto'}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs text-[#8b949e]">Título</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full rounded-lg border border-surface-border bg-page px-3 py-2 text-sm text-white focus:border-accent-orange/50 focus:outline-none focus:ring-2 focus:ring-accent-orange/20"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs text-[#8b949e]">Descripción</label>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full rounded-lg border border-surface-border bg-page px-3 py-2 text-sm text-white focus:border-accent-orange/50 focus:outline-none focus:ring-2 focus:ring-accent-orange/20"
              />
            </div>
            <div className="sm:col-span-2 space-y-3">
              <div>
                <label htmlFor="project-image-file" className="mb-1 block text-xs text-[#8b949e]">
                  Subir imagen (Firebase Storage, máx. 5 MB)
                </label>
                <input
                  id="project-image-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                  onChange={handleImageFileChange}
                  className="w-full cursor-pointer rounded-lg border border-dashed border-white/20 bg-page/50 px-3 py-2 text-sm text-[#c9d1d9] file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-accent-orange/20 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-accent-orange hover:border-white/30"
                />
                {imageFile ? (
                  <button
                    type="button"
                    onClick={() => setImageFile(null)}
                    className="mt-2 text-xs text-red-300 hover:underline"
                  >
                    Quitar archivo seleccionado
                  </button>
                ) : null}
              </div>
              {(imagePreviewUrl || form.image) ? (
                <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
                  <img
                    src={imagePreviewUrl || form.image}
                    alt=""
                    className="h-40 w-full object-cover sm:h-48"
                  />
                </div>
              ) : null}
              <div>
                <label className="mb-1 block text-xs text-[#8b949e]">
                  O URL de imagen (opcional si subes un archivo · ej. /static/... o enlace público)
                </label>
                <input
                  value={form.image}
                  onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                  placeholder="https://… o /static/images/mi-proyecto.png"
                  className="w-full rounded-lg border border-surface-border bg-page px-3 py-2 text-sm text-white focus:border-accent-orange/50 focus:outline-none focus:ring-2 focus:ring-accent-orange/20"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#8b949e]">Repo / código (URL)</label>
              <input
                value={form.gitUrl}
                onChange={(e) => setForm((f) => ({ ...f, gitUrl: e.target.value }))}
                className="w-full rounded-lg border border-surface-border bg-page px-3 py-2 text-sm text-white focus:border-accent-orange/50 focus:outline-none focus:ring-2 focus:ring-accent-orange/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#8b949e]">Demo / preview (URL)</label>
              <input
                value={form.previewUrl}
                onChange={(e) => setForm((f) => ({ ...f, previewUrl: e.target.value }))}
                className="w-full rounded-lg border border-surface-border bg-page px-3 py-2 text-sm text-white focus:border-accent-orange/50 focus:outline-none focus:ring-2 focus:ring-accent-orange/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#8b949e]">Orden</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                className="w-full rounded-lg border border-surface-border bg-page px-3 py-2 text-sm text-white focus:border-accent-orange/50 focus:outline-none focus:ring-2 focus:ring-accent-orange/20"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                id="proj-active"
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                className="h-4 w-4 rounded border-surface-border bg-page text-accent-orange focus:ring-accent-orange/30"
              />
              <label htmlFor="proj-active" className="text-sm text-[#c9d1d9]">
                Visible en el sitio público
              </label>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15 disabled:opacity-50"
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm text-[#c9d1d9] hover:bg-white/5"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : null}

      <div className={`overflow-x-auto ${liquidGlassPanel}`}>
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent-orange border-t-transparent" />
          </div>
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-[#8b949e]">
                <th className="px-4 py-3">Orden</th>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Activo</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id} className="border-b border-white/[0.06]">
                  <td className="px-4 py-3 tabular-nums text-[#c9d1d9]">{row.sortOrder ?? 0}</td>
                  <td className="max-w-[200px] truncate px-4 py-3 font-medium text-white">{row.title}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(row)}
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        row.active !== false
                          ? 'bg-emerald-500/20 text-emerald-300'
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
          <p className="p-8 text-center text-[#8b949e]">No hay proyectos. Crea el primero.</p>
        ) : null}
      </div>
    </div>
  )
}

export default ProjectsAdminClient
