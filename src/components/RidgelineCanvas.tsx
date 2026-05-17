'use client'

import { useEffect, useRef } from 'react'

// ─── Visual constants ─────────────────────────────────────────────────────────

const BG_FILL = '#F3E7D6'
const INK_R   = 44
const INK_G   = 42
const INK_B   = 42

const LINES   = 80          // dense stacking like the reference
const SAMPLES = 400         // samples per ridge

// ─── Perspective plane — corners as fraction of canvas (W, H) ─────────────────
//
//  Back-left ──────────────── Back-right
//      BL                          BR
//       \    (recedes upper-right)   \
//        \                            \
//        FL ────────────────────────── FR
//  Front-left                    Front-right
//
//  depthFrac = 0 → front (near, bottom of canvas)
//  depthFrac = 1 → back  (far,  top-right of canvas)
//
const FL = { x: 0.00, y: 0.94 }   // front-left  — near bottom-left
const FR = { x: 0.74, y: 1.02 }   // front-right — near bottom (can sit below canvas)
const BL = { x: 0.27, y: 0.01 }   // back-left   — near top-centre
const BR = { x: 1.05, y: 0.14 }   // back-right  — can run off-canvas right edge

// Maximum mountain height at the front, as a fraction of canvas height
const FRONT_AMP = 0.17

// ─── Seeded PRNG (LCG) ───────────────────────────────────────────────────────

function lcg(seed: number) {
  let s = (seed ^ 0xdeadbeef) >>> 0
  return (): number => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 0x100000000
  }
}

// ─── Mountain peak descriptors ────────────────────────────────────────────────

interface Peak {
  nx:    number   // centre position 0–1
  σ:     number   // Gaussian width
  h:     number   // base height 0–1
  phase: number   // breathing phase
  speed: number   // breathing speed rad/s
}

const PEAKS_PER_LINE = 16  // mix of broad masses + sharp spikes

// Profiles are deterministic (seeded by line index), never change on resize
const PROFILES: Peak[][] = Array.from({ length: LINES }, (_, li) => {
  const rand = lcg(li * 7013 + 31337)
  return Array.from({ length: PEAKS_PER_LINE }, (_, pi) => {
    // Center-biased x distribution (Box-Muller)
    const u1 = Math.max(1e-6, rand())
    const u2 = rand()
    const gauss = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    const nx = Math.max(0.01, Math.min(0.99, 0.45 + gauss * 0.27))

    // First half = narrow spikes, second half = broad mountain masses
    const isSpike = pi < PEAKS_PER_LINE / 2
    return {
      nx,
      σ:     isSpike ? 0.007 + rand() * 0.013 : 0.026 + rand() * 0.044,
      h:     0.15 + rand() * 0.85,
      phase: rand() * Math.PI * 2,
      speed: 0.10 + rand() * 0.50,   // rad/s — each peak breathes at its own rate
    }
  })
})

// ─── Mountain profile height at nx ───────────────────────────────────────────

const BREATH_SWING = 0.22   // ±22 % height variation — subtle live-data feel

function profileH(nx: number, peaks: Peak[], t: number): number {
  let h = 0
  for (const p of peaks) {
    const d = nx - p.nx
    const g = Math.exp(-(d * d) / (2 * p.σ * p.σ))
    const amp = Math.max(0, p.h * (1 + BREATH_SWING * Math.sin(t * p.speed + p.phase)))
    h += amp * g
  }
  return h
}

// ─── Perspective helpers ──────────────────────────────────────────────────────

/** Screen position of a point on the flat ground plane. */
function groundPt(nx: number, df: number, W: number, H: number) {
  // Bilinear interpolation across the four corners
  const lx = FL.x + df * (BL.x - FL.x)
  const ly = FL.y + df * (BL.y - FL.y)
  const rx = FR.x + df * (BR.x - FR.x)
  const ry = FR.y + df * (BR.y - FR.y)
  return {
    sx: (lx + nx * (rx - lx)) * W,
    sy: (ly + nx * (ry - ly)) * H,
  }
}

/** Height scale: perspective foreshortening — back lines are visually much shorter. */
function hScale(df: number): number {
  return 1 - df * 0.82
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

      // Draw back → front so each ridge's cream fill occludes the ones behind it
      for (let i = 0; i < LINES; i++) {
        // i = 0 is drawn first (back/far), i = LINES-1 last (front/near)
        const df       = 1 - i / (LINES - 1)   // depthFrac: 1=back, 0=front
        const hs       = hScale(df)
        const front    = 1 - df                 // 0=back, 1=front

        // Pre-compute screen points for this ridgeline
        const pts: { sx: number; sy: number }[] = []
        for (let s = 0; s <= SAMPLES; s++) {
          const nx = s / SAMPLES
          const mH = profileH(nx, PROFILES[i], t) * maxAmp * hs
          const g  = groundPt(nx, df, W, H)
          pts.push({ sx: g.sx, sy: g.sy - mH })
        }

        // ── Cream fill — everything below the ridge, masking lines behind it ──
        ctx!.beginPath()
        ctx!.moveTo(pts[0].sx, pts[0].sy)
        for (let s = 1; s <= SAMPLES; s++) {
          ctx!.lineTo(pts[s].sx, pts[s].sy)
        }
        ctx!.lineTo(pts[SAMPLES].sx, H + 10)
        ctx!.lineTo(pts[0].sx,       H + 10)
        ctx!.closePath()
        ctx!.fillStyle = BG_FILL
        ctx!.fill()

        // ── Stroke — the ridgeline itself ─────────────────────────────────────
        const alpha = 0.08 + 0.62 * front
        ctx!.beginPath()
        ctx!.moveTo(pts[0].sx, pts[0].sy)
        for (let s = 1; s <= SAMPLES; s++) {
          ctx!.lineTo(pts[s].sx, pts[s].sy)
        }
        ctx!.strokeStyle = `rgba(${INK_R},${INK_G},${INK_B},${alpha.toFixed(3)})`
        ctx!.lineWidth   = 0.4 + front * 0.9
        ctx!.lineJoin    = 'round'
        ctx!.stroke()
      }

      raf = requestAnimationFrame(draw)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
