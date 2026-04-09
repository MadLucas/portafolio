'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc, serverTimestamp } from 'firebase/firestore'
import { getFirebaseFirestore } from '../../../lib/firebase/client'
import { COL } from '../../../lib/firebase/collections'
import { liquidGlassPanel } from '../../../lib/admin/glass'

const SurveysListAdmin = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const db = getFirebaseFirestore()
    if (!db) return
    setLoading(true)
    try {
      const q = query(collection(db, COL.surveys), orderBy('updatedAt', 'desc'))
      const snap = await getDocs(q)
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  const handleToggle = async (row) => {
    const db = getFirebaseFirestore()
    if (!db) return
    try {
      await updateDoc(doc(db, COL.surveys, row.id), {
        active: !(row.active !== false),
        updatedAt: serverTimestamp(),
      })
      await load()
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar encuesta y respuestas?')) return
    const db = getFirebaseFirestore()
    if (!db) return
    try {
      const snap = await getDocs(collection(db, COL.surveys, id, COL.surveyResponses))
      await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)))
      await deleteDoc(doc(db, COL.surveys, id))
      await load()
    } catch (e) {
      console.error(e)
      alert('No se pudo eliminar.')
    }
  }

  const handleCopyLink = (id) => {
    const url = `${origin}/encuesta/${id}`
    navigator.clipboard.writeText(url).then(() => alert(`Copiado: ${url}`))
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Encuestas</h1>
          <p className="mt-1 text-sm text-[#8b949e]">Crea formularios y comparte el enlace público</p>
        </div>
        <Link
          href="/admin/encuestas/nuevo"
          className="rounded-lg bg-gradient-to-r from-accent-orange to-accent-coral px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
        >
          Nueva encuesta
        </Link>
      </div>

      <div className={`overflow-x-auto ${liquidGlassPanel}`}>
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent-orange border-t-transparent" />
          </div>
        ) : (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase text-[#8b949e]">
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Activa</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id} className="border-b border-white/[0.06]">
                  <td className="px-4 py-3 font-medium text-white">{row.title}</td>
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
                      onClick={() => handleCopyLink(row.id)}
                      className="mr-2 text-[#8b949e] hover:text-white"
                    >
                      Copiar link
                    </button>
                    <Link href={`/admin/encuestas/${row.id}`} className="mr-2 text-accent-orange hover:underline">
                      Editar / datos
                    </Link>
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
          <p className="p-8 text-center text-[#8b949e]">No hay encuestas.</p>
        ) : null}
      </div>
    </div>
  )
}

export default SurveysListAdmin
