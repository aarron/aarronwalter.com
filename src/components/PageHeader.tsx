interface PageHeaderProps {
  eyebrow?: string
  title: string
  /** Optional image rendered directly below the red rule */
  logo?: React.ReactNode
}

/**
 * PageHeader — eyebrow label, h1 title, orange rule, and optional logo.
 * Used at the top of every portfolio page.
 */
export default function PageHeader({ eyebrow, title, logo }: PageHeaderProps) {
  return (
    <header className="portfolio-header">
      {eyebrow && <p className="t-label portfolio-eyebrow">{eyebrow}</p>}
      <h1 className="portfolio-title">{title}</h1>
      <hr className="page-header-rule" />
      {logo && <div className="portfolio-header-logo">{logo}</div>}
    </header>
  )
}
