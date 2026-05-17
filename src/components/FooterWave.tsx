'use client'

import { useEffect, useRef } from 'react'

interface Line {
  /** Vertical centre as fraction of canvas height */
  cy: number
  /** Amplitude as fraction of canvas height */
  amp: number
  /** Overall time speed multiplier */
  speed: number
  /** Phase offset so lines start de-synced */
  phase: number
  strokeStyle: string
  lineWidth: number
}

const LINES: Line[] = [
  {
    cy: 0.42,
    amp: 0.38,
    speed: 1.0,
    phase: 0,
    strokeStyle: 'rgba(44, 42, 42, 0.20)',
    lineWidth: 1.2,
  },
  {
    cy: 0.52,
    amp: 0.30,
    speed: 0.73,
    phase: 2.1,
    strokeStyle: 'rgba(44, 42, 42, 0.13)',
    lineWidth: 1.5,
  },
  {
    cy: 0.60,
    amp: 0.42,
    speed: 1.28,
    phase: 4.7,
    strokeStyle: 'rgba(44, 42, 42, 0.09)',
    lineWidth: 1.0,
  },
]

export default function FooterWave({ color }: { color?: string }) {
  // `color` prop is accepted for API compatibility but the multi-line
  // version uses its own palette; pass it through if you want a single override.
  void color
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
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

    function drawLine(line: Line, t: number, w: number, h: number) {
      const { cy, amp, speed, phase, strokeStyle, lineWidth } = line
      const steps = 360
      const T = t * speed + phase

      ctx!.beginPath()

      for (let s = 0; s <= steps; s++) {
        const xn = s / steps

        // Breathing envelope — different per line due to speed & phase
        const envelope = 0.60 + 0.40 * Math.sin(xn * 2.3 - T * 0.18 + phase * 0.4)

        const disp = (
          Math.sin(xn *  6.8 + T * 0.58) * 0.48 +
          Math.sin(xn *  2.1 + T * 0.29) * 0.28 +
          Math.sin(xn * 11.3 + T * 0.91) * 0.14 +
          Math.sin(xn *  4.5 + T * 0.22) * 0.22 +
          Math.sin(xn *  0.9 - T * 0.11) * 0.12   // slow roll
        ) * envelope

        const x = xn * w
        const y = cy * h + disp * amp * h

        s === 0 ? ctx!.moveTo(x, y) : ctx!.lineTo(x, y)
      }

      ctx!.strokeStyle = strokeStyle
      ctx!.lineWidth   = lineWidth
      ctx!.lineJoin    = 'round'
      ctx!.lineCap     = 'round'
      ctx!.stroke()
    }

    function draw(now: number) {
      const w = canvas!.offsetWidth
      const h = canvas!.offsetHeight
      const t = (now - t0) * 0.00042

      ctx!.clearRect(0, 0, w, h)

      for (const line of LINES) {
        drawLine(line, t, w, h)
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
    <canvas ref={ref} style={{ display: 'block', width: '100%', height: '100%' }} />
  )
}
