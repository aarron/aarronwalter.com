'use client'

import { useEffect, useRef } from 'react'

// ─────────────────────────────────────────────────────────────
//  FooterWave — a single living line.
//
//  The base motion is a slow multi-harmonic wave with a traveling
//  amplitude envelope so different sections breathe at different times.
//
//  Occasionally a "fold" event propagates left→right along the line.
//  The fold is an S-curve displacement in x: before its center the line
//  is pushed forward; after it the line is pulled backward. This causes
//  the line to overshoot, then cross back over itself — a loop.
//
//  Condition for a loop:  |foldXAmp| > foldSigma
//  Loop travels at foldSpeed (normalised units / second).
//  Never more than one loop active at a time.
// ─────────────────────────────────────────────────────────────

export default function FooterWave() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf: number
    const t0    = performance.now()
    let lastMs  = performance.now()

    // ── Fold event state (one at a time) ─────────────────────
    let fActive = false
    let fCenter = 0          // normalised x of fold centre
    let fSigma  = 0.10       // fold region half-width (normalised)
    let fXAmp   = -0.18      // x fold depth — must satisfy |fXAmp| > fSigma
    let fYAmp   = 0.55       // y oval puff (signed → loop up or down)
    let fSpeed  = 0.12       // travel speed (normalised units / s)
    let fNextAt = 2 + Math.random() * 4   // seconds until first fold

    function spawnFold(ts: number) {
      fActive  = true
      fCenter  = -0.22                                  // start off left edge
      fSigma   = 0.08  + Math.random() * 0.05           // 0.08–0.13
      fXAmp    = -(0.15 + Math.random() * 0.09)         // 0.15–0.24 — always > fSigma → loop
      fYAmp    = (0.38 + Math.random() * 0.34)          // 0.38–0.72
               * (Math.random() < 0.5 ? 1 : -1)        // random up / down
      fSpeed   = 0.09  + Math.random() * 0.10           // 0.09–0.19 / s
      void ts
    }

    function resize() {
      const dpr      = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width  = canvas!.offsetWidth  * dpr
      canvas!.height = canvas!.offsetHeight * dpr
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function draw(now: number) {
      const w  = canvas!.offsetWidth
      const h  = canvas!.offsetHeight
      const t  = (now - t0) * 0.00042     // slow drift — same scale as HeroWaves
      const ts = (now - t0) / 1000        // real seconds
      const dt = Math.min((now - lastMs) / 1000, 0.05)
      lastMs   = now

      // ── Fold lifecycle ────────────────────────────────────
      if (!fActive) {
        if (ts >= fNextAt) spawnFold(ts)
      } else {
        fCenter += fSpeed * dt
        if (fCenter > 1.22) {
          fActive  = false
          fNextAt  = ts + 7 + Math.random() * 11   // 7–18 s gap between loops
        }
      }

      ctx!.clearRect(0, 0, w, h)

      const cy    = h * 0.50
      const amp   = h * 0.36      // generous amplitude so loops read clearly
      const steps = 420           // more steps for smooth parametric curves

      ctx!.beginPath()

      for (let s = 0; s <= steps; s++) {
        const xn = s / steps      // base parameter 0→1

        // ── Base wave ────────────────────────────────────────
        // Traveling envelope makes sections independently animated:
        // some are livelier, some quieter, the mood drifts slowly.
        const envelope = 0.68 + 0.32 * Math.sin(xn * 2.7 - t * 0.19)

        const disp = (
          Math.sin(xn *  7.0 + t * 0.55) * 0.52 +
          Math.sin(xn *  2.4 + t * 0.32) * 0.25 +
          Math.sin(xn * 13.0 + t * 0.88) * 0.15 +
          Math.sin(xn *  4.9 + t * 0.21) * 0.20   // extra harmonic for variety
        ) * envelope

        // ── Fold / loop displacement ──────────────────────────
        // S-curve in x  (forward push before centre, backward pull after)
        // creates a crossing → visible loop.
        // Gaussian in y  rounds the crossing into an oval.
        let fxd = 0   // x displacement (canvas pixels)
        let fyd = 0   // y displacement (normalised, multiplied by amp below)

        if (fActive) {
          const u    = (xn - fCenter) / fSigma
          const g    = Math.exp(-u * u * 0.5)           // Gaussian, 1 at centre
          const taper = Math.sin(xn * Math.PI)           // 0 at both edges, 1 at centre
          fxd = fXAmp * g * u * w * taper               // S-curve, pinned to edges
          fyd = fYAmp * g * taper                        // oval puff, also tapered
        }

        const x = xn * w + fxd
        const y = cy + (disp + fyd) * amp

        s === 0 ? ctx!.moveTo(x, y) : ctx!.lineTo(x, y)
      }

      ctx!.strokeStyle = 'rgba(243, 231, 214, 0.22)'
      ctx!.lineWidth   = 1.1
      ctx!.lineJoin    = 'round'
      ctx!.lineCap     = 'round'
      ctx!.stroke()

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

  return (
    <canvas ref={ref} style={{ display: 'block', width: '100%', height: '100%' }} />
  )
}
