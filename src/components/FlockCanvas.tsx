'use client'

import { useEffect, useRef } from 'react'

// Ink color — same palette as the rest of the site
const INK: [number, number, number] = [44, 42, 42]

const COUNT       = 85
const MAX_SPEED   = 0.52
const MIN_SPEED   = 0.13
const NEIGHBOR_R  = 88   // flocking awareness radius (px)
const SEP_R       = 20   // hard personal-space radius (px)

// Flocking weights
const W_SEP  = 0.14
const W_ALIGN = 0.020
const W_COH  = 0.00085

interface Boid {
  x: number; y: number; z: number   // position + depth
  vx: number; vy: number; vz: number // velocity + depth velocity
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

function makeBoid(W: number, H: number): Boid {
  return {
    // Seed in the right-centre of the canvas so the flock starts visible
    x: W * (0.2 + Math.random() * 0.75),
    y: H * (0.05 + Math.random() * 0.65),
    z: Math.random(),
    vx: (Math.random() - 0.5) * MAX_SPEED * 1.6,
    vy: (Math.random() - 0.5) * MAX_SPEED * 1.2,
    vz: (Math.random() - 0.5) * 0.004,
  }
}

function clampSpeed(b: Boid) {
  const s = Math.hypot(b.vx, b.vy)
  if (s > MAX_SPEED && s > 0) { b.vx = b.vx / s * MAX_SPEED; b.vy = b.vy / s * MAX_SPEED }
  if (s < MIN_SPEED && s > 0) { b.vx = b.vx / s * MIN_SPEED; b.vy = b.vy / s * MIN_SPEED }
}

export default function FlockCanvas({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf: number
    let W = 0, H = 0
    let boids: Boid[] = []
    let ready = false

    function resize() {
      const dpr  = Math.min(window.devicePixelRatio || 1, 2)
      W = canvas!.offsetWidth
      H = canvas!.offsetHeight
      canvas!.width  = W * dpr
      canvas!.height = H * dpr
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (!ready && W > 0 && H > 0) {
        boids = Array.from({ length: COUNT }, () => makeBoid(W, H))
        ready = true
      }
    }

    function tick() {
      raf = requestAnimationFrame(tick)
      if (!ready) return

      ctx!.clearRect(0, 0, W, H)

      // ── Flocking physics ────────────────────────────────
      for (const b of boids) {
        let sx = 0, sy = 0   // separation accumulator
        let ax = 0, ay = 0   // alignment accumulator
        let cx = 0, cy = 0   // cohesion accumulator
        let n = 0

        for (const o of boids) {
          if (o === b) continue
          const dx = o.x - b.x
          const dy = o.y - b.y
          const d  = Math.hypot(dx, dy)

          if (d < SEP_R && d > 0) {
            const f = (SEP_R - d) / SEP_R
            sx -= (dx / d) * f
            sy -= (dy / d) * f
          }
          if (d < NEIGHBOR_R) {
            ax += o.vx; ay += o.vy
            cx += o.x;  cy += o.y
            n++
          }
        }

        if (n > 0) {
          ax /= n; ay /= n
          cx = cx / n - b.x
          cy = cy / n - b.y
          b.vx += sx * W_SEP + ax * W_ALIGN + cx * W_COH
          b.vy += sy * W_SEP + ay * W_ALIGN + cy * W_COH
        }

        clampSpeed(b)

        // Depth — each boid breathes slowly in/out of the z plane
        b.vz += (Math.random() - 0.5) * 0.00018
        b.vz  = Math.max(-0.0045, Math.min(0.0045, b.vz))
        b.z   = Math.max(0, Math.min(1, b.z + b.vz))
        if (b.z <= 0 || b.z >= 1) b.vz *= -0.6

        b.x += b.vx
        b.y += b.vy

        // Wrap at all edges so the flock loops continuously
        if (b.x >  W + 12) b.x = -12
        if (b.x < -12)     b.x =  W + 12
        if (b.y >  H + 12) b.y = -12
        if (b.y < -12)     b.y =  H + 12
      }

      // ── Draw ────────────────────────────────────────────
      for (const b of boids) {
        // Size: 1.2 px (far) → 5.5 px (near)
        const size = lerp(1.2, 5.5, b.z)

        // Depth alpha: whisper-faint in background, solid in foreground
        const depthA = lerp(0.05, 0.78, b.z)

        // Left-edge fade: dissolve as boids drift toward the heading text
        const leftFade = Math.min(1, b.x / (W * 0.40))

        // Bottom fade: dissolve into the contact form below
        const botFade  = Math.max(0, 1 - Math.max(0, b.y - H * 0.42) / (H * 0.52))

        const alpha = depthA * leftFade * botFade
        if (alpha < 0.018) continue

        ctx!.fillStyle = `rgba(${INK[0]},${INK[1]},${INK[2]},${alpha.toFixed(3)})`

        // Square pixels — round to nearest pixel for crisp, bitmap feel
        const px = Math.round(b.x - size * 0.5)
        const py = Math.round(b.y - size * 0.5)
        const ps = Math.max(1, Math.round(size))
        ctx!.fillRect(px, py, ps, ps)
      }
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    raf = requestAnimationFrame(tick)

    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
