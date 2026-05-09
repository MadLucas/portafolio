import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

const sanitizePart = (value, fallback) => {
  const safe = String(value || fallback)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 80)
  return safe || fallback
}

const configureCloudinary = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) return false

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  })

  return true
}

const uploadBuffer = (buffer, options) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(options, (error, result) => {
        if (error) return reject(error)
        return resolve(result)
      })
      .end(buffer)
  })

export async function POST(req) {
  const ok = configureCloudinary()
  if (!ok) {
    return NextResponse.json(
      { error: { message: 'Faltan variables de Cloudinary en el servidor' } },
      { status: 500 }
    )
  }

  let formData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json(
      { error: { message: 'No se pudo leer el formulario de subida' } },
      { status: 400 }
    )
  }

  const file = formData.get('file')
  const rawProjectId = formData.get('projectId')

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: { message: 'Debes enviar una imagen en el campo "file"' } },
      { status: 400 }
    )
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json(
      { error: { message: 'El archivo enviado no es una imagen' } },
      { status: 415 }
    )
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: { message: 'La imagen supera el límite de 5 MB' } },
      { status: 413 }
    )
  }

  const projectId = sanitizePart(rawProjectId, 'project')
  const fileName = sanitizePart(file.name.replace(/\.[^/.]+$/, ''), 'image')
  const timestamp = Date.now()
  const folder = `portfolio-projects/${projectId}/images`

  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const uploaded = await uploadBuffer(buffer, {
      folder,
      public_id: `${timestamp}_${fileName}`,
      resource_type: 'image',
      overwrite: false,
      unique_filename: false,
    })

    return NextResponse.json({
      ok: true,
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
      format: uploaded.format,
      width: uploaded.width,
      height: uploaded.height,
    })
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    return NextResponse.json(
      { error: { message: 'No se pudo subir la imagen a Cloudinary' } },
      { status: 502 }
    )
  }
}
