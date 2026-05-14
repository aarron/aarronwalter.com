'use client'

import { useEffect, useRef } from 'react'

// ─────────────────────────────────────────────────────────────
//  SonarCanvas — concentric dot rings radiating from a source
//  just below the canvas bottom. A slow traveling wave pulses
//  outward through the rings. Invisible blobs drift through
//  the field, displacing nearby dots as they pass.
//
//  Source sits at (w/2, h * 1.08) so only the upper arc of
//  each ring is visible — the same semicircular sweep seen in
//  sonar and acoustic-field visualisations.
// ─────────────────────────────────────────────────────────────

const RINGS       = 38
const DOT_SPACING = 11     // target px between adjacent dots along arc
const PULSE_AMP   = 5      // traveling wave radial amplitude (px)
const PULSE_SPEED = 0.45   // wave angular speed (rad/s)
const RADIAL_FREQ = 0.014  // wave spatial frequency (rad/px of radius)
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
    let ringTiers: Array<'heavy' | 'medium' | 'light'> = []
    let blobs: Blob[]  = []
    let W = 0, H = 0, CX = 0, CY = 0

    // ── Build ring dot positions ──────────────────────────
    function build(w: number, h: number) {
      W = w; H = h
      CX = w * 0.5
      CY = h * 1.08    // source just below canvas bottom

      const rMin = h * 0.08
      const rMax = h * 1.52
      const margin = PULSE_AMP + 4

      rings = []
      for (let i = 0; i < RINGS; i++) {
        const t = i / (RINGS - 1)
        const r = rMin + (rMax - rMin) * t
        const step = DOT_SPACING / r         // angle step to hit target spacing
        const dots: Dot[] = []

        for (let a = 0; a < Math.PI * 2; a += step) {
          const px = CX + r * Math.cos(a)
          const py = CY + r * Math.sin(a)
          if (px >= -margin && px <= w + margin &&
              py >= -margin && py <= h + margin) {
            dots.push({ angle: a, r, nr: (Math.random() - 0.5) * 3.5 })
          }
        }
        rings.push(dots)
      }

      // Assign tiers: ~10% heavy, ~20% medium, rest light
      // Heavy rings must have ≥3 gap between them
      const nHeavy  = Math.round(RINGS * 0.10)   // ≈4
      const nMedium = Math.round(RINGS * 0.20)   // ≈8
      const shuffled = Array.from({ length: RINGS }, (_, i) => i)
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      const heavySet  = new Set<number>()
      const mediumSet = new Set<number>()
      for (const idx of shuffled) {
        if (heavySet.size < nHeavy) {
          const tooClose = [...heavySet].some(h => Math.abs(h - idx) < 3)
          if (!tooClose) { heavySet.add(idx); continue }
        }
      }
      for (const idx of shuffled) {
        if (mediumSet.size >= nMedium) break
        if (heavySet.has(idx)) continue
        const nextToHeavy = [...heavySet].some(h => Math.abs(h - idx) < 2)
        if (!nextToHeavy) mediumSet.add(idx)
      }
      ringTiers = Array.from({ length: RINGS }, (_, i) =>
        heavySet.has(i) ? 'heavy' : mediumSet.has(i) ? 'medium' : 'light'
      )

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

        const lNorm = ri / (RINGS - 1)
        const tier  = ringTiers[ri]

        // Position within visible band (peaks ~40% out, fades at edges)
        const focus = Math.max(0, 1 - Math.abs(lNorm - 0.38) * 1.6)

        // Per-tier alpha and dot-size ranges
        const [minA, maxA, minD, maxD] =
          tier === 'heavy'  ? [0.38, 0.62, 2.0, 2.8] :
          tier === 'medium' ? [0.20, 0.38, 1.3, 1.9] :
                              [0.10, 0.22, 0.8, 1.2]

        const alpha = minA + focus * (maxA - minA)
        const dotR  = minD + Math.sin(lNorm * Math.PI) * (maxD - minD)

        ctx!.beginPath()

        for (const dot of dots) {
          // Outward traveling wave
          const pulse = PULSE_AMP * Math.sin(t * PULSE_SPEED - dot.r * RADIAL_FREQ)
          const r = dot.r + dot.nr + pulse

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
