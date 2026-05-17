'use client'

import { useEffect, useRef } from 'react'
import { PULSAR_DATA } from '@/lib/pulsar-data'

// ─── Colors — match the rest of the site palette ──────────────────────────────
const BG_FILL = '#F3E7D6'   // cream background
const INK_R   = 70
const INK_G   = 58
const INK_B   = 48

// ─── Data constants ───────────────────────────────────────────────────────────
// PSR B1919+21 (CP 1919) — 80 pulse periods × 300 time samples
// Observed at 318 MHz, Arecibo Observatory, 1970
const ROWS     = PULSAR_DATA.length        // 80
const COLS     = PULSAR_DATA[0].length     // 300
const DATA_MAX = 74.31                     // max value in dataset

// ─── Component ────────────────────────────────────────────────────────────────
export default function RidgelineCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
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
      const t = (now - t0) * 0.001   // seconds elapsed

      ctx!.clearRect(0, 0, W, H)

      // ── Gradient: ghost on the left (toward header text), solid on the right ──
      // Matches the pattern used in HeroWaves — one gradient shared by all strokes.
      const grad = ctx!.createLinearGradient(0, 0, W, 0)
      grad.addColorStop(0.00, `rgba(${INK_R},${INK_G},${INK_B},0.000)`)
      grad.addColorStop(0.08, `rgba(${INK_R},${INK_G},${INK_B},0.018)`)
      grad.addColorStop(0.25, `rgba(${INK_R},${INK_G},${INK_B},0.090)`)
      grad.addColorStop(0.50, `rgba(${INK_R},${INK_G},${INK_B},0.185)`)
      grad.addColorStop(0.78, `rgba(${INK_R},${INK_G},${INK_B},0.235)`)
      grad.addColorStop(1.00, `rgba(${INK_R},${INK_G},${INK_B},0.260)`)

      // ── Layout ────────────────────────────────────────────────────────────────
      const padTop  = H * 0.04
      const padBot  = H * 0.04
      const spacing = (H - padTop - padBot) / (ROWS - 1)

      // Scale so the absolute max value occupies ~3 line-spacings of height.
      // This reproduces the original stacked-ridgeline proportions.
      const ampScale = (spacing * 3.0) / DATA_MAX

      ctx!.strokeStyle = grad
      ctx!.lineJoin    = 'round'

      // ── Draw back → front (row 0 at top, row 79 at bottom) ───────────────────
      // Each row's cream fill occludes everything drawn above it, creating the
      // Joy Division stacked-ridgeline depth illusion with real pulsar data.
      for (let row = 0; row < ROWS; row++) {
        const baseY    = padTop + row * spacing
        const rowNorm  = row / (ROWS - 1)     // 0 = top, 1 = bottom
        const data     = PULSAR_DATA[row]

        // ── Subtle animation ───────────────────────────────────────────────────
        // A slow traveling brightness wave moves through the stack at roughly
        // the pulsar's actual period (1.3373 s) — like receiving the signal live.
        // The wave is kept very gentle so it doesn't distort the data shape.
        const pulsarPhase = (t / 1.3373) * Math.PI * 2
        const waveMod     = 1.0 + 0.06 * Math.sin(pulsarPhase - row * 0.10)

        // Slow per-line amplitude breath — independent for each row
        const breathMod   = 1.0 + 0.04 * Math.sin(t * 0.31 + row * 0.47)

        const totalMod = waveMod * breathMod

        // Line weight: slightly fuller toward mid-stack, thinner at edges
        const stackMid = Math.abs(rowNorm - 0.5)
        ctx!.lineWidth = 0.45 + 0.60 * (1 - stackMid)

        // ── Sample the real pulsar data ────────────────────────────────────────
        const pts: { x: number; y: number }[] = []
        for (let s = 0; s < COLS; s++) {
          const nx        = s / (COLS - 1)
          const x         = nx * W
          // Clip negative values to baseline — noise floor sits near zero,
          // negative excursions are instrument noise not real signal
          const intensity = Math.max(0, data[s])
          // x-envelope: flat at left edge (header side), opens up rightward.
          // Doubles down on the gradient so lines physically shrink as they
          // approach the left margin, not just dim.
          const thr = 0.14
          const env = nx <= thr ? 0 : Math.pow((nx - thr) / (1 - thr), 1.4)
          const y   = baseY - intensity * ampScale * env * totalMod
          pts.push({ x, y })
        }

        // Cream occlusion fill — erases lines drawn above within this row's silhouette
        ctx!.beginPath()
        ctx!.moveTo(pts[0].x, pts[0].y)
        for (let s = 1; s < COLS; s++) ctx!.lineTo(pts[s].x, pts[s].y)
        ctx!.lineTo(pts[COLS - 1].x, H + 10)
        ctx!.lineTo(pts[0].x,        H + 10)
        ctx!.closePath()
        ctx!.fillStyle = BG_FILL
        ctx!.fill()

        // Ridge stroke — inherits the horizontal gradient set above
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
  }, [])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
