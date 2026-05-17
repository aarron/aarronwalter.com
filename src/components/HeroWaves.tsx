'use client'

import { useEffect, useRef } from 'react'

interface Props {
  className?: string
}

export default function HeroWaves({ className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf: number
    const t0 = performance.now()

    // ── Spike state ─────────────────────────────────────
    let spikeAmp    = 0
    let spikeLine   = 0.5
    let nextSpikeAt = 4.5   // real seconds

    // ── Mouse state ─────────────────────────────────────
    let mNormY  = 0.5   // mouse Y normalized 0–1 within canvas height
    let mSpeed  = 0     // smoothed speed (px / ms)
    let lastMx  = -1
    let lastMy  = -1
    let lastMt  = 0

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas!.getBoundingClientRect()
      const mx   = e.clientX - rect.left
      const my   = e.clientY - rect.top

      // Keep mNormY valid even when mouse is slightly outside canvas
      mNormY = Math.max(0, Math.min(1, my / canvas!.offsetHeight))

      if (lastMx >= 0) {
        const dt      = Math.max(e.timeStamp - lastMt, 1)
        const dx      = mx - lastMx
        const dy      = my - lastMy
        const instant = Math.sqrt(dx * dx + dy * dy) / dt  // px/ms
        // EMA blend — reacts quickly, smooths jitter
        mSpeed = mSpeed * 0.55 + instant * 0.45
      }
      lastMx = mx; lastMy = my; lastMt = e.timeStamp
    }
    window.addEventListener('mousemove', onMouseMove)

    function resize() {
      const dpr       = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width   = canvas!.offsetWidth  * dpr
      canvas!.height  = canvas!.offsetHeight * dpr
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    // Smooth multi-harmonic base wave — slow & organic
    function baseWave(xn: number, phase: number, t: number): number {
      const x  = xn * 9
      const h1 = Math.sin(x * 0.85 + t * 0.52 + phase)
      const h2 = Math.sin(x * 2.15 + t * 1.08 + phase * 1.45) * 0.52
      const h3 = Math.sin(x * 0.38 + t * 0.37 + phase * 0.62) * 0.40
      const h4 = Math.sin(x * 4.70 + t * 1.82 + phase * 0.25) * 0.15
      const h5 = Math.sin(x * 1.55 + t * 0.78 + phase * 1.85) * 0.23
      const h6 = Math.sin(x * 7.30 + t * 2.60 + phase * 0.50) * 0.07
      return (h1 + h2 + h3 + h4 + h5 + h6) / 2.37
    }

    // Sharp high-frequency spike wave — used for both timed spikes and mouse agitation
    function sharpWave(xn: number, phase: number, t: number, speed: number): number {
      const x  = xn * 9
      // Faster harmonics for spikes, mouse speed shifts the rate
      const tMod = t * (1 + speed * 6)
      const s1 = Math.sin(x * 11.0 + tMod * 18.0 + phase * 0.8)
      const s2 = Math.sin(x *  6.5 + tMod * 12.5 + phase * 1.2) * 0.55
      const s3 = Math.sin(x * 18.0 + tMod * 28.0 + phase * 0.3) * 0.30
      const raw = (s1 + s2 + s3) / 1.85
      // Square the peaks so they poke up hard and fast
      return raw > 0 ? raw * raw * 1.5 : raw * 0.55
    }

    function draw(now: number) {
      const w  = canvas!.offsetWidth
      const h  = canvas!.offsetHeight
      const t  = (now - t0) * 0.00048   // slow time
      const ts = (now - t0) / 1000       // real seconds

      ctx!.clearRect(0, 0, w, h)

      // ── Mouse decay (each frame) ─────────────────────
      mSpeed *= 0.970
      // Mouse boost: 0 at rest, up to ~2 at fast movement — kept intentionally gentle
      const mouseBoost = Math.min(mSpeed * 1.1, 2.0)

      // ── Timed spike logic ────────────────────────────
      spikeAmp *= 0.963
      if (ts > nextSpikeAt && spikeAmp < 0.08) {
        spikeAmp    = 2.8 + Math.random() * 3.2
        spikeLine   = 0.1  + Math.random() * 0.8
        nextSpikeAt = ts   + 3.5 + Math.random() * 9
      }

      // Horizontal gradient: invisible on the left (text), opens up rightward
      const grad = ctx!.createLinearGradient(0, 0, w, 0)
      grad.addColorStop(0.00, 'rgba(70, 58, 48, 0.000)')
      grad.addColorStop(0.10, 'rgba(70, 58, 48, 0.008)')
      grad.addColorStop(0.22, 'rgba(70, 58, 48, 0.055)')
      grad.addColorStop(0.40, 'rgba(70, 58, 48, 0.115)')
      grad.addColorStop(0.65, 'rgba(70, 58, 48, 0.165)')
      grad.addColorStop(0.85, 'rgba(70, 58, 48, 0.200)')
      grad.addColorStop(1.00, 'rgba(70, 58, 48, 0.225)')

      // Scale line count to canvas height (~1 line / 16px) so density stays
      // consistent whether the canvas covers just the hero or hero + work
      const numLines = Math.min(Math.round(h / 16), 130)
      const padTop   = h * 0.04
      const padBot   = h * 0.04
      const spacing  = (h - padTop - padBot) / (numLines - 1)
      const maxAmp   = h * 0.11
      const steps    = 220

      ctx!.strokeStyle = grad
      ctx!.lineJoin    = 'round'

      for (let i = 0; i < numLines; i++) {
        const baseY    = padTop + i * spacing
        const phase    = i * 0.365
        const lineNorm = i / (numLines - 1)  // 0 → 1 top to bottom

        // Slow per-line amplitude breath
        const ampMod = 0.68 + 0.32 * Math.sin(i * 1.08 + t * 0.14)

        // Timed spike influence — Gaussian bell around spikeLine row
        const distSpike    = Math.abs(lineNorm - spikeLine)
        const spikeInfluence = spikeAmp * Math.exp(-distSpike * distSpike * 20)

        // Mouse influence — reacts to proximity to mouse Y + current speed
        const distMouse    = Math.abs(lineNorm - mNormY)
        // Wider spread (σ ≈ 0.22) so several rows react together
        const mouseInfluence = mouseBoost * Math.exp(-distMouse * distMouse * 20)

        const totalBoost = spikeInfluence + mouseInfluence

        // Line weight: thicker toward mid-stack; bolder during excitation
        const stackMid    = Math.abs(lineNorm - 0.5)
        ctx!.lineWidth    = 0.55 + 0.50 * (1 - stackMid) + Math.min(totalBoost * 0.22, 0.6)

        // Amplitude envelope: zero on left, quadratic ramp rightward
        ctx!.beginPath()
        for (let s = 0; s <= steps; s++) {
          const xn     = s / steps
          const x      = xn * w
          const thresh = 0.18
          const env    = xn <= thresh ? 0 : Math.pow((xn - thresh) / (1 - thresh), 2.05)
          const amp    = maxAmp * env * ampMod

          // Base wave + spike/mouse overlay
          const bDisp = baseWave(xn, phase, t) * amp
          // During excitation, gently boost the base AND add a softer sharp component
          const boostedBase = baseWave(xn, phase, t) * amp * (1 + totalBoost * 0.50)
          const sharpDisp   = totalBoost > 0.08
            ? sharpWave(xn, phase, t, mouseBoost * 0.15) * totalBoost * amp * 0.35
            : 0

          const y = baseY - (bDisp * 0.5 + boostedBase * 0.5 + sharpDisp)
          s === 0 ? ctx!.moveTo(x, y) : ctx!.lineTo(x, y)
        }
        ctx!.stroke()
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
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
