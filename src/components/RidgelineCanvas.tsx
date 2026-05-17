'use client'

import { useEffect, useRef } from 'react'

// ─── Colors ───────────────────────────────────────────────────────────────────
const BG_FILL = '#F3E7D6'
const INK_R   = 70
const INK_G   = 58
const INK_B   = 48

const LINES   = 55
const SAMPLES = 280

// ─── Seeded LCG — stable profiles across resize ───────────────────────────────
function lcg(seed: number) {
  let s = (seed ^ 0xdeadbeef) >>> 0
  return (): number => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 0x100000000
  }
}

const LINE_SEED: number[] = Array.from({ length: LINES }, (_, i) => {
  const r = lcg(i * 4919 + 98317)
  return r() * Math.PI * 6
})

// ─── Ridged fractal noise — Joy Division / CP 1919 aesthetic ─────────────────
//
//  Uses 1 − |sin(x)| per octave so peaks are sharp spikes (not smooth humps).
//  Slow per-octave drift creates the "radio signal from a distant star" feel.
//
function ridgeH(nx: number, lineIdx: number, t: number): number {
  const seed = LINE_SEED[lineIdx]
  const x    = nx * 5.5 + seed

  let h = 0, amp = 0.60, freq = 1.0
  for (let oct = 0; oct < 5; oct++) {
    const drift = t * (0.006 + oct * 0.004)
    const v     = Math.sin(x * freq * 3.1 + drift + seed * oct * 0.27)
    h   += amp * (1.0 - Math.abs(v))
    amp  *= 0.52
    freq *= 2.04
  }

  // Slow amplitude pulse — subtle "signal received" effect across the stack
  const signal = 1.0 + 0.10 * Math.sin(t * 0.38 + lineIdx * 0.21)
  return Math.max(0, h - 0.52) * signal
}

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
      const t = (now - t0) * 0.001

      ctx!.clearRect(0, 0, W, H)

      // Left → right gradient: invisible at left (near header text) → solid at right.
      // This mirrors HeroWaves' technique — one gradient shared across all line strokes.
      const grad = ctx!.createLinearGradient(0, 0, W, 0)
      grad.addColorStop(0.00, `rgba(${INK_R},${INK_G},${INK_B},0.000)`)
      grad.addColorStop(0.10, `rgba(${INK_R},${INK_G},${INK_B},0.010)`)
      grad.addColorStop(0.28, `rgba(${INK_R},${INK_G},${INK_B},0.080)`)
      grad.addColorStop(0.52, `rgba(${INK_R},${INK_G},${INK_B},0.175)`)
      grad.addColorStop(0.78, `rgba(${INK_R},${INK_G},${INK_B},0.230)`)
      grad.addColorStop(1.00, `rgba(${INK_R},${INK_G},${INK_B},0.255)`)

      const padTop  = H * 0.04
      const padBot  = H * 0.04
      const spacing = (H - padTop - padBot) / (LINES - 1)
      const maxAmp  = H * 0.10   // maximum peak height as fraction of canvas height

      ctx!.strokeStyle = grad   // set once; all lines share the horizontal fade
      ctx!.lineJoin    = 'round'

      // Top → bottom: each line's cream fill occludes everything drawn above it,
      // creating the Joy Division stacked-ridgeline depth illusion.
      for (let i = 0; i < LINES; i++) {
        const baseY    = padTop + i * spacing
        const lineNorm = i / (LINES - 1)   // 0 = top row, 1 = bottom row

        // Slow per-line amplitude breath — each row breathes independently
        const ampMod = 0.72 + 0.28 * Math.sin(i * 1.08 + t * 0.14)

        // Line weight: slightly fuller toward mid-stack, thinner at edges
        const stackMid = Math.abs(lineNorm - 0.5)
        ctx!.lineWidth = 0.45 + 0.65 * (1 - stackMid)

        // Sample ridge profile
        const pts: { x: number; y: number }[] = []
        for (let s = 0; s <= SAMPLES; s++) {
          const nx  = s / SAMPLES
          // x-envelope: flat at left edge, ramps up to full amplitude rightward.
          // This complements the gradient — lines are both dimmer AND shorter on the left.
          const thr = 0.18
          const env = nx <= thr ? 0 : Math.pow((nx - thr) / (1 - thr), 1.6)
          const h   = ridgeH(nx, i, t) * maxAmp * env * ampMod
          pts.push({ x: nx * W, y: baseY - h })
        }

        // Cream occlusion fill — same background color as the page.
        // Each line erases everything above it within its silhouette.
        ctx!.beginPath()
        ctx!.moveTo(pts[0].x, pts[0].y)
        for (let s = 1; s <= SAMPLES; s++) ctx!.lineTo(pts[s].x, pts[s].y)
        ctx!.lineTo(pts[SAMPLES].x, H + 10)
        ctx!.lineTo(pts[0].x,       H + 10)
        ctx!.closePath()
        ctx!.fillStyle = BG_FILL
        ctx!.fill()

        // Ridge stroke
        ctx!.beginPath()
        ctx!.moveTo(pts[0].x, pts[0].y)
        for (let s = 1; s <= SAMPLES; s++) ctx!.lineTo(pts[s].x, pts[s].y)
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
