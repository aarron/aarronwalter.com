'use client'

import { useEffect, useRef } from 'react'

const PALETTE = [
  [255, 71, 37],   // Signal
  [133, 210, 255], // Sky
  [224, 235, 1],   // Volt
  [197, 202, 192], // Fog
  [255, 164, 204], // Blush
  [118, 1, 73],    // Plum
]

export default function GenerativeCanvas({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const w = rect.width
    const h = rect.height

    ctx.clearRect(0, 0, w, h)

    // Draw Richter-esque overlapping color blocks
    for (let i = 0; i < 90; i++) {
      const x = Math.random() * w * 1.2 - w * 0.1
      const y = Math.random() * h * 1.2 - h * 0.1
      const bw = 20 + Math.random() * 220
      const bh = 20 + Math.random() * 180
      const angle = (Math.random() - 0.5) * 0.55
      const [r, g, b] = PALETTE[Math.floor(Math.random() * PALETTE.length)]
      const alpha = 0.025 + Math.random() * 0.085

      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(angle)
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`
      ctx.fillRect(-bw / 2, -bh / 2, bw, bh)
      ctx.restore()
    }

    // A few larger, softer washes
    for (let i = 0; i < 12; i++) {
      const x = Math.random() * w
      const y = Math.random() * h
      const bw = 200 + Math.random() * 400
      const bh = 100 + Math.random() * 300
      const angle = (Math.random() - 0.5) * 0.3
      const [r, g, b] = PALETTE[Math.floor(Math.random() * PALETTE.length)]

      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(angle)
      ctx.fillStyle = `rgba(${r},${g},${b},0.018)`
      ctx.fillRect(-bw / 2, -bh / 2, bw, bh)
      ctx.restore()
    }
  }, [])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
