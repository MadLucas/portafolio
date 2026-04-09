'use client'

import React from 'react'
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  BarChart,
  Line,
  LineChart,
  Legend,
} from 'recharts'

const tipStyle = {
  backgroundColor: 'rgba(22,27,34,0.95)',
  border: '1px solid rgba(48,54,61,0.9)',
  borderRadius: '12px',
  color: '#f0f6fc',
}

const ViewsChart = ({ data, chartType }) => {
  if (!data?.length) {
    return (
      <div className="flex h-80 items-center justify-center rounded-xl border border-white/[0.08] bg-surface/[0.35] text-sm text-[#8b949e]">
        Sin datos en este rango. Visita el sitio público para generar vistas.
      </div>
    )
  }

  const common = (
    <>
      <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" vertical={false} />
      <XAxis
        dataKey="label"
        tick={{ fill: '#8b949e', fontSize: 11 }}
        tickLine={false}
        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
        interval="preserveStartEnd"
      />
      <YAxis
        tick={{ fill: '#8b949e', fontSize: 11 }}
        tickLine={false}
        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
        allowDecimals={false}
      />
      <Tooltip
        contentStyle={tipStyle}
        labelStyle={{ color: '#c9d1d9' }}
        formatter={(v) => [`${v} vistas`, 'Total']}
      />
      <Legend wrapperStyle={{ color: '#8b949e', fontSize: 12 }} />
    </>
  )

  if (chartType === 'bar') {
    return (
      <div className="h-80 w-full min-h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            {common}
            <Bar
              dataKey="count"
              name="Vistas"
              fill="url(#barGradAdmin)"
              radius={[8, 8, 0, 0]}
              maxBarSize={48}
            />
            <defs>
              <linearGradient id="barGradAdmin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#ea580c" stopOpacity={0.75} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div className="h-80 w-full min-h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          {common}
          <Line
            type="monotone"
            dataKey="count"
            name="Vistas"
            stroke="#f97316"
            strokeWidth={2.5}
            dot={{ fill: '#f97316', strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, fill: '#fb923c' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ViewsChart
