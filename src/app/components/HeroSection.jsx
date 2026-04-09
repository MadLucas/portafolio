'use client'

import React from 'react'
import Image from 'next/image'
import { TypeAnimation } from 'react-type-animation'

const HeroSection = () => {
  return (
    <section className="relative pb-16 pt-4 md:pb-24">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="place-self-center text-center sm:text-left lg:col-span-7">
          <h1 className="mb-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl lg:leading-[1.1]">
            <span className="bg-gradient-to-r from-accent-orange via-accent-coral to-accent-rose bg-clip-text text-transparent">
              Hola, soy{' '}
            </span>
            <br className="sm:hidden" />
            <span className="text-white">
              <TypeAnimation
                sequence={['Lucas!', 1200, 'Fullstack web developer', 1200]}
                wrapper="span"
                speed={40}
                repeat={Infinity}
              />
            </span>
          </h1>
          <p className="mb-8 max-w-xl text-pretty text-base leading-relaxed text-white/85 sm:text-lg">
            Bienvenidos a mi sitio web. Soy{' '}
            <span className="bg-gradient-to-r from-accent-orange to-accent-coral bg-clip-text font-medium text-transparent">
              Lucas
            </span>
            , desarrollador web fullstack. Aquí encontrarás proyectos recientes y
            un poco de mi trayectoria. Me enfoco en experiencias digitales claras,
            accesibles y con impacto real.
          </p>
          <button
            type="button"
            className="rounded-full bg-gradient-to-br from-accent-orange via-accent-coral to-accent-rose px-7 py-3 text-sm font-semibold text-white shadow-glow transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-accent-orange/50 focus:ring-offset-2 focus:ring-offset-page sm:w-fit"
          >
            Open to work!
          </button>
        </div>
        <div className="flex justify-center lg:col-span-5 lg:justify-end">
          <div className="relative">
            <div
              className="absolute -inset-3 rounded-full bg-gradient-to-br from-accent-orange/25 via-transparent to-accent-rose/20 blur-2xl"
              aria-hidden
            />
            <div className="relative flex aspect-square w-[200px] items-center justify-center rounded-full bg-surface p-1 shadow-card ring-1 ring-white/10 sm:w-[220px] lg:w-[240px]">
              <div className="relative h-full w-full overflow-hidden rounded-full bg-[#0d1117]">
                <Image
                  className="object-cover object-center"
                  src="/Lucas.jpg"
                  alt="Lucas Fernández"
                  width={480}
                  height={480}
                  sizes="(max-width: 1024px) 220px, 240px"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
