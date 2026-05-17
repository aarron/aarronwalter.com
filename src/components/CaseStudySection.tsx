import CaseMeta, { type CaseMetaItem } from './CaseMeta'

interface CaseStudySectionProps {
  /** "Case Study · 2010" style label */
  label: string
  heading: string
  meta?: CaseMetaItem[]
  /** Text column body — pass <p> elements or any ReactNode */
  children: React.ReactNode
  /** Visual panel (PortfolioPanel, BrowserFrame, etc.) */
  panel: React.ReactNode
  /** Flip puts the panel on the left and text on the right */
  flip?: boolean
  /** Extra className for the outer ds-split wrapper */
  className?: string
  style?: React.CSSProperties
}

/**
 * CaseStudySection — ds-split layout with label, heading, optional meta,
 * body text on one side and a visual panel on the other.
 * Accepts a `flip` prop to mirror the column order.
 */
export default function CaseStudySection({
  label,
  heading,
  meta,
  children,
  panel,
  flip = false,
  className,
  style,
}: CaseStudySectionProps) {
  const classes = ['ds-split', flip && 'ds-split--flip', className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} style={style}>
      <div className="ds-split__text">
        <p className="pf-label">{label}</p>
        <h2 className="pf-heading">{heading}</h2>
        {meta && <CaseMeta items={meta} />}
        {children}
      </div>
      <div className="ds-split__panel">{panel}</div>
    </div>
  )
}
