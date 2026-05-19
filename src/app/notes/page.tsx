import type { Metadata } from 'next'
import FooterWave from '@/components/FooterWave'
import NotesFeed from '@/components/NotesFeed'
import RidgelineCanvas from '@/components/RidgelineCanvas'
import { SOLAR_WIND_DATA } from '@/lib/natural-data'
import { fetchNotes } from '@/lib/notes-feed'
import { ogImage } from '@/lib/og'

// Revalidate hourly — Substack posts are infrequent
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Feed — Aarron Walter',
  description: 'Writing, roundups, and podcast episodes by Aarron Walter.',
  openGraph: {
    title: 'Feed — Aarron Walter',
    description: 'Writing, roundups, and podcast episodes by Aarron Walter.',
    url: 'https://aarronwalter.com/notes',
    images: ogImage('Feed', 'Writing, roundups, and podcast episodes.'),
  },
  alternates: {
    canonical: 'https://aarronwalter.com/notes',
    types: {
      'application/rss+xml': 'https://db-corpus.vercel.app/api/feed',
    },
  },
}

export default async function NotesPage() {
  let notes = await fetchNotes()

  return (
    <>
      <article className="page-article">
        {/* CO2 data: Mauna Loa monthly measurements, 1960–2019 */}
        <RidgelineCanvas
          className="page-hero-canvas"
          data={SOLAR_WIND_DATA}
          ampRef={0.8}
          animate="breath"
        />
        <span className="viz-credit" style={{ bottom: 'auto', top: 'calc(clamp(16rem, 24vw, 20rem) + clamp(4rem, 12vw, 10rem) * 0.9 + clamp(1.5rem, 3vw, 2.5rem))' }}>
          Data source: <a href="https://omniweb.gsfc.nasa.gov/" target="_blank" rel="noopener noreferrer">Solar Wind Speed</a> · OMNI2 / NASA GSFC · 2000–2024
        </span>

        <header className="page-header">
          <h1 className="page-header-title">Feed</h1>
          <hr className="page-header-rule" />
          <p className="page-header-intro">
            The latest from Design Better.
          </p>
        </header>

        <div className="page-content">
          <NotesFeed notes={notes} />
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
