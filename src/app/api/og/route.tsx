import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export const runtime = 'nodejs'

// ─── Load assets once at module level ────────────────────────────────────────
const linecaRegular = readFileSync(join(process.cwd(), 'public/fonts/lineca-regular.otf'))
const linecaMedium  = readFileSync(join(process.cwd(), 'public/fonts/lineca-medium.otf'))

const logoB64 = readFileSync(join(process.cwd(), 'public/aarron-walter-logo.png')).toString('base64')
const logoSrc = `data:image/png;base64,${logoB64}`

// ─── Topo generation (same algorithm as TopoCanvas, static at t = 0) ─────────

interface Hill { cx: number; cy: number; amp: number; sx: number; sy: number; ang: number; p: number }

const HILLS: Hill[] = [
  // Northern range
  { cx: 0.80, cy: 0.14, amp: 1.00, sx: 0.18, sy: 0.13, ang:  0.20, p: 0.00 },
  { cx: 0.94, cy: 0.21, amp: 0.82, sx: 0.15, sy: 0.17, ang: -0.30, p: 2.10 },
  { cx: 0.69, cy: 0.27, amp: 0.74, sx: 0.16, sy: 0.12, ang:  0.55, p: 4.20 },
  { cx: 1.01, cy: 0.08, amp: 0.60, sx: 0.13, sy: 0.11, ang: -0.45, p: 1.50 },
  // Southern range
  { cx: 0.75, cy: 0.64, amp: 0.92, sx: 0.19, sy: 0.16, ang:  0.75, p: 3.50 },
  { cx: 0.91, cy: 0.75, amp: 0.80, sx: 0.17, sy: 0.20, ang: -0.55, p: 0.80 },
  { cx: 0.62, cy: 0.80, amp: 0.66, sx: 0.16, sy: 0.13, ang:  1.10, p: 5.00 },
  { cx: 0.87, cy: 0.58, amp: 0.56, sx: 0.15, sy: 0.12, ang: -0.15, p: 2.70 },
  // Eastern ridge
  { cx: 1.06, cy: 0.42, amp: 0.70, sx: 0.13, sy: 0.30, ang:  0.05, p: 1.80 },
  { cx: 1.07, cy: 0.90, amp: 0.50, sx: 0.12, sy: 0.14, ang:  0.25, p: 3.30 },
]

const GW     = 88
const GH     = 72
const LEVELS = 26

// Marching-squares edge table
const MS: Array<Array<[number, number]>> = [
  [], [[3,2]], [[2,1]], [[3,1]], [[0,1]], [[0,1],[2,3]], [[0,2]], [[0,3]],
  [[0,3]], [[0,2]], [[0,3],[1,2]], [[0,1]], [[1,3]], [[1,2]], [[2,3]], [],
]

function heightAt(nx: number, ny: number): number {
  let h = 0
  for (const hill of HILLS) {
    const cx  = hill.cx + 0.012 * Math.sin(hill.p)
    const cy  = hill.cy + 0.009 * Math.cos(hill.p * 1.3)
    const amp = hill.amp * (0.98 + 0.02 * Math.sin(hill.p * 0.8))
    const dx  = nx - cx
    const dy  = ny - cy
    const c   = Math.cos(hill.ang)
    const s   = Math.sin(hill.ang)
    const lx  = dx * c + dy * s
    const ly  = -dx * s + dy * c
    h += amp * Math.exp(-(lx * lx / (hill.sx * hill.sx) + ly * ly / (hill.sy * hill.sy)) * 0.5)
  }
  h += 0.038 * Math.sin(nx * 7.1) * Math.sin(ny * 5.3)
  h += 0.022 * Math.sin(nx * 12.8 + 1.5) * Math.cos(ny * 8.2)
  return h
}

function edgePt(
  edge: number, gx: number, gy: number,
  tl: number, tr: number, br: number, bl: number,
  level: number,
): [number, number] {
  let t: number
  switch (edge) {
    case 0: t = Math.max(0, Math.min(1, (level - tl) / (tr - tl + 1e-9))); return [(gx + t) / GW, gy / GH]
    case 1: t = Math.max(0, Math.min(1, (level - tr) / (br - tr + 1e-9))); return [(gx + 1) / GW, (gy + t) / GH]
    case 2: t = Math.max(0, Math.min(1, (level - bl) / (br - bl + 1e-9))); return [(gx + t) / GW, (gy + 1) / GH]
    case 3: t = Math.max(0, Math.min(1, (level - tl) / (bl - tl + 1e-9))); return [gx / GW, (gy + t) / GH]
    default: return [0, 0]
  }
}

/** Generate the topo contour lines as an SVG data URI (1200×630). */
function buildTopoSvg(W: number, H: number): string {
  const grid = new Float32Array((GW + 1) * (GH + 1))
  let minH = Infinity, maxH = -Infinity

  for (let gy = 0; gy <= GH; gy++) {
    for (let gx = 0; gx <= GW; gx++) {
      const v = heightAt(gx / GW, gy / GH)
      grid[gy * (GW + 1) + gx] = v
      if (v < minH) minH = v
      if (v > maxH) maxH = v
    }
  }

  const step = (maxH - minH) / (LEVELS + 1)
  const parts: string[] = [`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">`]

  for (let li = 0; li < LEVELS; li++) {
    const level   = minH + step * (li + 1)
    const lNorm   = li / (LEVELS - 1)
    const isIndex = li % 5 === 0
    const midArc  = 1 - Math.abs(lNorm - 0.5) * 1.8
    const alpha   = Math.max(0.03, midArc * (isIndex ? 0.48 : 0.20))
    const lw      = isIndex ? 1.4 : 0.65

    const segs: string[] = []

    for (let gy = 0; gy < GH; gy++) {
      for (let gx = 0; gx < GW; gx++) {
        const base = gy * (GW + 1) + gx
        const tl   = grid[base]
        const tr   = grid[base + 1]
        const bl   = grid[base + (GW + 1)]
        const br   = grid[base + (GW + 2)]
        const code = (tl > level ? 8 : 0) | (tr > level ? 4 : 0) | (br > level ? 2 : 0) | (bl > level ? 1 : 0)

        for (const [e1, e2] of MS[code]) {
          const [nx1, ny1] = edgePt(e1, gx, gy, tl, tr, br, bl, level)
          const [nx2, ny2] = edgePt(e2, gx, gy, tl, tr, br, bl, level)
          segs.push(`M${(nx1 * W).toFixed(1)} ${(ny1 * H).toFixed(1)}L${(nx2 * W).toFixed(1)} ${(ny2 * H).toFixed(1)}`)
        }
      }
    }

    if (segs.length > 0) {
      const color = `rgba(70,58,48,${alpha.toFixed(3)})`
      parts.push(`<path d="${segs.join('')}" stroke="${color}" stroke-width="${lw}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`)
    }
  }

  parts.push('</svg>')
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(parts.join(''))}`
}

// Build once at module load — same result every request
const topoSrc = buildTopoSvg(1200, 630)

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
          background: '#F3E7D6',
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* ── Topo lines ── */}
        <img
          src={topoSrc}
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
