import { NextResponse } from 'next/server'

const trim = (v) => (typeof v === 'string' ? v.trim() : '')

const ENV_KEYS = {
  apiKey: 'NEXT_PUBLIC_FIREBASE_API_KEY',
  authDomain: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  projectId: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  storageBucket: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'NEXT_PUBLIC_FIREBASE_APP_ID',
}

export async function GET() {
  const config = {
    apiKey: trim(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
    authDomain: trim(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
    projectId: trim(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
    storageBucket: trim(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) || undefined,
    messagingSenderId: trim(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) || undefined,
    appId: trim(process.env.NEXT_PUBLIC_FIREBASE_APP_ID) || undefined,
  }

  const requiredFields = ['apiKey', 'authDomain', 'projectId']
  const missing = requiredFields.filter((f) => !config[f])

  if (missing.length) {
    const missingEnv = missing.map((f) => ENV_KEYS[f])
    return NextResponse.json(
      {
        ok: false,
        missing: process.env.NODE_ENV === 'development' ? missingEnv : undefined,
      },
      { status: 422 }
    )
  }

  return NextResponse.json({
    ok: true,
    config,
    adminEmail: trim(process.env.NEXT_PUBLIC_ADMIN_EMAIL) || null,
  })
}
