'use client'

import { useEffect, useRef } from 'react'

// ─── Math helpers ────────────────────────────────────────────────────────────

type Vec3 = [number, number, number]

const normalize = (v: Vec3): Vec3 => {
  const len = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2)
  return [v[0] / len, v[1] / len, v[2] / len]
}

// ─── Mesh — same spiked geodesic icosahedron ─────────────────────────────────

const PHI = (1 + Math.sqrt(5)) / 2
const SPIKE_R = 1.27

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

function buildMesh(subdivisions: number) {
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

  // Push original 12 icosahedron vertices outward to form spikes
  verts = verts.map((v, i) =>
    i < 12 ? [v[0] * SPIKE_R, v[1] * SPIKE_R, v[2] * SPIKE_R] : v
  )

  return { verts, faces }
}

const { verts: VERTS, faces: FACES } = buildMesh(2)

// Extract unique edges — drawing all edges (front + back) gives the wireframe look
const EDGES: [number, number][] = (() => {
  const seen = new Set<string>()
  const result: [number, number][] = []
  for (const [a, b, c] of FACES) {
    for (const [i, j] of [[a, b], [b, c], [c, a]] as [number, number][]) {
      const key = `${Math.min(i, j)}_${Math.max(i, j)}`
      if (!seen.has(key)) { seen.add(key); result.push([i, j]) }
    }
  }
  return result
})()

// ─── Rotation helper ─────────────────────────────────────────────────────────

function rotVec(v: Vec3, rx: number, ry: number): Vec3 {
  let [x, y, z] = v
  const cosY = Math.cos(ry), sinY = Math.sin(ry)
  ;[x, z] = [x * cosY - z * sinY, x * sinY + z * cosY]
  const cosX = Math.cos(rx), sinX = Math.sin(rx)
  ;[y, z] = [y * cosX - z * sinX, y * sinX + z * cosX]
  return [x, y, z]
}

// ─── Sphere instances ─────────────────────────────────────────────────────────
//
// Canvas is 1200 × 360 px (intrinsic).
// Spheres span left → right; larger and slightly more opaque toward the right
// so the density increases in the bottom-right corner.
// cy values are sized so the spheres sit at the bottom — their tops emerge
// into view while their equators and lower halves fall below the canvas floor.

type SphereConfig = {
  cx: number; cy: number   // center in canvas px
  r: number                // radius in canvas px
  ry: number; rx: number   // static rotation angles
  opacity: number          // stroke globalAlpha
  lw: number               // lineWidth
}

const SPHERES: SphereConfig[] = [
  // ← left: small, airy
  { cx:   55, cy: 300, r:  52, ry: 0.40, rx: -0.10, opacity: 0.11, lw: 0.55 },
  { cx:  175, cy: 268, r:  88, ry: 1.30, rx:  0.18, opacity: 0.16, lw: 0.65 },
  { cx:  305, cy: 302, r:  60, ry: 2.05, rx: -0.15, opacity: 0.13, lw: 0.55 },
  // ─ middle: builds in presence
  { cx:  425, cy: 242, r: 125, ry: 0.75, rx:  0.11, opacity: 0.19, lw: 0.70 },
  { cx:  575, cy: 284, r:  78, ry: 1.70, rx: -0.20, opacity: 0.16, lw: 0.60 },
  { cx:  700, cy: 228, r: 155, ry: 0.28, rx:  0.14, opacity: 0.22, lw: 0.75 },
  // ─ right: most visible →
  { cx:  838, cy: 268, r:  95, ry: 2.20, rx: -0.08, opacity: 0.20, lw: 0.65 },
  { cx:  972, cy: 198, r: 182, ry: 1.10, rx:  0.17, opacity: 0.30, lw: 0.80 },
  { cx: 1105, cy: 248, r: 110, ry: 1.85, rx: -0.10, opacity: 0.26, lw: 0.72 },
  { cx: 1205, cy: 218, r: 145, ry: 0.55, rx:  0.22, opacity: 0.23, lw: 0.68 },
]

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * GeoSphereTexture — a row of wireframe geodesic icosahedra rendered once
 * as a static line-drawing texture. No fills, no animation. Overlapping
 * instances at varying sizes and opacities increase in density toward the
 * right, creating a geometric motif at the page footer.
 */
export default function GeoSphereTexture() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (const sp of SPHERES) {
      const rot = VERTS.map(v => rotVec(v, sp.rx, sp.ry))

      // Mild perspective so spheres look convincingly round, not flat
      const FOV = 4.0
      const proj = rot.map((v): [number, number] => {
        const scale = (FOV / (FOV + v[2] * 0.12)) * sp.r
        return [sp.cx + v[0] * scale, sp.cy + v[1] * scale]
      })

      ctx.save()
      ctx.globalAlpha = sp.opacity
      ctx.strokeStyle = '#2C2A2A'
      ctx.lineWidth = sp.lw
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      // Batch all edges into one path — much faster than one stroke() per edge
      ctx.beginPath()
      for (const [a, b] of EDGES) {
        ctx.moveTo(proj[a][0], proj[a][1])
        ctx.lineTo(proj[b][0], proj[b][1])
      }
      ctx.stroke()
      ctx.restore()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={1200}
      height={360}
      aria-hidden="true"
      style={{ display: 'block', width: '100%', height: 'auto', pointerEvents: 'none' }}
    />
  )
}
