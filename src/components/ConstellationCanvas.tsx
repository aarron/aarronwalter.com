'use client'

import { useEffect, useRef } from 'react'
import { SKY, stars } from '@/lib/sky-data'
import { getVizColors, usePaletteVersion } from '@/lib/viz-colors'

interface Props {
  className?: string
}

// Visible sky window (degrees). RA spans the width; the view drifts east.
const RA_SPAN = 150
const DEC_MIN = -55
const DEC_MAX = 80

/**
 * ConstellationCanvas — a real slice of the night sky: ~3,200 stars to
 * magnitude 5.6 with the IAU constellation figures drawn as faint lines, from
 * the Yale Bright Star / Hipparcos catalogues (via d3-celestial). The sky
 * drifts slowly east and the stars twinkle. A quiet "connect the dots / find
 * the pattern" texture for advisory work. Palette-aware; honors reduced motion.
 */
export default function ConstellationCanvas({ className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const pv = usePaletteVersion()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const viz = getVizColors()
    const [ir, ig, ib] = viz.inkRGB
    const [ar, ag, ab] = viz.accentRGB

    const S = stars()
    const n = S.ra.length
    const lines = SKY.lines

    let W = 0, H = 0
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = W = Math.max(1, Math.round(rect.width * dpr))
      canvas.height = H = Math.max(1, Math.round(rect.height * dpr))
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const decToY = (dec: number) => {
      const yf = (DEC_MAX - dec) / (DEC_MAX - DEC_MIN)
      return (yf * 1.16 - 0.08) * H // slight vertical bleed
    }
    // x for a given RA against the current scroll ra0; returns -1 if off-window.
    const raToX = (ra: number, ra0: number) => {
      const d = (((ra - ra0) % 360) + 360) % 360
      if (d > RA_SPAN * 1.04) return -1
      return (d / RA_SPAN) * W
    }
    // Fade stars/lines out toward the left, where the heading sits.
    const leftFade = (x: number) => {
      const f = x / (W * 0.26)
      return f >= 1 ? 1 : f <= 0 ? 0 : f * f * (3 - 2 * f)
    }

    let raf = 0
    let startT = 0

    const render = (now: number) => {
      if (!startT) startT = now
      const t = (now - startT) / 1000
      const ra0 = 20 + (reduce ? 0 : t * (360 / 420)) // full sky drift in ~7 min

      ctx.clearRect(0, 0, W, H)

      // ── Constellation figures ──
      ctx.lineWidth = Math.max(0.8, dpr * 0.6)
      ctx.lineCap = 'round'
      for (const poly of lines) {
        for (let k = 0; k < poly.length - 2; k += 2) {
          const x1 = raToX(poly[k], ra0)
          const x2 = raToX(poly[k + 2], ra0)
          if (x1 < 0 || x2 < 0) continue
          if (Math.abs(x1 - x2) > W * 0.5) continue // seam wrap
          const y1 = decToY(poly[k + 1])
          const y2 = decToY(poly[k + 3])
          const a = 0.16 * leftFade((x1 + x2) / 2)
          if (a < 0.012) continue
          ctx.strokeStyle = `rgba(${ar}, ${ag}, ${ab}, ${a})`
          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.stroke()
        }
      }

      // ── Stars ──
      for (let i = 0; i < n; i++) {
        const x = raToX(S.ra[i], ra0)
        if (x < 0) continue
        const y = decToY(S.dec[i])
        if (y < -8 || y > H + 8) continue
        const lf = leftFade(x)
        if (lf < 0.02) continue

        const mag = S.mag[i]
        const bright = Math.max(0, Math.min(1, (5.6 - mag) / 7)) // 0 faint … 1 brilliant
        const twinkle = reduce ? 1 : 0.82 + 0.18 * Math.sin(t * 2.1 + i * 0.7)
        const alpha = (0.14 + 0.82 * bright) * lf * twinkle
        if (alpha < 0.02) continue
        const r = dpr * (0.5 + 2.1 * bright)

        // Brightest stars lean toward the accent; faint ones stay ink.
        const m = bright * 0.65
        const cr = Math.round(ir + (ar - ir) * m)
        const cg = Math.round(ig + (ag - ig) * m)
        const cb = Math.round(ib + (ab - ib) * m)

        if (bright > 0.72) {
          ctx.shadowColor = `rgba(${ar}, ${ag}, ${ab}, ${0.5 * lf})`
          ctx.shadowBlur = dpr * 4
        }
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha.toFixed(3)})`
        ctx.fill()
        ctx.shadowBlur = 0
      }

      if (!reduce) raf = requestAnimationFrame(render)
    }
    raf = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [pv])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
