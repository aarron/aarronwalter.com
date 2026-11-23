'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import RecordCard, { type RecordMeta } from './RecordCard'
import RecordModal from './RecordModal'
import type { VinylRecord } from '@/data/records'

interface RecordWithMeta {
  record: VinylRecord
  meta:   RecordMeta
}

interface Props {
  records: RecordWithMeta[]
  /** Open this record's modal on load (from /listening/{slug}). */
  initialSlug?: string
}

type SortMode = 'rating' | 'artist' | 'year' | 'genre'
type RatingFilter = 'any' | '5' | '4' | '3' | 'unrated'

// Discogs genres, in display order. A record can belong to several; genres and
// styles come from the album's Discogs master release, so they describe the album
// rather than one pressing.
const GENRE_ORDER = [
  'Rock', 'Jazz', 'Funk / Soul', 'Blues', 'Pop', 'Folk, World, & Country',
  'Electronic', 'Reggae', 'Hip Hop', 'Latin', 'Stage & Screen', 'Classical',
]

function genresOf(meta: RecordMeta) {
  const known = GENRE_ORDER.filter(g => meta.genres?.includes(g))
  return known.length ? known : ['Other']
}

// Ratings are edited only while running the site locally (npm run dev).
const CAN_RATE = process.env.NODE_ENV === 'development'

// Record-store order: ignore a leading "The", "A" or "An".
function sortName(s: string) {
  return s.replace(/^(the|a|an)\s+/i, '').toLowerCase()
}

function yearOf({ record, meta }: RecordWithMeta) {
  return meta.originalYear ?? record.released ?? null
}

function byArtist(a: RecordWithMeta, b: RecordWithMeta) {
  return sortName(a.record.artist).localeCompare(sortName(b.record.artist))
    || (yearOf(a) ?? 0) - (yearOf(b) ?? 0)
    || sortName(a.record.title).localeCompare(sortName(b.record.title))
}

function ratingHeading(r: number) {
  return r === 0 ? 'Unrated' : `${r} star${r === 1 ? '' : 's'}`
}

// Rating sections draw small filled/outlined stars; other sections show their title.
function SectionTitle({ heading }: { heading: string }) {
  const m = heading.match(/^(\d) stars?$/)
  if (!m) return <>{heading}</>
  const n = Number(m[1])
  return (
    <span className="record-section-stars" aria-label={heading}>
      {[1, 2, 3, 4, 5].map(i => <span key={i} aria-hidden className={i <= n ? 'is-on' : 'is-off'}>{i <= n ? '★' : '☆'}</span>)}
    </span>
  )
}

// Small inline icons (stroke follows the text colour)
const iconProps = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }
const FilterIcon = () => <svg {...iconProps}><path d="M3 5h18l-7 8.5V19l-4 2v-7.5z" /></svg>
const SortIcon = () => <svg {...iconProps}><path d="M7 4v16M3 8l4-4 4 4M17 20V4M13 16l4 4 4-4" /></svg>
const SearchIcon = () => <svg {...iconProps}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>

export default function ListeningGrid({ records, initialSlug }: Props) {
  const [modal,    setModal]    = useState<{ id: number; nav: number[] } | null>(null)
  const [search,   setSearch]   = useState('')
  const [genre,    setGenre]    = useState<string | null>(null)
  const [sort,     setSort]     = useState<SortMode>('rating')
  const [newest,   setNewest]   = useState(false)
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('any')
  const [mounted,  setMounted]  = useState(false)
  // Local overrides so a new rating shows immediately, before the page reloads.
  const [ratings,  setRatings]  = useState<Record<number, number>>({})
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => { setMounted(true) }, [])

  const withRatings = useMemo(() => records.map(r =>
    r.record.releaseId != null && ratings[r.record.releaseId] !== undefined
      ? { ...r, record: { ...r.record, rating: ratings[r.record.releaseId] } }
      : r
  ), [records, ratings])

  const availableGenres = GENRE_ORDER.filter(g =>
    records.some(({ meta }) => meta.genres?.includes(g))
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return withRatings.filter(({ record: r, meta }) =>
      (!q || r.artist.toLowerCase().includes(q) || r.title.toLowerCase().includes(q)) &&
      (!genre || meta.genres?.includes(genre)) &&
      (ratingFilter === 'any' ? true : ratingFilter === 'unrated' ? r.rating === 0 : r.rating >= Number(ratingFilter))
    )
  }, [withRatings, search, genre, ratingFilter])

  // Group into titled sections according to the sort mode.
  const sections = useMemo(() => {
    const groups = new Map<string, RecordWithMeta[]>()
    const add = (key: string, item: RecordWithMeta) => {
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(item)
    }
    const items = [...filtered]

    if (sort === 'rating') {
      items.sort((a, b) => b.record.rating - a.record.rating || byArtist(a, b))
      items.forEach(i => add(ratingHeading(i.record.rating), i))
    } else if (sort === 'artist') {
      items.sort(byArtist)
      items.forEach(i => {
        const c = sortName(i.record.artist).charAt(0).toUpperCase()
        add(/[A-Z]/.test(c) ? c : '#', i)
      })
    } else if (sort === 'year') {
      items.sort((a, b) => {
        const ya = yearOf(a), yb = yearOf(b)
        if (ya == null || yb == null) return ya == null ? (yb == null ? 0 : 1) : -1
        return (newest ? yb - ya : ya - yb) || byArtist(a, b)
      })
      items.forEach(i => {
        const y = yearOf(i)
        add(y == null ? 'Undated' : `${Math.floor(y / 10) * 10}s`, i)
      })
    } else {
      // A record appears under each of its genres.
      for (const g of [...GENRE_ORDER, 'Other']) groups.set(g, [])
      items.sort(byArtist).forEach(i => genresOf(i.meta).forEach(g => add(g, i)))
    }
    return [...groups.entries()].filter(([, list]) => list.length > 0)
  }, [filtered, sort, newest])

  // Each record once, in on-screen order (genre view can show a record more than once).
  const ordered = useMemo(() => [...new Set(sections.flatMap(([, items]) => items))], [sections])
  const byId = useMemo(() => new Map(withRatings.map(r => [r.record.releaseId, r])), [withRatings])

  const openRecord = useCallback((record: VinylRecord) => {
    if (record.releaseId == null) return
    // Remember the order at open time so arrow keys still work after ratings re-sort the grid.
    setModal({ id: record.releaseId, nav: ordered.map(r => r.record.releaseId!).filter(id => id != null) })
  }, [ordered])

  // ── Each open record has its own URL: /listening/{slug} ──
  const bySlug = useMemo(() => new Map(records.map(r => [r.meta.slug, r.record.releaseId])), [records])
  const slugOf = useCallback((id: number) => byId.get(id)?.meta.slug, [byId])
  const navIds = useCallback(() => ordered.map(r => r.record.releaseId!).filter(id => id != null), [ordered])

  // Landing on a record's URL opens it.
  const opened = useRef(false)
  useEffect(() => {
    if (opened.current || !initialSlug) return
    opened.current = true
    const id = bySlug.get(initialSlug)
    if (id != null) setModal({ id, nav: navIds() })
  }, [initialSlug, bySlug, navIds])

  // Keep the address bar in step with the modal.
  const wasOpen = useRef(false)
  useEffect(() => {
    if (!mounted) return
    const path = modal ? `/listening/${slugOf(modal.id) ?? ''}` : '/listening'
    if (window.location.pathname !== path) {
      // Opening adds a history entry (so Back closes it); stepping and closing replace it.
      if (modal && !wasOpen.current) window.history.pushState(null, '', path)
      else window.history.replaceState(null, '', path)
    }
    wasOpen.current = !!modal
  }, [modal, mounted, slugOf])

  // Back/forward buttons open or close records to match the URL.
  useEffect(() => {
    const onPop = () => {
      const m = window.location.pathname.match(/^\/listening\/([^/]+)\/?$/)
      const id = m ? bySlug.get(decodeURIComponent(m[1])) : undefined
      if (id != null) setModal(prev => ({ id, nav: prev?.nav ?? navIds() }))
      else setModal(null)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [bySlug, navIds])

  const rate = useCallback(async (releaseId: number, rating: number) => {
    setRatings(prev => ({ ...prev, [releaseId]: rating }))
    try {
      const res = await fetch('/api/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ releaseId, rating }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setSaveError(null)
    } catch (err) {
      setSaveError(`Couldn't save that rating (${(err as Error).message}). Is npm run dev running?`)
    }
  }, [])

  const step = useCallback((dir: 1 | -1) => {
    setModal(m => {
      if (!m) return m
      const i = m.nav.indexOf(m.id)
      const next = m.nav[i + dir]
      return next == null ? m : { ...m, id: next }
    })
  }, [])

  useEffect(() => {
    if (!modal) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModal(null)
      else if (e.key === 'ArrowRight') step(1)
      else if (e.key === 'ArrowLeft') step(-1)
      else if (CAN_RATE && /^[0-5]$/.test(e.key)) {
        rate(modal.id, Number(e.key))
        if (e.key !== '0') step(1)
      }
    }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [modal, step, rate])

  const current = modal ? byId.get(modal.id) : undefined
  const navIndex = modal ? modal.nav.indexOf(modal.id) : -1
  const unratedCount = withRatings.filter(r => r.record.rating === 0).length

  return (
    <>
      {/* ── Toolbar: filters (left), search, sort (right) ── */}
      <div className="record-toolbar">
        <div className="record-filters" role="group" aria-label="Filter records">
          <span className="record-toolbar-label"><FilterIcon /> Filter</span>
          <label className={`record-menu${genre ? ' is-set' : ''}`}>
            <span className="sr-only">Genre</span>
            <select value={genre ?? ''} onChange={e => setGenre(e.target.value || null)}>
              <option value="">All genres</option>
              {availableGenres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>
          <label className={`record-menu${ratingFilter !== 'any' ? ' is-set' : ''}`}>
            <span className="sr-only">Rating</span>
            <select value={ratingFilter} onChange={e => setRatingFilter(e.target.value as RatingFilter)}>
              <option value="any">Any rating</option>
              <option value="5">★★★★★ only</option>
              <option value="4">★★★★ and up</option>
              <option value="3">★★★ and up</option>
              {CAN_RATE && <option value="unrated">Unrated ({unratedCount})</option>}
            </select>
          </label>
          {(genre || ratingFilter !== 'any' || search) && (
            <button
              type="button"
              className="record-clear"
              onClick={() => { setGenre(null); setRatingFilter('any'); setSearch('') }}
            >Clear</button>
          )}
        </div>

        <label className="record-search-wrap">
          <SearchIcon />
          <input
            type="search"
            className="record-search"
            placeholder="Search artist or album…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search records"
          />
        </label>

        <label className="record-sort">
          <SortIcon />
          <span>Sort by</span>
          <select
            value={sort === 'year' ? (newest ? 'year-new' : 'year-old') : sort}
            onChange={e => {
              const v = e.target.value
              if (v.startsWith('year')) { setSort('year'); setNewest(v === 'year-new') }
              else setSort(v as SortMode)
            }}
          >
            <option value="rating">Rating</option>
            <option value="artist">Artist A–Z</option>
            <option value="year-old">Year, oldest first</option>
            <option value="year-new">Year, newest first</option>
            <option value="genre">Genre</option>
          </select>
        </label>
      </div>

      {CAN_RATE && (
        <p className="record-rate-hint">
          Rating mode (local only): filled stars are your rating. Click a star to change it, or click your current rating to clear it. Or open a record and press 1–5 to rate and move on, 0 to clear, ← → to browse.
          {saveError && <span className="record-rate-error"> {saveError}</span>}
        </p>
      )}

      <p className="record-count">
        {filtered.length} {filtered.length === 1 ? 'record' : 'records'}
        {sort === 'genre' && ' · records with more than one genre appear in each'}
      </p>

      {/* ── Sections ── */}
      {sections.map(([heading, items]) => (
        <section key={heading} className="record-section">
          <h2 className="record-section-heading">
            <SectionTitle heading={heading} />
            <span className="record-section-count">{items.length}</span>
          </h2>
          <div className="book-grid record-grid">
            {items.map(({ record, meta }, i) => (
              <RecordCard
                key={`${heading}-${record.releaseId ?? i}`}
                record={record}
                meta={meta}
                year={yearOf({ record, meta })}
                onOpen={openRecord}
                onRate={CAN_RATE ? rate : undefined}
              />
            ))}
          </div>
        </section>
      ))}

      {/* ── Modal (portal to body) ── */}
      {mounted && current && modal && createPortal(
        <RecordModal
          record={current.record}
          meta={current.meta}
          year={yearOf(current)}
          position={`${navIndex + 1} of ${modal.nav.length}`}
          hasPrev={navIndex > 0}
          hasNext={navIndex < modal.nav.length - 1}
          onPrev={() => step(-1)}
          onNext={() => step(1)}
          onClose={() => setModal(null)}
          onRate={CAN_RATE && current.record.releaseId != null ? r => rate(current.record.releaseId!, r) : undefined}
        />,
        document.body
      )}
    </>
  )
}
