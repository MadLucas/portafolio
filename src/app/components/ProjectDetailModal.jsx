'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { createPortal } from 'react-dom'
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  DocumentTextIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

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

const viewportClasses =
  'h-[min(48vh,460px)] w-full sm:h-[min(52vh,520px)] lg:h-[min(68vh,720px)]'

/**
 * @param {{ project: object | null, onClose: () => void }} props
 */
const ProjectDetailModal = ({ project, onClose }) => {
  const scrollRef = useRef(null)
  const [index, setIndex] = useState(0)
  const [mounted, setMounted] = useState(false)
  /** En lg+ el carrusel es vertical; en móvil/tablet, horizontal */
  const [galleryVertical, setGalleryVertical] = useState(false)

  const gallery = React.useMemo(() => {
    if (!project) return []
    const list = Array.isArray(project.images) && project.images.length > 0 ? project.images : []
    return list.map((u) => resolveImgUrl(u)).filter(Boolean)
  }, [project])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const apply = () => setGalleryVertical(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    if (!project) return
    setIndex(0)
    const el = scrollRef.current
    if (el) el.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [project])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    setIndex(0)
  }, [galleryVertical])

  useEffect(() => {
    if (!project) return undefined
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = prev
    }
  }, [project, onClose])

  const scrollToIndex = useCallback(
    (next) => {
      const el = scrollRef.current
      if (!el) return
      const clamped = Math.max(0, Math.min(next, gallery.length - 1))
      if (galleryVertical) {
        const h = el.clientHeight
        if (h <= 0) return
        el.scrollTo({ top: clamped * h, left: 0, behavior: 'smooth' })
      } else {
        const w = el.clientWidth
        if (w <= 0) return
        el.scrollTo({ left: clamped * w, top: 0, behavior: 'smooth' })
      }
      setIndex(clamped)
    },
    [gallery.length, galleryVertical]
  )

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el || gallery.length === 0) return
    if (galleryVertical) {
      const h = el.clientHeight
      if (h <= 0) return
      const i = Math.round(el.scrollTop / h)
      setIndex(Math.min(Math.max(0, i), gallery.length - 1))
    } else {
      const w = el.clientWidth
      if (w <= 0) return
      const i = Math.round(el.scrollLeft / w)
      setIndex(Math.min(Math.max(0, i), gallery.length - 1))
    }
  }, [gallery.length, galleryVertical])

  const handlePrev = useCallback(() => {
    scrollToIndex(index - 1)
  }, [index, scrollToIndex])

  const handleNext = useCallback(() => {
    scrollToIndex(index + 1)
  }, [index, scrollToIndex])

  if (!mounted || !project) return null

  const dateLabel = formatExecutedAt(project.executedAt)
  const skills = Array.isArray(project.skills) ? project.skills.filter(Boolean) : []
  const pdfs = Array.isArray(project.pdfs) ? project.pdfs.filter((p) => p?.url) : []

  const modal = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 lg:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="relative z-[101] flex max-h-[96vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-surface-elevated/95 shadow-[0_24px_80px_rgba(0,0,0,0.65)] ring-1 ring-white/[0.06] lg:max-h-[92vh] lg:flex-row"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-page/80 text-[#8b949e] transition hover:border-white/25 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange/50 lg:right-4 lg:top-4"
          aria-label="Cerrar"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        <div className="relative flex w-full flex-col border-b border-white/[0.06] bg-page/50 lg:w-[56%] lg:min-h-0 lg:border-b-0 lg:border-r">
          {gallery.length > 0 ? (
            <>
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className={`relative shrink-0 scroll-smooth ${viewportClasses} ${
                  galleryVertical
                    ? 'flex flex-col overflow-x-hidden overflow-y-auto overscroll-y-contain snap-y snap-mandatory'
                    : 'flex flex-row overflow-x-auto overflow-y-hidden overscroll-x-contain snap-x snap-mandatory'
                }`}
              >
                {gallery.map((url, i) => (
                  <div
                    key={`${url}-${i}`}
                    className={`relative shrink-0 snap-start ${viewportClasses} ${
                      galleryVertical ? 'w-full' : 'h-full min-w-full w-full'
                    }`}
                  >
                    <Image
                      src={url}
                      alt=""
                      fill
                      className="object-contain bg-black/25"
                      sizes="(max-width: 1024px) 100vw, 58vw"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
              {gallery.length > 1 ? (
                <>
                  <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 flex-row gap-2 lg:hidden">
                    <button
                      type="button"
                      onClick={handlePrev}
                      disabled={index <= 0}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-page/90 text-white shadow-lg transition hover:border-accent-orange/40 hover:bg-accent-orange/15 disabled:cursor-not-allowed disabled:opacity-35"
                      aria-label="Imagen anterior"
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={index >= gallery.length - 1}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-page/90 text-white shadow-lg transition hover:border-accent-orange/40 hover:bg-accent-orange/15 disabled:cursor-not-allowed disabled:opacity-35"
                      aria-label="Imagen siguiente"
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 flex-col gap-1 lg:flex">
                    <button
                      type="button"
                      onClick={handlePrev}
                      disabled={index <= 0}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-page/90 text-white shadow-lg transition hover:border-accent-orange/40 hover:bg-accent-orange/15 disabled:cursor-not-allowed disabled:opacity-35"
                      aria-label="Imagen anterior"
                    >
                      <ChevronUpIcon className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={index >= gallery.length - 1}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-page/90 text-white shadow-lg transition hover:border-accent-orange/40 hover:bg-accent-orange/15 disabled:cursor-not-allowed disabled:opacity-35"
                      aria-label="Imagen siguiente"
                    >
                      <ChevronDownIcon className="h-5 w-5" />
                    </button>
                  </div>
                </>
              ) : null}
              {gallery.length > 1 ? (
                <div className="absolute bottom-14 left-1/2 z-10 flex -translate-x-1/2 flex-row gap-1.5 lg:bottom-auto lg:left-4 lg:top-1/2 lg:flex-col lg:-translate-y-1/2 lg:translate-x-0">
                  {gallery.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => scrollToIndex(i)}
                      className={`rounded-full transition lg:h-2 lg:w-2 ${
                        galleryVertical ? 'h-2 w-2' : 'h-1.5 w-6 lg:h-2 lg:w-2'
                      } ${i === index ? 'bg-accent-orange' : 'bg-white/30 hover:bg-white/50'}`}
                      aria-label={`Ir a imagen ${i + 1}`}
                      aria-selected={i === index}
                    />
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <div
              className={`flex items-center justify-center bg-gradient-to-br from-accent-orange/10 via-page to-surface ${viewportClasses}`}
            >
              <span className="text-sm text-[#8b949e]">Sin imágenes</span>
            </div>
          )}
        </div>

        <div className="flex max-h-[min(52vh,480px)] flex-1 flex-col overflow-y-auto px-5 pb-6 pt-12 sm:px-7 lg:max-h-none lg:min-h-[min(68vh,720px)] lg:px-10 lg:pb-10 lg:pt-12">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
            <h2 id="project-modal-title" className="pr-8 text-xl font-semibold text-white sm:text-2xl lg:text-3xl">
              {project.title}
            </h2>
            {dateLabel ? (
              <time className="shrink-0 text-xs tabular-nums text-[#8b949e]">{dateLabel}</time>
            ) : null}
          </div>
          <p className="text-sm leading-relaxed text-[#8b949e] sm:text-[15px]">{project.description}</p>
          {skills.length > 0 ? (
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Habilidades">
              {skills.map((skill) => (
                <li
                  key={skill}
                  className="rounded-full border border-accent-orange/30 bg-accent-orange/10 px-2.5 py-0.5 text-xs font-medium text-accent-orange"
                >
                  {skill}
                </li>
              ))}
            </ul>
          ) : null}
          {pdfs.length > 0 ? (
            <ul className="mt-6 space-y-2 border-t border-white/[0.06] pt-5">
              {pdfs.map((p, idx) => (
                <li key={`${p.url}-${idx}`}>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-accent-orange/90 transition hover:text-accent-orange"
                  >
                    <DocumentTextIcon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                    <span className="underline-offset-2 hover:underline">{p.fileName || 'Documento PDF'}</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

export default ProjectDetailModal
