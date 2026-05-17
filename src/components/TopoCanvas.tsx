'use client'

import { useEffect, useRef } from 'react'
import { ICELAND_ELEVATION } from '@/lib/iceland-elevation'

// Grid & contour settings
const GW     = 88   // columns
const GH     = 72   // rows
const LEVELS = 26   // contour levels

// ─────────────────────────────────────────────────────────────
//  Marching-squares lookup
//  Corner bits: TL=8  TR=4  BR=2  BL=1
//  Edge index:  0=top(TL→TR)  1=right(TR→BR)  2=bottom(BL→BR)  3=left(TL→BL)
// ─────────────────────────────────────────────────────────────
const MS: Array<Array<[number, number]>> = [
  [],                      //  0  ────
  [[3, 2]],                //  1  BL
  [[2, 1]],                //  2  BR
  [[3, 1]],                //  3  BR+BL
  [[0, 1]],                //  4  TR
  [[0, 1], [2, 3]],        //  5  TR+BL  saddle
  [[0, 2]],                //  6  TR+BR
  [[0, 3]],                //  7  TR+BR+BL
  [[0, 3]],                //  8  TL
  [[0, 2]],                //  9  TL+BL
  [[0, 3], [1, 2]],        // 10  TL+BR  saddle
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

    // Iceland elevation data: 72 rows × 90 cols, normalized [-1, 1]
    const SRC_ROWS = ICELAND_ELEVATION.length       // 72
    const SRC_COLS = ICELAND_ELEVATION[0].length    // 90

    let raf: number
    const t0   = performance.now()
    const grid = new Float32Array((GW + 1) * (GH + 1))
    let frame  = 0

    // ── Bilinear sample from the elevation grid ────────────
    // nx, ny in [0, 1]. panX slowly shifts the viewport east/west.
    function sampleElev(nx: number, ny: number, panX: number): number {
      const sx = ((nx + panX) % 1 + 1) % 1   // wrap horizontally
      const sy = Math.max(0, Math.min(1, ny))

      const fx = sx * (SRC_COLS - 1)
      const fy = sy * (SRC_ROWS - 1)
      const x0 = Math.floor(fx), x1 = Math.min(x0 + 1, SRC_COLS - 1)
      const y0 = Math.floor(fy), y1 = Math.min(y0 + 1, SRC_ROWS - 1)
      const tx = fx - x0, ty = fy - y0

      const v00 = ICELAND_ELEVATION[y0][x0]
      const v10 = ICELAND_ELEVATION[y0][x1]
      const v01 = ICELAND_ELEVATION[y1][x0]
      const v11 = ICELAND_ELEVATION[y1][x1]

      return v00 * (1-tx)*(1-ty) + v10 * tx*(1-ty)
           + v01 * (1-tx)*ty    + v11 * tx*ty
    }

    // ─────────────────────────────────────────────────────────
    //  Height field at (nx, ny) with time t
    //  Real Iceland topography + very slow drift + organic noise
    // ─────────────────────────────────────────────────────────
    function heightAt(nx: number, ny: number, t: number): number {
      // Glacial-speed pan — one full traverse in ~4 minutes
      const panX = (t * 0.0014) % 1

      let h = sampleElev(nx, ny, panX)

      // Add organic micro-noise — gives contours a living, breathing quality
      h += 0.022 * Math.sin(nx * 8.3 + t * 0.09) * Math.sin(ny * 6.1 + t * 0.07)
         + 0.012 * Math.sin(nx * 14.5 + t * 0.13 + 1.7) * Math.cos(ny * 9.8 + t * 0.08)
         + 0.018 * Math.sin(t * 0.24 + nx * 5.2 + ny * 4.1)

      return h
    }

    // ─────────────────────────────────────────────────────────
    //  Edge interpolation
    // ─────────────────────────────────────────────────────────
    function edgePt(
      edge: number, gx: number, gy: number,
      tl: number, tr: number, br: number, bl: number,
      level: number
    ): [number, number] {
      let t: number
      switch (edge) {
        case 0: t = Math.max(0, Math.min(1, (level - tl) / (tr - tl + 1e-9)));  return [(gx + t) / GW, gy / GH]
        case 1: t = Math.max(0, Math.min(1, (level - tr) / (br - tr + 1e-9)));  return [(gx + 1) / GW, (gy + t) / GH]
        case 2: t = Math.max(0, Math.min(1, (level - bl) / (br - bl + 1e-9)));  return [(gx + t) / GW, (gy + 1) / GH]
        case 3: t = Math.max(0, Math.min(1, (level - tl) / (bl - tl + 1e-9)));  return [gx / GW, (gy + t) / GH]
        default: return [0, 0]
      }
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width  = canvas!.offsetWidth  * dpr
      canvas!.height = canvas!.offsetHeight * dpr
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function draw(now: number) {
      // ~30 fps — plenty for slow geological animation
      frame++
      if (frame % 2 !== 0) { raf = requestAnimationFrame(draw); return }

      const w = canvas!.offsetWidth
      const h = canvas!.offsetHeight
      const t = (now - t0) * 0.001

      ctx!.clearRect(0, 0, w, h)

      // ── Build height grid ────────────────────────────────
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

      // ── Draw contour levels ──────────────────────────────
      for (let li = 0; li < LEVELS; li++) {
        const level   = minH + step * (li + 1)
        const lNorm   = li / (LEVELS - 1)
        const isIndex = li % 5 === 0

        // Opacity: peaks in the middle of the height range, tapers at extremes
        const midArc  = 1 - Math.abs(lNorm - 0.5) * 1.8
        const alpha   = Math.max(0.03, midArc * (isIndex ? 0.48 : 0.20))

        ctx!.strokeStyle = `rgba(70, 58, 48, ${alpha.toFixed(3)})`
        ctx!.lineWidth   = isIndex ? 1.4 : 0.65
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

      // ── Mist: left fade (toward the heading) ────────────
      const mistL = ctx!.createLinearGradient(0, 0, w * 0.52, 0)
      mistL.addColorStop(0,    '#F3E7D6')
      mistL.addColorStop(0.25, 'rgba(243,231,214,0.96)')
      mistL.addColorStop(0.55, 'rgba(243,231,214,0.65)')
      mistL.addColorStop(0.82, 'rgba(243,231,214,0.18)')
      mistL.addColorStop(1,    'rgba(243,231,214,0)')
      ctx!.fillStyle = mistL
      ctx!.fillRect(0, 0, w * 0.52, h)

      // ── Mist: bottom fade (into the book grid below) ────
      const fadeStart = h * 0.58
      const fadeEnd   = h
      const mistB = ctx!.createLinearGradient(0, fadeStart, 0, fadeEnd)
      mistB.addColorStop(0,    'rgba(243,231,214,0)')
      mistB.addColorStop(0.35, 'rgba(243,231,214,0.55)')
      mistB.addColorStop(0.70, 'rgba(243,231,214,0.90)')
      mistB.addColorStop(1,    '#F3E7D6')
      ctx!.fillStyle = mistB
      ctx!.fillRect(0, fadeStart, w, fadeEnd - fadeStart)

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
