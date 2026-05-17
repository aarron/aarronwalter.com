'use client'

import { useEffect, useRef } from 'react'
import { PULSAR_DATA } from '@/lib/pulsar-data'

// ─── Colors ───────────────────────────────────────────────────────────────────
const BG_FILL = '#F3E7D6'
const INK_R   = 70
const INK_G   = 58
const INK_B   = 48

interface Props {
  className?: string
  /** Row × column data matrix. Defaults to PSR B1919+21 pulsar data. */
  data?: number[][]
  /**
   * "Typical strong peak" value used for amplitude scaling.
   * A value equal to ampRef will rise exactly 3.5 line-spacings.
   * Pulsar data uses 15 (raw intensity units).
   * Normalized data ([-1, +1]) should use ~0.30–0.40.
   */
  ampRef?: number
  /**
   * Animation style:
   *   'pulsar'  — brightness wave at the pulsar's actual 1.3373 s period (default)
   *   'breath'  — slow independent per-row amplitude breathing only
   */
  animate?: 'pulsar' | 'breath'
}

export default function RidgelineCanvas({
  className,
  data: propData,
  ampRef: propAmpRef,
  animate = 'pulsar',
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const data   = propData ?? PULSAR_DATA
    const ROWS   = data.length
    const COLS   = data[0].length
    const AMP_REF = propAmpRef ?? 15

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf: number
    const t0 = performance.now()

    function resize() {
      const dpr = Math.min(window.devicePixelRatio ?? 1, 2)
      canvas!.width  = canvas!.offsetWidth  * dpr
      canvas!.height = canvas!.offsetHeight * dpr
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function draw(now: number) {
      const W = canvas!.offsetWidth
      const H = canvas!.offsetHeight
      const t = (now - t0) * 0.001

      ctx!.clearRect(0, 0, W, H)

      // Horizontal gradient: transparent on the left (toward header text), solid on the right
      const grad = ctx!.createLinearGradient(0, 0, W, 0)
      grad.addColorStop(0.00, `rgba(${INK_R},${INK_G},${INK_B},0.000)`)
      grad.addColorStop(0.08, `rgba(${INK_R},${INK_G},${INK_B},0.018)`)
      grad.addColorStop(0.25, `rgba(${INK_R},${INK_G},${INK_B},0.090)`)
      grad.addColorStop(0.50, `rgba(${INK_R},${INK_G},${INK_B},0.185)`)
      grad.addColorStop(0.78, `rgba(${INK_R},${INK_G},${INK_B},0.235)`)
      grad.addColorStop(1.00, `rgba(${INK_R},${INK_G},${INK_B},0.260)`)

      const padTop  = H * 0.03
      const padBot  = H * 0.03
      const spacing = (H - padTop - padBot) / (ROWS - 1)
      const ampScale = (spacing * 3.5) / AMP_REF

      ctx!.strokeStyle = grad
      ctx!.lineJoin    = 'round'

      for (let row = 0; row < ROWS; row++) {
        const baseY   = padTop + row * spacing
        const rowNorm = row / (ROWS - 1)
        const rowData = data[row]

        // Pulsar mode: brightness wave at the pulsar's actual 1.3373 s period
        const pulsarMod = animate === 'pulsar'
          ? 1.0 + 0.10 * Math.sin((t / 1.3373) * Math.PI * 2 - row * 0.15)
          : 1.0

        // Both modes: per-row amplitude breath — each row has its own period offset
        // so waves cascade visibly down the stack rather than pulsing in sync
        const breathMod = 1.0 + 0.14 * Math.sin(t * 0.52 + row * 0.61)
          + 0.05 * Math.sin(t * 0.19 + row * 0.23)

        const totalMod = pulsarMod * breathMod

        const stackMid = Math.abs(rowNorm - 0.5)
        ctx!.lineWidth = 0.45 + 0.60 * (1 - stackMid)

        const pts: { x: number; y: number }[] = []
        for (let s = 0; s < COLS; s++) {
          const nx        = s / (COLS - 1)
          const x         = nx * W
          const intensity = Math.max(0, rowData[s])
          const y         = baseY - intensity * ampScale * totalMod
          pts.push({ x, y })
        }

        // Cream occlusion fill — erases lines above within this row's silhouette
        ctx!.beginPath()
        ctx!.moveTo(pts[0].x, pts[0].y)
        for (let s = 1; s < COLS; s++) ctx!.lineTo(pts[s].x, pts[s].y)
        ctx!.lineTo(pts[COLS - 1].x, H + 10)
        ctx!.lineTo(pts[0].x,        H + 10)
        ctx!.closePath()
        ctx!.fillStyle = BG_FILL
        ctx!.fill()

        // Ridge stroke
        ctx!.beginPath()
        ctx!.moveTo(pts[0].x, pts[0].y)
        for (let s = 1; s < COLS; s++) ctx!.lineTo(pts[s].x, pts[s].y)
        ctx!.stroke()
      }

      raf = requestAnimationFrame(draw)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    raf = requestAnimationFrame(draw)

    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [propData, propAmpRef, animate])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
