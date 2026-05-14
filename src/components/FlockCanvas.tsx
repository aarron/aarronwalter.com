'use client'

import { useEffect, useRef } from 'react'

const INK: [number, number, number] = [44, 42, 42]

const COUNT      = 110
const MAX_SPEED  = 1.8
const MIN_SPEED  = 0.9   // birds always move with purpose
const NEIGHBOR_R = 120   // wide awareness so the flock stays coherent
const SEP_R      = 32    // personal space

// Weights — high alignment is the key to the bird-flock feel
const W_SEP   = 0.20
const W_ALIGN = 0.14   // strong: the group quickly matches direction
const W_COH   = 0.0018

interface Boid {
  x: number; y: number; z: number
  vx: number; vy: number; vz: number
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

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

    // Slowly-wandering flock direction — all boids are nudged toward this,
    // giving the whole mass a purposeful, curving flight path
    let wanderAngle = -0.4   // start heading slightly left and up
    let wanderRate  = 0.0003 // how fast the angle drifts

    function resize() {
      const dpr  = Math.min(window.devicePixelRatio || 1, 2)
      W = canvas!.offsetWidth
      H = canvas!.offsetHeight
      canvas!.width  = W * dpr
      canvas!.height = H * dpr
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)

      if (!ready && W > 0 && H > 0) {
        // Seed the whole flock in a loose cluster so cohesion holds from frame 1
        const cx = W * 0.72
        const cy = H * 0.30
        const spread = Math.min(W, H) * 0.22

        boids = Array.from({ length: COUNT }, () => {
          // Give each boid a similar initial velocity (same rough direction)
          // so they form one flock immediately rather than scattering
          const baseAngle = wanderAngle + (Math.random() - 0.5) * 0.8
          const speed     = MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED) * 0.5
          return {
            x: cx + (Math.random() - 0.5) * spread,
            y: cy + (Math.random() - 0.5) * spread * 0.6,
            z: Math.random(),
            vx: Math.cos(baseAngle) * speed,
            vy: Math.sin(baseAngle) * speed,
            vz: (Math.random() - 0.5) * 0.0008,
          }
        })
        ready = true
      }
    }

    function tick() {
      raf = requestAnimationFrame(tick)
      if (!ready) return

      ctx!.clearRect(0, 0, W, H)

      // Drift the wander angle — occasionally nudge the rate for variety
      wanderRate += (Math.random() - 0.5) * 0.000004
      wanderRate  = Math.max(-0.0006, Math.min(0.0006, wanderRate))
      wanderAngle += wanderRate

      const wanderX = Math.cos(wanderAngle)
      const wanderY = Math.sin(wanderAngle)

      // ── Flocking physics ────────────────────────────────
      for (const b of boids) {
        let sx = 0, sy = 0
        let ax = 0, ay = 0
        let cx = 0, cy = 0
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

        // Gentle global wander force — keeps the whole flock drifting together
        b.vx += wanderX * 0.012
        b.vy += wanderY * 0.012

        clampSpeed(b)

        // Depth: oscillate very slowly so depth feels stable, not floaty
        b.vz += (Math.random() - 0.5) * 0.000035
        b.vz  = Math.max(-0.0012, Math.min(0.0012, b.vz))
        b.z   = Math.max(0, Math.min(1, b.z + b.vz))
        if (b.z <= 0 || b.z >= 1) b.vz *= -0.5

        b.x += b.vx
        b.y += b.vy

        // Wrap so the flock loops continuously across the canvas
        if (b.x >  W + 20) b.x = -20
        if (b.x < -20)     b.x =  W + 20
        if (b.y >  H + 20) b.y = -20
        if (b.y < -20)     b.y =  H + 20
      }

      // ── Draw ────────────────────────────────────────────
      for (const b of boids) {
        // Radius: 1 px (far) → 4.5 px (near)
        const r = lerp(1.0, 4.5, b.z)

        // Alpha: almost invisible in background, solid in foreground
        const depthA = lerp(0.06, 0.80, b.z)

        // Left fade: dissolve toward the heading text
        const leftFade = Math.min(1, b.x / (W * 0.42))

        // Bottom fade: dissolve into the form below
        const botFade  = Math.max(0, 1 - Math.max(0, b.y - H * 0.45) / (H * 0.50))

        const alpha = depthA * leftFade * botFade
        if (alpha < 0.02) continue

        ctx!.beginPath()
        ctx!.arc(b.x, b.y, r, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${INK[0]},${INK[1]},${INK[2]},${alpha.toFixed(3)})`
        ctx!.fill()
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
