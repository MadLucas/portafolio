'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { collection, getDocs, query, where, documentId } from 'firebase/firestore'
import { getFirebaseAuth, getFirebaseFirestore } from '../../lib/firebase/client'
import {
  daysBackIds,
  fillDailySeries,
  granularityFromMode,
  mapToMap,
} from '../../lib/analytics/aggregateViews'
import { COL } from '../../lib/firebase/collections'

const ViewsChart = dynamic(() => import('./ViewsChart'), {
  ssr: false,
  loading: () => (
    <div className="flex h-80 items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent-orange border-t-transparent" />
    </div>
  ),
})

const RANGE_OPTIONS = [
  { value: 14, label: '14 días' },
  { value: 30, label: '30 días' },
  { value: 90, label: '90 días' },
  { value: 365, label: '12 meses' },
  { value: 730, label: '24 meses' },
]

const GRANULARITY = [
  { value: 'day', label: 'Por día' },
  { value: 'week', label: 'Por semana' },
  { value: 'month', label: 'Por mes' },
  { value: 'year', label: 'Por año' },
]

const CHART_TYPES = [
  { value: 'line', label: 'Líneas' },
  { value: 'bar', label: 'Barras' },
]

const loadDailySeries = async (db, numDays) => {
  const dayIds = daysBackIds(numDays)
  const start = dayIds[0]
  const end = dayIds[dayIds.length - 1]
  const colRef = collection(db, COL.dailyViews)
  const q = query(colRef, where(documentId(), '>=', start), where(documentId(), '<=', end))
  const snap = await getDocs(q)
  const entries = snap.docs.map((d) => ({
    date: d.id,
    count: Number(d.data().count ?? 0),
  }))
  const map = mapToMap(entries)
  return fillDailySeries(dayIds, map)
}

const AdminDashboard = () => {
  const [rangeDays, setRangeDays] = useState(30)
  const [granularity, setGranularity] = useState('day')
  const [chartType, setChartType] = useState('line')
  const [seriesLoading, setSeriesLoading] = useState(false)
  const [seriesError, setSeriesError] = useState('')
  const [dailySeries, setDailySeries] = useState([])
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    setUserEmail(getFirebaseAuth()?.currentUser?.email ?? '')
  }, [])

  const fetchSeries = useCallback(async () => {
    const db = getFirebaseFirestore()
    if (!db) return
    setSeriesLoading(true)
    setSeriesError('')
    try {
      const s = await loadDailySeries(db, rangeDays)
      setDailySeries(s)
    } catch (e) {
      console.error(e)
      setSeriesError('No se pudieron cargar las métricas.')
    } finally {
      setSeriesLoading(false)
    }
  }, [rangeDays])

  useEffect(() => {
    fetchSeries()
  }, [fetchSeries])

  const chartData = useMemo(
    () => granularityFromMode(granularity, dailySeries),
    [granularity, dailySeries]
  )

  const totals = useMemo(() => {
    const total = dailySeries.reduce((a, b) => a + b.count, 0)
    let peak = { date: '', count: 0 }
    dailySeries.forEach((d) => {
      if (d.count > peak.count) peak = { date: d.date, count: d.count }
    })
    return { total, peak }
  }, [dailySeries])

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-[#8b949e]">Vistas del sitio (Firestore · dailyViews)</p>
      </header>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/[0.08] bg-surface/[0.45] p-5 backdrop-blur-md">
          <p className="text-xs font-medium uppercase tracking-wider text-[#8b949e]">Vistas en rango</p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-white">{totals.total}</p>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-surface/[0.45] p-5 backdrop-blur-md">
          <p className="text-xs font-medium uppercase tracking-wider text-[#8b949e]">Pico diario</p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-white">{totals.peak.count}</p>
          <p className="mt-1 text-xs text-[#8b949e]">{totals.peak.date || '—'}</p>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-surface/[0.45] p-5 backdrop-blur-md">
          <p className="text-xs font-medium uppercase tracking-wider text-[#8b949e]">Sesión</p>
          <p className="mt-2 truncate text-sm text-white">{userEmail}</p>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-white/[0.1] bg-surface/[0.35] p-5 backdrop-blur-md lg:flex-row lg:flex-wrap lg:items-end">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="range" className="text-xs font-medium text-[#8b949e]">
            Rango de datos
          </label>
          <select
            id="range"
            value={rangeDays}
            onChange={(e) => setRangeDays(Number(e.target.value))}
            className="rounded-lg border border-surface-border bg-page px-3 py-2 text-sm text-white focus:border-accent-orange/50 focus:outline-none focus:ring-2 focus:ring-accent-orange/20"
          >
            {RANGE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="granularity" className="text-xs font-medium text-[#8b949e]">
            Agrupación
          </label>
          <select
            id="granularity"
            value={granularity}
            onChange={(e) => setGranularity(e.target.value)}
            className="rounded-lg border border-surface-border bg-page px-3 py-2 text-sm text-white focus:border-accent-orange/50 focus:outline-none focus:ring-2 focus:ring-accent-orange/20"
          >
            {GRANULARITY.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="chart-type" className="text-xs font-medium text-[#8b949e]">
            Tipo de gráfico
          </label>
          <select
            id="chart-type"
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="rounded-lg border border-surface-border bg-page px-3 py-2 text-sm text-white focus:border-accent-orange/50 focus:outline-none focus:ring-2 focus:ring-accent-orange/20"
          >
            {CHART_TYPES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={fetchSeries}
          disabled={seriesLoading}
          className="rounded-lg border border-accent-orange/40 bg-accent-orange/10 px-4 py-2 text-sm font-medium text-accent-orange transition hover:bg-accent-orange/20 disabled:opacity-50 lg:ml-auto"
        >
          {seriesLoading ? 'Actualizando…' : 'Actualizar datos'}
        </button>
      </div>

      {seriesError ? (
        <p className="mb-4 text-sm text-red-400" role="alert">
          {seriesError}
        </p>
      ) : null}

      <div className="rounded-2xl border border-white/[0.1] bg-surface/[0.35] p-5 backdrop-blur-md sm:p-7">
        <h2 className="mb-4 text-lg font-semibold">Vistas</h2>
        {seriesLoading ? (
          <div className="flex h-80 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent-orange border-t-transparent" />
          </div>
        ) : (
          <ViewsChart data={chartData} chartType={chartType} />
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
