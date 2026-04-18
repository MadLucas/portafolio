'use client'

import React, { useState, useTransition } from 'react'
import Image from 'next/image'
import TabButton from './TabButton'

const TAB_DATA = [
  {
    title: "skills",
    id: "skills",
    content: (
      <ul className="grid list-none gap-2 text-[#c9d1d9] sm:grid-cols-2">
        <li className="rounded-lg border border-white/[0.06] bg-surface-elevated/50 px-3 py-2">Node.js</li>
        <li className="rounded-lg border border-white/[0.06] bg-surface-elevated/50 px-3 py-2">Express</li>
        <li className="rounded-lg border border-white/[0.06] bg-surface-elevated/50 px-3 py-2">JavaScript</li>
        <li className="rounded-lg border border-white/[0.06] bg-surface-elevated/50 px-3 py-2">MongoDB</li>
        <li className="rounded-lg border border-white/[0.06] bg-surface-elevated/50 px-3 py-2">HTML5</li>
        <li className="rounded-lg border border-white/[0.06] bg-surface-elevated/50 px-3 py-2">CSS</li>
        <li className="rounded-lg border border-white/[0.06] bg-surface-elevated/50 px-3 py-2">Bootstrap</li>
        <li className="rounded-lg border border-white/[0.06] bg-surface-elevated/50 px-3 py-2">Tailwind</li>
        <li className="rounded-lg border border-white/[0.06] bg-surface-elevated/50 px-3 py-2">React</li>
        <li className="rounded-lg border border-white/[0.06] bg-surface-elevated/50 px-3 py-2">Next.js</li>
      </ul>
    ),
  },
  {
    title: "educacion",
    id: "educacion",
    content: (
      <ul className="text-[#c9d1d9]">
        <li className="rounded-lg border border-white/[0.06] bg-surface-elevated/50 px-4 py-3">
          Universidad del Desarrollo
        </li>
      </ul>
    ),
  },
]

const AboutSection = () => {
  const [tab, setTab] = useState("skills")
  const [, startTransition] = useTransition()

  const handleTabChange = (id) => {
    startTransition(() => {
      setTab(id)
    })
  }

  const activeContent = TAB_DATA.find((t) => t.id === tab)?.content

  return (
    <section className="relative border-t border-white/[0.06] text-white" id="about">
      <div className="py-16 sm:py-20">
        <div className="grid gap-12 md:grid-cols-2 md:items-center md:gap-16">
          <div className="order-2 md:order-1">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Acerca de mí
            </h2>
            <p className="text-base leading-relaxed text-[#c9d1d9] md:text-lg">
              Soy un desarrollador fullstack apasionado por crear aplicaciones interactivas y
              responsivas. Mi experiencia abarca JavaScript, React, MongoDB, HTML, CSS, Next.js,
              Node.js, Express y Git.<br /> <br />
              He trabajado en proyectos propios y con clientes, siempre con foco en código limpio y resultados concretos.
            </p>
            <div className="mt-8">
              <div className="flex flex-row gap-2 border-b border-surface-border pb-px">
                <TabButton
                  selectTab={() => handleTabChange("skills")}
                  active={tab === "skills"}
                >
                  Skills
                </TabButton>
                <TabButton
                  selectTab={() => handleTabChange("educacion")}
                  active={tab === "educacion"}
                >
                  Educación
                </TabButton>
              </div>
              <div className="mt-6">{activeContent}</div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1117] p-4 shadow-card ring-1 ring-white/[0.04]">
              <Image
                className="h-auto w-full rounded-lg object-cover"
                src="/static/images/PortafolioStck.jpg"
                alt="Stack tecnológico y herramientas"
                width={560}
                height={560}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection
