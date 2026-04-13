'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import {
  collection,
  deleteDoc,
  deleteField,
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
const MAX_PDF_BYTES = 12 * 1024 * 1024

const sanitizeStorageFileName = (name) => {
  const n = (name || 'archivo').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 96)
  return n || 'archivo'
}

const toDateInputValue = (v) => {
  if (v == null || v === '') return ''
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10)
  if (typeof v === 'object' && v !== null && typeof v.toDate === 'function') {
    const d = v.toDate()
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10)
  }
  return ''
}

const normalizeImagesFromRow = (row) => {
  if (Array.isArray(row.images) && row.images.length > 0) {
    return row.images.filter((u) => typeof u === 'string' && u.trim())
  }
  if (row.image && typeof row.image === 'string' && row.image.trim()) {
    return [row.image.trim()]
  }
  return []
}

const normalizeSkillsFromRow = (row) => {
  if (!Array.isArray(row.skills)) return []
  return row.skills.map((s) => String(s).trim()).filter(Boolean)
}

const normalizePdfsFromRow = (row) => {
  if (!Array.isArray(row.pdfs)) return []
  return row.pdfs.filter((p) => p && typeof p.url === 'string' && p.url.trim())
}

const emptyForm = {
  title: '',
  description: '',
  skills: [],
  imageUrls: [],
  executedAt: '',
  pdfs: [],
  sortOrder: 0,
  active: true,
}

const ProjectsAdminClient = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [skillInput, setSkillInput] = useState('')
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [pendingImageFiles, setPendingImageFiles] = useState([])
  const [pendingPdfFiles, setPendingPdfFiles] = useState([])
  const [pendingImagePreviews, setPendingImagePreviews] = useState([])

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
    const urls = pendingImageFiles.map((f) => URL.createObjectURL(f))
    setPendingImagePreviews(urls)
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [pendingImageFiles])

  const handleImageFilesChange = (e) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    const valid = []
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        alert('Cada archivo debe ser una imagen (JPEG, PNG, WebP, etc.)')
        continue
      }
      if (file.size > MAX_IMAGE_BYTES) {
        alert(`"${file.name}" supera 5 MB`)
        continue
      }
      valid.push(file)
    }
    if (valid.length === 0) return
    setPendingImageFiles((prev) => [...prev, ...valid])
  }

  const handleRemovePendingImage = (index) => {
    setPendingImageFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handlePdfFilesChange = (e) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    const valid = []
    for (const file of files) {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      if (!isPdf) {
        alert(`"${file.name}" no es un PDF`)
        continue
      }
      if (file.size > MAX_PDF_BYTES) {
        alert(`"${file.name}" supera 12 MB`)
        continue
      }
      valid.push(file)
    }
    if (valid.length === 0) return
    setPendingPdfFiles((prev) => [...prev, ...valid])
  }

  const handleRemovePendingPdf = (index) => {
    setPendingPdfFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAddSkill = () => {
    const s = skillInput.trim()
    if (!s) return
    if (form.skills.includes(s)) {
      setSkillInput('')
      return
    }
    setForm((f) => ({ ...f, skills: [...f.skills, s] }))
    setSkillInput('')
  }

  const handleRemoveSkill = (skill) => {
    setForm((f) => ({ ...f, skills: f.skills.filter((x) => x !== skill) }))
  }

  const handleAddImageUrl = () => {
    const u = imageUrlInput.trim()
    if (!u) return
    setForm((f) => ({ ...f, imageUrls: [...f.imageUrls, u] }))
    setImageUrlInput('')
  }

  const handleRemoveImageUrl = (index) => {
    setForm((f) => ({ ...f, imageUrls: f.imageUrls.filter((_, i) => i !== index) }))
  }

  const handleRemoveSavedPdf = (index) => {
    setForm((f) => ({ ...f, pdfs: f.pdfs.filter((_, i) => i !== index) }))
  }

  const handleEdit = (row) => {
    setPendingImageFiles([])
    setPendingPdfFiles([])
    setSkillInput('')
    setImageUrlInput('')
    setEditingId(row.id)
    setForm({
      title: row.title ?? '',
      description: row.description ?? '',
      skills: normalizeSkillsFromRow(row),
      imageUrls: normalizeImagesFromRow(row),
      executedAt: toDateInputValue(row.executedAt),
      pdfs: normalizePdfsFromRow(row),
      sortOrder: Number(row.sortOrder ?? 0),
      active: row.active !== false,
    })
  }

  const handleNew = () => {
    setPendingImageFiles([])
    setPendingPdfFiles([])
    setSkillInput('')
    setImageUrlInput('')
    setEditingId('new')
    setForm({ ...emptyForm })
  }

  const handleCancel = () => {
    setEditingId(null)
    setForm(emptyForm)
    setPendingImageFiles([])
    setPendingPdfFiles([])
    setSkillInput('')
    setImageUrlInput('')
  }

  const uploadProjectImages = async (storage, projectId, files) => {
    const urls = []
    for (const file of files) {
      const baseName = file.name.replace(/\.[^/.]+$/, '')
      const rawExt = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : 'jpg'
      const ext = /^[a-z0-9]{2,5}$/.test(rawExt || '') ? rawExt : 'jpg'
      const safe = sanitizeStorageFileName(baseName)
      const path = `portfolio-projects/${projectId}/images/${Date.now()}_${safe}.${ext}`
      const storageRef = ref(storage, path)
      await uploadBytes(storageRef, file, {
        contentType: file.type || 'image/jpeg',
      })
      urls.push(await getDownloadURL(storageRef))
    }
    return urls
  }

  const uploadProjectPdfs = async (storage, projectId, files) => {
    const out = []
    for (const file of files) {
      const safe = sanitizeStorageFileName(file.name.replace(/\.pdf$/i, ''))
      const path = `portfolio-projects/${projectId}/pdfs/${Date.now()}_${safe}.pdf`
      const storageRef = ref(storage, path)
      await uploadBytes(storageRef, file, {
        contentType: 'application/pdf',
      })
      const url = await getDownloadURL(storageRef)
      out.push({ url, fileName: file.name })
    }
    return out
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const db = getFirebaseFirestore()
    if (!db) return

    const needsStorage =
      pendingImageFiles.length > 0 || pendingPdfFiles.length > 0

    if (needsStorage) {
      const storage = getFirebaseStorage()
      if (!storage) {
        alert('Configura NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET en .env.local y reinicia el servidor')
        return
      }
    }

    setSaving(true)
    try {
      const projectRef =
        editingId === 'new'
          ? doc(collection(db, COL.portfolioProjects))
          : doc(db, COL.portfolioProjects, editingId)

      const storage = getFirebaseStorage()
      let imageUrls = [...form.imageUrls.map((u) => u.trim()).filter(Boolean)]
      let pdfs = [...form.pdfs]

      if (pendingImageFiles.length > 0) {
        if (!storage) throw new Error('Storage no disponible')
        const uploaded = await uploadProjectImages(storage, projectRef.id, pendingImageFiles)
        imageUrls = [...imageUrls, ...uploaded]
      }

      if (pendingPdfFiles.length > 0) {
        if (!storage) throw new Error('Storage no disponible')
        const uploadedPdfs = await uploadProjectPdfs(storage, projectRef.id, pendingPdfFiles)
        pdfs = [...pdfs, ...uploadedPdfs]
      }

      const skills = form.skills.map((s) => s.trim()).filter(Boolean)
      const executedRaw = form.executedAt.trim()
      const executedAt = executedRaw === '' ? null : executedRaw

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        images: imageUrls,
        skills,
        executedAt,
        pdfs,
        sortOrder: Number(form.sortOrder) || 0,
        active: Boolean(form.active),
        updatedAt: serverTimestamp(),
        gitUrl: deleteField(),
        previewUrl: deleteField(),
        image: deleteField(),
      }

      if (editingId === 'new') {
        // deleteField() en setDoc exige { merge: true } (Firestore)
        await setDoc(
          projectRef,
          {
            ...payload,
            createdAt: serverTimestamp(),
          },
          { merge: true }
        )
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

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSkill()
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
        <form onSubmit={handleSave} className={`mb-10 space-y-4 p-6 ${liquidGlassPanel}`}>
          <h2 className="text-lg font-semibold">{editingId === 'new' ? 'Crear proyecto' : 'Editar proyecto'}</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs text-[#8b949e]">Título del proyecto</label>
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
                rows={4}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full rounded-lg border border-surface-border bg-page px-3 py-2 text-sm text-white focus:border-accent-orange/50 focus:outline-none focus:ring-2 focus:ring-accent-orange/20"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs text-[#8b949e]">Habilidades aplicadas</label>
              <div className="flex flex-wrap gap-2">
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder="Ej. Next.js"
                  className="min-w-[12rem] flex-1 rounded-lg border border-surface-border bg-page px-3 py-2 text-sm text-white focus:border-accent-orange/50 focus:outline-none focus:ring-2 focus:ring-accent-orange/20"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="rounded-lg border border-accent-orange/40 bg-accent-orange/15 px-3 py-2 text-sm font-medium text-accent-orange hover:bg-accent-orange/25"
                >
                  Añadir
                </button>
              </div>
              {form.skills.length > 0 ? (
                <ul className="mt-3 flex flex-wrap gap-2" aria-label="Habilidades añadidas">
                  {form.skills.map((skill) => (
                    <li
                      key={skill}
                      className="inline-flex items-center gap-1 rounded-full border border-accent-orange/30 bg-accent-orange/10 px-2.5 py-0.5 text-xs font-medium text-accent-orange"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-0.5 rounded p-0.5 text-accent-orange/80 hover:bg-accent-orange/20 hover:text-accent-orange"
                        aria-label={`Quitar ${skill}`}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-[#8b949e]">Aparecerán como etiquetas en la tarjeta pública</p>
              )}
            </div>

            <div className="sm:col-span-2 space-y-3">
              <label className="block text-xs text-[#8b949e]">Imágenes (opcional)</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                multiple
                onChange={handleImageFilesChange}
                className="w-full cursor-pointer rounded-lg border border-dashed border-white/20 bg-page/50 px-3 py-2 text-sm text-[#c9d1d9] file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-accent-orange/20 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-accent-orange hover:border-white/30"
              />
              <div className="flex flex-wrap gap-2">
                <input
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="O pegar URL de imagen"
                  className="min-w-[12rem] flex-1 rounded-lg border border-surface-border bg-page px-3 py-2 text-sm text-white focus:border-accent-orange/50 focus:outline-none focus:ring-2 focus:ring-accent-orange/20"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="rounded-lg border border-white/15 px-3 py-2 text-sm text-[#c9d1d9] hover:bg-white/5"
                >
                  Añadir URL
                </button>
              </div>
              {form.imageUrls.length > 0 || pendingImagePreviews.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {form.imageUrls.map((url, i) => (
                    <div key={`url-${i}`} className="relative overflow-hidden rounded-lg border border-white/10">
                      <img src={url} alt="" className="h-24 w-36 object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImageUrl(i)}
                        className="absolute right-1 top-1 rounded bg-black/60 px-1.5 text-xs text-white hover:bg-black/80"
                        aria-label="Quitar imagen"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {pendingImagePreviews.map((src, i) => (
                    <div key={`pending-${i}`} className="relative overflow-hidden rounded-lg border border-dashed border-accent-orange/40">
                      <img src={src} alt="" className="h-24 w-36 object-cover opacity-90" />
                      <button
                        type="button"
                        onClick={() => handleRemovePendingImage(i)}
                        className="absolute right-1 top-1 rounded bg-black/60 px-1.5 text-xs text-white hover:bg-black/80"
                        aria-label="Quitar archivo pendiente"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-xs text-[#8b949e]">Fecha de ejecución (opcional)</label>
              <input
                type="date"
                value={form.executedAt}
                onChange={(e) => setForm((f) => ({ ...f, executedAt: e.target.value }))}
                className="w-full rounded-lg border border-surface-border bg-page px-3 py-2 text-sm text-white focus:border-accent-orange/50 focus:outline-none focus:ring-2 focus:ring-accent-orange/20"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="block text-xs text-[#8b949e]">Archivos PDF (opcional)</label>
              <input
                type="file"
                accept="application/pdf,.pdf"
                multiple
                onChange={handlePdfFilesChange}
                className="w-full cursor-pointer rounded-lg border border-dashed border-white/20 bg-page/50 px-3 py-2 text-sm text-[#c9d1d9] file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-accent-orange/20 file:px-3 file:py-1.5 file:text-sm file:text-accent-orange hover:border-white/30"
              />
              {form.pdfs.length > 0 ? (
                <ul className="space-y-1 text-sm text-[#c9d1d9]">
                  {form.pdfs.map((p, i) => (
                    <li key={`pdf-saved-${i}`} className="flex items-center justify-between gap-2 rounded border border-white/[0.06] bg-page/40 px-2 py-1">
                      <span className="truncate">{p.fileName || 'PDF'}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSavedPdf(i)}
                        className="shrink-0 text-xs text-red-300 hover:underline"
                      >
                        Quitar
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              {pendingPdfFiles.length > 0 ? (
                <ul className="space-y-1 text-sm text-[#8b949e]">
                  {pendingPdfFiles.map((f, i) => (
                    <li key={`pdf-pend-${i}`} className="flex items-center justify-between gap-2">
                      <span className="truncate">Subir: {f.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePendingPdf(i)}
                        className="shrink-0 text-xs text-red-300 hover:underline"
                      >
                        Quitar
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
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
