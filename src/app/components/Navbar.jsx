"use client"

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import NavLink from './NavLink'
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid"
import MenuOverlay from './MenuOverlay'

const navLinks = [
  { title: "About", path: "#about" },
  { title: "Proyectos", path: "#proyectos" },
  { title: "Blog", path: "/blog" },
  { title: "Contacto", path: "#contacto" },
]

const SCROLL_THRESHOLD = 80

/** Cristal oscuro translúcido */
const pillGlass =
  'border border-white/[0.11] bg-[linear-gradient(180deg,rgba(255,255,255,0.07)_0%,transparent_38%),rgba(13,17,23,0.46)] shadow-[0_12px_44px_rgba(0,0,0,0.55),inset_0_1px_0_0_rgba(255,255,255,0.11)] backdrop-blur-2xl backdrop-saturate-150'

const pillSurface = `rounded-full ${pillGlass}`

const pillMobilePanel = `rounded-2xl ${pillGlass}`

/** Mismo botón hamburguesa en top y en pill (sin anillo naranja al foco) */
const menuButtonClasses =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/18 bg-white/[0.06] text-slate-200 transition duration-200 hover:border-white/28 hover:bg-white/[0.10] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-page md:hidden'

const Navbar = () => {
  const [navbarOpen, setNavbarOpen] = useState(false)
  const [scrolledDown, setScrolledDown] = useState(false)

  const updateScroll = useCallback(() => {
    const y = window.scrollY || document.documentElement.scrollTop
    setScrolledDown(y > SCROLL_THRESHOLD)
  }, [])

  useEffect(() => {
    updateScroll()
    window.addEventListener('scroll', updateScroll, { passive: true })
    return () => window.removeEventListener('scroll', updateScroll)
  }, [updateScroll])

  const isPill = scrolledDown

  const handleToggleMenu = () => {
    setNavbarOpen((open) => !open)
  }

  const brandBorder = isPill ? 'border-white/18' : 'border-transparent'
  const brandHover = isPill
    ? 'hover:border-white/30 hover:bg-white/[0.06]'
    : 'hover:border-white/15 hover:bg-white/[0.04]'

  const brandLink = (
    <Link
      href="/"
      className={`flex h-9 shrink-0 items-center gap-2 overflow-hidden rounded-full border py-0.5 pl-0.5 pr-3 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-page sm:h-10 sm:pr-4 ${brandBorder} bg-transparent ${brandHover}`}
      aria-label="Inicio — Lucas Fernández"
      onClick={() => setNavbarOpen(false)}
    >
      <Image
        src="/Lucas.jpg"
        alt=""
        width={32}
        height={32}
        className="h-7 w-7 shrink-0 rounded-full object-cover sm:h-8 sm:w-8"
        priority
      />
      <span className="text-sm font-semibold tracking-tight text-white">Lucas</span>
    </Link>
  )

  const desktopLinks = (
    <div className="hidden md:flex md:items-center md:gap-0.5" id="navbar-desktop">
      {navLinks.map((link) => (
        <NavLink key={link.path} href={link.path} title={link.title} pill={isPill} />
      ))}
    </div>
  )

  const menuButton = (
    <button
      type="button"
      onClick={handleToggleMenu}
      className={menuButtonClasses}
      aria-expanded={navbarOpen}
      aria-controls="mobile-menu-nav"
      aria-label={navbarOpen ? 'Cerrar menú' : 'Abrir menú'}
    >
      {navbarOpen ? (
        <XMarkIcon className="h-5 w-5 transition-transform duration-200" />
      ) : (
        <Bars3Icon className="h-5 w-5 transition-transform duration-200" />
      )}
    </button>
  )

  const mobileDropdown = navbarOpen ? (
    <div className="flex w-full justify-center px-3 md:hidden">
      <div
        id="mobile-menu-nav"
        className={`animate-nav-dropdown w-full max-w-3xl origin-top p-2 ${pillMobilePanel}`}
      >
        <MenuOverlay links={navLinks} onNavigate={() => setNavbarOpen(false)} />
      </div>
    </div>
  ) : null

  return (
    <div
      className={`fixed left-0 right-0 z-50 transition-[top,padding] duration-300 ease-out ${
        isPill
          ? 'top-4 flex flex-col items-center gap-2 border-b-0 bg-transparent px-3 sm:top-6 sm:px-6'
          : 'top-0 flex flex-col items-center gap-2 border-b-0 bg-transparent'
      }`}
    >
      <nav
        className={`flex flex-wrap items-center justify-between transition-[border-radius,box-shadow,background-color] duration-300 ${
          isPill
            ? `w-full max-w-3xl gap-2 px-2 py-2 sm:gap-3 sm:px-3 ${pillSurface}`
            : 'mx-auto w-full max-w-6xl gap-3 border-0 bg-transparent px-4 py-3 shadow-none sm:px-6 lg:px-8'
        }`}
        aria-label="Principal"
      >
        {brandLink}
        <div className="flex items-center gap-1">
          {desktopLinks}
          {menuButton}
        </div>
      </nav>
      {mobileDropdown}
    </div>
  )
}

export default Navbar
