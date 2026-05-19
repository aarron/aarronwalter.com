import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'
import { PULSAR_DATA } from '@/lib/pulsar-data'

export const runtime = 'nodejs'

// ─── Load assets once at module level ────────────────────────────────────────
const linecaRegular = readFileSync(join(process.cwd(), 'public/fonts/lineca-regular.otf'))
const linecaMedium  = readFileSync(join(process.cwd(), 'public/fonts/lineca-medium.otf'))

const logoB64 = readFileSync(join(process.cwd(), 'public/aarron-walter-logo.png')).toString('base64')
const logoSrc = `data:image/png;base64,${logoB64}`

// ─── Ridgeline generation (PSR B1919+21 pulsar, static snapshot) ─────────────

const BG_FILL = '#F3E7D6'
const INK     = 'rgb(70,58,48)'

function buildRidgeSvg(W: number, H: number): string {
  const data    = PULSAR_DATA
  const ROWS    = data.length       // 80
  const STEP    = 2                 // sample every 2nd column → ~150 pts/row
  const AMP_REF = 15

  const padTop  = H * 0.03
  const padBot  = H * 0.03
  const spacing = (H - padTop - padBot) / (ROWS - 1)
  const ampScale = (spacing * 3.5) / AMP_REF

  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">`,
    `<defs>`,
    `<linearGradient id="g" x1="0" y1="0" x2="${W}" y2="0" gradientUnits="userSpaceOnUse">`,
    `<stop offset="0%"   stop-color="${INK}" stop-opacity="0"/>`,
    `<stop offset="8%"   stop-color="${INK}" stop-opacity="0.018"/>`,
    `<stop offset="25%"  stop-color="${INK}" stop-opacity="0.090"/>`,
    `<stop offset="50%"  stop-color="${INK}" stop-opacity="0.185"/>`,
    `<stop offset="78%"  stop-color="${INK}" stop-opacity="0.235"/>`,
    `<stop offset="100%" stop-color="${INK}" stop-opacity="0.260"/>`,
    `</linearGradient>`,
    `</defs>`,
  ]

  for (let row = 0; row < ROWS; row++) {
    const baseY   = padTop + row * spacing
    const rowNorm = row / (ROWS - 1)
    const rowData = data[row]
    const COLS    = rowData.length

    const stackMid = Math.abs(rowNorm - 0.5)
    const lw = (0.45 + 0.60 * (1 - stackMid)).toFixed(2)

    const xs: number[] = []
    const ys: number[] = []
    const indices = Array.from({ length: Math.ceil(COLS / STEP) }, (_, i) => i * STEP)
    if (indices[indices.length - 1] !== COLS - 1) indices.push(COLS - 1)

    for (const s of indices) {
      xs.push((s / (COLS - 1)) * W)
      ys.push(baseY - Math.max(0, rowData[s]) * ampScale)
    }

    const n      = xs.length
    const ridge  = xs.map((x, i) => `${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ')
    const close  = `${xs[n-1].toFixed(1)},${(H+10).toFixed(1)} ${xs[0].toFixed(1)},${(H+10).toFixed(1)}`

    parts.push(`<polygon points="${ridge} ${close}" fill="${BG_FILL}" stroke="none"/>`)
    parts.push(`<polyline points="${ridge}" fill="none" stroke="url(#g)" stroke-width="${lw}" stroke-linejoin="round" stroke-linecap="round"/>`)
  }

  parts.push('</svg>')
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(parts.join(''))}`
}

// Build once at module load — same result every request
const ridgeSrc = buildRidgeSvg(1200, 630)

// ─── Route handler ────────────────────────────────────────────────────────────

export function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title       = searchParams.get('title')       ?? 'Aarron Walter'
  const description = searchParams.get('description') ?? ''

  const titleSize =
    title.length > 28 ? 64 :
    title.length > 18 ? 76 :
    88

  return new ImageResponse(
    (
      <div
        style={{
          background: BG_FILL,
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* ── Pulsar ridgeline ── */}
        <img
          src={ridgeSrc}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        />

        {/* ── Left-side mist fade (keeps text legible) ── */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '65%',
            height: '100%',
            background:
              'linear-gradient(to right, #F3E7D6 0%, #F3E7D6 45%, rgba(243,231,214,0.92) 65%, rgba(243,231,214,0.55) 85%, rgba(243,231,214,0) 100%)',
          }}
        />

        {/* ── Content ── */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '52px 68px',
            width: '100%',
            height: '100%',
          }}
        >
          {/* Logo */}
          <img
            src={logoSrc}
            style={{ width: 56, height: 56, objectFit: 'contain' }}
          />

          {/* Title + description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 720 }}>
            <div
              style={{
                fontFamily: 'Lineca',
                fontWeight: 400,
                color: '#2C2A2A',
                fontSize: titleSize,
                letterSpacing: '-0.03em',
                lineHeight: 0.92,
              }}
            >
              {title}
            </div>
            {description ? (
              <div
                style={{
                  fontFamily: 'Lineca',
                  fontWeight: 400,
                  color: 'rgba(44, 42, 42, 0.52)',
                  fontSize: 22,
                  lineHeight: 1.45,
                  maxWidth: 620,
                }}
              >
                {description}
              </div>
            ) : null}
          </div>

          {/* URL with red accent */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 28,
                height: 2,
                background: '#FF4725',
                borderRadius: 1,
              }}
            />
            <span
              style={{
                fontFamily: 'Lineca',
                fontWeight: 400,
                color: 'rgba(44, 42, 42, 0.38)',
                fontSize: 17,
                letterSpacing: '0.04em',
              }}
            >
              aarronwalter.com
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Lineca', data: linecaRegular, style: 'normal', weight: 400 },
        { name: 'Lineca', data: linecaMedium,  style: 'normal', weight: 500 },
      ],
    }
  )
}
