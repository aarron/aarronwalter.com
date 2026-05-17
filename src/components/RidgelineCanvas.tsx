'use client'

import { useEffect, useRef } from 'react'

// ─── Colors — match HeroWaves on the home page ────────────────────────────────
const BG_FILL = '#F3E7D6'   // cream — page background, used as depth mask
const INK_R   = 70
const INK_G   = 58
const INK_B   = 48          // rgba(70, 58, 48) — same warm ink as HeroWaves

const LINES   = 80
const SAMPLES = 480

// ─── Perspective plane — -90° rotation from original ─────────────────────────
//
//  Lines are now VERTICAL (ny = 0 → top, ny = 1 → bottom of canvas).
//  Depth goes LEFT (back/far) → RIGHT (front/near).
//
//   TB ──────── TF    (top edge)
//    |           |
//    |  ←peaks  |    mountains extend LEFT from each vertical ridge
//    |           |
//   BB ──────── BF    (bottom edge)
//
//  df = 0 → front (right side, near viewer, tall)
//  df = 1 → back  (left side, far, perspective-compressed)
//
const TF = { x: 0.97, y: 0.01 }   // front-top
const BF = { x: 0.97, y: 0.99 }   // front-bottom
const TB = { x: 0.03, y: 0.28 }   // back-top  (vertically compressed by perspective)
const BB = { x: 0.03, y: 0.72 }   // back-bottom

// Max leftward mountain extension (front line) as a fraction of canvas WIDTH
const FRONT_AMP = 0.44

// ─── Seeded LCG — stable profiles across resize ───────────────────────────────

function lcg(seed: number) {
  let s = (seed ^ 0xdeadbeef) >>> 0
  return (): number => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 0x100000000
  }
}

const LINE_SEED: number[] = Array.from({ length: LINES }, (_, i) => {
  const r = lcg(i * 4919 + 98317)
  return r() * Math.PI * 6
})

// ─── Ridged fractal noise — sharp mountain peaks ──────────────────────────────
//
//  (1 − |sin|) creates upward spikes at multiples of π.
//  Six stacked octaves give jagged fractal detail.
//  Each octave drifts at its own slow rate → live data-feed feel.
//  ny  = normalised vertical position (0 = top, 1 = bottom of this line).
//
function mountainH(ny: number, lineIdx: number, t: number): number {
  const seed = LINE_SEED[lineIdx]
  const y    = ny * 5.5 + seed

  let h    = 0
  let amp  = 0.60
  let freq = 1.0

  for (let oct = 0; oct < 6; oct++) {
    const drift = t * (0.006 + oct * 0.007)
    const v     = Math.sin(y * freq * 3.1 + drift + seed * oct * 0.27)
    h   += amp * (1.0 - Math.abs(v))   // ridged: sharp upward spikes
    amp  *= 0.52
    freq *= 2.04
  }

  // Vertical envelope: peaks concentrated in the centre of each line,
  // flat at the very top and bottom — matching the CP 1919 signal shape.
  const d   = Math.abs(ny - 0.48) / 0.40
  const env = Math.max(0, 1.0 - d * d * d)

  const thresh = 0.52
  return Math.max(0, h - thresh) * env
}

// ─── Perspective projection ───────────────────────────────────────────────────

function groundPt(ny: number, df: number, W: number, H: number) {
  // Bilinear interpolation across the four corners of the 3-D plane
  const topX = TF.x + df * (TB.x - TF.x)
  const topY = TF.y + df * (TB.y - TF.y)
  const botX = BF.x + df * (BB.x - BF.x)
  const botY = BF.y + df * (BB.y - BF.y)
  return {
    sx: (topX + ny * (botX - topX)) * W,
    sy: (topY + ny * (botY - topY)) * H,
  }
}

// Perspective foreshortening: front lines tall & dramatic, back lines tiny
function hScale(df: number): number {
  return 1 - df * 0.84
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RidgelineCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf: number
    const t0 = performance.now()

    function resize() {
      const dpr = Math.min(window.devicePixelRatio ?? 1, 2)
      canvas!.width  = canvas!.offsetWidth  * dpr
      canvas!.height = canvas!.offsetHeight * dpr
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function draw(now: number) {
      const W = canvas!.offsetWidth
      const H = canvas!.offsetHeight
      const t = (now - t0) * 0.001

      // Max leftward extension in px (scales with canvas width)
      const maxAmp = W * FRONT_AMP

      ctx!.clearRect(0, 0, W, H)

      // Draw back (leftmost) → front (rightmost)
      // Each front ridge's cream fill, closed to x = –10, occludes back ridges.
      for (let i = 0; i < LINES; i++) {
        const df    = 1 - i / (LINES - 1)   // 1 = back/left, 0 = front/right
        const hs    = hScale(df)
        const front = 1 - df                 // 0 = back, 1 = front

        const pts: { sx: number; sy: number }[] = []
        for (let s = 0; s <= SAMPLES; s++) {
          const ny = s / SAMPLES
          const mH = mountainH(ny, i, t) * maxAmp * hs
          const g  = groundPt(ny, df, W, H)
          // Mountains extend LEFT (negative x offset from the vertical baseline)
          pts.push({ sx: g.sx - mH, sy: g.sy })
        }

        // ── Cream fill — closes leftward, masking ridgelines drawn behind ──────
        ctx!.beginPath()
        ctx!.moveTo(pts[0].sx, pts[0].sy)
        for (let s = 1; s <= SAMPLES; s++) ctx!.lineTo(pts[s].sx, pts[s].sy)
        ctx!.lineTo(-10, pts[SAMPLES].sy)  // left edge at bottom
        ctx!.lineTo(-10, pts[0].sy)         // up the left edge
        ctx!.closePath()
        ctx!.fillStyle = BG_FILL
        ctx!.fill()

        // ── Stroke — the ridgeline itself ──────────────────────────────────────
        const alpha = 0.06 + 0.64 * front
        ctx!.beginPath()
        ctx!.moveTo(pts[0].sx, pts[0].sy)
        for (let s = 1; s <= SAMPLES; s++) ctx!.lineTo(pts[s].sx, pts[s].sy)
        ctx!.strokeStyle = `rgba(${INK_R},${INK_G},${INK_B},${alpha.toFixed(3)})`
        ctx!.lineWidth   = 0.35 + front * 1.0
        ctx!.lineJoin    = 'round'
        ctx!.stroke()
      }

      raf = requestAnimationFrame(draw)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    raf = requestAnimationFrame(draw)

    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
