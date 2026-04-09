'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { getFirebaseFirestore } from '../../../lib/firebase/client'
import { COL } from '../../../lib/firebase/collections'
import { liquidGlassPanel } from '../../../lib/admin/glass'

const QUESTION_TYPES = [
  { value: 'shortText', label: 'Texto corto' },
  { value: 'longText', label: 'Texto largo' },
  { value: 'singleChoice', label: 'Una opción' },
  { value: 'multipleChoice', label: 'Varias opciones' },
]

const newQuestion = () => ({
  id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  label: '',
  type: 'shortText',
  options: [],
})

const SurveyEditorClient = ({ surveyId }) => {
  const isNew = !surveyId
  const [tab, setTab] = useState('edit')
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [active, setActive] = useState(true)
  const [questions, setQuestions] = useState([newQuestion()])
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(!isNew)

  const loadSurvey = useCallback(async () => {
    if (isNew) return
    const db = getFirebaseFirestore()
    if (!db) return
    setLoading(true)
    try {
      const ref = doc(db, COL.surveys, surveyId)
      const snap = await getDoc(ref)
      if (!snap.exists()) {
        setTitle('')
        setLoading(false)
        return
      }
      const d = snap.data()
      setTitle(d.title ?? '')
      setDescription(d.description ?? '')
      setActive(d.active !== false)
      const raw = Array.isArray(d.questions) && d.questions.length ? d.questions : [newQuestion()]
      setQuestions(
        raw.map((q) => ({
          ...q,
          optionsText: Array.isArray(q.options) ? q.options.join(', ') : q.optionsText ?? '',
        }))
      )
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [isNew, surveyId])

  const loadResponses = useCallback(async () => {
    if (isNew) return
    const db = getFirebaseFirestore()
    if (!db) return
    try {
      const snap = await getDocs(collection(db, COL.surveys, surveyId, COL.surveyResponses))
      const list = snap.docs.map((x) => ({ id: x.id, ...x.data() }))
      list.sort((a, b) => {
        const ta = a.submittedAt?.toMillis?.() ?? 0
        const tb = b.submittedAt?.toMillis?.() ?? 0
        return tb - ta
      })
      setResponses(list)
    } catch (e) {
      console.error(e)
      setResponses([])
    }
  }, [isNew, surveyId])

  useEffect(() => {
    loadSurvey()
  }, [loadSurvey])

  useEffect(() => {
    if (tab === 'data') loadResponses()
  }, [tab, loadResponses])

  const handleSave = async (e) => {
    e.preventDefault()
    const db = getFirebaseFirestore()
    if (!db) return
    const cleanedQs = questions
      .filter((q) => q.label.trim())
      .map((q) => ({
        id: q.id,
        label: q.label.trim(),
        type: q.type,
        options:
          q.type === 'singleChoice' || q.type === 'multipleChoice'
            ? (q.optionsText || '')
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
      }))
    if (!title.trim()) {
      alert('Añade un título')
      return
    }
    if (!cleanedQs.length) {
      alert('Añade al menos una pregunta con texto')
      return
    }
    setSaving(true)
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        active,
        questions: cleanedQs,
        updatedAt: serverTimestamp(),
      }
      if (isNew) {
        const ref = await addDoc(collection(db, COL.surveys), {
          ...payload,
          createdAt: serverTimestamp(),
        })
        window.location.href = `/admin/encuestas/${ref.id}`
        return
      }
      await updateDoc(doc(db, COL.surveys, surveyId), payload)
      alert('Guardado')
      await loadSurvey()
    } catch (err) {
      console.error(err)
      alert('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const updateQuestion = (index, partial) => {
    setQuestions((qs) => qs.map((q, i) => (i === index ? { ...q, ...partial } : q)))
  }

  const addQuestion = () => setQuestions((qs) => [...qs, newQuestion()])
  const removeQuestion = (index) =>
    setQuestions((qs) => (qs.length <= 1 ? qs : qs.filter((_, i) => i !== index)))

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const publicLink = !isNew ? `${origin}/encuesta/${surveyId}` : ''

  if (!isNew && loading) {
    return (
      <div className="flex justify-center p-16">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent-orange border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Link href="/admin/encuestas" className="text-sm text-[#8b949e] hover:text-white">
          ← Encuestas
        </Link>
        {!isNew ? (
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-[#8b949e]">
            ID: {surveyId}
          </span>
        ) : null}
      </div>

      {!isNew ? (
        <div className={`mb-6 flex gap-2 ${liquidGlassPanel} p-1`}>
          <button
            type="button"
            onClick={() => setTab('edit')}
            className={`flex-1 rounded-xl py-2 text-sm font-medium transition ${
              tab === 'edit' ? 'bg-white/12 text-white' : 'text-[#8b949e] hover:text-white'
            }`}
          >
            Editor
          </button>
          <button
            type="button"
            onClick={() => setTab('data')}
            className={`flex-1 rounded-xl py-2 text-sm font-medium transition ${
              tab === 'data' ? 'bg-white/12 text-white' : 'text-[#8b949e] hover:text-white'
            }`}
          >
            Respuestas ({responses.length})
          </button>
        </div>
      ) : null}

      {publicLink ? (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(publicLink).then(() => alert('Link copiado'))}
            className="rounded-lg border border-accent-orange/40 bg-accent-orange/10 px-3 py-2 text-sm text-accent-orange"
          >
            Copiar enlace público
          </button>
          <code className="max-w-full truncate text-xs text-[#8b949e]">{publicLink}</code>
        </div>
      ) : null}

      {tab === 'data' && !isNew ? (
        <div className={`${liquidGlassPanel} overflow-x-auto p-4`}>
          {responses.length === 0 ? (
            <p className="text-[#8b949e]">Aún no hay respuestas.</p>
          ) : (
            <table className="w-full min-w-[480px] text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/10 text-[#8b949e]">
                  <th className="pb-2 pr-2">Fecha</th>
                  {questions
                    .filter((q) => q.label?.trim())
                    .map((q) => (
                      <th key={q.id} className="pb-2 pr-2">
                        {q.label}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {responses.map((r) => (
                  <tr key={r.id} className="border-b border-white/[0.06]">
                    <td className="py-2 pr-2 text-[#8b949e]">
                      {r.submittedAt?.toDate
                        ? r.submittedAt.toDate().toLocaleString()
                        : '—'}
                    </td>
                    {questions.filter((q) => q.label?.trim()).map((q) => {
                      const a = r.answers && r.answers[q.id]
                      const display = Array.isArray(a) ? a.join(', ') : a ?? '—'
                      return (
                        <td key={q.id} className="max-w-[200px] truncate py-2 pr-2 text-white">
                          {String(display)}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <form onSubmit={handleSave} className={`space-y-6 p-6 ${liquidGlassPanel}`}>
          <h1 className="text-xl font-bold">{isNew ? 'Nueva encuesta' : 'Editar encuesta'}</h1>
          <div>
            <label className="mb-1 block text-xs text-[#8b949e]">Título</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-surface-border bg-page px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[#8b949e]">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-surface-border bg-page px-3 py-2 text-sm text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="surv-active"
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 rounded"
            />
            <label htmlFor="surv-active" className="text-sm text-[#c9d1d9]">
              Formulario abierto (público)
            </label>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-white">Preguntas</span>
              <button
                type="button"
                onClick={addQuestion}
                className="text-sm text-accent-orange hover:underline"
              >
                + Pregunta
              </button>
            </div>
            <div className="space-y-4">
              {questions.map((q, i) => (
                <div key={q.id} className="rounded-xl border border-white/[0.08] bg-page/40 p-4">
                  <div className="mb-2 flex justify-between gap-2">
                    <span className="text-xs text-[#8b949e]">Pregunta {i + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeQuestion(i)}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Quitar
                    </button>
                  </div>
                  <input
                    placeholder="Texto de la pregunta"
                    value={q.label}
                    onChange={(e) => updateQuestion(i, { label: e.target.value })}
                    className="mb-2 w-full rounded-lg border border-surface-border bg-page px-3 py-2 text-sm text-white"
                  />
                  <select
                    value={q.type}
                    onChange={(e) => updateQuestion(i, { type: e.target.value, options: [] })}
                    className="mb-2 w-full rounded-lg border border-surface-border bg-page px-3 py-2 text-sm text-white"
                  >
                    {QUESTION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  {(q.type === 'singleChoice' || q.type === 'multipleChoice') && (
                    <input
                      placeholder="Opciones separadas por comas"
                      value={q.optionsText ?? q.options?.join(', ') ?? ''}
                      onChange={(e) => updateQuestion(i, { optionsText: e.target.value })}
                      className="w-full rounded-lg border border-surface-border bg-page px-3 py-2 text-sm text-white"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-gradient-to-r from-accent-orange to-accent-coral px-6 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? 'Guardando…' : 'Guardar encuesta'}
          </button>
        </form>
      )}
    </div>
  )
}

export default SurveyEditorClient
