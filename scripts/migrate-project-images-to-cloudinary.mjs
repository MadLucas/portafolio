import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { v2 as cloudinary } from 'cloudinary'

const COLLECTION = 'portfolioProjects'
const FIREBASE_STORAGE_HOST = 'firebasestorage.googleapis.com'

const toBool = (value, fallback = false) => {
  if (value == null) return fallback
  const normalized = String(value).trim().toLowerCase()
  if (['1', 'true', 'yes', 'y', 'on'].includes(normalized)) return true
  if (['0', 'false', 'no', 'n', 'off'].includes(normalized)) return false
  return fallback
}

const trim = (value) => (typeof value === 'string' ? value.trim() : '')

const parseServiceAccount = () => {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (!raw) {
    throw new Error('Falta FIREBASE_SERVICE_ACCOUNT_KEY en variables de entorno')
  }
  try {
    return JSON.parse(raw)
  } catch (error) {
    throw new Error(`FIREBASE_SERVICE_ACCOUNT_KEY no es JSON valido: ${error.message}`)
  }
}

const getAdminDb = () => {
  const serviceAccount = parseServiceAccount()
  const app = getApps()[0] || initializeApp({ credential: cert(serviceAccount) })
  return getFirestore(app)
}

const configureCloudinary = () => {
  const cloudName = trim(process.env.CLOUDINARY_CLOUD_NAME)
  const apiKey = trim(process.env.CLOUDINARY_API_KEY)
  const apiSecret = trim(process.env.CLOUDINARY_API_SECRET)

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Faltan CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY o CLOUDINARY_API_SECRET')
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  })
}

const normalizeUrlsFromProject = (project) => {
  const list = []
  if (Array.isArray(project.images)) {
    for (const url of project.images) {
      const clean = trim(url)
      if (clean) list.push(clean)
    }
  }

  if (list.length === 0) {
    const legacy = trim(project.image)
    if (legacy) list.push(legacy)
  }

  const unique = []
  const seen = new Set()
  for (const url of list) {
    if (seen.has(url)) continue
    seen.add(url)
    unique.push(url)
  }
  return unique
}

const isCloudinaryUrl = (url) => /(^https?:\/\/)?res\.cloudinary\.com\//i.test(url)

const isFirebaseStorageUrl = (url) => {
  try {
    const parsed = new URL(url)
    return parsed.hostname === FIREBASE_STORAGE_HOST
  } catch {
    return false
  }
}

const inferExtension = (contentType, originalUrl) => {
  const ct = trim(contentType).toLowerCase()
  if (ct.includes('image/png')) return 'png'
  if (ct.includes('image/webp')) return 'webp'
  if (ct.includes('image/gif')) return 'gif'
  if (ct.includes('image/svg')) return 'svg'
  if (ct.includes('image/avif')) return 'avif'
  if (ct.includes('image/jpeg') || ct.includes('image/jpg')) return 'jpg'

  try {
    const pathname = new URL(originalUrl).pathname
    const ext = pathname.split('.').pop()?.toLowerCase() || ''
    if (/^[a-z0-9]{2,5}$/.test(ext)) return ext
  } catch {
    // ignore
  }
  return 'jpg'
}

const uploadFromUrlToCloudinary = async ({ projectId, sourceUrl, index }) => {
  const response = await fetch(sourceUrl)
  if (!response.ok) {
    throw new Error(`No se pudo descargar imagen (${response.status})`)
  }

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.toLowerCase().startsWith('image/')) {
    throw new Error(`La URL no devolvio imagen (${contentType || 'sin content-type'})`)
  }

  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const ext = inferExtension(contentType, sourceUrl)

  const folder = `portfolio-projects/${projectId}/images`
  const publicId = `${Date.now()}_${index}.${ext}`.replace(/\.[a-z0-9]{2,5}$/, '')

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: 'image',
        overwrite: false,
        unique_filename: false,
      },
      (error, result) => {
        if (error) return reject(error)
        return resolve(result?.secure_url || '')
      }
    )
    stream.end(buffer)
  })
}

const run = async () => {
  const dryRun = toBool(process.env.MIGRATION_DRY_RUN, true)
  const onlyActive = toBool(process.env.MIGRATION_ONLY_ACTIVE, false)
  const limit = Number(process.env.MIGRATION_LIMIT || 0)

  configureCloudinary()
  const db = getAdminDb()

  const snap = await db.collection(COLLECTION).get()
  const docs = snap.docs

  console.log(`\n[scan] Proyectos encontrados: ${docs.length}`)
  console.log(`[config] dryRun=${dryRun} onlyActive=${onlyActive} limit=${limit || 'sin limite'}\n`)

  let processed = 0
  let updated = 0
  let skipped = 0
  let failed = 0

  for (const doc of docs) {
    if (limit > 0 && processed >= limit) break

    const data = doc.data()
    if (onlyActive && data.active === false) {
      skipped++
      continue
    }

    const originalUrls = normalizeUrlsFromProject(data)
    if (originalUrls.length === 0) {
      skipped++
      continue
    }

    processed++
    const id = doc.id
    const title = trim(data.title) || '(sin titulo)'
    console.log(`[project] ${id} :: ${title}`)

    const finalUrls = []
    let changed = false
    let projectFailed = false

    for (let i = 0; i < originalUrls.length; i++) {
      const url = originalUrls[i]

      if (isCloudinaryUrl(url)) {
        finalUrls.push(url)
        console.log(`  - [keep] cloudinary ${url}`)
        continue
      }

      if (!isFirebaseStorageUrl(url)) {
        finalUrls.push(url)
        console.log(`  - [keep] url externa/no-firebase ${url}`)
        continue
      }

      try {
        const migrated = await uploadFromUrlToCloudinary({
          projectId: id,
          sourceUrl: url,
          index: i,
        })
        if (!migrated) {
          throw new Error('Cloudinary no devolvio secure_url')
        }
        finalUrls.push(migrated)
        changed = true
        console.log(`  - [migrated] ${url} -> ${migrated}`)
      } catch (error) {
        projectFailed = true
        finalUrls.push(url)
        console.log(`  - [error] ${url} :: ${error.message}`)
      }
    }

    if (!changed) {
      skipped++
      console.log('  - [skip] sin cambios\n')
      continue
    }

    if (dryRun) {
      updated++
      console.log('  - [dry-run] cambios detectados, no se actualiza Firestore\n')
      continue
    }

    try {
      await doc.ref.update({
        images: finalUrls,
        image: FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp(),
      })
      updated++
      console.log('  - [ok] Firestore actualizado\n')
    } catch (error) {
      failed++
      console.log(`  - [fail] no se pudo actualizar Firestore: ${error.message}\n`)
      continue
    }

    if (projectFailed) failed++
  }

  console.log('\n=== RESUMEN ===')
  console.log(`Procesados: ${processed}`)
  console.log(`Actualizados: ${updated}`)
  console.log(`Saltados: ${skipped}`)
  console.log(`Con errores: ${failed}`)
  console.log(`Dry run: ${dryRun}`)
}

run().catch((error) => {
  console.error('\n[fatal]', error.message)
  process.exit(1)
})
