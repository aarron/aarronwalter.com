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
      const dpr     = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width  = canvas!.offsetWidth  * dpr
      canvas!.height = canvas!.offsetHeight * dpr
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function draw(now: number) {
      const w = canvas!.offsetWidth
      const h = canvas!.offsetHeight
      const t = (now - t0) * 0.00042  // same slow drift as the hero

      ctx!.clearRect(0, 0, w, h)

      const cy    = h * 0.5   // vertical center of the canvas
      const amp   = h * 0.28  // gentle displacement — stays well within the canvas
      const steps = 280

      ctx!.beginPath()

      for (let s = 0; s <= steps; s++) {
        const xn = s / steps
        const x  = xn * w

        // Intentionally fewer harmonics than the hero for a calmer, cleaner line
        const disp =
          Math.sin(xn * 7.0 + t * 0.55) * 0.55 +
          Math.sin(xn * 2.4 + t * 0.32) * 0.28 +
          Math.sin(xn * 13  + t * 0.90) * 0.17

        const y = cy + disp * amp

        s === 0 ? ctx!.moveTo(x, y) : ctx!.lineTo(x, y)
      }

      ctx!.strokeStyle = 'rgba(243, 231, 214, 0.18)'
      ctx!.lineWidth   = 1
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
