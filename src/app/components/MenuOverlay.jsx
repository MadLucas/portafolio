import React from 'react'
import NavLink from './NavLink'

const MenuOverlay = ({ links, onNavigate }) => {
  return (
    <div className="flex w-full flex-col">
      <p className="px-3 pb-2 pt-1 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
        Navegación
      </p>
      <ul className="flex w-full flex-col gap-1.5 px-1 pb-1 pt-0">
        {links.map((link, index) => (
          <li key={link.path} className="w-full">
            <NavLink
              href={link.path}
              title={link.title}
              onClick={onNavigate}
              mobileNav
              linkIndex={index}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default MenuOverlay
