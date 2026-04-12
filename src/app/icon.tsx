import { readFileSync } from 'fs'
import { join } from 'path'
import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'

export const size = {
  width: 48,
  height: 48,
}

export const contentType = 'image/png'

const Icon = () => {
  const buf = readFileSync(join(process.cwd(), 'public', 'Lucas.jpg'))
  const base64 = buf.toString('base64')
  const src = `data:image/jpeg;base64,${base64}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0d1117',
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 999,
            overflow: 'hidden',
            display: 'flex',
            border: '2px solid rgba(255,255,255,0.35)',
          }}
        >
          <img
            alt=""
            src={src}
            width={44}
            height={44}
            style={{
              objectFit: 'cover',
              width: '100%',
              height: '100%',
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

export default Icon
