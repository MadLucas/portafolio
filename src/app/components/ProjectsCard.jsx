'use client'

import React from 'react'
import { CodeBracketIcon, EyeIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

const resolveBgUrl = (imgUrl) => {
  if (!imgUrl || typeof imgUrl !== 'string') return ''
  const t = imgUrl.trim()
  if (t.startsWith('http://') || t.startsWith('https://')) return t
  if (t.startsWith('/')) return t
  return `/${t}`
}

const ProjectsCard = ({ imgUrl, title, description, gitUrl, previewUrl }) => {
  const bgUrl = resolveBgUrl(imgUrl)
  const hasRepoLink = Boolean(gitUrl?.trim())
  const hasPreviewLink = Boolean(previewUrl?.trim())

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/[0.06] bg-surface-elevated/40 shadow-card ring-1 ring-white/[0.04] transition hover:border-white/[0.1] hover:shadow-glow">
      <div
        className="relative h-52 bg-surface md:h-60"
        style={{
          backgroundImage: `url(${bgUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center gap-4 bg-page/0 opacity-0 transition duration-300 group-hover:bg-page/75 group-hover:opacity-100">
          {hasRepoLink ? (
            <Link
              href={gitUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#ADB7BE] transition hover:border-white focus:outline-none focus:ring-2 focus:ring-accent-orange/50"
              aria-label={`Código fuente de ${title}`}
            >
              <CodeBracketIcon className="h-9 w-9 text-[#ADB7BE] hover:text-white" />
            </Link>
          ) : null}
          {hasPreviewLink ? (
            <Link
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#ADB7BE] transition hover:border-white focus:outline-none focus:ring-2 focus:ring-accent-orange/50"
              aria-label={`Ver demo de ${title}`}
            >
              <EyeIcon className="h-9 w-9 text-[#ADB7BE] hover:text-white" />
            </Link>
          ) : null}
        </div>
      </div>
      <div className="border-t border-white/[0.06] bg-surface/80 px-5 py-6">
        <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm leading-relaxed text-[#8b949e]">{description}</p>
      </div>
    </article>
  )
}

export default ProjectsCard
