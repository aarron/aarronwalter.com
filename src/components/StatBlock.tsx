import OdometerValue from './OdometerValue'

export interface StatItem {
  value: string
  label: string
}

interface StatBlockProps {
  heading?: string
  stats: StatItem[]
}

/**
 * StatBlock — "By the numbers" heading + a row of animated stat values.
 * heading is optional; omit it when embedding in pages that provide their own.
 */
export default function StatBlock({ heading, stats }: StatBlockProps) {
  return (
    <>
      {heading && (
        <p
          className="pf-awards-block__heading"
          style={{ margin: `clamp(1.5rem, 3vw, 2.5rem) var(--pf-pad) clamp(0.75rem, 1.5vw, 1rem)` }}
        >
          {heading}
        </p>
      )}
      <div className="portfolio-stats">
        {stats.map((stat) => (
          <div key={stat.label} className="portfolio-stat">
            <div className="portfolio-stat-value">
              <OdometerValue value={stat.value} />
            </div>
            <div className="portfolio-stat-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </>
  )
}
