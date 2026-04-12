'use client'

import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import { DocumentTextIcon } from '@heroicons/react/24/outline'

const resolveImgUrl = (imgUrl) => {
  if (!imgUrl || typeof imgUrl !== 'string') return ''
  const t = imgUrl.trim()
  if (t.startsWith('http://') || t.startsWith('https://')) return t
  if (t.startsWith('/')) return t
  return `/${t}`
}

const formatExecutedAt = (raw) => {
  if (raw == null || raw === '') return null
  try {
    if (typeof raw === 'object' && raw !== null && typeof raw.toDate === 'function') {
      const d = raw.toDate()
      if (!Number.isNaN(d.getTime())) {
        return d.toLocaleDateString('es', { year: 'numeric', month: 'long', day: 'numeric' })
      }
    }
    const s = typeof raw === 'string' ? raw : String(raw)
    const d = s.match(/^\d{4}-\d{2}-\d{2}$/) ? new Date(`${s}T12:00:00`) : new Date(raw)
    if (Number.isNaN(d.getTime())) return null
    return d.toLocaleDateString('es', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return null
  }
}

const ProjectsCard = ({ title, description, images = [], legacyImage, skills = [], executedAt, pdfs = [] }) => {
  const gallery = useMemo(() => {
    const list = Array.isArray(images) && images.length > 0 ? images : legacyImage ? [legacyImage] : []
    return list.map((u) => resolveImgUrl(u)).filter(Boolean)
  }, [images, legacyImage])

  const [heroIndex, setHeroIndex] = useState(0)
  const heroUrl = gallery[heroIndex] ?? ''
  const dateLabel = formatExecutedAt(executedAt)
  const safeSkills = Array.isArray(skills) ? skills.filter(Boolean) : []
  const safePdfs = Array.isArray(pdfs) ? pdfs.filter((p) => p?.url) : []

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-surface-elevated/40 shadow-card ring-1 ring-white/[0.04] transition hover:border-white/[0.1] hover:shadow-glow">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-accent-orange/15 via-page to-surface md:aspect-[16/9]">
        {heroUrl ? (
          <Image
            src={heroUrl}
            alt=""
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full min-h-[10rem] w-full items-center justify-center bg-gradient-to-br from-white/[0.06] to-page">
            <span className="text-sm text-[#8b949e]">Sin imagen</span>
          </div>
        )}
        {gallery.length > 1 ? (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 px-2">
            {gallery.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setHeroIndex(i)}
                className={`h-1.5 rounded-full transition ${
                  i === heroIndex ? 'w-6 bg-accent-orange' : 'w-1.5 bg-white/35 hover:bg-white/55'
                }`}
                aria-label={`Imagen ${i + 1} de ${title}`}
              />
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col border-t border-white/[0.06] bg-surface/80 px-5 py-5">
        <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-lg font-semibold leading-snug text-white">{title}</h3>
          {dateLabel ? (
            <time className="shrink-0 text-xs tabular-nums text-[#8b949e]" dateTime={typeof executedAt === 'string' ? executedAt : undefined}>
              {dateLabel}
            </time>
          ) : null}
        </div>

        <p className="text-sm leading-relaxed text-[#8b949e]">{description}</p>

        {safeSkills.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Habilidades">
            {safeSkills.map((skill) => (
              <li
                key={skill}
                className="rounded-full border border-accent-orange/30 bg-accent-orange/10 px-2.5 py-0.5 text-xs font-medium text-accent-orange"
              >
                {skill}
              </li>
            ))}
          </ul>
        ) : null}

        {safePdfs.length > 0 ? (
          <ul className="mt-4 space-y-2 border-t border-white/[0.06] pt-4">
            {safePdfs.map((p, idx) => (
              <li key={`${p.url}-${idx}`}>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-accent-orange/90 transition hover:text-accent-orange"
                >
                  <DocumentTextIcon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                  <span className="truncate underline-offset-2 hover:underline">
                    {p.fileName || 'Documento PDF'}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  )
}

export default ProjectsCard
