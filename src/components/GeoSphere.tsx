'use client'

import { useEffect, useRef } from 'react'

// ─── Math helpers ───────────────────────────────────────────────────────────

type Vec3 = [number, number, number]

const normalize = (v: Vec3): Vec3 => {
  const len = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2)
  return [v[0] / len, v[1] / len, v[2] / len]
}

const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]

// ─── Mesh generation ─────────────────────────────────────────────────────────

const PHI = (1 + Math.sqrt(5)) / 2

const BASE_VERTS: Vec3[] = [
  [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
  [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
  [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
].map(v => normalize(v as Vec3))

const BASE_FACES = [
  [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
  [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
  [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
  [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
]

/**
 * Subdivide the icosahedron on the unit sphere, then push the 12 original
 * vertices outward to form spikes — matching the Broken Bells album aesthetic.
 */
function buildMesh(subdivisions: number, spikeRadius = 1.27) {
  let verts: Vec3[] = BASE_VERTS.map(v => [...v] as Vec3)
  let faces: number[][] = BASE_FACES.map(f => [...f])

  for (let iter = 0; iter < subdivisions; iter++) {
    const next: number[][] = []
    const cache: Record<string, number> = {}

    const getMid = (i1: number, i2: number): number => {
      const key = `${Math.min(i1, i2)}_${Math.max(i1, i2)}`
      if (cache[key] !== undefined) return cache[key]
      const mid = normalize([
        (verts[i1][0] + verts[i2][0]) / 2,
        (verts[i1][1] + verts[i2][1]) / 2,
        (verts[i1][2] + verts[i2][2]) / 2,
      ])
      cache[key] = verts.length
      verts.push(mid)
      return cache[key]
    }

    for (const [a, b, c] of faces) {
      const ab = getMid(a, b), bc = getMid(b, c), ca = getMid(c, a)
      next.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca])
    }
    faces = next
  }

  // Push only the original 12 icosahedron vertices outward (indices 0–11)
  verts = verts.map((v, i) =>
    i < 12 ? [v[0] * spikeRadius, v[1] * spikeRadius, v[2] * spikeRadius] : v
  )

  return { verts, faces }
}

// Build once at module scope — never re-computed
const { verts: VERTS, faces: FACES } = buildMesh(2)

// ─── Face color assignment ────────────────────────────────────────────────────

// The four palette colors: warm orange-red, hot pink, dark plum, sky blue
const PALETTE = ['#FF4725', '#DD015A', '#760149', '#85D2FF'] as const

/** Deterministic pseudo-random [0, 1) from a seed */
function rng(seed: number) {
  return Math.abs(Math.sin(seed * 127.1 + 3.14) * 43758.5453) % 1
}

const FACE_COLORS = FACES.map(([a, b, c], i) => {
  // Object-space centroid Y (-1 bottom → +1 top of sphere)
  const vy = (VERTS[a][1] + VERTS[b][1] + VERTS[c][1]) / 3
  const s1 = rng(i)
  const s2 = rng(i + 500)

  if (vy > 0.45) {
    // Top cap: warm orange/pink, occasional blue pop
    if (s2 < 0.13) return PALETTE[3]
    return s1 < 0.5 ? PALETTE[0] : PALETTE[1]
  }
  if (vy > 0.05) {
    // Upper band: warm, rare blue
    if (s1 < 0.07) return PALETTE[3]
    return s2 < 0.5 ? PALETTE[1] : PALETTE[0]
  }
  if (vy > -0.25) {
    // Equatorial: transition to plum, scattered blue
    if (s1 < 0.09) return PALETTE[3]
    return s2 < 0.55 ? PALETTE[2] : PALETTE[1]
  }
  // Bottom: dark plum, very rare blue
  if (s1 < 0.04) return PALETTE[3]
  return PALETTE[2]
})

function hexToRgb(hex: string): Vec3 {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
}

const FACE_RGB = FACE_COLORS.map(hexToRgb)

// Light: upper-right, slightly toward camera
const LIGHT: Vec3 = normalize([0.5, 1.0, 0.7])

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * GeoSphere — a slowly-rotating spiked geodesic sphere rendered on canvas.
 * Matches the Broken Bells album art aesthetic with flat-shaded triangular faces.
 * Canvas intrinsic is 400×400; scale with CSS as needed.
 */
export default function GeoSphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let animId: number
    const t0 = performance.now()

    // All render math in intrinsic pixels (400×400)
    const W = 400, H = 400
    const CX = W / 2, CY = H / 2
    const R = W * 0.34 // sphere radius in pixels

    /** Rotate a vector around Y then X axes */
    function rotVec(v: Vec3, rx: number, ry: number): Vec3 {
      let [x, y, z] = v
      const cosY = Math.cos(ry), sinY = Math.sin(ry)
      ;[x, z] = [x * cosY - z * sinY, x * sinY + z * cosY]
      const cosX = Math.cos(rx), sinX = Math.sin(rx)
      ;[y, z] = [y * cosX - z * sinX, y * sinX + z * cosX]
      return [x, y, z]
    }

    function draw(now: number) {
      // canvasRef.current?.getContext('2d') returns the same cached instance — zero perf cost
      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx) return

      const t = (now - t0) * 0.001

      // Gentle rotation: slow Y spin, slight X wobble
      const ry = t * 0.25
      const rx = -0.15 + Math.sin(t * 0.11) * 0.13

      // Floating bob — subtle vertical oscillation
      const yBob = Math.sin(t * 0.6) * 10

      ctx.clearRect(0, 0, W, H)

      // Rotate all vertices into camera space
      const rot = VERTS.map(v => rotVec(v, rx, ry))

      // Mild perspective projection
      const FOV = 3.6
      const proj = rot.map((v): [number, number] => {
        const scale = (FOV / (FOV + v[2] * 0.15)) * R
        return [CX + v[0] * scale, CY + yBob + v[1] * scale]
      })

      // Collect front-facing faces with depth
      type FD = { idx: number; depth: number; lit: number }
      const visible: FD[] = []

      FACES.forEach(([ai, bi, ci], idx) => {
        const rA = rot[ai], rB = rot[bi], rC = rot[ci]
        const n = normalize(cross(sub(rB, rA), sub(rC, rA)))
        if (n[2] < 0) return // back-face cull
        const depth = (rA[2] + rB[2] + rC[2]) / 3
        const lit = Math.max(0, dot(n, LIGHT))
        visible.push({ idx, depth, lit })
      })

      // Painter's algorithm: far faces first
      visible.sort((a, b) => a.depth - b.depth)

      for (const { idx, lit } of visible) {
        const [ai, bi, ci] = FACES[idx]
        const pA = proj[ai], pB = proj[bi], pC = proj[ci]
        const [r, g, b] = FACE_RGB[idx]

        // Ambient (0.2) + diffuse (0.8) shading
        const br = 0.2 + 0.8 * lit
        const fr = Math.min(255, Math.round(r * br))
        const fg = Math.min(255, Math.round(g * br))
        const fb = Math.min(255, Math.round(b * br))

        ctx.beginPath()
        ctx.moveTo(pA[0], pA[1])
        ctx.lineTo(pB[0], pB[1])
        ctx.lineTo(pC[0], pC[1])
        ctx.closePath()
        ctx.fillStyle = `rgb(${fr},${fg},${fb})`
        ctx.fill()

        // Thin edge lines give the hand-drawn / screen-print feel
        ctx.strokeStyle = 'rgba(15,5,10,0.09)'
        ctx.lineWidth = 0.55
        ctx.stroke()
      }

      animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={400}
      aria-hidden="true"
      style={{ display: 'block', pointerEvents: 'none' }}
    />
  )
}
