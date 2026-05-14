'use client'

import { useEffect, useRef } from 'react'

// ─────────────────────────────────────────────────────────────
//  SonarCanvas — concentric dot rings radiating from a source
//  just below the canvas bottom. A sound-like pulse sweeps
//  outward through the rings, brightening and enlarging each
//  ring as it passes. Invisible blobs drift through the field,
//  displacing nearby dots as they pass.
//
//  Source sits at (w/2, h * 1.08) so only the upper arc of
//  each ring is visible — the same semicircular sweep seen in
//  sonar and acoustic-field visualisations.
// ─────────────────────────────────────────────────────────────

const RINGS       = 38
const DOT_SPACING = 11     // target px between adjacent dots along arc
const PULSE_SPEED = 0.9    // wave angular speed (rad/s)
const RADIAL_FREQ = 0.016  // wave spatial frequency (rad/px of radius)
const BLOB_COUNT  = 3

interface Dot {
  angle: number   // base angle (rad)
  r:     number   // base radius (px)
  nr:    number   // per-dot organic noise offset (px)
}

interface Blob {
  x: number; y: number
  vx: number; vy: number
  influence: number    // push falloff radius (px)
  push: number         // max displacement at centre (px)
}

export default function SonarCanvas({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf: number
    const t0     = performance.now()
    let lastMs   = performance.now()
    let rings: Dot[][] = []
    let blobs: Blob[]  = []
    let W = 0, H = 0, CX = 0, CY = 0

    // ── Build ring dot positions ──────────────────────────
    function build(w: number, h: number) {
      W = w; H = h
      CX = w * 0.5
      CY = h * 1.08    // source just below canvas bottom

      const rMin = h * 0.08
      const rMax = h * 1.52

      rings = []
      for (let i = 0; i < RINGS; i++) {
        const t = i / (RINGS - 1)
        const r = rMin + (rMax - rMin) * t
        const step = DOT_SPACING / r         // angle step to hit target spacing
        const dots: Dot[] = []

        for (let a = 0; a < Math.PI * 2; a += step) {
          const px = CX + r * Math.cos(a)
          const py = CY + r * Math.sin(a)
          if (px >= -4 && px <= w + 4 &&
              py >= -4 && py <= h + 4) {
            dots.push({ angle: a, r, nr: (Math.random() - 0.5) * 3.5 })
          }
        }
        rings.push(dots)
      }

      blobs = Array.from({ length: BLOB_COUNT }, () => ({
        x:         w * (0.25 + Math.random() * 0.5),
        y:         h * (0.15 + Math.random() * 0.65),
        vx:        (Math.random() < 0.5 ? 1 : -1) * (22 + Math.random() * 20),
        vy:        (Math.random() < 0.5 ? 1 : -1) * (22 + Math.random() * 20),
        influence: 100 + Math.random() * 70,
        push:       20 + Math.random() * 18,
      }))
    }

    function resize() {
      const dpr      = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width  = canvas!.offsetWidth  * dpr
      canvas!.height = canvas!.offsetHeight * dpr
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      build(canvas!.offsetWidth, canvas!.offsetHeight)
    }

    function draw(now: number) {
      const t  = (now - t0) / 1000
      const dt = Math.min((now - lastMs) / 1000, 0.05)
      lastMs = now

      ctx!.clearRect(0, 0, W, H)

      // ── Advance blobs ─────────────────────────────────────
      for (const b of blobs) {
        b.x += b.vx * dt
        b.y += b.vy * dt
        if (b.x < 40 || b.x > W - 40) b.vx *= -1
        if (b.y < 40 || b.y > H - 40) b.vy *= -1
      }

      // ── Draw rings ────────────────────────────────────────
      for (let ri = 0; ri < rings.length; ri++) {
        const dots = rings[ri]
        if (!dots.length) continue

        // Traveling wave: sin moves outward with time.
        // All dots in a ring share the same r, so wave is per-ring.
        const ringR = dots[0].r
        const wave  = Math.sin(t * PULSE_SPEED - ringR * RADIAL_FREQ)
        const boost = (wave + 1) * 0.5   // 0 → 1, crests at 1

        // Uniform base; pulse lifts opacity and size as it passes
        const alpha = 0.16 + boost * 0.22   // 0.16 … 0.38
        const dotR  = 0.9  + boost * 0.85   // 0.9  … 1.75

        ctx!.beginPath()

        for (const dot of dots) {
          const r = dot.r + dot.nr

          let px = CX + r * Math.cos(dot.angle)
          let py = CY + r * Math.sin(dot.angle)

          // Blob field displacement (squared falloff for softer edges)
          for (const b of blobs) {
            const dx   = px - b.x
            const dy   = py - b.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist > 0 && dist < b.influence) {
              const strength = (1 - dist / b.influence) ** 2
              px += (dx / dist) * b.push * strength
              py += (dy / dist) * b.push * strength
            }
          }

          if (px < -2 || px > W + 2 || py < -2 || py > H + 2) continue

          ctx!.moveTo(px + dotR, py)
          ctx!.arc(px, py, dotR, 0, Math.PI * 2)
        }

        ctx!.fillStyle = `rgba(44, 42, 42, ${alpha.toFixed(3)})`
        ctx!.fill()
      }

      // ── Left mist — dissolves toward the page heading ─────
      const mistL = ctx!.createLinearGradient(0, 0, W * 0.52, 0)
      mistL.addColorStop(0,    '#F3E7D6')
      mistL.addColorStop(0.25, 'rgba(243,231,214,0.96)')
      mistL.addColorStop(0.55, 'rgba(243,231,214,0.65)')
      mistL.addColorStop(0.82, 'rgba(243,231,214,0.18)')
      mistL.addColorStop(1,    'rgba(243,231,214,0)')
      ctx!.fillStyle = mistL
      ctx!.fillRect(0, 0, W * 0.52, H)

      // ── Bottom mist — dissolves into page content ─────────
      const fadeStart = H * 0.58
      const mistB = ctx!.createLinearGradient(0, fadeStart, 0, H)
      mistB.addColorStop(0,    'rgba(243,231,214,0)')
      mistB.addColorStop(0.35, 'rgba(243,231,214,0.55)')
      mistB.addColorStop(0.70, 'rgba(243,231,214,0.90)')
      mistB.addColorStop(1,    '#F3E7D6')
      ctx!.fillStyle = mistB
      ctx!.fillRect(0, fadeStart, W, H - fadeStart)

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

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
