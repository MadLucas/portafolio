import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const requiredEnvKeys = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
]

const trim = (v) => (typeof v === 'string' ? v.trim() : '')

const getFirebaseConfigFromEnv = () => {
  const cfg = {
    apiKey: trim(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
    authDomain: trim(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
    projectId: trim(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
    storageBucket: trim(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) || undefined,
    messagingSenderId: trim(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) || undefined,
    appId: trim(process.env.NEXT_PUBLIC_FIREBASE_APP_ID) || undefined,
  }
  const missing = requiredEnvKeys.filter((k) => !trim(process.env[k]))
  if (missing.length) {
    return { ok: false, missing, cfg: null }
  }
  return { ok: true, missing: [], cfg }
}

export const isFirebaseClientConfigured = () => getFirebaseConfigFromEnv().ok

/** Inicializa la app con el objeto config de Firebase (p. ej. respuesta del servidor). */
export const initFirebaseAppFromPublicConfig = (cfg) => {
  if (getApps().length) return getApp()
  return initializeApp(cfg)
}

export const getFirebaseApp = () => (getApps().length ? getApp() : null)

export const getFirebaseAuth = () => {
  const app = getFirebaseApp()
  if (!app) return null
  return getAuth(app)
}

export const getFirebaseFirestore = () => {
  const app = getFirebaseApp()
  if (!app) return null
  return getFirestore(app)
}

/** Requiere `storageBucket` en la config (p. ej. NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET). */
export const getFirebaseStorage = () => {
  const app = getFirebaseApp()
  if (!app) return null
  const bucket = app.options?.storageBucket
  if (!bucket) return null
  return getStorage(app)
}
