'use client'

import { useEffect, useRef } from 'react'

// ─── Colors — match HeroWaves (home page) ─────────────────────────────────────
const BG_FILL = '#F3E7D6'
const INK_R   = 70
const INK_G   = 58
const INK_B   = 48

const LINES   = 80
const SAMPLES = 400

// ─── Perspective plane ────────────────────────────────────────────────────────
//
//  Horizontal stacked lines, plane recedes to the upper-right.
//  depthFrac = 0 → front / near / lower-left
//  depthFrac = 1 → back  / far  / upper-right
//
//   BL ─────────────────────────── BR  (back edge, upper-right)
//    \                               \
//     \                               \
//     FL ─────────────────────────── FR  (front edge, lower)
//
const FL = { x: 0.00, y: 0.86 }
const FR = { x: 0.72, y: 0.96 }
const BL = { x: 0.25, y: 0.02 }
const BR = { x: 1.04, y: 0.13 }

// Max mountain height (front line) as fraction of canvas height
const FRONT_AMP = 0.42

// ─── Seeded LCG — stable across resize ───────────────────────────────────────

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
//  (1 − |sin|) creates sharp upward spikes at multiples of π.
//  Six octaves of doubling frequency give fractal jagged detail.
//  Animation: each octave drifts at its own very slow rate so individual
//  peaks rise and fall independently — subtle live-signal feel.
//
//  x-envelope: mountains concentrated in the LEFT portion of each line
//  (roughly nx 0–0.58), flat on the right — matching the mockup.
//
function mountainH(nx: number, lineIdx: number, t: number): number {
  const seed = LINE_SEED[lineIdx]
  const x    = nx * 5.5 + seed

  let h    = 0
  let amp  = 0.60
  let freq = 1.0

  for (let oct = 0; oct < 6; oct++) {
    const drift = t * (0.003 + oct * 0.004)   // very slow drift
    const v     = Math.sin(x * freq * 3.1 + drift + seed * oct * 0.27)
    h   += amp * (1.0 - Math.abs(v))           // ridged: sharp upward spikes
    amp  *= 0.52
    freq *= 2.04
  }

  // Left-biased x-envelope — peaks at nx ≈ 0.28, zero beyond 0.60
  const d   = Math.abs(nx - 0.28) / 0.30
  const env = nx > 0.60 ? 0 : Math.max(0, 1 - d * d)

  const thresh = 0.52
  return Math.max(0, h - thresh) * env
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

// Front lines: full height. Back lines: perspective-compressed to near-flat.
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
      const maxAmp = H * FRONT_AMP

      ctx!.clearRect(0, 0, W, H)

      // Draw back → front: i=0 is the back/far line, i=LINES-1 is front/near
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

        // ── Cream fill — closes downward, masks ridgelines drawn behind ────────
        ctx!.beginPath()
        ctx!.moveTo(pts[0].sx, pts[0].sy)
        for (let s = 1; s <= SAMPLES; s++) ctx!.lineTo(pts[s].sx, pts[s].sy)
        ctx!.lineTo(pts[SAMPLES].sx, H + 10)
        ctx!.lineTo(pts[0].sx,       H + 10)
        ctx!.closePath()
        ctx!.fillStyle = BG_FILL
        ctx!.fill()

        // ── Stroke ────────────────────────────────────────────────────────────
        const alpha = 0.06 + 0.64 * front
        ctx!.beginPath()
        ctx!.moveTo(pts[0].sx, pts[0].sy)
        for (let s = 1; s <= SAMPLES; s++) ctx!.lineTo(pts[s].sx, pts[s].sy)
        ctx!.strokeStyle = `rgba(${INK_R},${INK_G},${INK_B},${alpha.toFixed(3)})`
        ctx!.lineWidth   = 0.35 + front * 1.05
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
