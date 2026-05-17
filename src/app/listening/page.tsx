import type { Metadata } from 'next'
import FooterWave from '@/components/FooterWave'
import ListeningGrid from '@/components/ListeningGrid'
import RidgelineCanvas from '@/components/RidgelineCanvas'
import { GW150914_DATA } from '@/lib/gw150914'
import { records } from '@/data/records'
import type { RecordMeta } from '@/components/RecordCard'
import coversJson from '@/data/record-covers.json'

export const metadata: Metadata = {
  title: 'Listening — Aarron Walter',
  description: "Aarron Walter's vinyl record collection.",
}

const covers = coversJson as Record<string, {
  cover: string | null
  thumb: string | null
  genres?: string[]
  styles?: string[]
  country?: string | null
  tracklist?: { position: string; title: string; duration: string }[]
}>

// Sort: 5-star first, then by artist
const sorted = [...records]
  .sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating
    return a.artist.localeCompare(b.artist)
  })
  .map(r => {
    const cached = r.releaseId ? covers[String(r.releaseId)] : undefined
    const meta: RecordMeta = cached
      ? {
          found:      true,
          cover:      cached.cover,
          thumb:      cached.thumb,
          genres:     cached.genres,
          styles:     cached.styles,
          country:    cached.country ?? undefined,
          tracklist:  cached.tracklist,
          discogsUrl: r.releaseId ? `https://www.discogs.com/release/${r.releaseId}` : undefined,
        }
      : { found: false }
    return { record: r, meta }
  })

export default function ListeningPage() {
  return (
    <>
      <article className="page-article">
        <RidgelineCanvas
          className="page-hero-canvas"
          data={GW150914_DATA}
          ampRef={0.48}
          animate="breath"
        />

        <header className="page-header">
          <h1 className="page-header-title">Listening</h1>
          <hr className="page-header-rule" />
          <p className="page-header-intro">
            Music is the heart of my studio. Vinyl is how I love to listen. Keep them spinning — here's what's in rotation.
          </p>
        </header>

        <div className="page-content">
          <ListeningGrid records={sorted} />
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
