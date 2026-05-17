'use client'

import { useEffect, useRef } from 'react'

// #F3E7D6 → #2C2A2A
const CREAM: [number, number, number] = [243, 231, 214]
const DARK:  [number, number, number] = [44,  42,  42]

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function lerpColor(t: number): string {
  const r = Math.round(lerp(CREAM[0], DARK[0], t))
  const g = Math.round(lerp(CREAM[1], DARK[1], t))
  const b = Math.round(lerp(CREAM[2], DARK[2], t))
  return `rgb(${r},${g},${b})`
}

// Same harmonic blend as the hero waves for visual continuity
function wave(xn: number, phase: number, t: number): number {
  const x = xn * 9
  return (
    Math.sin(x * 0.85 + t * 0.52 + phase) +
    Math.sin(x * 2.15 + t * 1.08 + phase * 1.45) * 0.52 +
    Math.sin(x * 0.38 + t * 0.37 + phase * 0.62) * 0.40 +
    Math.sin(x * 4.70 + t * 1.82 + phase * 0.25) * 0.15 +
    Math.sin(x * 1.55 + t * 0.78 + phase * 1.85) * 0.23
  ) / 2.30
}

export default function WaveTransition() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf: number
    const t0 = performance.now()

    function resize() {
      const dpr      = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width  = canvas!.offsetWidth  * dpr
      canvas!.height = canvas!.offsetHeight * dpr
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function draw(now: number) {
      const w = canvas!.offsetWidth
      const h = canvas!.offsetHeight
      const t = (now - t0) * 0.00048  // same slow drift as hero

      ctx!.clearRect(0, 0, w, h)

      // Number of stacked ribbons — more = smoother gradient
      const numRibbons = 48
      const steps      = 240
      // Max vertical displacement of each wave crest.
      // Bigger in the middle of the stack for drama, smaller near top/bottom edges.
      const globalMaxAmp = h * 0.22

      // Draw ribbons top → bottom. Each ribbon fills from its wave crest
      // down to the bottom of the canvas, painting over the one below.
      // Result: the wave crests of lower (darker) ribbons peek through where
      // the ribbons above don't reach — classic stacked-silhouette effect.
      for (let i = 0; i < numRibbons; i++) {
        const tNorm = i / (numRibbons - 1)  // 0 = top / cream, 1 = bottom / dark

        // Vertical center of this ribbon's wave
        const baseY = tNorm * h

        // Amplitude peaks in the middle of the stack for drama
        const bellCurve = Math.sin(tNorm * Math.PI)          // 0→1→0
        const ampMod    = 0.35 + 0.65 * bellCurve
        const maxAmp    = globalMaxAmp * ampMod

        // Subtle per-ribbon breathing
        const breathe = 0.80 + 0.20 * Math.sin(i * 1.12 + t * 0.13)

        // Amplitude ramp: left edge slightly calmer, right edge fuller
        // (mirrors how the hero waves are quieter on the left)
        const phase = i * 0.38

        ctx!.beginPath()

        for (let s = 0; s <= steps; s++) {
          const xn = s / steps
          const x  = xn * w
          // Gentle left→right ramp: 0.5 on the left, 1.0 on the right
          const xScale = 0.5 + 0.5 * xn
          const amp    = maxAmp * breathe * xScale
          const y      = baseY - wave(xn, phase, t) * amp

          s === 0 ? ctx!.moveTo(x, y) : ctx!.lineTo(x, y)
        }

        // Close the shape down to the very bottom of the canvas
        ctx!.lineTo(w, h + 2)
        ctx!.lineTo(0, h + 2)
        ctx!.closePath()

        ctx!.fillStyle = lerpColor(tNorm)
        ctx!.fill()
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

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: '100%' }}
      aria-hidden="true"
    />
  )
}
