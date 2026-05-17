export interface NavLink {
  href: string
  label: string
  /** Override the direction indicator (defaults to "← Previous" / "Next →") */
  dir?: string
}

interface PortfolioNavProps {
  prev?: NavLink
  next?: NavLink
}

/**
 * PortfolioNav — prev / next navigation between portfolio pages.
 * Pass null/undefined for prev or next to hide that side.
 */
export default function PortfolioNav({ prev, next }: PortfolioNavProps) {
  return (
    <nav className="portfolio-nav" aria-label="Portfolio navigation">
      {prev && (
        <a href={prev.href} className="portfolio-nav-link">
          <span className="portfolio-nav-dir">{prev.dir ?? '← Previous'}</span>
          <span className="portfolio-nav-title">{prev.label}</span>
        </a>
      )}
      {next && (
        <a href={next.href} className="portfolio-nav-link is-next">
          <span className="portfolio-nav-dir">{next.dir ?? 'Next →'}</span>
          <span className="portfolio-nav-title">{next.label}</span>
        </a>
      )}
    </nav>
  )
}
