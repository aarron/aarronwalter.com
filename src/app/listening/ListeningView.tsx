import FooterWave from '@/components/FooterWave'
import ListeningGrid from '@/components/ListeningGrid'
import GrooveCanvas from '@/components/GrooveCanvas'
import { records } from '@/data/records'
import type { RecordMeta } from '@/components/RecordCard'
import coversJson from '@/data/record-covers.json'
import spotifyJson from '@/data/record-spotify.json'
import overridesJson from '@/data/record-genre-overrides.json'

const covers = coversJson as Record<string, {
  cover: string | null
  thumb: string | null
  genres?: string[]
  styles?: string[]
  country?: string | null
  tracklist?: { position: string; title: string; duration: string }[]
  originalYear?: number | null
}>

// Hand corrections to Discogs genres/styles (src/data/record-genre-overrides.json)
type Override = { removeGenres?: string[]; addGenres?: string[]; removeStyles?: string[]; addStyles?: string[] }
const overrides = overridesJson as unknown as Record<string, Override>
function corrected(list: string[] | undefined, remove?: string[], add?: string[]) {
  const out = (list ?? []).filter(x => !remove?.includes(x))
  for (const x of add ?? []) if (!out.includes(x)) out.push(x)
  return out
}

// Spotify album IDs, matched by scripts/fetch-spotify-albums.ts
const spotify = spotifyJson as Record<string, { albumId: string } | null>

// URL-safe name for each record: /listening/miles-davis-kind-of-blue
export function slugify(s: string) {
  return s
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '')
}

const slugs = new Map<number, string>()
{
  const used = new Set<string>()
  for (const r of records) {
    if (r.releaseId == null) continue
    let slug = slugify(`${r.artist} ${r.title}`) || String(r.releaseId)
    if (used.has(slug)) slug = `${slug}-${r.releaseId}`   // same album twice (e.g. two pressings)
    used.add(slug)
    slugs.set(r.releaseId, slug)
  }
}

// Sorting and grouping happen in ListeningGrid so visitors can switch views.
export const withMeta = records
  .map(r => {
    const cached = r.releaseId ? covers[String(r.releaseId)] : undefined
    const meta: RecordMeta = cached
      ? {
          found:      true,
          cover:      cached.cover,
          thumb:      cached.thumb,
          genres:     corrected(cached.genres, overrides[String(r.releaseId)]?.removeGenres, overrides[String(r.releaseId)]?.addGenres),
          styles:     corrected(cached.styles, overrides[String(r.releaseId)]?.removeStyles, overrides[String(r.releaseId)]?.addStyles),
          country:    cached.country ?? undefined,
          tracklist:  cached.tracklist,
          originalYear: cached.originalYear ?? r.released,
          spotifyAlbumId: r.releaseId ? spotify[String(r.releaseId)]?.albumId : undefined,
          discogsUrl: r.releaseId ? `https://www.discogs.com/release/${r.releaseId}` : undefined,
          slug:       r.releaseId ? slugs.get(r.releaseId) : undefined,
        }
      : { found: false, slug: r.releaseId ? slugs.get(r.releaseId) : undefined }
    return { record: r, meta }
  })

export default function ListeningView({ initialSlug }: { initialSlug?: string }) {
  return (
    <>
      <article className="page-article">
        <GrooveCanvas className="page-hero-canvas" />
        <span className="viz-credit" style={{ bottom: 'auto', top: 'calc(clamp(16rem, 24vw, 20rem) + clamp(4rem, 12vw, 10rem) * 0.9 + clamp(1.5rem, 3vw, 2.5rem))' }}>Data source: <a href="https://archive.org/details/TheSoundsOfEarth" target="_blank" rel="noopener noreferrer">Voyager Golden Record</a> · NASA · “The Sounds of Earth,” 1977</span>

        <header className="page-header">
          <h1 className="page-header-title">Listening</h1>
          <hr className="page-header-rule" />
          <p className="page-header-intro">
            Music is the heart of my studio. Vinyl is how I love to listen. Here's my current vinyl collection.
          </p>
        </header>

        <div className="page-content">
          <ListeningGrid records={withMeta} initialSlug={initialSlug} />
        </div>
      </article>

      <footer className="site-footer site-footer--light">
        <div className="footer-wave-wrap" aria-hidden="true"><FooterWave /></div>
        <div className="footer-inner">
          <span className="t-caption">© {new Date().getFullYear()} <strong className="footer-name">Aarron Walter</strong></span>
          <nav className="footer-links">
            <a href="https://designbetter.com" target="_blank" rel="noopener noreferrer">Design Better</a>
            <a href="https://linkedin.com/in/aarronwalter" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </nav>
        </div>
      </footer>
    </>
  )
}
