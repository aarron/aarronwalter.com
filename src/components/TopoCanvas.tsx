'use client'

import { useEffect, useRef } from 'react'

// ── Terrain definition ───────────────────────────────────────
// Hills are anisotropic (elliptical) Gaussians that drift and breathe slowly.
// All positions are normalised 0-1 relative to the canvas.
// Hills are weighted toward the right half so the left side stays clear for text.

interface Hill {
  cx: number   // base centre x
  cy: number   // base centre y
  amp: number  // peak amplitude
  sx: number   // half-width in local X
  sy: number   // half-width in local Y
  ang: number  // tilt angle (radians)
  p: number    // phase offset for independent drift timing
}

const HILLS: Hill[] = [
  { cx: 0.68, cy: 0.24, amp: 1.00, sx: 0.23, sy: 0.17, ang:  0.30, p: 0.00 },
  { cx: 0.90, cy: 0.74, amp: 0.88, sx: 0.21, sy: 0.25, ang: -0.45, p: 1.70 },
  { cx: 0.52, cy: 0.58, amp: 0.70, sx: 0.18, sy: 0.15, ang:  0.75, p: 3.20 },
  { cx: 1.10, cy: 0.40, amp: 0.68, sx: 0.20, sy: 0.16, ang: -0.20, p: 5.10 }, // extends off right edge
  { cx: 0.78, cy: 0.92, amp: 0.54, sx: 0.19, sy: 0.14, ang:  1.10, p: 2.40 },
  { cx: 0.82, cy: 0.12, amp: 0.46, sx: 0.16, sy: 0.13, ang: -0.80, p: 4.30 }, // near top edge
]

// ── Grid & contour settings ──────────────────────────────────
const GW     = 80   // grid columns
const GH     = 54   // grid rows
const LEVELS = 24   // contour levels

// ── Marching-squares lookup ──────────────────────────────────
// Corner bits: TL=8, TR=4, BR=2, BL=1
// Edge indices: 0=top(TL→TR), 1=right(TR→BR), 2=bottom(BL→BR), 3=left(TL→BL)
// Each entry lists the edge pairs [e1, e2] to connect for that corner code.
const MS: Array<Array<[number, number]>> = [
  [],                      //  0  ────
  [[3, 2]],                //  1  BL
  [[2, 1]],                //  2  BR
  [[3, 1]],                //  3  BR+BL
  [[0, 1]],                //  4  TR
  [[0, 1], [2, 3]],        //  5  TR+BL  (saddle — two isolated peaks)
  [[0, 2]],                //  6  TR+BR
  [[0, 3]],                //  7  TR+BR+BL
  [[0, 3]],                //  8  TL
  [[0, 2]],                //  9  TL+BL
  [[0, 3], [1, 2]],        // 10  TL+BR  (saddle)
  [[0, 1]],                // 11  TL+BR+BL
  [[1, 3]],                // 12  TL+TR
  [[1, 2]],                // 13  TL+TR+BL
  [[2, 3]],                // 14  TL+TR+BR
  [],                      // 15  ████
]

export default function TopoCanvas({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf: number
    const t0   = performance.now()
    const grid = new Float32Array((GW + 1) * (GH + 1))
    let frame  = 0

    // ── Height field ─────────────────────────────────────────
    function heightAt(nx: number, ny: number, t: number): number {
      let h = 0
      for (const hill of HILLS) {
        // Each hill drifts independently
        const cx  = hill.cx + 0.035 * Math.sin(t * 0.10 + hill.p)
        const cy  = hill.cy + 0.025 * Math.cos(t * 0.07 + hill.p * 1.3)
        // Amplitude breathes slightly
        const amp = hill.amp * (0.93 + 0.07 * Math.sin(t * 0.13 + hill.p * 0.8))
        // Rotate dx/dy into hill's local axis for elliptical shape
        const dx  = nx - cx
        const dy  = ny - cy
        const c   = Math.cos(hill.ang)
        const s   = Math.sin(hill.ang)
        const lx  = dx * c + dy * s
        const ly  = -dx * s + dy * c
        h += amp * Math.exp(-(lx * lx / (hill.sx * hill.sx) + ly * ly / (hill.sy * hill.sy)) * 0.5)
      }
      // Gentle noise waves — add organic terrain texture
      h += 0.09 * Math.sin(nx * 7.2 + t * 0.15) * Math.sin(ny * 5.4 + t * 0.11)
      h += 0.05 * Math.sin(nx * 13.1 + t * 0.22 + 1.5) * Math.cos(ny * 8.6 + t * 0.14)
      h += 0.03 * Math.cos(nx * 19.0 + t * 0.31 + 3.1) * Math.sin(ny * 15.0 + t * 0.19)
      return h
    }

    // ── Edge interpolation ───────────────────────────────────
    function edgePt(
      edge: number,
      gx: number, gy: number,
      tl: number, tr: number, br: number, bl: number,
      level: number
    ): [number, number] {
      let t: number
      switch (edge) {
        case 0: // top — TL → TR
          t = Math.max(0, Math.min(1, (level - tl) / (tr - tl + 1e-9)))
          return [(gx + t) / GW, gy / GH]
        case 1: // right — TR → BR
          t = Math.max(0, Math.min(1, (level - tr) / (br - tr + 1e-9)))
          return [(gx + 1) / GW, (gy + t) / GH]
        case 2: // bottom — BL → BR (left to right)
          t = Math.max(0, Math.min(1, (level - bl) / (br - bl + 1e-9)))
          return [(gx + t) / GW, (gy + 1) / GH]
        case 3: // left — TL → BL (top to bottom)
          t = Math.max(0, Math.min(1, (level - tl) / (bl - tl + 1e-9)))
          return [gx / GW, (gy + t) / GH]
        default:
          return [0, 0]
      }
    }

    // ── Resize ───────────────────────────────────────────────
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width  = canvas!.offsetWidth  * dpr
      canvas!.height = canvas!.offsetHeight * dpr
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    // ── Draw ─────────────────────────────────────────────────
    function draw(now: number) {
      // Throttle to ~30 fps — animation is slow so 60 fps buys nothing
      frame++
      if (frame % 2 !== 0) { raf = requestAnimationFrame(draw); return }

      const w = canvas!.offsetWidth
      const h = canvas!.offsetHeight
      const t = (now - t0) * 0.001   // seconds

      ctx!.clearRect(0, 0, w, h)

      // ── Build height grid ──────────────────────────────────
      let minH = Infinity, maxH = -Infinity
      for (let gy = 0; gy <= GH; gy++) {
        for (let gx = 0; gx <= GW; gx++) {
          const v = heightAt(gx / GW, gy / GH, t)
          grid[gy * (GW + 1) + gx] = v
          if (v < minH) minH = v
          if (v > maxH) maxH = v
        }
      }

      const step = (maxH - minH) / (LEVELS + 1)

      // ── Draw each contour level ────────────────────────────
      for (let li = 0; li < LEVELS; li++) {
        const level   = minH + step * (li + 1)
        const lNorm   = li / (LEVELS - 1)           // 0 → 1 bottom to top
        const isIndex = li % 5 === 0                 // heavier index contours
        // Opacity arcs: highest at mid-range levels, tapers toward extremes
        const midArc  = 1 - Math.abs(lNorm - 0.5) * 1.7
        const alpha   = Math.max(0.04, midArc * (isIndex ? 0.50 : 0.22))

        ctx!.strokeStyle = `rgba(70, 58, 48, ${alpha.toFixed(3)})`
        ctx!.lineWidth   = isIndex ? 1.5 : 0.7
        ctx!.lineJoin    = 'round'
        ctx!.lineCap     = 'round'
        ctx!.beginPath()

        for (let gy = 0; gy < GH; gy++) {
          for (let gx = 0; gx < GW; gx++) {
            const base = gy * (GW + 1) + gx
            const tl   = grid[base]
            const tr   = grid[base + 1]
            const bl   = grid[base + (GW + 1)]
            const br   = grid[base + (GW + 2)]

            const code =
              (tl > level ? 8 : 0) |
              (tr > level ? 4 : 0) |
              (br > level ? 2 : 0) |
              (bl > level ? 1 : 0)

            for (const [e1, e2] of MS[code]) {
              const [nx1, ny1] = edgePt(e1, gx, gy, tl, tr, br, bl, level)
              const [nx2, ny2] = edgePt(e2, gx, gy, tl, tr, br, bl, level)
              ctx!.moveTo(nx1 * w, ny1 * h)
              ctx!.lineTo(nx2 * w, ny2 * h)
            }
          }
        }

        ctx!.stroke()
      }

      // ── Mist fade — cream overlay, dense on left, gone by ~55% ──
      // This hides contour lines near the heading text.
      const mist = ctx!.createLinearGradient(0, 0, w * 0.58, 0)
      mist.addColorStop(0,    '#F3E7D6')
      mist.addColorStop(0.28, 'rgba(243,231,214,0.96)')
      mist.addColorStop(0.50, 'rgba(243,231,214,0.72)')
      mist.addColorStop(0.78, 'rgba(243,231,214,0.22)')
      mist.addColorStop(1,    'rgba(243,231,214,0)')
      ctx!.fillStyle = mist
      ctx!.fillRect(0, 0, w * 0.58, h)

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

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
