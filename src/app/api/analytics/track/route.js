import { NextResponse } from 'next/server'
import { getAdminDb, FieldValue } from '../../../../lib/firebase/admin'

export const runtime = 'nodejs'

const todayId = () => new Date().toISOString().slice(0, 10)

export async function POST() {
  const db = getAdminDb()
  if (!db) {
    return NextResponse.json(
      { ok: false, reason: 'analytics_not_configured' },
      { status: 503 }
    )
  }

  try {
    const ref = db.collection('dailyViews').doc(todayId())
    await ref.set(
      {
        count: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
