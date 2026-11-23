'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import OdometerValue from './OdometerValue'

type Day = [string, number, [string, number][]]

interface Props {
  days:  Day[]                       // Sunday-first, one entry per day
  names: Record<string, string>      // project slug → display name
}

const CELL = 15, GAP = 4, STEP = CELL + GAP, TOP = 22, LEFT = 34

// Commit count → shade (0–4)
const level = (n: number) => (n === 0 ? 0 : n <= 3 ? 1 : n <= 10 ? 2 : n <= 25 ? 3 : 4)

const fmtDay = (iso: string) =>
  new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })

export default function ActivityGrid({ days, names }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [tip, setTip] = useState<{ x: number; y: number; day: Day } | null>(null)

  // On narrow screens the chart scrolls sideways; start at the most recent activity.
  useEffect(() => {
    const el = wrapRef.current
    if (el) el.scrollLeft = el.scrollWidth
  }, [])

  const cols = Math.ceil(days.length / 7)
  const W = LEFT + cols * STEP, H = TOP + 7 * STEP

  const months = useMemo(() => {
    const out: { x: number; label: string }[] = []
    let last = -1
    days.forEach((d, i) => {
      if (i % 7 !== 0) return
      const date = new Date(d[0] + 'T00:00:00Z')
      if (date.getUTCMonth() !== last && date.getUTCDate() <= 7) {
        last = date.getUTCMonth()
        out.push({ x: LEFT + Math.floor(i / 7) * STEP, label: date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }) })
      }
    })
    return out
  }, [days])

  const stats = useMemo(() => {
    const total = days.reduce((a, d) => a + d[1], 0)
    const active = days.filter(d => d[1] > 0).length
    let best = 0, cur = 0
    for (const d of days) { cur = d[1] ? cur + 1 : 0; best = Math.max(best, cur) }
    const busiest = days.reduce((a, b) => (b[1] > a[1] ? b : a))
    return { total, active, best, busiest }
  }, [days])

  const show = (e: React.MouseEvent | React.FocusEvent, day: Day) => {
    const wrap = wrapRef.current?.getBoundingClientRect()
    const cell = (e.currentTarget as SVGRectElement).getBoundingClientRect()
    if (!wrap) return
    setTip({ x: cell.left - wrap.left + cell.width / 2, y: cell.top - wrap.top, day })
  }

  return (
    <div className="activity">
      <dl className="activity-stats">
        <div className="activity-stat">
          <dt>Commits this year</dt>
          <dd><OdometerValue value={stats.total.toLocaleString()} /></dd>
        </div>
        <div className="activity-stat">
          <dt>Days building</dt>
          <dd><OdometerValue value={String(stats.active)} /></dd>
        </div>
        <div className="activity-stat">
          <dt>Longest streak (days)</dt>
          <dd><OdometerValue value={String(stats.best)} /></dd>
        </div>
        <div className="activity-stat">
          <dt>Most commits in a day ({new Date(stats.busiest[0] + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })})</dt>
          <dd><OdometerValue value={String(stats.busiest[1])} /></dd>
        </div>
      </dl>

      <div className="activity-scroll" ref={wrapRef}>
        <svg className="activity-grid" viewBox={`0 0 ${W} ${H}`} style={{ minWidth: W * 0.8 }} role="img"
          aria-label={`${stats.total} commits over the past year`} onMouseLeave={() => setTip(null)}>
          {months.map(m => <text key={m.x} x={m.x} y={12}>{m.label}</text>)}
          {['Mon', 'Wed', 'Fri'].map((t, i) => <text key={t} x={0} y={TOP + (i * 2 + 1) * STEP + CELL - 2}>{t}</text>)}
          {days.map((d, i) => (
            <rect
              key={d[0]}
              x={LEFT + Math.floor(i / 7) * STEP}
              y={TOP + (i % 7) * STEP}
              width={CELL} height={CELL} rx={2}
              className={`activity-cell l${level(d[1])}`}
              style={{ animationDelay: `${Math.floor(i / 7) * 18 + (i % 7) * 6}ms` }}
              aria-label={`${d[1]} commits, ${fmtDay(d[0])}`}
              onMouseEnter={e => show(e, d)}
            />
          ))}
        </svg>
        {tip && (
          <div className="activity-tip" style={{ left: tip.x, top: tip.y }} role="tooltip">
            <strong>{tip.day[1]} commit{tip.day[1] === 1 ? '' : 's'}</strong>
            <span className="activity-tip-date">{fmtDay(tip.day[0])}</span>
            {tip.day[2].map(([slug, n]) => <span key={slug}>{names[slug] ?? slug} · {n}</span>)}
          </div>
        )}
      </div>

      <p className="activity-scale" aria-hidden="true">
        <span>Fewer commits</span> {[0, 1, 2, 3, 4].map(l => <i key={l} className={`l${l}`} />)} <span>More</span>
      </p>
    </div>
  )
}
