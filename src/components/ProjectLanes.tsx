'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

interface Lane {
  slug:     string
  name:     string
  featured: boolean
  days:     [string, number][]
}

interface Props {
  lanes: Lane[]
  start: string   // ISO date where the time axis begins
  end:   string
}

const W = 1000, LANE = 28, LEFT = 210, RIGHT = 52, TOP = 26, BREAK = 30   // BREAK: space above the 'more projects' rows
const t = (iso: string) => Date.parse(iso + 'T00:00:00Z')
const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', { ...opts, timeZone: 'UTC' })

// One row per project, one tick per day of work; taller ticks are busier days.
export default function ProjectLanes({ lanes, start, end }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [tip, setTip] = useState<{ x: number; y: number; text: React.ReactNode } | null>(null)

  // On narrow screens the chart scrolls sideways; start at the most recent activity.
  useEffect(() => {
    const el = wrapRef.current
    if (el) el.scrollLeft = el.scrollWidth
  }, [])

  const t0 = t(start), t1 = t(end) + 86400000
  const x = (iso: string) => LEFT + ((t(iso) - t0) / (t1 - t0)) * (W - LEFT - RIGHT)
  const dayW = (W - LEFT - RIGHT) / ((t1 - t0) / 86400000)
  const featuredCount = lanes.filter(l => l.featured).length
  const hasBreak = featuredCount > 0 && featuredCount < lanes.length
  const rowTop = (i: number) => TOP + i * LANE + (hasBreak && i >= featuredCount ? BREAK : 0)
  const H = rowTop(lanes.length - 1) + LANE + 6

  const max = useMemo(() => Math.max(1, ...lanes.flatMap(l => l.days.map(d => d[1]))), [lanes])
  const tick = (n: number) => 3 + 17 * Math.sqrt(n / max)

  const months = useMemo(() => {
    const out: string[] = []
    const d = new Date(t0)
    d.setUTCDate(1)
    if (d.getTime() < t0) d.setUTCMonth(d.getUTCMonth() + 1)
    while (d.getTime() < t1) { out.push(d.toISOString().slice(0, 10)); d.setUTCMonth(d.getUTCMonth() + 1) }
    return out
  }, [t0, t1])

  const show = (e: React.MouseEvent, text: React.ReactNode) => {
    const wrap = wrapRef.current?.getBoundingClientRect()
    const el = (e.currentTarget as SVGElement).getBoundingClientRect()
    if (!wrap) return
    setTip({ x: el.left - wrap.left + el.width / 2, y: el.top - wrap.top, text })
  }

  return (
    <div className="lanes-scroll" ref={wrapRef} onMouseLeave={() => setTip(null)}>
      <svg className="lanes" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Days of work on each project">
        {months.map(m => (
          <g key={m}>
            <line x1={x(m)} x2={x(m)} y1={TOP - 6} y2={H - 4} className="lanes-grid" />
            <text x={x(m) + 4} y={TOP - 10}>{fmt(m, { month: 'short' })}</text>
          </g>
        ))}
        <text x={W} y={TOP - 10} textAnchor="end">commits</text>

        {lanes.map((lane, i) => {
          const base = rowTop(i) + LANE - 7
          const total = lane.days.reduce((a, d) => a + d[1], 0)
          const first = lane.days[0]?.[0], last = lane.days[lane.days.length - 1]?.[0]
          return (
            <g key={lane.slug} className={lane.featured ? 'lane is-featured' : 'lane'}>
              {hasBreak && i === featuredCount && <text x={0} y={rowTop(i) - 6} className="lanes-group">More projects</text>}
              <text x={0} y={base} className="lane-name">{lane.name}</text>
              <line x1={LEFT} x2={W - RIGHT} y1={base + 0.5} y2={base + 0.5} className="lanes-base" />
              <text x={W} y={base} textAnchor="end" className="lane-total">{total}</text>
              {first && (
                <rect x={LEFT} y={base - LANE + 7} width={W - LEFT - RIGHT} height={LANE - 4} fill="transparent"
                  onMouseEnter={e => show(e, <><strong>{lane.name}</strong>{total} commits · {fmt(first, { month: 'short', day: 'numeric' })} to {fmt(last, { month: 'short', day: 'numeric' })}</>)} />
              )}
              {lane.days.map(([d, n]) => {
                const h = tick(n)
                return (
                  <rect key={d} x={x(d)} y={base - h} width={Math.max(1.6, dayW - 0.8)} height={h} rx={1} className="lane-tick"
                    onMouseEnter={e => show(e, <><strong>{lane.name}</strong>{n} commit{n === 1 ? '' : 's'} · {fmt(d, { weekday: 'short', month: 'short', day: 'numeric' })}</>)} />
                )
              })}
            </g>
          )
        })}
      </svg>
      {tip && <div className="activity-tip" style={{ left: tip.x, top: tip.y }} role="tooltip">{tip.text}</div>}
    </div>
  )
}
