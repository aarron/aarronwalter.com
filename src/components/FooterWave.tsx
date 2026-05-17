'use client'

import { useEffect, useRef } from 'react'
import {
  TSUNAMI_CRESCENT_CITY,
  TSUNAMI_KAWAIHAE,
  TSUNAMI_SAN_FRANCISCO,
  TSUNAMI_METADATA,
} from '@/lib/tsunami-data'

// ── Station baselines (pre-tsunami quiet period) ───────────────────────────────
// normalize(v) = (v - center) / halfRange → ±1 = typical tidal swing
const STATIONS = [
  { data: TSUNAMI_KAWAIHAE,       ...TSUNAMI_METADATA.stations.kawaihae },
  { data: TSUNAMI_SAN_FRANCISCO,  ...TSUNAMI_METADATA.stations.sanFrancisco },
  { data: TSUNAMI_CRESCENT_CITY,  ...TSUNAMI_METADATA.stations.crescentCity },
] as const

// ── Layout ─────────────────────────────────────────────────────────────────────
const LINE_CY         = [0.38, 0.52, 0.63]    // vertical center per line (fraction of H)
const LINE_WIDTHS     = [1.0, 1.5, 1.2]
const WINDOW          = 90                      // data points visible at once (~9 h of data)
const CYCLE_SECS      = 96                      // seconds per full 24-h playback loop

// Dark-background palette (cream tones on dark footer)
const DARK_STROKES  = [
  'rgba(243, 231, 214, 0.22)',
  'rgba(243, 231, 214, 0.35)',
  'rgba(243, 231, 214, 0.15)',
]

// Light-background palette (ink tones on cream footer)
const LIGHT_STROKES = [
  'rgba(44, 42, 42, 0.13)',
  'rgba(44, 42, 42, 0.20)',
  'rgba(44, 42, 42, 0.09)',
]

export default function FooterWave({ color }: { color?: string }) {
  const isDark = Boolean(color)
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const strokes = isDark ? DARK_STROKES : LIGHT_STROKES

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
      const t = (now - t0) / 1000   // real seconds elapsed

      ctx!.clearRect(0, 0, w, h)

      // Sliding window: advances through 240 data points over CYCLE_SECS, then loops.
      // At the end of each cycle the smooth pre-tsunami waves seamlessly replace
      // the chaotic post-tsunami signal — a natural reset.
      const progress  = (t % CYCLE_SECS) / CYCLE_SECS
      const maxStart  = TSUNAMI_METADATA.totalReadings - WINDOW
      const startBase = Math.floor(progress * maxStart)

      // Tsunami peaks reach up to ±4.6 normalized units (Crescent City).
      // Derive ampH per-line from available headroom so the clip ceiling
      // exactly fills the space — guaranteed no overflow at any canvas size.
      const CLIP_MAX = 4.5

      for (let i = 0; i < 3; i++) {
        const { data, center, halfRange } = STATIONS[i]
        const cy      = LINE_CY[i] * h
        const maxRoom = Math.min(cy, h - cy) * 0.88   // 88% of nearest edge
        const ampH    = maxRoom / CLIP_MAX

        ctx!.beginPath()
        ctx!.lineJoin    = 'round'
        ctx!.lineCap     = 'round'
        ctx!.lineWidth   = LINE_WIDTHS[i]
        ctx!.strokeStyle = strokes[i]

        for (let s = 0; s < WINDOW; s++) {
          const idx = startBase + s
          const raw = data[idx] ?? 0

          // Normalize: ±1 = normal tidal swing. Tsunami peaks exceed ±1 naturally.
          const norm    = (raw - center) / halfRange
          const clipped = Math.sign(norm) * Math.min(Math.abs(norm), CLIP_MAX)

          const x = (s / (WINDOW - 1)) * w
          const y = cy - clipped * ampH
          s === 0 ? ctx!.moveTo(x, y) : ctx!.lineTo(x, y)
        }
        ctx!.stroke()
      }

      raf = requestAnimationFrame(draw)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    raf = requestAnimationFrame(draw)

    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [isDark])

  return (
    <canvas ref={ref} style={{ display: 'block', width: '100%', height: '100%' }} aria-hidden="true" />
  )
}
