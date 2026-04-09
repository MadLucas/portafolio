import { Resend } from "resend"
import { NextResponse } from "next/server"
import React from "react"

const getResend = () => {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

const fromEmail = process.env.FROM_EMAIL
const toEmail = process.env.TO_EMAIL

const ContactEmail = ({ subject, message, email }) => (
  <>
    <h1 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{subject}</h1>
    <p style={{ whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>{message}</p>
    <p style={{ color: '#666', fontSize: '0.875rem' }}>Nuevo mensaje desde el portafolio</p>
    <p style={{ marginTop: '0.5rem' }}>
      <strong>De:</strong> {email}
    </p>
  </>
)

export async function POST(req) {
  const resend = getResend()
  if (!resend || !fromEmail || !toEmail) {
    return NextResponse.json(
      { error: { message: 'Configuración de correo incompleta en el servidor.' } },
      { status: 500 }
    )
  }

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: { message: 'JSON inválido' } }, { status: 400 })
  }

  const { email, subject, message } = body

  if (
    typeof email !== 'string' ||
    typeof subject !== 'string' ||
    typeof message !== 'string' ||
    !email.trim() ||
    !subject.trim() ||
    !message.trim()
  ) {
    return NextResponse.json(
      { error: { message: 'Faltan email, asunto o mensaje.' } },
      { status: 400 }
    )
  }

  if (subject.length > 200 || message.length > 8000) {
    return NextResponse.json(
      { error: { message: 'Asunto o mensaje demasiado largo.' } },
      { status: 400 }
    )
  }

  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: `Contacto portafolio: ${subject}`,
      react: <ContactEmail subject={subject} message={message} email={email} />,
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: { message: 'No se pudo enviar el correo.' } },
      { status: 502 }
    )
  }
}
