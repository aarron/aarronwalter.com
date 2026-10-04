'use client'

import { useEffect, useRef } from 'react'
import { bases } from '@/lib/cov2-genome'
import { getVizColors, usePaletteVersion } from '@/lib/viz-colors'

interface Props {
  className?: string
}

/**
 * Each ribbon is the SARS-CoV-2 genome walked with its own per-base heading
 * nudges (complementary bases turn opposite ways), so every strand is a
 * genuinely different weave of the same sequence. Layered large-faint-back to
 * small-sharp-front for depth, and staggered so they draw in at different
 * times and places.
 */
interface Ribbon {
  turn: [number, number, number, number] // per-base turn for A, C, G, T
  alpha: number        // peak stroke opacity
  accentMix: number    // 0 = all ink, 1 = full ink→accent gradient
  scaleMul: number     // size relative to min(W,H)
  cxFrac: number       // centre, as a fraction of canvas size
  cyFrac: number
  widthMul: number     // stroke weight multiplier
  rotBase: number      // resting rotation (rad)
  rotAmp: number       // breathing rotation amplitude (rad)
  rotPeriod: number    // breathing period (ms)
  rotPhase: number
  revealMs: number     // time for this strand to draw in
  delayMs: number      // stagger before it starts
}

const RIBBONS: Ribbon[] = [
  // Back — large, hazy, nearly monochrome; drifts in first.
  { turn: [0.44, 0.44, -0.44, -0.44], alpha: 0.12, accentMix: 0.22, scaleMul: 1.62, cxFrac: 0.5, cyFrac: 0.3, widthMul: 0.5, rotBase: -0.22, rotAmp: 0.05, rotPeriod: 13000, rotPhase: 0.0, revealMs: 16000, delayMs: 0 },
  // Mid.
  { turn: [0.45, 0.78, -0.78, -0.45], alpha: 0.24, accentMix: 0.6, scaleMul: 1.26, cxFrac: 0.7, cyFrac: 0.56, widthMul: 0.58, rotBase: 0.16, rotAmp: 0.04, rotPeriod: 10500, rotPhase: 1.7, revealMs: 15000, delayMs: 3000 },
  // Front — the hero strand: crisp, full gradient; arrives last.
  { turn: [0.6, 0.6, -0.6, -0.6], alpha: 0.52, accentMix: 1.0, scaleMul: 0.98, cxFrac: 0.58, cyFrac: 0.46, widthMul: 0.66, rotBase: 0.0, rotAmp: 0.03, rotPeriod: 12000, rotPhase: 0.6, revealMs: 13000, delayMs: 6000 },
]

interface Strand {
  cfg: Ribbon
  xs: Float32Array
  ys: Float32Array
  pathCX: number
  pathCY: number
  pathW: number
  pathH: number
  // per-resize screen mapping
  cx: number
  cy: number
  scale: number
}

const BUCKETS = 200

export default function GenomeCanvas({ className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const pv = usePaletteVersion()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const viz = getVizColors()
    const [ir, ig, ib] = viz.inkRGB
    const [ar, ag, ab] = viz.accentRGB

    const seq = bases()
    const N = seq.length

    // Build one walk per ribbon.
    const buildWalk = (turn: number[]) => {
      const xs = new Float32Array(N)
      const ys = new Float32Array(N)
      let theta = 0, x = 0, y = 0
      let minX = 0, maxX = 0, minY = 0, maxY = 0
      for (let i = 0; i < N; i++) {
        theta += turn[seq[i]]
        x += Math.cos(theta)
        y += Math.sin(theta)
        xs[i] = x
        ys[i] = y
        if (x < minX) minX = x; else if (x > maxX) maxX = x
        if (y < minY) minY = y; else if (y > maxY) maxY = y
      }
      return { xs, ys, pathCX: (minX + maxX) / 2, pathCY: (minY + maxY) / 2, pathW: (maxX - minX) || 1, pathH: (maxY - minY) || 1 }
    }

    const strands: Strand[] = RIBBONS.map(cfg => ({ cfg, ...buildWalk(cfg.turn), cx: 0, cy: 0, scale: 1 }))

    // Colour along the genome: ink → accent, scaled by a per-ribbon accentMix.
    const colorAt = (t: number, mix: number, alpha: number) => {
      const m = t * mix
      return `rgba(${Math.round(ir + (ar - ir) * m)}, ${Math.round(ig + (ag - ig) * m)}, ${Math.round(ib + (ab - ib) * m)}, ${alpha})`
    }

    let W = 0, H = 0
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = W = Math.max(1, Math.round(rect.width * dpr))
      canvas.height = H = Math.max(1, Math.round(rect.height * dpr))
      const base = Math.min(W, H)
      for (const s of strands) {
        s.scale = (base * s.cfg.scaleMul) / Math.max(s.pathW, s.pathH)
        s.cx = W * s.cfg.cxFrac
        s.cy = H * s.cfg.cyFrac
      }
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const drawStrand = (s: Strand, elapsed: number) => {
      const cfg = s.cfg
      const local = reduce ? cfg.revealMs : elapsed - cfg.delayMs
      if (local <= 0) return
      const progress = reduce ? 1 : Math.min(1, local / cfg.revealMs)
      // Smootherstep — eases in AND out, so the strand starts gently rather
      // than rushing in, then settles softly at the end.
      const eased = progress * progress * progress * (progress * (progress * 6 - 15) + 10)
      const K = Math.max(1, Math.floor(eased * (N - 1)))

      const sx = (i: number) => s.cx + (s.xs[i] - s.pathCX) * s.scale
      const sy = (i: number) => s.cy + (s.ys[i] - s.pathCY) * s.scale

      ctx.save()
      if (!reduce) {
        const a = cfg.rotBase + cfg.rotAmp * Math.sin(elapsed / cfg.rotPeriod + cfg.rotPhase)
        ctx.translate(s.cx, s.cy)
        ctx.rotate(a)
        ctx.translate(-s.cx, -s.cy)
      } else if (cfg.rotBase) {
        ctx.translate(s.cx, s.cy)
        ctx.rotate(cfg.rotBase)
        ctx.translate(-s.cx, -s.cy)
      }

      ctx.lineWidth = Math.max(0.75, dpr * cfg.widthMul)
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'

      let i = 1
      while (i <= K) {
        const t = i / N
        const bucket = Math.floor(t * BUCKETS)
        const bucketEnd = Math.min(K, Math.ceil(((bucket + 1) / BUCKETS) * N))
        ctx.strokeStyle = colorAt(t, cfg.accentMix, cfg.alpha)
        ctx.beginPath()
        ctx.moveTo(sx(i - 1), sy(i - 1))
        for (; i <= bucketEnd; i++) ctx.lineTo(sx(i), sy(i))
        ctx.stroke()
      }

      // Travelling tip while this strand is still drawing in.
      if (progress < 1) {
        ctx.beginPath()
        ctx.arc(sx(K), sy(K), dpr * (1.4 + 1.4 * cfg.accentMix), 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${ar}, ${ag}, ${ab}, ${0.5 + 0.4 * cfg.accentMix})`
        ctx.shadowColor = `rgba(${ar}, ${ag}, ${ab}, 0.7)`
        ctx.shadowBlur = dpr * 7
        ctx.fill()
        ctx.shadowBlur = 0
      }
      ctx.restore()
    }

    let raf = 0
    let startT = 0
    const lastReveal = Math.max(...RIBBONS.map(r => r.delayMs + r.revealMs))

    const render = (now: number) => {
      if (!startT) startT = now
      const elapsed = now - startT
      ctx.clearRect(0, 0, W, H)
      for (const s of strands) drawStrand(s, elapsed)
      // Keep animating for breathing; if reduced-motion, stop once all drawn.
      if (!reduce || elapsed < lastReveal) raf = requestAnimationFrame(render)
    }
    raf = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [pv])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
