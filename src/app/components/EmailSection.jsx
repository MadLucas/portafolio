'use client'

import React from 'react'
import Link from 'next/link'

const EmailSection = () => {
  const handleSubmit = async (e) => {
    e.preventDefault()

    const data = {
      email: e.target.email.value,
      subject: e.target.subject.value,
      message: e.target.message.value,
    }
    const endpoint = '/api/send'

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    let resData = null
    try {
      resData = await response.json()
    } catch {
      resData = null
    }

    if (response.ok) {
      alert('Mensaje enviado con éxito')
      e.target.reset()
      return
    }

    const msg =
      resData?.error?.message ||
      resData?.message ||
      'No se pudo enviar el mensaje. Intenta de nuevo más tarde.'
    alert(msg)
  }

  return (
    <section
      className="relative border-t border-white/[0.06] py-16 sm:py-24"
      id="contacto"
    >
      <div className="grid gap-12 md:grid-cols-2 md:gap-16">
        <div>
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Hablemos
          </h2>
          <p className="mb-6 max-w-md text-[#8b949e]">
            Estoy abierto a nuevas oportunidades. Si tienes una pregunta o quieres saludar,
            responderé lo antes posible.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="https://github.com/MadLucas"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-accent-orange transition hover:text-accent-coral focus:outline-none focus:ring-2 focus:ring-accent-orange/40 focus:ring-offset-2 focus:ring-offset-page rounded"
            >
              GitHub
            </Link>
          </div>
        </div>
        <div>
          <form className="flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-surface/60 p-6 shadow-card backdrop-blur-sm" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#c9d1d9]">
                Tu email
              </label>
              <input
                name="email"
                type="email"
                id="email"
                required
                autoComplete="email"
                placeholder="tu@email.com"
                className="block w-full rounded-lg border border-surface-border bg-page px-3 py-2.5 text-sm text-white placeholder-[#6e7681] transition focus:border-accent-orange/50 focus:outline-none focus:ring-2 focus:ring-accent-orange/25"
              />
            </div>
            <div>
              <label htmlFor="subject" className="mb-2 block text-sm font-medium text-[#c9d1d9]">
                Asunto
              </label>
              <input
                name="subject"
                type="text"
                id="subject"
                required
                placeholder="Solo pasaba a saludar"
                className="block w-full rounded-lg border border-surface-border bg-page px-3 py-2.5 text-sm text-white placeholder-[#6e7681] transition focus:border-accent-orange/50 focus:outline-none focus:ring-2 focus:ring-accent-orange/25"
              />
            </div>
            <div>
              <label htmlFor="message" className="mb-2 block text-sm font-medium text-[#c9d1d9]">
                Mensaje
              </label>
              <textarea
                name="message"
                id="message"
                required
                rows={5}
                placeholder="Hablemos…"
                className="block w-full resize-y rounded-lg border border-surface-border bg-page px-3 py-2.5 text-sm text-white placeholder-[#6e7681] transition focus:border-accent-orange/50 focus:outline-none focus:ring-2 focus:ring-accent-orange/25"
              />
            </div>
            <button
              type="submit"
              className="mt-1 w-full rounded-lg bg-gradient-to-r from-accent-orange to-accent-coral py-3 text-sm font-semibold text-white shadow-glow transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-accent-orange/50 focus:ring-offset-2 focus:ring-offset-page"
            >
              Enviar mensaje
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default EmailSection
