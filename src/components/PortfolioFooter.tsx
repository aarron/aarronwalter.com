import FooterWave from './FooterWave'

const BUG_URL =
  'https://github.com/aarron/aarronwalter.com/issues/new?labels=bug&title=%5BBug%5D+'

/**
 * PortfolioFooter — site footer with animated wave and copyright/links.
 * Shared across all portfolio pages.
 */
export default function PortfolioFooter() {
  return (
    <footer className="site-footer site-footer--light">
      <div className="footer-wave-wrap" aria-hidden="true">
        <FooterWave />
      </div>
      <div className="footer-inner">
        <span className="t-caption">
          © {new Date().getFullYear()} <strong className="footer-name">Aarron Walter</strong>
        </span>
        <nav className="footer-links">
          <a href="https://designbetterpodcast.com" target="_blank" rel="noopener noreferrer">
            Design Better
          </a>
          <a href="https://linkedin.com/in/aarronwalter" target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <a href="/colophon">Colophon</a>
          <a href={BUG_URL} target="_blank" rel="noopener noreferrer">
            File a bug
          </a>
        </nav>
      </div>
    </footer>
  )
}
