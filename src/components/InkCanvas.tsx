'use client'

import { useEffect, useRef } from 'react'

// ─────────────────────────────────────────────────────────────────────────
//  InkCanvas — ink tendrils bleed outward from the illustration region,
//  grow slowly like wet ink soaking through paper, hold, then dissolve.
//  Canvas uses mix-blend-mode: multiply so strokes integrate with both
//  the cream page and the illustration beneath.
// ─────────────────────────────────────────────────────────────────────────

const INK         = 'rgb(20, 10, 4)'    // warm India-ink black
const MAX_ACTIVE  = 14
const SPAWN_EVERY = 110                  // frames between new tendrils

interface Pt { x: number; y: number }

interface Tendril {
  pts:       Pt[]
  angle:     number   // current heading (radians)
  speed:     number   // px per frame
  width:     number   // stroke width
  alpha:     number   // current opacity
  phase:     'grow' | 'hold' | 'fade'
  holdFor:   number   // frames remaining in hold
  maxPts:    number   // total points before stopping growth
}

// Illustration occupies x: ~52–100% of canvas (right:-10%, width:58%)
// Ink spawns from the left edge and interior, bleeding left onto the page.
function spawn(W: number, H: number): Tendril {
  const zone = Math.random()
  let x: number, y: number, angle: number

  if (zone < 0.45) {
    // Left edge of illustration — bleeds leftward onto the page
    x     = W * (0.50 + Math.random() * 0.10)
    y     = H * (0.06 + Math.random() * 0.80)
    angle = Math.PI + (Math.random() - 0.5) * 1.3
  } else if (zone < 0.70) {
    // Bottom of illustration — bleeds downward
    x     = W * (0.52 + Math.random() * 0.40)
    y     = H * (0.65 + Math.random() * 0.30)
    angle = Math.PI * 0.35 + Math.random() * Math.PI * 0.7
  } else {
    // Random interior — spreads in any direction
    x     = W * (0.54 + Math.random() * 0.38)
    y     = H * (0.08 + Math.random() * 0.70)
    angle = Math.random() * Math.PI * 2
  }

  return {
    pts:     [{ x, y }],
    angle,
    speed:   0.55 + Math.random() * 1.1,
    width:   0.4  + Math.random() * 2.2,
    alpha:   0,
    phase:   'grow',
    holdFor: 220 + Math.floor(Math.random() * 520),
    maxPts:  Math.floor(55 + Math.random() * 170),
  }
}

// Pre-grow a tendril so it appears already present on first frame
function preGrow(t: Tendril, fraction = 0.8) {
  let x = t.pts[0].x
  let y = t.pts[0].y
  const len = Math.floor(t.maxPts * (fraction * (0.5 + Math.random() * 0.5)))
  for (let i = 0; i < len; i++) {
    t.angle += (Math.random() - 0.5) * 0.2
    x += Math.cos(t.angle) * t.speed
    y += Math.sin(t.angle) * t.speed
    t.pts.push({ x, y })
  }
  t.phase   = 'hold'
  t.alpha   = 0.45 + Math.random() * 0.40
}

export default function InkCanvas({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf: number
    let W = 0, H = 0, frame = 0
    const tendrils: Tendril[] = []

    function resize() {
      const dpr  = Math.min(window.devicePixelRatio || 1, 2)
      W = canvas!.offsetWidth
      H = canvas!.offsetHeight
      canvas!.width  = W * dpr
      canvas!.height = H * dpr
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function tick() {
      frame++
      ctx!.clearRect(0, 0, W, H)

      // Seed pre-grown tendrils on first frame
      if (frame === 1) {
        for (let i = 0; i < 8; i++) {
          const t = spawn(W, H)
          preGrow(t)
          tendrils.push(t)
        }
      }

      // Periodically add new tendrils
      if (frame % SPAWN_EVERY === 0 && tendrils.length < MAX_ACTIVE) {
        tendrils.push(spawn(W, H))
      }

      for (let i = tendrils.length - 1; i >= 0; i--) {
        const t = tendrils[i]

        // ── Phase transitions ─────────────────────────────────
        if (t.phase === 'grow') {
          t.alpha = Math.min(0.88, t.alpha + 0.018)
          if (t.pts.length < t.maxPts) {
            const last = t.pts[t.pts.length - 1]
            t.angle  += (Math.random() - 0.5) * 0.20
            const nx  = last.x + Math.cos(t.angle) * t.speed
            const ny  = last.y + Math.sin(t.angle) * t.speed
            t.pts.push({ x: nx, y: ny })
          } else {
            t.phase = 'hold'
          }
        } else if (t.phase === 'hold') {
          if (--t.holdFor <= 0) t.phase = 'fade'
        } else {
          t.alpha -= 0.004
          if (t.alpha <= 0) { tendrils.splice(i, 1); continue }
        }

        // ── Draw ─────────────────────────────────────────────
        const pts = t.pts
        if (pts.length < 2) continue

        ctx!.save()
        ctx!.globalAlpha  = t.alpha
        ctx!.strokeStyle  = INK
        ctx!.lineWidth    = t.width
        ctx!.lineJoin     = 'round'
        ctx!.lineCap      = 'round'
        ctx!.filter       = 'blur(0.5px)'

        ctx!.beginPath()
        ctx!.moveTo(pts[0].x, pts[0].y)
        for (let j = 1; j < pts.length; j++) {
          ctx!.lineTo(pts[j].x, pts[j].y)
        }
        ctx!.stroke()

        // Wet ink blob at the growing tip
        if (t.phase === 'grow' && pts.length > 2) {
          const tip = pts[pts.length - 1]
          ctx!.filter      = 'blur(1.2px)'
          ctx!.fillStyle   = INK
          ctx!.globalAlpha = t.alpha * 0.5
          ctx!.beginPath()
          ctx!.arc(tip.x, tip.y, t.width * 1.8, 0, Math.PI * 2)
          ctx!.fill()
        }

        ctx!.restore()
      }

      raf = requestAnimationFrame(tick)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    raf = requestAnimationFrame(tick)

    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
