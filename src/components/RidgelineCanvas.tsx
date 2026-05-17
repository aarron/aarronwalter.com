'use client'

import { useEffect, useRef } from 'react'

// ─── Colors — match HeroWaves (home page) ─────────────────────────────────────
const BG_FILL = '#F3E7D6'
const INK_R   = 70
const INK_G   = 58
const INK_B   = 48

const LINES   = 90
const SAMPLES = 420

// ─── Perspective plane ────────────────────────────────────────────────────────
//
//  Horizontal stacked lines. Plane recedes to the upper-LEFT.
//  depthFrac = 0 → front / near (lower-right, steeper "\" tilt)
//  depthFrac = 1 → back  / far  (upper-left, tightly compressed)
//
const FL = { x: 0.04, y: 0.76 }
const FR = { x: 1.02, y: 0.97 }
const BL = { x: 0.00, y: 0.03 }
const BR = { x: 0.88, y: -0.01 }

// Max mountain height at the front, as a fraction of canvas HEIGHT.
// The "flat parallel lines" effect on back ridges comes entirely from
// depth compression (hScale), NOT from an x-axis envelope cutoff.
const FRONT_AMP = 0.54

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

// ─── Mountain profile — ridged fractal noise ──────────────────────────────────
//
//  Key insight from the reference: the "flat parallel lines" visual
//  comes from DEPTH COMPRESSION of far-back lines, not from cutting off
//  the x-axis. Front lines have mountains across most of their width.
//  Back lines look flat because hScale reduces their amplitude to ~12%.
//
//  Wide dome-shaped x-envelope mirrors the reference's mountain mass:
//  active across roughly 90% of each line, peaked in the centre.
//
function mountainH(nx: number, lineIdx: number, t: number): number {
  const seed = LINE_SEED[lineIdx]
  const x    = nx * 5.5 + seed

  let h    = 0
  let amp  = 0.60
  let freq = 1.0

  for (let oct = 0; oct < 6; oct++) {
    const drift = t * (0.008 + oct * 0.005)   // slow per-octave drift
    const v     = Math.sin(x * freq * 3.1 + drift + seed * oct * 0.27)
    h   += amp * (1.0 - Math.abs(v))           // ridged: sharp upward spikes
    amp  *= 0.52
    freq *= 2.04
  }

  // Dome envelope — active across the full line width; the parallelogram clip
  // handles the visible boundary. Envelope extends to the edges so lines fill
  // all the way to the clipped left/right walls.
  const d   = Math.abs(nx - 0.50) / 0.52
  const env = Math.max(0, 1.0 - d * d * d)    // cubic falloff

  // Radio signal: slow amplitude wave traveling through the ridgelines
  const signal = 1.0 + 0.12 * Math.sin(t * 0.38 + lineIdx * 0.21)

  const thresh = 0.52
  return Math.max(0, h - thresh) * env * signal
}

// ─── Perspective helpers ──────────────────────────────────────────────────────

function groundPt(nx: number, df: number, W: number, H: number) {
  const lx = FL.x + df * (BL.x - FL.x)
  const ly = FL.y + df * (BL.y - FL.y)
  const rx = FR.x + df * (BR.x - FR.x)
  const ry = FR.y + df * (BR.y - FR.y)
  return {
    sx: (lx + nx * (rx - lx)) * W,
    sy: (ly + nx * (ry - ly)) * H,
  }
}

// Aggressive depth compression — back lines at only 12% of front amplitude,
// making them appear as flat parallel lines (the reference's right-side effect).
function hScale(df: number): number {
  return 1 - df * 0.88
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
      const maxAmp = H * FRONT_AMP

      ctx!.clearRect(0, 0, W, H)

      // ── Parallelogram clip: enforce left, right, bottom; top is open ──────────
      // The four ground corners define a parallelogram. We build a clip region
      // that extends far UPWARD from BL and BR (so peaks above the top edge are
      // not clipped), but terminates exactly at FL-FR (left/right ground edges)
      // and the bottom of the canvas.
      ctx!.save()
      {
        const flS = { x: FL.x * W, y: FL.y * H }
        const frS = { x: FR.x * W, y: FR.y * H }
        const blS = { x: BL.x * W, y: BL.y * H }
        const brS = { x: BR.x * W, y: BR.y * H }
        // Far-above extensions of the back-left and back-right corners
        const S = 80
        const lExt = { x: blS.x - (flS.x - blS.x) * S, y: blS.y - (flS.y - blS.y) * S }
        const rExt = { x: brS.x - (frS.x - brS.x) * S, y: brS.y - (frS.y - brS.y) * S }
        ctx!.beginPath()
        ctx!.moveTo(lExt.x, lExt.y)       // far above BL
        ctx!.lineTo(rExt.x, rExt.y)       // far above BR
        ctx!.lineTo(frS.x,  H + 20)       // right edge → bottom
        ctx!.lineTo(flS.x,  H + 20)       // bottom → left edge
        ctx!.closePath()
        ctx!.clip()
      }

      // Back → front: i=0 drawn first (back/far), i=LINES-1 drawn last (front/near)
      for (let i = 0; i < LINES; i++) {
        const df    = 1 - i / (LINES - 1)   // 1 = back, 0 = front
        const hs    = hScale(df)
        const front = 1 - df                 // 0 = back, 1 = front

        const pts: { sx: number; sy: number }[] = []
        for (let s = 0; s <= SAMPLES; s++) {
          const nx = s / SAMPLES
          const mH = mountainH(nx, i, t) * maxAmp * hs
          const g  = groundPt(nx, df, W, H)
          pts.push({ sx: g.sx, sy: g.sy - mH })
        }

        // Cream fill below the ridge — occludes ridgelines drawn behind it
        ctx!.beginPath()
        ctx!.moveTo(pts[0].sx, pts[0].sy)
        for (let s = 1; s <= SAMPLES; s++) ctx!.lineTo(pts[s].sx, pts[s].sy)
        ctx!.lineTo(pts[SAMPLES].sx, H + 10)
        ctx!.lineTo(pts[0].sx,       H + 10)
        ctx!.closePath()
        ctx!.fillStyle = BG_FILL
        ctx!.fill()

        // Stroke — subtle fade from back to front
        const alpha = 0.30 + 0.40 * front
        ctx!.beginPath()
        ctx!.moveTo(pts[0].sx, pts[0].sy)
        for (let s = 1; s <= SAMPLES; s++) ctx!.lineTo(pts[s].sx, pts[s].sy)
        ctx!.strokeStyle = `rgba(${INK_R},${INK_G},${INK_B},${alpha.toFixed(3)})`
        ctx!.lineWidth   = 0.35 + front * 1.1
        ctx!.lineJoin    = 'round'
        ctx!.stroke()
      }

      ctx!.restore()   // end parallelogram clip

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
