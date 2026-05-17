'use client'

import { useEffect, useRef } from 'react'

// ─── Visual constants ────────────────────────────────────────────────────────

const BG_FILL = '#F3E7D6'
const INK_R   = 44
const INK_G   = 42
const INK_B   = 42

const LINES      = 52           // number of ridgelines
const SAMPLES    = 340          // x-samples per line
const ROTATE_DEG = -17          // counter-clockwise tilt (degrees)

// Mountain shape
const PEAKS_PER_LINE   = 10     // Gaussian peaks composing each ridge
const BASE_AMP         = 2.0    // amplitude multiplier (× slot height × depth)

// Each peak breathes independently — "live data feed" feel
const BREATH_MIN  = 0.10        // rad/s (slow)
const BREATH_MAX  = 0.45        // rad/s (faster)
const BREATH_SWING = 0.28       // ± fraction of peak height

// ─── Seeded LCG pseudo-random ────────────────────────────────────────────────

function lcg(seed: number) {
  let s = (seed ^ 0xdeadbeef) >>> 0
  return (): number => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 0x100000000
  }
}

// ─── Mountain peak descriptors (generated once, deterministic) ───────────────

interface Peak {
  nx:    number   // centre position 0–1
  σ:     number   // Gaussian half-width
  h:     number   // base height 0–1
  phase: number   // breathing phase offset
  speed: number   // breathing speed (rad/s)
}

// Profiles are computed at module load so they never change between renders.
// Using seeded LCG keeps them deterministic — no jitter on resize/remount.
const PROFILES: Peak[][] = Array.from({ length: LINES }, (_, li) => {
  const rand = lcg(li * 6271 + 999983)

  // Weight the centre of the canvas more heavily (bell-curve x-distribution)
  return Array.from({ length: PEAKS_PER_LINE }, () => {
    // Box-Muller for a center-biased x position
    const u1 = Math.max(1e-6, rand())
    const u2 = rand()
    const normal = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    const nx = Math.max(0.02, Math.min(0.98, 0.5 + normal * 0.22))

    return {
      nx,
      σ:     0.016 + rand() * 0.042,     // narrow → sharp mountain peaks
      h:     0.20  + rand() * 0.80,      // height diversity
      phase: rand() * Math.PI * 2,
      speed: BREATH_MIN + rand() * (BREATH_MAX - BREATH_MIN),
    }
  })
})

// ─── Evaluate mountain profile height at a given x position ─────────────────

function profileH(nx: number, peaks: Peak[], t: number): number {
  let h = 0
  for (const p of peaks) {
    const d = nx - p.nx
    const g = Math.exp(-(d * d) / (2 * p.σ * p.σ))
    // Each peak independently rises and falls — the live-data effect
    const breath = 1 + BREATH_SWING * Math.sin(t * p.speed + p.phase)
    h += Math.max(0, p.h * breath) * g
  }
  return h   // sum of weighted Gaussians; typically 0–2+
}

// ─── Component ───────────────────────────────────────────────────────────────

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
      const w = canvas!.offsetWidth
      const h = canvas!.offsetHeight
      const t = (now - t0) * 0.001

      ctx!.clearRect(0, 0, w, h)

      // ── Rotate the whole composition CCW around canvas centre ──────────────
      const rad = (ROTATE_DEG * Math.PI) / 180
      ctx!.save()
      ctx!.translate(w / 2, h / 2)
      ctx!.rotate(rad)
      ctx!.translate(-w / 2, -h / 2)

      // Extend the draw rectangle so rotated edges fill the canvas fully
      const pad = Math.ceil(Math.max(w, h) * 0.35)
      const dw  = w + pad * 2
      const dh  = h + pad * 2
      const ox  = -pad
      const oy  = -pad

      const slotH = dh / LINES

      for (let i = 0; i < LINES; i++) {
        const depthFrac = i / (LINES - 1)          // 0 = back, 1 = front
        const baseY     = oy + slotH * (i + 0.5)

        // Front ridges are taller — strong depth cue
        const ampPx = slotH * BASE_AMP * (0.12 + 0.88 * depthFrac)

        const ys = new Float32Array(SAMPLES + 1)
        for (let s = 0; s <= SAMPLES; s++) {
          const nx = s / SAMPLES
          ys[s] = baseY - profileH(nx, PROFILES[i], t) * ampPx
        }

        const x0 = ox
        const x1 = ox + dw

        // ── Cream fill — masks ridgelines behind, creating 3-D depth ─────────
        ctx!.beginPath()
        ctx!.moveTo(x0, ys[0])
        for (let s = 1; s <= SAMPLES; s++) {
          ctx!.lineTo(x0 + (s / SAMPLES) * dw, ys[s])
        }
        ctx!.lineTo(x1, oy + dh + 4)
        ctx!.lineTo(x0, oy + dh + 4)
        ctx!.closePath()
        ctx!.fillStyle = BG_FILL
        ctx!.fill()

        // ── Stroke — the ridgeline itself ─────────────────────────────────────
        const alpha = 0.14 + 0.56 * depthFrac
        ctx!.beginPath()
        ctx!.moveTo(x0, ys[0])
        for (let s = 1; s <= SAMPLES; s++) {
          ctx!.lineTo(x0 + (s / SAMPLES) * dw, ys[s])
        }
        ctx!.strokeStyle = `rgba(${INK_R},${INK_G},${INK_B},${alpha.toFixed(3)})`
        ctx!.lineWidth   = 0.5 + depthFrac * 0.9
        ctx!.lineJoin    = 'round'
        ctx!.stroke()
      }

      ctx!.restore()
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
