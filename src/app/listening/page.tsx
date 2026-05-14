import type { Metadata } from 'next'
import FooterWave from '@/components/FooterWave'
import ListeningGrid from '@/components/ListeningGrid'
import TopoCanvas from '@/components/TopoCanvas'
import { records } from '@/data/records'

export const metadata: Metadata = {
  title: 'Listening — Aarron Walter',
  description: "Aarron Walter's vinyl record collection.",
}

// Sort: 5-star first, then by artist
const sorted = [...records].sort((a, b) => {
  if (b.rating !== a.rating) return b.rating - a.rating
  return a.artist.localeCompare(b.artist)
})

export default function ListeningPage() {
  return (
    <>
      <article className="reading-article">
        <TopoCanvas className="reading-topo-canvas" />

        <header className="reading-header">
          <h1 className="reading-header-title">Listening</h1>
          <hr className="reading-header-rule" />
          <p className="reading-header-intro">
            Records I return to again and again. Some for the music, some for the feeling,
            some because they changed how I hear everything else.
          </p>
        </header>

        <div className="reading-page-content">
          <ListeningGrid records={sorted} />
        </div>
      </article>

      <footer className="site-footer site-footer--light">
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
