'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { CalendarDaysIcon, XMarkIcon } from '@heroicons/react/24/outline'

const MEETING_SOURCE = 'Soluciones · Agenda'

/**
 * @param {{ solution: { id: string, title: string } | null, onClose: () => void }} props
 */
const SolucionMeetingModal = ({ solution, onClose }) => {
  const [mounted, setMounted] = useState(false)
  const [form, setForm] = useState({ email: '', phone: '', message: '' })
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!solution) return undefined
    setForm({ email: '', phone: '', message: '' })
    setStatus('idle')
    setErrorMessage('')
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = prev
    }
  }, [solution, onClose])

  const handleBackdropMouseDown = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    const email = form.email.trim()
    const phone = form.phone.trim()
    const message = form.message.trim()

    if (!email || !phone || !message) {
      setStatus('error')
      setErrorMessage('Completá email, teléfono y mensaje.')
      return
    }

    setStatus('sending')

    const bodyText = [
      `Servicio / solución: ${solution.title}`,
      `Teléfono de contacto: ${phone}`,
      '',
      'Mensaje:',
      message,
    ].join('\n')

    let response
    try {
      response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          subject: 'Solicitud de reunión',
          message: bodyText,
          source: MEETING_SOURCE,
        }),
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
      setStatus('success')
      return
    }

    const msg =
      resData?.error?.message ||
      resData?.message ||
      'No se pudo enviar. Intenta de nuevo más tarde.'
    setErrorMessage(msg)
    setStatus('error')
  }

  const handleCloseAfterSuccess = () => {
    onClose()
  }

  if (!mounted || !solution) return null

  const modal = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4"
      role="presentation"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="meeting-modal-title"
        className="relative z-[101] w-full max-w-md rounded-2xl border border-white/[0.1] bg-surface-elevated/95 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.65)] ring-1 ring-white/[0.06] sm:p-6"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-page/80 text-[#8b949e] transition hover:border-white/25 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange/50"
          aria-label="Cerrar"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        {status === 'success' ? (
          <div className="animate-contact-feedback-in pt-2 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-orange/15 text-accent-orange">
              <CalendarDaysIcon className="h-6 w-6" aria-hidden />
            </div>
            <h2 id="meeting-modal-title" className="text-lg font-semibold text-white">
              ¡Listo!
            </h2>
            <p className="mt-2 text-sm text-[#c9d1d9]">
              Te escribiré al correo que dejaste para coordinar la reunión.
            </p>
            <button
              type="button"
              onClick={handleCloseAfterSuccess}
              className="mt-6 w-full rounded-lg bg-gradient-to-r from-accent-orange to-accent-coral py-2.5 text-sm font-semibold text-white shadow-glow transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange/50"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <div className="mb-5 pr-8">
              <h2 id="meeting-modal-title" className="text-lg font-semibold text-white">
                Agendar reunión
              </h2>
              <p className="mt-1 text-sm text-[#8b949e]">
                <span className="text-[#c9d1d9]">{solution.title}</span>
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit} aria-busy={status === 'sending'}>
              <div>
                <label htmlFor="modal-meeting-email" className="mb-1.5 block text-sm font-medium text-[#c9d1d9]">
                  Email
                </label>
                <input
                  id="modal-meeting-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={handleChange('email')}
                  disabled={status === 'sending'}
                  placeholder="tu@email.com"
                  className="block w-full rounded-lg border border-surface-border bg-page px-3 py-2.5 text-sm text-white placeholder-[#6e7681] transition focus:border-accent-orange/50 focus:outline-none focus:ring-2 focus:ring-accent-orange/25 disabled:opacity-60"
                />
              </div>
              <div>
                <label htmlFor="modal-meeting-phone" className="mb-1.5 block text-sm font-medium text-[#c9d1d9]">
                  Teléfono de contacto
                </label>
                <input
                  id="modal-meeting-phone"
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  required
                  value={form.phone}
                  onChange={handleChange('phone')}
                  disabled={status === 'sending'}
                  placeholder="+54 9 11 …"
                  className="block w-full rounded-lg border border-surface-border bg-page px-3 py-2.5 text-sm text-white placeholder-[#6e7681] transition focus:border-accent-orange/50 focus:outline-none focus:ring-2 focus:ring-accent-orange/25 disabled:opacity-60"
                />
              </div>
              <div>
                <label htmlFor="modal-meeting-message" className="mb-1.5 block text-sm font-medium text-[#c9d1d9]">
                  Mensaje
                </label>
                <textarea
                  id="modal-meeting-message"
                  name="message"
                  required
                  rows={4}
                  value={form.message}
                  onChange={handleChange('message')}
                  disabled={status === 'sending'}
                  placeholder="Contame qué necesitás o cuándo podés reunirte."
                  className="block w-full resize-y rounded-lg border border-surface-border bg-page px-3 py-2.5 text-sm text-white placeholder-[#6e7681] transition focus:border-accent-orange/50 focus:outline-none focus:ring-2 focus:ring-accent-orange/25 disabled:opacity-60"
                />
              </div>

              {status === 'error' && errorMessage ? (
                <p className="text-sm text-rose-300/90" role="alert">
                  {errorMessage}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-accent-orange to-accent-coral py-3 text-sm font-semibold text-white shadow-glow transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-accent-orange/50 focus:ring-offset-2 focus:ring-offset-page disabled:pointer-events-none disabled:opacity-70"
              >
                {status === 'sending' ? (
                  <>
                    <span
                      className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                      aria-hidden
                    />
                    Enviando…
                  </>
                ) : (
                  <>
                    <CalendarDaysIcon className="h-4 w-4" aria-hidden />
                    Enviar solicitud
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

export default SolucionMeetingModal
