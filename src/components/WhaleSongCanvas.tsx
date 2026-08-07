'use client'

import { useEffect, useRef } from 'react'
import { WHALE_SONG_DATA } from '@/lib/whale-song'

interface Props {
  className?: string
  /** Ink color (charcoal to match the site). */
  color?: [number, number, number]
  /** Peak opacity of the drawn spectrogram. */
  opacity?: number
}

/**
 * WhaleSongCanvas — renders a real humpback-whale-song spectrogram as an
 * ink-on-cream field: the melodic song units read as sweeping hooks, the
 * pulsed units as fine vertical strokes. The song drifts slowly and loops,
 * with a gentle "breath" in opacity. Data is a precomputed [time][freq]
 * magnitude grid (see src/data/whale-song.ts).
 */
export default function WhaleSongCanvas({
  className,
  color = [44, 42, 42],
  opacity = 0.42,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const data = WHALE_SONG_DATA
    const T = data.length
    const F = data[0].length
    const [cr, cg, cb] = color

    // ── Build the spectrogram once into an offscreen ink bitmap (T × F). ──
    const off = document.createElement('canvas')
    off.width = T
    off.height = F
    const octx = off.getContext('2d')!
    const img = octx.createImageData(T, F)
    for (let t = 0; t < T; t++) {
      for (let f = 0; f < F; f++) {
        const v = data[t][f]
        const y = F - 1 - f // low frequency at the bottom
        // Emphasize the low/mid band where the melodic "song units" live; let
        // the high-frequency broadband pulses fade so they don't dominate as
        // vertical rain once the short band is stretched tall.
        const hz = f / (F - 1) // 0 = low, 1 = high
        const weight = 0.28 + 0.72 * Math.pow(1 - hz, 1.35)
        const idx = (y * T + t) * 4
        img.data[idx] = cr
        img.data[idx + 1] = cg
        img.data[idx + 2] = cb
        img.data[idx + 3] = Math.round(Math.min(1, v * 1.25) * weight * 255)
      }
    }
    octx.putImageData(img, 0, 0)

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    let raf = 0
    let start = 0

    function resize() {
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.max(1, Math.round(rect.width * dpr))
      canvas.height = Math.max(1, Math.round(rect.height * dpr))
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // One "song copy" spans ~1.6 canvas widths so a portion is visible and
    // scrolls through — enough motion without over-stretching 340 columns.
    const SPAN = 1.6
    const SPEED = 26 // device-independent px/sec drift

    function draw(now: number) {
      if (!start) start = now
      const elapsed = (now - start) / 1000
      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

      const tileW = W * SPAN
      const shift = reduce ? 0 : (elapsed * SPEED * dpr) % tileW
      const breath = reduce ? opacity : opacity * (0.9 + 0.1 * Math.sin(elapsed * 0.5))
      ctx.globalAlpha = breath

      // Draw enough tiled copies (stretched to fill height) to cover the width.
      for (let x = -shift; x < W; x += tileW) {
        ctx.drawImage(off, 0, 0, T, F, x, 0, tileW, H)
      }
      ctx.globalAlpha = 1

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
