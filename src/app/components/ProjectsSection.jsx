'use client'

import React, { useEffect, useState } from 'react'
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'
import { getFirebaseFirestore, getFirebaseApp, initFirebaseAppFromPublicConfig } from '../../lib/firebase/client'
import { COL } from '../../lib/firebase/collections'
import ProjectsCard from './ProjectsCard'
import ProjectDetailModal from './ProjectDetailModal'

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

const PREVIEW_PROJECT_COUNT = 3

const ProjectsSection = () => {
  /** null = cargando, array = ya cargado (puede estar vacío) */
  const [projects, setProjects] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)
  const [showAllProjects, setShowAllProjects] = useState(false)

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

  const visibleProjects =
    projects && projects.length > PREVIEW_PROJECT_COUNT && !showAllProjects
      ? projects.slice(0, PREVIEW_PROJECT_COUNT)
      : projects ?? []

  const hasMoreProjects = projects && projects.length > PREVIEW_PROJECT_COUNT

  const handleToggleShowAll = () => {
    setShowAllProjects((prev) => !prev)
  }

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
        <>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
            {visibleProjects.map((project) => (
              <ProjectsCard
                key={project.id}
                title={project.title}
                description={project.description}
                images={project.images}
                skills={project.skills}
                executedAt={project.executedAt}
                pdfs={project.pdfs}
                onOpen={() => setSelectedProject(project)}
              />
            ))}
          </div>
          {hasMoreProjects ? (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={handleToggleShowAll}
                className="rounded-full border border-white/18 bg-white/[0.06] px-6 py-2.5 text-sm font-semibold text-white transition hover:border-accent-orange/40 hover:bg-accent-orange/10 hover:text-accent-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange/50 focus-visible:ring-offset-2 focus-visible:ring-offset-page"
                aria-expanded={showAllProjects}
              >
                {showAllProjects ? 'Ver menos' : 'Ver más'}
              </button>
            </div>
          ) : null}
        </>
      ) : null}

      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  )
}

export default ProjectsSection
