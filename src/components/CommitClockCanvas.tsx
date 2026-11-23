'use client'

import { useEffect, useRef } from 'react'
import { getVizColors, usePaletteVersion, type RGB } from '@/lib/viz-colors'

export interface CommitTimes {
  start:  string               // ISO date of day 0 (the center of the spiral)
  days:   number               // span in days
  points: [number, number][]   // [day index, hour of day 0–24 in local time]
}

interface Props {
  data: CommitTimes
  className?: string
}

const LABELS = ['Midnight', '6 a.m.', 'Noon', '6 p.m.']
const mix = (a: RGB, b: RGB, t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t)) as RGB

/**
 * CommitClockCanvas — every commit as a tick on a 24-hour dial (midnight at the
 * top), spiraling outward from the first day at the center to today at the
 * edge. A hand sweeps once a minute, lighting the commits it has just passed.
 * Palette-aware; honors prefers-reduced-motion.
 */
export default function CommitClockCanvas({ data, className }: Props) {
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
    const ink = viz.inkRGB, accent = viz.accentRGB
    const { points, days, start } = data
    const months: number[] = []
    {
      const d = new Date(start + 'T00:00:00Z')
      d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() + 1)
      const t0 = Date.parse(start + 'T00:00:00Z')
      while ((d.getTime() - t0) / 864e5 < days) { months.push((d.getTime() - t0) / 864e5); d.setUTCMonth(d.getUTCMonth() + 1) }
    }

    let W = 0, H = 0
    const build = () => {
      const r = canvas.getBoundingClientRect()
      W = canvas.width = Math.max(1, Math.round(r.width * dpr))
      H = canvas.height = Math.max(1, Math.round(r.height * dpr))
    }
    build()
    const ro = new ResizeObserver(build)
    ro.observe(canvas)

    const angle = (h: number) => (h / 24) * Math.PI * 2 - Math.PI / 2

    let raf = 0, t0 = 0
    const frame = (now: number) => {
      if (!t0) t0 = now
      // Start the hand at 11 a.m., the busiest hour; one full turn per minute.
      const hand = reduce ? 11 : (11 + ((now - t0) / 60000) * 24) % 24
      ctx.clearRect(0, 0, W, H)

      // Dial sits upper right, like the record on the Listening page.
      const R = Math.min(W * 0.27, H * 0.36), cx = W - R - 80 * dpr, cy = H * 0.42, r0 = R * 0.14
      const [ir, ig, ib] = ink

      for (let h = 0; h < 24; h++) {
        const a = angle(h), long = h % 6 === 0
        ctx.strokeStyle = `rgba(${ir},${ig},${ib},${long ? 0.35 : 0.15})`
        ctx.lineWidth = dpr
        ctx.beginPath()
        ctx.moveTo(cx + Math.cos(a) * (R + 8 * dpr), cy + Math.sin(a) * (R + 8 * dpr))
        ctx.lineTo(cx + Math.cos(a) * (R + (long ? 20 : 13) * dpr), cy + Math.sin(a) * (R + (long ? 20 : 13) * dpr))
        ctx.stroke()
        if (long) {
          ctx.fillStyle = `rgba(${ir},${ig},${ib},0.45)`
          ctx.font = `${11 * dpr}px "aktiv-grotesk", sans-serif`
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
          ctx.fillText(LABELS[h / 6], cx + Math.cos(a) * (R + 38 * dpr), cy + Math.sin(a) * (R + 38 * dpr))
        }
      }
      ctx.strokeStyle = `rgba(${ir},${ig},${ib},0.07)`
      for (const m of months) {
        ctx.beginPath(); ctx.arc(cx, cy, r0 + (m / days) * (R - r0), 0, Math.PI * 2); ctx.stroke()
      }

      for (const [d, h] of points) {
        const a = angle(h), rr = r0 + ((d + h / 24) / days) * (R - r0)
        const since = (hand - h + 24) % 24                 // hours since the hand passed
        const glow = since < 3 ? 1 - since / 3 : 0
        const [r, g, b] = mix(ink, accent, 0.35 + 0.65 * glow)
        ctx.strokeStyle = `rgba(${r},${g},${b},${0.28 + 0.6 * glow})`
        ctx.lineWidth = (1 + glow) * dpr
        const len = (3 + glow * 4) * dpr
        ctx.beginPath()
        ctx.moveTo(cx + Math.cos(a) * (rr - len / 2), cy + Math.sin(a) * (rr - len / 2))
        ctx.lineTo(cx + Math.cos(a) * (rr + len / 2), cy + Math.sin(a) * (rr + len / 2))
        ctx.stroke()
      }

      const ha = angle(hand)
      ctx.strokeStyle = `rgba(${accent[0]},${accent[1]},${accent[2]},0.5)`
      ctx.lineWidth = 1.2 * dpr
      ctx.beginPath(); ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(ha) * (R + 6 * dpr), cy + Math.sin(ha) * (R + 6 * dpr))
      ctx.stroke()

      if (!reduce) raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [pv, data])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
