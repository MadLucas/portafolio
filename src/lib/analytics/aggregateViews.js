const pad = (n) => String(n).padStart(2, '0')

export const dateIdFromDate = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const daysBackIds = (numDays) => {
  const out = []
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  for (let i = numDays - 1; i >= 0; i--) {
    const x = new Date(d)
    x.setDate(x.getDate() - i)
    out.push(dateIdFromDate(x))
  }
  return out
}

/** @param {{ date: string, count: number }[]} entries sorted by date */
export const mapToMap = (entries) => {
  const m = new Map()
  entries.forEach((e) => m.set(e.date, e.count))
  return m
}

export const fillDailySeries = (dayIds, countMap) =>
  dayIds.map((date) => ({
    label: date.slice(5),
    date,
    count: countMap.get(date) ?? 0,
  }))

/** ISO week string YYYY-Www */
const weekKey = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  const dayNum = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((date - yearStart) / 86400000 + 1) / 7)
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

export const aggregateByWeek = (dailySeries) => {
  const buckets = new Map()
  dailySeries.forEach(({ date, count }) => {
    const k = weekKey(date)
    buckets.set(k, (buckets.get(k) ?? 0) + count)
  })
  return [...buckets.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([label, count]) => ({ label, count }))
}

export const aggregateByMonth = (dailySeries) => {
  const buckets = new Map()
  dailySeries.forEach(({ date, count }) => {
    const k = date.slice(0, 7)
    buckets.set(k, (buckets.get(k) ?? 0) + count)
  })
  return [...buckets.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([label, count]) => ({ label, count }))
}

export const aggregateByYear = (dailySeries) => {
  const buckets = new Map()
  dailySeries.forEach(({ date, count }) => {
    const k = date.slice(0, 4)
    buckets.set(k, (buckets.get(k) ?? 0) + count)
  })
  return [...buckets.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([label, count]) => ({ label, count }))
}

export const granularityFromMode = (mode, dailySeries) => {
  if (mode === 'day') {
    return dailySeries.map(({ label, count, date }) => ({
      label,
      count,
      key: date,
    }))
  }
  if (mode === 'week') {
    return aggregateByWeek(dailySeries).map((r) => ({
      label: r.label,
      count: r.count,
      key: r.label,
    }))
  }
  if (mode === 'month') {
    return aggregateByMonth(dailySeries).map((r) => ({
      label: r.label,
      count: r.count,
      key: r.label,
    }))
  }
  return aggregateByYear(dailySeries).map((r) => ({
    label: r.label,
    count: r.count,
    key: r.label,
  }))
}
