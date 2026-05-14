'use client'

import { useEffect, useRef } from 'react'

const INK: [number, number, number] = [44, 42, 42]

const COUNT     = 700
const MAX_SPEED = 3.8
const MIN_SPEED = 1.6

// Topological neighbors (Ballerini 2008): each boid responds to its K
// nearest regardless of distance — this keeps the flock coherent across
// density changes and lets direction changes ripple like a murmuration wave
const K_NEIGHBORS = 7

// Separation uses metric distance — only very close boids trigger avoidance
const SEP_R  = 24
const SEP_R2 = SEP_R * SEP_R

// Steering weights
// Alignment: steer toward average velocity of K nearest (velocity matching)
// Cohesion: steer toward center of mass of K nearest
// Separation: repel from metric-close neighbors
const W_ALIGN = 0.050
const W_COH   = 0.0004
const W_SEP   = 0.050

// Soft boundary: boids turn away when this close to any edge
const MARGIN     = 90
const TURN_FORCE = 0.07

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

    // Pre-allocated neighbor buffers — zero GC pressure during animation
    const d2buf = new Float32Array(COUNT)
    const vxbuf = new Float32Array(COUNT)
    const vybuf = new Float32Array(COUNT)
    const xbuf  = new Float32Array(COUNT)
    const ybuf  = new Float32Array(COUNT)
    const kidx  = new Int32Array(K_NEIGHBORS)

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = canvas!.offsetWidth
      H = canvas!.offsetHeight
      canvas!.width  = W * dpr
      canvas!.height = H * dpr
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)

      if (!ready && W > 0 && H > 0) {
        // Seed one tight cluster — all boids given nearly identical velocity
        // so flocking rules kick in immediately rather than from a scatter
        const cx     = W * 0.65
        const cy     = H * 0.30
        const spread = Math.min(W, H) * 0.32
        const baseAngle = -0.35   // heading: left + slightly up

        boids = Array.from({ length: COUNT }, () => {
          const angle = baseAngle + (Math.random() - 0.5) * 0.4
          const speed = MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED) * 0.35
          return {
            x:  cx + (Math.random() - 0.5) * spread,
            y:  cy + (Math.random() - 0.5) * spread * 0.45,
            z:  Math.random(),
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
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

      for (let i = 0; i < COUNT; i++) {
        const b = boids[i]
        let sx = 0, sy = 0   // separation accumulator (metric)
        let nCount = 0

        // ── Build neighbor data ──────────────────────────────
        for (let j = 0; j < COUNT; j++) {
          if (i === j) continue
          const o  = boids[j]
          const dx = o.x - b.x
          const dy = o.y - b.y
          const d2 = dx * dx + dy * dy

          // Separation: metric radius only
          if (d2 < SEP_R2 && d2 > 0) {
            const d = Math.sqrt(d2)
            const f = (SEP_R - d) / SEP_R
            sx -= (dx / d) * f
            sy -= (dy / d) * f
          }

          d2buf[nCount] = d2
          vxbuf[nCount] = o.vx
          vybuf[nCount] = o.vy
          xbuf[nCount]  = o.x
          ybuf[nCount]  = o.y
          nCount++
        }

        // ── Find K nearest (partial insertion sort, zero allocs) ──
        const K = Math.min(K_NEIGHBORS, nCount)
        for (let k = 0; k < K; k++) kidx[k] = k

        // Sort initial K by d² ascending
        for (let a = 1; a < K; a++) {
          const key = kidx[a]; const keyD = d2buf[key]
          let p = a - 1
          while (p >= 0 && d2buf[kidx[p]] > keyD) { kidx[p + 1] = kidx[p]; p-- }
          kidx[p + 1] = key
        }

        // Scan rest — replace max if a closer boid is found
        for (let j = K; j < nCount; j++) {
          const dj = d2buf[j]
          if (dj < d2buf[kidx[K - 1]]) {
            kidx[K - 1] = j
            let k = K - 1
            while (k > 0 && d2buf[kidx[k]] < d2buf[kidx[k - 1]]) {
              const tmp = kidx[k]; kidx[k] = kidx[k - 1]; kidx[k - 1] = tmp; k--
            }
          }
        }

        // ── Alignment + cohesion from K nearest ──────────────
        let ax = 0, ay = 0, cx2 = 0, cy2 = 0
        for (let k = 0; k < K; k++) {
          const ki = kidx[k]
          ax  += vxbuf[ki]; ay  += vybuf[ki]
          cx2 += xbuf[ki];  cy2 += ybuf[ki]
        }
        ax /= K; ay /= K
        cx2 = cx2 / K - b.x   // vector toward center of mass
        cy2 = cy2 / K - b.y

        // Steering: alignment = velocity matching (Reynolds), cohesion toward COM
        b.vx += (ax - b.vx) * W_ALIGN + cx2 * W_COH + sx * W_SEP
        b.vy += (ay - b.vy) * W_ALIGN + cy2 * W_COH + sy * W_SEP

        // ── Soft boundary: turn away from edges ──────────────
        if (b.x < MARGIN)       b.vx += TURN_FORCE * (1 - b.x / MARGIN)
        if (b.x > W - MARGIN)   b.vx -= TURN_FORCE * (1 - (W - b.x) / MARGIN)
        if (b.y < MARGIN)       b.vy += TURN_FORCE * (1 - b.y / MARGIN)
        if (b.y > H - MARGIN)   b.vy -= TURN_FORCE * (1 - (H - b.y) / MARGIN)

        clampSpeed(b)

        // Depth: very slow oscillation so z feels stable, not floaty
        b.vz += (Math.random() - 0.5) * 0.00003
        b.vz  = Math.max(-0.0010, Math.min(0.0010, b.vz))
        b.z   = Math.max(0, Math.min(1, b.z + b.vz))
        if (b.z <= 0 || b.z >= 1) b.vz *= -0.5

        b.x += b.vx
        b.y += b.vy

        // Safety wrap (for boids that escape past soft boundary)
        if (b.x >  W + 40) b.x = -40
        if (b.x < -40)     b.x =  W + 40
        if (b.y >  H + 40) b.y = -40
        if (b.y < -40)     b.y =  H + 40
      }

      // ── Draw ────────────────────────────────────────────────
      for (const b of boids) {
        const r      = lerp(0.7, 3.0, b.z)
        const depthA = lerp(0.05, 0.72, b.z)

        // Fade toward left (where heading text lives)
        const leftFade = Math.min(1, b.x / (W * 0.42))
        // Fade toward bottom (behind the contact form)
        const botFade  = Math.max(0, 1 - Math.max(0, b.y - H * 0.45) / (H * 0.50))

        const alpha = depthA * leftFade * botFade
        if (alpha < 0.02) continue

        // Draw as elongated ellipse pointing in direction of travel
        const angle = Math.atan2(b.vy, b.vx)
        ctx!.beginPath()
        ctx!.ellipse(b.x, b.y, r * 2.5, r * 0.55, angle, 0, Math.PI * 2)
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
