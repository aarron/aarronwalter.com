'use client'

import { useEffect, useRef } from 'react'

// ─── Visual constants ──────────────────────────────────────────────────────────

const BG_FILL  = '#F3E7D6'   // cream — masks lines behind each ridge
const INK_R    = 44
const INK_G    = 42
const INK_B    = 42

const LINES    = 46           // number of ridgelines
const SAMPLES  = 260          // x-samples per line — smooth but fast

// Noise amplitude as fraction of available height per line slot
const BASE_AMP = 0.55

// Spike parameters
const MAX_SPIKES       = 7
const SPIKE_RISE_MS    = 160   // fast snap up
const SPIKE_HOLD_MS    = 120   // brief plateau
const SPIKE_DECAY_MS   = 700   // graceful fade
const SPIKE_TOTAL_MS   = SPIKE_RISE_MS + SPIKE_HOLD_MS + SPIKE_DECAY_MS
const SPAWN_INTERVAL_MIN = 600
const SPAWN_INTERVAL_MAX = 2200

interface Spike {
  nx:   number   // normalized x position 0–1
  maxH: number   // peak height in px (at front line)
  σ:    number   // horizontal spread in normalized units
  born: number   // timestamp ms
}

// ─── Smooth layered noise ──────────────────────────────────────────────────────
// Returns value in roughly –1…1

function noiseAt(nx: number, lineIdx: number, t: number): number {
  const x = nx * Math.PI * 2
  const l = lineIdx / LINES
  return (
    0.48 * Math.sin(x * 2.3  + t * 0.22 + l * 1.9) *
           Math.sin(x * 0.7  - t * 0.14 + l * 0.8) +
    0.28 * Math.sin(x * 4.1  + t * 0.38 + l * 2.5 + 1.3) +
    0.16 * Math.sin(x * 1.05 - t * 0.19 + l * 1.1 + 2.7) +
    0.08 * Math.sin(x * 7.6  + t * 0.55 + l * 0.6 + 0.4)
  )
}

// ─── Spike envelope: rise → hold → decay ──────────────────────────────────────

function spikeEnvelope(age: number): number {
  if (age < 0) return 0
  if (age < SPIKE_RISE_MS) {
    return age / SPIKE_RISE_MS                             // linear snap up
  }
  if (age < SPIKE_RISE_MS + SPIKE_HOLD_MS) {
    return 1                                               // plateau
  }
  const decay = age - SPIKE_RISE_MS - SPIKE_HOLD_MS
  return 1 - decay / SPIKE_DECAY_MS                       // linear decay
}

function spikeContrib(nx: number, depthFrac: number, spikes: Spike[], now: number): number {
  let total = 0
  for (const s of spikes) {
    const age = now - s.born
    if (age < 0 || age > SPIKE_TOTAL_MS) continue
    const env  = spikeEnvelope(age)
    const dist = nx - s.nx
    const gaus = Math.exp(-(dist * dist) / (2 * s.σ * s.σ))
    total += s.maxH * env * gaus * (0.25 + 0.75 * depthFrac)
  }
  return total
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RidgelineCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Bail immediately if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf: number
    const spikes: Spike[] = []
    let lastSpawn  = 0
    let nextDelay  = SPAWN_INTERVAL_MIN
    const t0       = performance.now()

    function resize() {
      const dpr = Math.min(window.devicePixelRatio ?? 1, 2)
      canvas!.width  = canvas!.offsetWidth  * dpr
      canvas!.height = canvas!.offsetHeight * dpr
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function draw(now: number) {
      const w = canvas!.offsetWidth
      const h = canvas!.offsetHeight
      const t = (now - t0) * 0.001

      // ── Prune dead spikes ───────────────────────────────────────────────────
      for (let i = spikes.length - 1; i >= 0; i--) {
        if (now - spikes[i].born > SPIKE_TOTAL_MS) spikes.splice(i, 1)
      }

      // ── Spawn new spike ─────────────────────────────────────────────────────
      if (now - lastSpawn > nextDelay && spikes.length < MAX_SPIKES) {
        lastSpawn  = now
        nextDelay  = SPAWN_INTERVAL_MIN + Math.random() * (SPAWN_INTERVAL_MAX - SPAWN_INTERVAL_MIN)
        const slotH = h / LINES
        spikes.push({
          nx:   0.05 + Math.random() * 0.90,
          maxH: slotH * (1.8 + Math.random() * 3.5),   // 2–5× a line slot
          σ:    0.018 + Math.random() * 0.040,
          born: now,
        })
      }

      ctx!.clearRect(0, 0, w, h)

      // ── Draw ridgelines back → front ────────────────────────────────────────
      const slotH = h / LINES

      for (let i = 0; i < LINES; i++) {
        const depthFrac = i / (LINES - 1)           // 0 = back, 1 = front
        const baseY     = slotH * (i + 0.5)         // vertical centre of this slot

        // Amplitude: front lines larger — depth cue
        const amp = slotH * BASE_AMP * (0.2 + 0.8 * depthFrac)

        // Pre-compute y positions
        const ys = new Float32Array(SAMPLES + 1)
        for (let s = 0; s <= SAMPLES; s++) {
          const nx = s / SAMPLES
          const n  = noiseAt(nx, i, t)
          // Push noise upward only (positive peaks), flatten troughs slightly
          const noiseH = n > 0 ? n * amp * 1.6 : n * amp * 0.35
          const spike  = spikeContrib(nx, depthFrac, spikes, now)
          ys[s] = baseY - noiseH - spike
        }

        // ── Filled mask — cream below the ridgeline ─────────────────────────
        ctx!.beginPath()
        ctx!.moveTo(0, ys[0])
        for (let s = 1; s <= SAMPLES; s++) {
          ctx!.lineTo((s / SAMPLES) * w, ys[s])
        }
        // Close down to below the canvas so the fill fully masks
        ctx!.lineTo(w, h + 2)
        ctx!.lineTo(0, h + 2)
        ctx!.closePath()
        ctx!.fillStyle = BG_FILL
        ctx!.fill()

        // ── Stroke — the ridgeline itself ───────────────────────────────────
        // Opacity: back lines subtler, front lines bolder
        const alpha = 0.18 + 0.52 * depthFrac
        ctx!.beginPath()
        ctx!.moveTo(0, ys[0])
        for (let s = 1; s <= SAMPLES; s++) {
          ctx!.lineTo((s / SAMPLES) * w, ys[s])
        }
        ctx!.strokeStyle = `rgba(${INK_R},${INK_G},${INK_B},${alpha.toFixed(3)})`
        ctx!.lineWidth   = 0.6 + depthFrac * 0.6
        ctx!.lineJoin    = 'round'
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
    }
  }, [])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
