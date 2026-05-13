import type { Metadata } from 'next'
import FooterWave from '@/components/FooterWave'
import ReadingGrid from '@/components/ReadingGrid'
import { books, years } from '@/data/books'

export const metadata: Metadata = {
  title: 'Reading — Aarron Walter',
  description: 'Books Aarron Walter has read, organized by year.',
}

export default function ReadingPage() {
  const allYears = years()
  const booksByYear = allYears.reduce<Record<number, typeof books>>((acc, y) => {
    acc[y] = books.filter(b => b.year === y)
    return acc
  }, {})

  return (
    <>
      <article>
        <header className="portfolio-header">
          <a href="/" className="portfolio-back t-label">← My work</a>
          <p className="t-label portfolio-eyebrow">A life in books</p>
          <h1 className="portfolio-title">Reading</h1>
          <p className="portfolio-roles">
            Books I&rsquo;ve loved, organized by year
          </p>
        </header>

        <div className="reading-page-content">
          <ReadingGrid booksByYear={booksByYear} years={allYears} />
        </div>
      </article>

      <footer className="site-footer">
        <div className="footer-wave-wrap" aria-hidden="true"><FooterWave /></div>
        <div className="footer-inner">
          <span className="t-caption">© {new Date().getFullYear()} Aarron Walter</span>
          <nav className="footer-links">
            <a href="https://designbetterpodcast.com" target="_blank" rel="noopener noreferrer">Design Better</a>
            <a href="https://linkedin.com/in/aarronwalter" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </nav>
        </div>
      </footer>
    </>
  )
}
