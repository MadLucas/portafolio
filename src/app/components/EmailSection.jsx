'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  PaperAirplaneIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

const EmailSection = () => {
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    setErrorMessage('')

    const data = {
      email: e.target.email.value,
      subject: e.target.subject.value,
      message: e.target.message.value,
    }

    let response
    try {
      response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    } catch {
      setStatus('error')
      setErrorMessage('No hay conexión. Revisa tu red e inténtalo de nuevo.')
      return
    }

    let resData = null
    try {
      resData = await response.json()
    } catch {
      resData = null
    }

    if (response.ok) {
      e.target.reset()
      setStatus('success')
      return
    }

    const msg =
      resData?.error?.message ||
      resData?.message ||
      'No se pudo enviar el mensaje. Intenta de nuevo más tarde.'
    setErrorMessage(msg)
    setStatus('error')
  }

  const handleDismissFeedback = () => {
    setStatus('idle')
    setErrorMessage('')
  }

  const isSending = status === 'sending'
  const showSuccess = status === 'success'
  const showError = status === 'error'

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
              className="rounded font-medium text-accent-orange transition hover:text-accent-coral focus:outline-none focus:ring-2 focus:ring-accent-orange/40 focus:ring-offset-2 focus:ring-offset-page"
            >
              GitHub
            </Link>
          </div>
        </div>
        <div>
          {showSuccess ? (
            <div
              role="status"
              aria-live="polite"
              className="animate-contact-feedback-in relative flex min-h-[26rem] flex-col items-center justify-center overflow-hidden rounded-2xl border border-accent-orange/35 bg-gradient-to-br from-accent-orange/[0.18] via-page/80 to-accent-coral/10 p-6 text-center shadow-[0_0_40px_rgba(249,115,22,0.12)]"
            >
              <div
                className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent-orange/20 blur-2xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-accent-coral/15 blur-xl"
                aria-hidden
              />
              <div className="relative flex max-w-sm flex-col items-center gap-3">
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-orange/25 ring-2 ring-accent-orange/40">
                    <PaperAirplaneIcon
                      className="h-8 w-8 animate-contact-float text-accent-orange"
                      aria-hidden
                    />
                  </div>
                  <SparklesIcon
                    className="absolute -right-1 -top-1 h-5 w-5 animate-pulse text-amber-300/90"
                    aria-hidden
                  />
                  <span
                    className="absolute -bottom-0.5 -left-1 h-2 w-2 animate-ping rounded-full bg-cyan-300/80"
                    style={{ animationDuration: '1.8s' }}
                    aria-hidden
                  />
                </div>
                <div>
                  <p className="text-xl font-semibold text-white">¡Mensaje enviado!</p>
                  <p className="mt-1 text-sm text-[#c9d1d9]">
                    Tu mensaje ya voló a mi bandeja. Te responderé pronto.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDismissFeedback}
                  className="mt-2 rounded-full border border-white/15 bg-white/5 px-5 py-2 text-xs font-medium text-[#c9d1d9] transition hover:border-accent-orange/35 hover:bg-accent-orange/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange/50"
                >
                  Enviar otro mensaje
                </button>
              </div>
            </div>
          ) : (
            <form
              className="relative flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-surface/60 p-6 shadow-card backdrop-blur-sm"
              onSubmit={handleSubmit}
              aria-busy={isSending}
            >
            <div className="grid gap-4">
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
                  disabled={isSending}
                  className="block w-full rounded-lg border border-surface-border bg-page px-3 py-2.5 text-sm text-white placeholder-[#6e7681] transition focus:border-accent-orange/50 focus:outline-none focus:ring-2 focus:ring-accent-orange/25 disabled:opacity-60"
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
                  disabled={isSending}
                  className="block w-full rounded-lg border border-surface-border bg-page px-3 py-2.5 text-sm text-white placeholder-[#6e7681] transition focus:border-accent-orange/50 focus:outline-none focus:ring-2 focus:ring-accent-orange/25 disabled:opacity-60"
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
                  disabled={isSending}
                  className="block w-full resize-y rounded-lg border border-surface-border bg-page px-3 py-2.5 text-sm text-white placeholder-[#6e7681] transition focus:border-accent-orange/50 focus:outline-none focus:ring-2 focus:ring-accent-orange/25 disabled:opacity-60"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-accent-orange to-accent-coral py-3 text-sm font-semibold text-white shadow-glow transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-accent-orange/50 focus:ring-offset-2 focus:ring-offset-page disabled:pointer-events-none disabled:opacity-70"
            >
              {isSending ? (
                <>
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                    aria-hidden
                  />
                  Enviando…
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="h-4 w-4" aria-hidden />
                  Enviar mensaje
                </>
              )}
            </button>

            <div role="status" aria-live="polite" className="min-h-0">
              {showError ? (
                <div className="animate-contact-shake rounded-2xl border border-rose-500/35 bg-rose-950/35 p-4">
                  <div className="flex gap-3 text-left">
                    <ExclamationTriangleIcon
                      className="mt-0.5 h-5 w-5 shrink-0 text-rose-300"
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">Ups, algo falló</p>
                      <p className="mt-1 text-sm text-[#f0abbd]">{errorMessage}</p>
                      <button
                        type="button"
                        onClick={handleDismissFeedback}
                        className="mt-3 rounded text-xs font-medium text-accent-orange underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange/50"
                      >
                        Entendido
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

export default EmailSection
