import type { Metadata } from 'next'
import FooterWave from '@/components/FooterWave'
import ReadingGrid from '@/components/ReadingGrid'
import TopoCanvas from '@/components/TopoCanvas'
import { books, years } from '@/data/books'
import type { BookMeta } from '@/components/BookCard'
import coversJson from '@/data/book-covers.json'

export const metadata: Metadata = {
  title: 'Reading — Aarron Walter',
  description: 'Books Aarron Walter has read, organized by year.',
}

// Type the JSON so TypeScript is happy
const covers = coversJson as Record<string, { coverUrl: string | null; firstPublished?: number; subjects?: string[]; description?: string | null }>

function coverKey(title: string, author: string) {
  return `${title}::${author}`
}

export default function ReadingPage() {
  const allYears = years()

  // Merge pre-fetched cover data with each book
  const booksByYear = allYears.reduce<Record<number, Array<{ title: string; author: string; year: number; favorite: boolean; coverUrl?: string; meta: BookMeta }>>>((acc, y) => {
    acc[y] = books
      .filter(b => b.year === y)
      .map(b => {
        const key = coverKey(b.title, b.author)
        const cached = covers[key]
        const meta: BookMeta = cached
          ? { found: true, coverUrl: b.coverUrl ?? cached.coverUrl, firstPublished: cached.firstPublished, subjects: cached.subjects, description: b.description ?? cached.description ?? null }
          : { found: false, coverUrl: b.coverUrl ?? null, description: b.description ?? null }
        return { ...b, meta }
      })
    return acc
  }, {})

  return (
    <>
      <article className="page-article">
        {/* Canvas is article-level so it can extend below the header into the content */}
        <TopoCanvas className="page-hero-canvas" />

        <header className="page-header">
          <h1 className="page-header-title">Reading</h1>
          <hr className="page-header-rule" />
          <p className="page-header-intro">
            Some books explain the world. Some just let you leave it for a while.
            Not every book here will be worth your time. But each one was worth mine.
          </p>
        </header>

        <div className="page-content">
          <ReadingGrid booksByYear={booksByYear} years={allYears} />
        </div>
      </article>

      <footer className="site-footer site-footer--light">
        <div className="footer-wave-wrap" aria-hidden="true"><FooterWave /></div>
        <div className="footer-inner">
          <span className="t-caption">© {new Date().getFullYear()} <strong className="footer-name">Aarron Walter</strong></span>
          <nav className="footer-links">
            <a href="https://designbetterpodcast.com" target="_blank" rel="noopener noreferrer">Design Better</a>
            <a href="https://linkedin.com/in/aarronwalter" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </nav>
        </div>
      </footer>
    </>
  )
}
