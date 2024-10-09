"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import NavLink from './NavLink';
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import MenuOverlay from './MenuOverlay';


const navLinks = [
    {
        title: "About",
        path: "#about",
    },
    {
        title: "Proyectos",
        path: "#proyectos"
    },
    {
        title: "Contacto",
        path: "#contacto"
    }
];

const Navbar = () => {
    const [navbarOpen, setNavbarOpen] = useState(false);

    return (
        <nav className='fixed top-0 left-0 right-0 z-10 bg-[#121212] bg-opacity-75'>
            <div className='flex flex-wrap item-center justify-between mx-auto p-4'>
                <Link href={"/"} className='w-56 h-auto'>
                    <img src="/Lucas.svg" alt="Logo" className='rounded'/>
                </Link>
                <div className='mobile-menu block md:hidden'>
                    {
                        !navbarOpen ? (
                            <button onClick={() => setNavbarOpen(true)} className='flex items-center px-3 py-2 border rounded border-slate-200 text-slate-200 hover:text-whiter hover:border-white'>
                                <Bars3Icon className='w-5 h-5' />
                            </button>
                        ) : (
                            <button onClick={() => setNavbarOpen(false)} className='flex items-center px-3 py-2 border rounded border-slate-200 text-slate-200 hover:text-whiter hover:border-white'>
                                <XMarkIcon className='w-5 h-5' />
                            </button>
                        )
                    }
                </div>
                <div className='menu hidden md:block md:w-auto' id='navbar'>
                    <ul className='flex p-4 md:p-0 md:flex-row md:spacex-8 mt-0'>
                        {navLinks.map((link, index) => (
                            <li key={index}>
                                <NavLink href={link.path} title={link.title} />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            {navbarOpen ? <MenuOverlay links={navLinks} /> : null}
        </nav>
    )
}

export default Navbar;


