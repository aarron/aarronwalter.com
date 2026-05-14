'use client'

import { useEffect, useRef } from 'react'

export default function FooterWave() {
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

    function draw(now: number) {
      const w = canvas!.offsetWidth
      const h = canvas!.offsetHeight
      const t = (now - t0) * 0.00042

      ctx!.clearRect(0, 0, w, h)

      const cy    = h * 0.50
      const amp   = h * 0.36
      const steps = 320

      ctx!.beginPath()

      for (let s = 0; s <= steps; s++) {
        const xn = s / steps

        // Traveling amplitude envelope — sections breathe independently
        const envelope = 0.68 + 0.32 * Math.sin(xn * 2.7 - t * 0.19)

        const disp = (
          Math.sin(xn *  7.0 + t * 0.55) * 0.52 +
          Math.sin(xn *  2.4 + t * 0.32) * 0.25 +
          Math.sin(xn * 13.0 + t * 0.88) * 0.15 +
          Math.sin(xn *  4.9 + t * 0.21) * 0.20
        ) * envelope

        const x = xn * w
        const y = cy + disp * amp

        s === 0 ? ctx!.moveTo(x, y) : ctx!.lineTo(x, y)
      }

      ctx!.strokeStyle = 'rgba(44, 42, 42, 0.18)'
      ctx!.lineWidth   = 1.1
      ctx!.lineJoin    = 'round'
      ctx!.lineCap     = 'round'
      ctx!.stroke()

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
