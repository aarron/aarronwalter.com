'use client'

import { useEffect, useRef } from 'react'

// ─── Visual constants ─────────────────────────────────────────────────────────

const BG_FILL = '#F3E7D6'
const INK_R   = 44
const INK_G   = 42
const INK_B   = 42

const LINES   = 88          // dense stacking
const SAMPLES = 480         // points per ridgeline

// ─── Perspective plane corners (as fraction of canvas W, H) ──────────────────
//
//  depthFrac = 0 → front / near / bottom of canvas
//  depthFrac = 1 → back  / far  / upper-right of canvas
//
//        BL ─────────────────────── BR
//       /                              \
//      /   (recedes to upper-right)     \
//    FL ─────────────────────────────── FR
//
const FL = { x: 0.00, y: 0.90 }   // front-left
const FR = { x: 0.74, y: 1.00 }   // front-right  (sits at canvas bottom edge)
const BL = { x: 0.26, y: 0.01 }   // back-left
const BR = { x: 1.04, y: 0.13 }   // back-right   (can run off canvas right)

// Max mountain amplitude at the front as a fraction of canvas height
const FRONT_AMP = 0.58

// ─── Per-line phase seeds ─────────────────────────────────────────────────────
// Deterministic seeded PRNG so profiles are stable across resizes

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

// ─── Ridged fractal noise — the key to jagged mountain peaks ─────────────────
//
//  Uses 6 octaves of  (1 − |sin|)  stacked at doubling frequencies.
//  (1 − |sin|) peaks sharply at 0, π, 2π … and touches 0 at ±π/2.
//  Higher octaves add fine jagged detail on top of the base ridges.
//
//  Each octave drifts at its own slow rate → "live data feed" feel where
//  individual peaks rise and fall independently over ~30–120 s cycles.
//
function mountainH(nx: number, lineIdx: number, t: number): number {
  const seed = LINE_SEED[lineIdx]
  // Base x: enough cycles across the line to show multiple peaks
  const x = nx * 5.5 + seed

  let h    = 0
  let amp  = 0.60
  let freq = 1.0

  for (let oct = 0; oct < 6; oct++) {
    // Drift speed: low octaves drift very slowly, high octaves slightly faster
    const drift = t * (0.006 + oct * 0.007)
    const v = Math.sin(x * freq * 3.1 + drift + seed * oct * 0.27)

    // Ridged: 1 - |v| creates sharp upward peaks (inverted absolute value)
    h   += amp * (1.0 - Math.abs(v))
    amp  *= 0.52
    freq *= 2.04
  }

  // x-envelope: mountains concentrated in centre, flat at both edges
  // (mimics the CP 1919 signal shape — active region flanked by silence)
  const d   = Math.abs(nx - 0.44) / 0.44
  const env = Math.max(0, 1.0 - d * d * d)  // cubic falloff

  // Clip baseline so flat regions are truly flat (zero height)
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

// Perspective height compression: front lines full size, back lines tiny
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

      // Draw back → front so each ridge's cream fill masks the ones behind it
      for (let i = 0; i < LINES; i++) {
        const df    = 1 - i / (LINES - 1)   // 1 = back/far, 0 = front/near
        const hs    = hScale(df)
        const front = 1 - df                 // 0 = back, 1 = front

        const pts: { sx: number; sy: number }[] = []
        for (let s = 0; s <= SAMPLES; s++) {
          const nx = s / SAMPLES
          const mH = mountainH(nx, i, t) * maxAmp * hs
          const g  = groundPt(nx, df, W, H)
          pts.push({ sx: g.sx, sy: g.sy - mH })
        }

        // ── Cream fill — occludes ridgelines drawn behind this one ────────────
        ctx!.beginPath()
        ctx!.moveTo(pts[0].sx, pts[0].sy)
        for (let s = 1; s <= SAMPLES; s++) ctx!.lineTo(pts[s].sx, pts[s].sy)
        ctx!.lineTo(pts[SAMPLES].sx, H + 10)
        ctx!.lineTo(pts[0].sx,       H + 10)
        ctx!.closePath()
        ctx!.fillStyle = BG_FILL
        ctx!.fill()

        // ── Stroke — the ridgeline ─────────────────────────────────────────────
        const alpha = 0.07 + 0.63 * front
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
