'use client'

import { useEffect, useRef } from 'react'

interface LineConfig {
  cy: number
  amp: number
  speed: number
  phase: number
  strokeStyle: string
  lineWidth: number
}

// Dark-background palette (cream/paper tones)
const DARK_BG_LINES: LineConfig[] = [
  { cy: 0.42, amp: 0.38, speed: 1.00, phase: 0.0, strokeStyle: 'rgba(243, 231, 214, 0.35)', lineWidth: 1.2 },
  { cy: 0.52, amp: 0.30, speed: 0.73, phase: 2.1, strokeStyle: 'rgba(243, 231, 214, 0.20)', lineWidth: 1.5 },
  { cy: 0.60, amp: 0.42, speed: 1.28, phase: 4.7, strokeStyle: 'rgba(243, 231, 214, 0.12)', lineWidth: 1.0 },
]

// Light-background palette (ink tones)
const LIGHT_BG_LINES: LineConfig[] = [
  { cy: 0.42, amp: 0.38, speed: 1.00, phase: 0.0, strokeStyle: 'rgba(44, 42, 42, 0.20)', lineWidth: 1.2 },
  { cy: 0.52, amp: 0.30, speed: 0.73, phase: 2.1, strokeStyle: 'rgba(44, 42, 42, 0.13)', lineWidth: 1.5 },
  { cy: 0.60, amp: 0.42, speed: 1.28, phase: 4.7, strokeStyle: 'rgba(44, 42, 42, 0.09)', lineWidth: 1.0 },
]

export default function FooterWave({ color }: { color?: string }) {
  // color prop: when provided the footer sits on a dark background → use cream lines
  const isDark = Boolean(color)
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const lines = isDark ? DARK_BG_LINES : LIGHT_BG_LINES

    let raf: number
    const t0 = performance.now()

    function resize() {
      const dpr      = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width  = canvas!.offsetWidth  * dpr
      canvas!.height = canvas!.offsetHeight * dpr
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function drawLine(line: LineConfig, t: number, w: number, h: number) {
      const { cy, amp, speed, phase, strokeStyle, lineWidth } = line
      const steps = 360
      const T = t * speed + phase

      ctx!.beginPath()

      for (let s = 0; s <= steps; s++) {
        const xn = s / steps

        const envelope = 0.60 + 0.40 * Math.sin(xn * 2.3 - T * 0.18 + phase * 0.4)

        const disp = (
          Math.sin(xn *  6.8 + T * 0.58) * 0.48 +
          Math.sin(xn *  2.1 + T * 0.29) * 0.28 +
          Math.sin(xn * 11.3 + T * 0.91) * 0.14 +
          Math.sin(xn *  4.5 + T * 0.22) * 0.22 +
          Math.sin(xn *  0.9 - T * 0.11) * 0.12
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

      for (const line of lines) {
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
  }, [isDark])

  return (
    <canvas ref={ref} style={{ display: 'block', width: '100%', height: '100%' }} aria-hidden="true" />
  )
}
