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

// Triangle wave — produces angular V-peaks, unlike sine's rounded curves
function tri(x: number): number {
  const v = ((x % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
  return v < Math.PI ? v / Math.PI : 2 - v / Math.PI
}

// Layered triangle harmonics → jagged mountain silhouette
function mountain(xn: number, phase: number, t: number): number {
  const x = xn * Math.PI * 5.5

  const primary  = tri(x * 0.9  + phase          + t * 0.06)          // large ridges
  const mid      = tri(x * 2.3  + phase * 1.51   + t * 0.11) * 0.42   // secondary peaks
  const fine     = tri(x * 5.1  + phase * 0.73   + t * 0.18) * 0.20   // sharp detail
  const micro    = tri(x * 10.7 + phase * 2.17   + t * 0.09) * 0.09   // tiny serrations

  return (primary + mid + fine + micro) / 1.71
}

export default function MountainTransition() {
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
      const t = (now - t0) * 0.00032   // slow drift — mountains move glacially

      ctx!.clearRect(0, 0, w, h)

      const numRidges    = 52
      const steps        = 320          // more steps → sharper angular corners
      const globalMaxAmp = h * 0.28     // taller than the wave bridge for drama

      for (let i = 0; i < numRidges; i++) {
        const tNorm = i / (numRidges - 1)  // 0 = top/cream, 1 = bottom/dark

        // Ridges are evenly spaced vertically; earlier (cream) ridges sit higher
        const baseY = tNorm * h

        // Amplitude: peaks most dramatically in the upper-middle of the stack
        const bellCurve = Math.sin(tNorm * Math.PI * 0.9 + 0.1)
        const maxAmp    = globalMaxAmp * (0.25 + 0.75 * bellCurve)

        // Slow individual breathing per ridge
        const breathe = 0.88 + 0.12 * Math.sin(i * 0.97 + t * 0.17)

        // Phase shifts every ridge, creating distinct independent ridgelines
        const phase = i * 0.61 + Math.sin(i * 0.41) * 0.8

        ctx!.beginPath()

        for (let s = 0; s <= steps; s++) {
          const xn = s / steps
          const x  = xn * w
          const amp = maxAmp * breathe
          // Peaks go UP from baseY (subtract so ridges point skyward)
          const y  = baseY - mountain(xn, phase, t) * amp

          s === 0 ? ctx!.moveTo(x, y) : ctx!.lineTo(x, y)
        }

        // Close shape down to canvas bottom — fills from crest to floor
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
    />
  )
}
