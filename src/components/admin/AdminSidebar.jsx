'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChartBarIcon,
  FolderIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  CpuChipIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  PowerIcon,
} from '@heroicons/react/24/outline'
import { liquidGlassSidebar } from '../../lib/admin/glass'

const COLLAPSED_W = '3.5rem'
const EXPANDED_W = '14.5rem'

const items = [
  { href: '/admin', label: 'Dashboard', Icon: ChartBarIcon },
  { href: '/admin/proyectos', label: 'Proyectos', Icon: FolderIcon },
  { href: '/admin/soluciones', label: 'Soluciones', Icon: CpuChipIcon },
  { href: '/admin/blog', label: 'Blog', Icon: DocumentTextIcon },
  { href: '/admin/encuestas', label: 'Encuestas', Icon: ClipboardDocumentListIcon },
]

const AdminSidebar = ({ open, onToggle, onSignOut, userEmail }) => {
  const pathname = usePathname()

  const handleSignOut = () => {
    if (typeof onSignOut !== 'function') return
    onSignOut()
  }

  return (
    <aside
      className="fixed left-3 top-4 z-40 flex h-[calc(100vh-2rem)] max-h-[calc(100dvh-2rem)] w-[var(--admin-sb-w)] flex-col transition-[width] duration-500 ease-out"
      style={{ '--admin-sb-w': open ? EXPANDED_W : COLLAPSED_W }}
      aria-label="Navegación del panel"
    >
      <div
        className={`flex h-full min-h-0 w-full min-w-0 flex-col gap-1 overflow-hidden py-3 px-1.5 sm:px-2 ${liquidGlassSidebar}`}
      >
        <button
          type="button"
          onClick={onToggle}
          className="mx-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.04] text-white/85 transition hover:border-white/15 hover:bg-white/[0.08] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange/35 sm:h-9 sm:w-9"
          aria-expanded={open}
          aria-label={open ? 'Contraer menú' : 'Expandir menú'}
        >
          {open ? <ChevronLeftIcon className="h-4 w-4" strokeWidth={2} /> : <ChevronRightIcon className="h-4 w-4" strokeWidth={2} />}
        </button>

        <nav className="mt-1 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden overscroll-contain py-1">
          {items.map(({ href, label, Icon }) => {
            const active = pathname === href || (href !== '/admin' && pathname?.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={`flex min-h-[2.75rem] items-center rounded-xl py-2 text-sm font-medium transition ${
                  open ? 'justify-start gap-3 px-2' : 'justify-center gap-0 px-0'
                } ${
                  active
                    ? 'bg-white/12 text-white'
                    : 'text-white/75 hover:bg-white/[0.07] hover:text-white'
                }`}
                title={label}
              >
                <Icon className="h-5 w-5 shrink-0 text-accent-orange opacity-90" aria-hidden />
                {open ? (
                  <span className="min-w-0 flex-1 overflow-hidden text-left whitespace-nowrap transition-opacity duration-300 ease-out">
                    {label}
                  </span>
                ) : (
                  <span className="sr-only">{label}</span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto shrink-0 border-t border-white/[0.08] pt-2">
          {open && userEmail ? (
            <p className="mb-2 truncate px-1.5 text-[10px] leading-tight text-[#8b949e]" title={userEmail}>
              {userEmail}
            </p>
          ) : null}
          <button
            type="button"
            onClick={handleSignOut}
            className={`flex min-h-[2.75rem] w-full items-center rounded-xl border border-transparent py-2 text-sm font-medium text-white/70 transition hover:border-red-500/25 hover:bg-red-500/10 hover:text-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40 ${
              open ? 'justify-start gap-3 px-2' : 'justify-center gap-0 px-0'
            }`}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <PowerIcon className="h-5 w-5 shrink-0 text-red-300/90" aria-hidden />
            {open ? (
              <span className="min-w-0 flex-1 overflow-hidden whitespace-nowrap">Salir</span>
            ) : (
              <span className="sr-only">Cerrar sesión</span>
            )}
          </button>
        </div>
      </div>
    </aside>
  )
}

export default AdminSidebar

export const adminSidebarWidths = { collapsed: COLLAPSED_W, expanded: EXPANDED_W }
