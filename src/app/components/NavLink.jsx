import React from 'react'
import Link from 'next/link'

const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]'

const NavLink = ({ href, title, onClick, pill, mobileNav, linkIndex = 0 }) => {
  if (mobileNav) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`group animate-nav-link-in relative block w-full overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-3.5 text-center text-[15px] font-medium text-white transition duration-200 hover:border-white/12 hover:bg-white/10 active:scale-[0.98] ${focusRing}`}
        style={{ animationDelay: `${45 + linkIndex * 55}ms` }}
      >
        <span className="relative z-10">{title}</span>
        <span
          className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent-orange/35 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          aria-hidden
        />
      </Link>
    )
  }

  const layout = pill
    ? 'rounded-lg py-2 pl-3 pr-4 md:rounded-full md:py-1.5 md:px-3'
    : 'rounded-lg py-2 pl-3 pr-4'

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block text-sm font-medium text-white/90 transition hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-accent-orange/50 md:inline-block ${layout} focus:outline-none`}
    >
      {title}
    </Link>
  )
}

export default NavLink
