'use client'

import { useEffect, useRef } from 'react'
import { WHALE_SONG_CONTOUR, type ContourPoint } from '@/lib/whale-song'

interface Props {
  className?: string
  /** Ink color (charcoal to match the site). */
  color?: [number, number, number]
  /** Peak opacity of the drawn contour. */
  opacity?: number
}

/**
 * WhaleSongCanvas — draws the humpback song's melodic pitch contour as crisp
 * vector ink strokes on cream: each phrase is a flowing line that sweeps up and
 * down with the whale's pitch. The song drifts slowly and loops, with a gentle
 * "breath" in opacity. Honors prefers-reduced-motion. Data is a precomputed set
 * of [x, y, strength] phrases (see src/lib/whale-song.ts).
 */
export default function WhaleSongCanvas({
  className,
  color = [44, 42, 42],
  opacity = 0.6,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const [cr, cg, cb] = color
    const inkRGB = `${cr}, ${cg}, ${cb}`

    // Precompute per-phrase average strength (drives width + opacity).
    const phrases = WHALE_SONG_CONTOUR.map((pts) => {
      const avg = pts.reduce((a, p) => a + p[2], 0) / Math.max(1, pts.length)
      return { pts, avg }
    })

    // Vertical band the pitch maps into (fractions of height).
    const BAND_TOP = 0.16
    const BAND_BOTTOM = 0.9
    const SPAN = 1.5 // one song copy spans 1.5 canvas widths
    const SPEED = 22 // device-independent px/sec drift

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    let raf = 0
    let start = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.max(1, Math.round(rect.width * dpr))
      canvas.height = Math.max(1, Math.round(rect.height * dpr))
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // Draw one phrase as a smoothed polyline at horizontal offset `ox` (px).
    const drawPhrase = (pts: ContourPoint[], ox: number, songW: number, H: number) => {
      const X = (p: ContourPoint) => ox + p[0] * songW
      const Y = (p: ContourPoint) => H * (BAND_BOTTOM - p[1] * (BAND_BOTTOM - BAND_TOP))
      ctx.beginPath()
      ctx.moveTo(X(pts[0]), Y(pts[0]))
      if (pts.length === 1) {
        ctx.lineTo(X(pts[0]) + 0.5, Y(pts[0]))
      } else {
        for (let i = 1; i < pts.length - 1; i++) {
          const mx = (X(pts[i]) + X(pts[i + 1])) / 2
          const my = (Y(pts[i]) + Y(pts[i + 1])) / 2
          ctx.quadraticCurveTo(X(pts[i]), Y(pts[i]), mx, my)
        }
        const last = pts[pts.length - 1]
        ctx.lineTo(X(last), Y(last))
      }
      ctx.stroke()
    }

    const draw = (now: number) => {
      if (!start) start = now
      const elapsed = (now - start) / 1000
      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      const songW = W * SPAN
      const shift = reduce ? 0 : (elapsed * SPEED * dpr) % songW
      const breath = reduce ? 1 : 0.92 + 0.08 * Math.sin(elapsed * 0.5)

      // Two copies side by side for a seamless horizontal loop.
      for (const base of [-shift, -shift + songW]) {
        for (const { pts, avg } of phrases) {
          ctx.lineWidth = dpr * (1.0 + 0.9 * avg)
          ctx.strokeStyle = `rgba(${inkRGB}, ${opacity * (0.4 + 0.6 * avg) * breath})`
          drawPhrase(pts, base, songW, H)
        }
      }

      if (!reduce) raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [color, opacity])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
