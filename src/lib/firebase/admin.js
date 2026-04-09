import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

export const getAdminDb = () => {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (!raw) return null

  try {
    let app = getApps()[0]
    if (!app) {
      const parsed = JSON.parse(raw)
      app = initializeApp({
        credential: cert(parsed),
      })
    }
    return getFirestore(app)
  } catch (e) {
    console.error('Firebase Admin:', e)
    return null
  }
}

export { FieldValue }
