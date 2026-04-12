'use client'

import React, { useEffect, useState } from 'react'
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'
import { getFirebaseFirestore, getFirebaseApp, initFirebaseAppFromPublicConfig } from '../../lib/firebase/client'
import { COL } from '../../lib/firebase/collections'
import ProjectsCard from './ProjectsCard'

const ensureFirebase = async () => {
  if (getFirebaseApp()) return true
  try {
    const res = await fetch('/api/config/firebase-public', { cache: 'no-store' })
    const data = await res.json()
    if (!res.ok) return false
    initFirebaseAppFromPublicConfig(data.config)
    return true
  } catch {
    return false
  }
}

const mapProjectDoc = (id, x) => {
  const images = Array.isArray(x.images) && x.images.length > 0
    ? x.images.filter((u) => typeof u === 'string' && u.trim())
    : x.image && typeof x.image === 'string' && x.image.trim()
      ? [x.image.trim()]
      : []

  const skills = Array.isArray(x.skills)
    ? x.skills.map((s) => String(s).trim()).filter(Boolean)
    : []

  const pdfs = Array.isArray(x.pdfs)
    ? x.pdfs.filter((p) => p && typeof p.url === 'string' && p.url.trim())
    : []

  return {
    id,
    title: x.title,
    description: x.description,
    images,
    skills,
    executedAt: x.executedAt ?? null,
    pdfs,
  }
}

const ProjectsSection = () => {
  /** null = cargando, array = ya cargado (puede estar vacío) */
  const [projects, setProjects] = useState(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const ok = await ensureFirebase()
      if (!ok) {
        if (alive) setProjects([])
        return
      }
      const db = getFirebaseFirestore()
      if (!db) {
        if (alive) setProjects([])
        return
      }
      try {
        const q = query(
          collection(db, COL.portfolioProjects),
          where('active', '==', true),
          orderBy('sortOrder', 'asc')
        )
        const snap = await getDocs(q)
        const list = snap.docs.map((d) => mapProjectDoc(d.id, d.data()))
        if (alive) setProjects(list)
      } catch (e) {
        console.warn('Firestore proyectos:', e)
        if (alive) setProjects([])
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  return (
    <section className="relative border-t border-white/[0.06] py-16 sm:py-20" id="proyectos">
      <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Mis proyectos
      </h2>

      {projects === null ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent-orange border-t-transparent" />
        </div>
      ) : null}

      {projects && projects.length > 0 ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {projects.map((project) => (
            <ProjectsCard
              key={project.id}
              title={project.title}
              description={project.description}
              images={project.images}
              skills={project.skills}
              executedAt={project.executedAt}
              pdfs={project.pdfs}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}

export default ProjectsSection
