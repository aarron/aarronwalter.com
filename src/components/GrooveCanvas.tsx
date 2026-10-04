'use client'

import { useEffect, useRef } from 'react'
import { VOYAGER_GROOVE } from '@/lib/voyager-groove'
import { getVizColors, usePaletteVersion } from '@/lib/viz-colors'

interface Props {
  className?: string
}

/**
 * GrooveCanvas — the Voyager Golden Record "Sounds of Earth" loudness envelope
 * drawn as a spinning vinyl record: an Archimedean spiral whose grooves bulge
 * with the recording's volume and tint from ink toward the palette accent where
 * it's loud. Rotates slowly. Palette-aware; honors prefers-reduced-motion.
 */
export default function GrooveCanvas({ className }: Props) {
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
    const data = VOYAGER_GROOVE
    const N = data.length
    const TURNS = 62

    let off: HTMLCanvasElement | null = null
    let offSize = 0
    let cx = 0
    let cy = 0

    const build = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.max(1, Math.round(rect.width * dpr))
      canvas.height = Math.max(1, Math.round(rect.height * dpr))

      const R = Math.min(canvas.width, canvas.height) * 0.72
      const rInner = R * 0.17
      offSize = Math.ceil(R * 2 + 4)

      off = document.createElement('canvas')
      off.width = offSize
      off.height = offSize
      const o = off.getContext('2d')!
      const ocx = offSize / 2
      const ocy = offSize / 2
      const spacing = (R - rInner) / TURNS
      const thetaMax = TURNS * 2 * Math.PI
      const [ir, ig, ib] = viz.inkRGB
      const [ar, ag, ab] = viz.accentRGB

      o.lineWidth = Math.max(1, dpr * 0.9)
      o.lineJoin = 'round'
      o.lineCap = 'round'

      let px = 0
      let py = 0
      for (let i = 0; i < N; i++) {
        const t = i / (N - 1)
        const theta = t * thetaMax
        const baseR = R - (R - rInner) * t
        const a = data[i]
        const rr = baseR - a * spacing * 0.92 // groove bulges inward with loudness
        const x = ocx + rr * Math.cos(theta)
        const y = ocy + rr * Math.sin(theta)
        if (i > 0) {
          const mr = Math.round(ir + (ar - ir) * a)
          const mg = Math.round(ig + (ag - ig) * a)
          const mb = Math.round(ib + (ab - ib) * a)
          o.strokeStyle = `rgba(${mr}, ${mg}, ${mb}, ${0.22 + 0.5 * a})`
          o.beginPath()
          o.moveTo(px, py)
          o.lineTo(x, y)
          o.stroke()
        }
        px = x
        py = y
      }

      // Record sits upper-right, bleeding past the edges.
      cx = canvas.width * 0.74
      cy = canvas.height * 0.4
    }

    build()
    const ro = new ResizeObserver(build)
    ro.observe(canvas)

    let raf = 0
    let start = 0
    const frame = (now: number) => {
      if (!start) start = now
      const elapsed = (now - start) / 1000
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (off) {
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(reduce ? 0 : elapsed * 0.28) // ~2.7 rpm — a gently turning record
        ctx.drawImage(off, -offSize / 2, -offSize / 2)
        ctx.restore()
      }
      if (!reduce) raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [pv])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
