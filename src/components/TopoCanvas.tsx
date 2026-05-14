'use client'

import { useEffect, useRef } from 'react'

// ─────────────────────────────────────────────────────────────
//  Terrain: three clearly separated topographic forms
//
//  Form 1 — Northern range  (canvas top, cy ≈ 0.10–0.30)
//  Form 2 — Southern range  (canvas lower half, cy ≈ 0.58–0.80)
//  Form 3 — Eastern ridge   (extends off right edge, bridges the gap)
//
//  Valley sits between the two main forms (cy ≈ 0.32–0.56) and is
//  naturally empty because the hills don't reach there.
// ─────────────────────────────────────────────────────────────

interface Hill {
  cx: number   // base centre x  (0–1, can exceed canvas edge)
  cy: number   // base centre y  (0–1)
  amp: number  // peak amplitude
  sx: number   // gaussian half-width in local X
  sy: number   // gaussian half-width in local Y
  ang: number  // tilt angle (radians)
  p: number    // phase offset for independent drift timing
}

const HILLS: Hill[] = [
  // ── Form 1: Northern range ────────────────────────────────
  { cx: 0.80, cy: 0.14, amp: 1.00, sx: 0.18, sy: 0.13, ang:  0.20, p: 0.00 },
  { cx: 0.94, cy: 0.21, amp: 0.82, sx: 0.15, sy: 0.17, ang: -0.30, p: 2.10 },
  { cx: 0.69, cy: 0.27, amp: 0.74, sx: 0.16, sy: 0.12, ang:  0.55, p: 4.20 },
  { cx: 1.01, cy: 0.08, amp: 0.60, sx: 0.13, sy: 0.11, ang: -0.45, p: 1.50 },

  // ── Form 2: Southern range ────────────────────────────────
  { cx: 0.75, cy: 0.64, amp: 0.92, sx: 0.19, sy: 0.16, ang:  0.75, p: 3.50 },
  { cx: 0.91, cy: 0.75, amp: 0.80, sx: 0.17, sy: 0.20, ang: -0.55, p: 0.80 },
  { cx: 0.62, cy: 0.80, amp: 0.66, sx: 0.16, sy: 0.13, ang:  1.10, p: 5.00 },
  { cx: 0.87, cy: 0.58, amp: 0.56, sx: 0.15, sy: 0.12, ang: -0.15, p: 2.70 },

  // ── Form 3: Eastern ridge (off right edge, bridges the gap) ──
  { cx: 1.06, cy: 0.42, amp: 0.70, sx: 0.13, sy: 0.30, ang:  0.05, p: 1.80 },
  { cx: 1.07, cy: 0.90, amp: 0.50, sx: 0.12, sy: 0.14, ang:  0.25, p: 3.30 },
]

// Grid & contour settings
const GW     = 88   // columns
const GH     = 72   // rows  (slightly less than square — canvas is wide)
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

    let raf: number
    const t0   = performance.now()
    const grid = new Float32Array((GW + 1) * (GH + 1))
    let frame  = 0

    // ─────────────────────────────────────────────────────────
    //  Height field
    //  Movement is very slow — geological, not liquid.
    //  Drift is tiny (±0.012) so forms stay recognisable.
    // ─────────────────────────────────────────────────────────
    function heightAt(nx: number, ny: number, t: number): number {
      let h = 0
      for (const hill of HILLS) {
        const cx  = hill.cx + 0.012 * Math.sin(t * 0.05 + hill.p)
        const cy  = hill.cy + 0.009 * Math.cos(t * 0.038 + hill.p * 1.3)
        const amp = hill.amp * (0.98 + 0.02 * Math.sin(t * 0.07 + hill.p * 0.8))
        const dx  = nx - cx
        const dy  = ny - cy
        const c   = Math.cos(hill.ang)
        const s   = Math.sin(hill.ang)
        const lx  = dx * c + dy * s
        const ly  = -dx * s + dy * c
        h += amp * Math.exp(
          -(lx * lx / (hill.sx * hill.sx) + ly * ly / (hill.sy * hill.sy)) * 0.5
        )
      }
      // Very gentle noise — organic texture, not turbulence
      h += 0.038 * Math.sin(nx * 7.1 + t * 0.08) * Math.sin(ny * 5.3 + t * 0.06)
      h += 0.022 * Math.sin(nx * 12.8 + t * 0.11 + 1.5) * Math.cos(ny * 8.2 + t * 0.07)
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
      // ~30 fps — plenty for very slow animation
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
      // Covers roughly the left 50%, becoming fully cream at the left edge.
      const mistL = ctx!.createLinearGradient(0, 0, w * 0.52, 0)
      mistL.addColorStop(0,    '#F3E7D6')
      mistL.addColorStop(0.25, 'rgba(243,231,214,0.96)')
      mistL.addColorStop(0.55, 'rgba(243,231,214,0.65)')
      mistL.addColorStop(0.82, 'rgba(243,231,214,0.18)')
      mistL.addColorStop(1,    'rgba(243,231,214,0)')
      ctx!.fillStyle = mistL
      ctx!.fillRect(0, 0, w * 0.52, h)

      // ── Mist: bottom fade (into the book grid below) ────
      // Begins around 58% canvas height, fully opaque by 90%.
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
