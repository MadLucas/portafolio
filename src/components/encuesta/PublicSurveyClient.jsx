'use client'

import React, { useEffect, useState } from 'react'
import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore'
import { initFirebaseAppFromPublicConfig, getFirebaseFirestore, getFirebaseApp } from '../../lib/firebase/client'
import { COL } from '../../lib/firebase/collections'

const ensureClient = async () => {
  if (getFirebaseApp()) return true
  const res = await fetch('/api/config/firebase-public', { cache: 'no-store' })
  const data = await res.json()
  if (!res.ok) return false
  initFirebaseAppFromPublicConfig(data.config)
  return true
}

const PublicSurveyClient = ({ surveyId }) => {
  const [loading, setLoading] = useState(true)
  const [survey, setSurvey] = useState(null)
  const [answers, setAnswers] = useState({})
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    let cancel = false
    ;(async () => {
      const ok = await ensureClient()
      if (!ok || cancel) {
        setLoading(false)
        setErr('Formulario no disponible')
        return
      }
      const db = getFirebaseFirestore()
      if (!db) {
        setLoading(false)
        return
      }
      try {
        const snap = await getDoc(doc(db, COL.surveys, surveyId))
        if (!snap.exists() || snap.data().active === false) {
          if (!cancel) setSurvey(null)
        } else if (!cancel) {
          setSurvey({ id: snap.id, ...snap.data() })
        }
      } catch (e) {
        console.error(e)
        if (!cancel) setErr('No se pudo cargar')
      } finally {
        if (!cancel) setLoading(false)
      }
    })()
    return () => {
      cancel = true
    }
  }, [surveyId])

  const setAnswer = (qid, value) => {
    setAnswers((a) => ({ ...a, [qid]: value }))
  }

  const toggleMulti = (qid, opt, checked) => {
    setAnswers((a) => {
      const cur = Array.isArray(a[qid]) ? [...a[qid]] : []
      if (checked) return { ...a, [qid]: [...cur, opt] }
      return { ...a, [qid]: cur.filter((x) => x !== opt) }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const db = getFirebaseFirestore()
    if (!db || !survey) return
    for (const q of survey.questions || []) {
      const v = answers[q.id]
      if (q.type === 'multipleChoice') {
        if (!Array.isArray(v) || !v.length) {
          setErr(`Completa: ${q.label}`)
          return
        }
      } else if (v == null || String(v).trim() === '') {
        setErr(`Completa: ${q.label}`)
        return
      }
    }
    setErr('')
    try {
      await addDoc(collection(db, COL.surveys, surveyId, COL.surveyResponses), {
        answers,
        submittedAt: serverTimestamp(),
      })
      setSent(true)
    } catch (err) {
      console.error(err)
      setErr('No se pudo enviar. Intenta de nuevo.')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent-orange border-t-transparent" />
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="rounded-2xl border border-white/10 bg-surface/40 p-8 text-center text-[#8b949e]">
        Esta encuesta no está disponible.
      </div>
    )
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center text-white">
        <p className="text-lg font-semibold">¡Gracias!</p>
        <p className="mt-2 text-sm text-[#8b949e]">Tus respuestas se registraron correctamente.</p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-white/[0.1] bg-surface/[0.35] p-6 backdrop-blur-md sm:p-8"
    >
      <div>
        <h1 className="text-2xl font-bold text-white">{survey.title}</h1>
        {survey.description ? <p className="mt-2 text-[#8b949e]">{survey.description}</p> : null}
      </div>

      {(survey.questions || []).map((q) => (
        <div key={q.id}>
          <label className="mb-2 block text-sm font-medium text-[#c9d1d9]">{q.label}</label>
          {q.type === 'shortText' && (
            <input
              required
              value={answers[q.id] ?? ''}
              onChange={(e) => setAnswer(q.id, e.target.value)}
              className="w-full rounded-lg border border-surface-border bg-page px-3 py-2 text-sm text-white"
            />
          )}
          {q.type === 'longText' && (
            <textarea
              required
              rows={4}
              value={answers[q.id] ?? ''}
              onChange={(e) => setAnswer(q.id, e.target.value)}
              className="w-full rounded-lg border border-surface-border bg-page px-3 py-2 text-sm text-white"
            />
          )}
          {q.type === 'singleChoice' &&
            (q.options || []).map((opt) => (
              <label key={opt} className="mb-2 flex items-center gap-2 text-sm text-white">
                <input
                  type="radio"
                  name={q.id}
                  value={opt}
                  checked={answers[q.id] === opt}
                  onChange={() => setAnswer(q.id, opt)}
                  className="h-4 w-4"
                />
                {opt}
              </label>
            ))}
          {q.type === 'multipleChoice' &&
            (q.options || []).map((opt) => (
              <label key={opt} className="mb-2 flex items-center gap-2 text-sm text-white">
                <input
                  type="checkbox"
                  checked={(answers[q.id] || []).includes(opt)}
                  onChange={(e) => toggleMulti(q.id, opt, e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                {opt}
              </label>
            ))}
        </div>
      ))}

      {err ? <p className="text-sm text-red-400">{err}</p> : null}

      <button
        type="submit"
        className="w-full rounded-lg bg-gradient-to-r from-accent-orange to-accent-coral py-3 text-sm font-semibold text-white sm:w-auto sm:px-8"
      >
        Enviar respuestas
      </button>
    </form>
  )
}

export default PublicSurveyClient
