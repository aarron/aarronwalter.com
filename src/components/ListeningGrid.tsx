'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
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
}

type SortMode = 'rating' | 'artist' | 'year' | 'genre'

const SORT_LABELS: Record<SortMode, string> = {
  rating: 'Rating',
  artist: 'A–Z',
  year:   'Year',
  genre:  'Genre',
}

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
  return r === 0 ? 'Unrated' : '★'.repeat(r)
}

export default function ListeningGrid({ records }: Props) {
  const [modal,    setModal]    = useState<{ id: number; nav: number[] } | null>(null)
  const [search,   setSearch]   = useState('')
  const [genre,    setGenre]    = useState<string | null>(null)
  const [sort,     setSort]     = useState<SortMode>('rating')
  const [newest,   setNewest]   = useState(false)
  const [unrated,  setUnrated]  = useState(false)
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
      (!unrated || r.rating === 0)
    )
  }, [withRatings, search, genre, unrated])

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
      {/* ── Sort ── */}
      <div className="record-sort-nav" role="group" aria-label="Sort records">
        <span className="record-sort-label">Sort</span>
        {(Object.keys(SORT_LABELS) as SortMode[]).map(m => (
          <button
            key={m}
            className={`page-filter-btn${sort === m ? ' is-active' : ''}`}
            onClick={() => setSort(m)}
            aria-pressed={sort === m}
          >{SORT_LABELS[m]}</button>
        ))}
        {sort === 'year' && (
          <button className="page-filter-btn" onClick={() => setNewest(n => !n)}>
            {newest ? 'Newest first ↓' : 'Oldest first ↑'}
          </button>
        )}
      </div>

      {/* ── Filters ── */}
      <div className="page-filter-nav record-filter-nav">
        <div className="page-filter-btns">
          <button
            className={`page-filter-btn${!genre ? ' is-active' : ''}`}
            onClick={() => setGenre(null)}
          >All</button>
          {availableGenres.map(g => (
            <button
              key={g}
              className={`page-filter-btn${genre === g ? ' is-active' : ''}`}
              onClick={() => setGenre(genre === g ? null : g)}
            >{g}</button>
          ))}
          {CAN_RATE && (
            <button
              className={`page-filter-btn record-unrated-btn${unrated ? ' is-active' : ''}`}
              onClick={() => setUnrated(u => !u)}
            >Unrated ({unratedCount})</button>
          )}
        </div>
        <input
          type="search"
          className="record-search"
          placeholder="Search artist or album…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search records"
        />
      </div>

      {CAN_RATE && (
        <p className="record-rate-hint">
          Rating mode (local only): click the stars under a cover, or open a record and press 1–5 to rate and move on, 0 to clear, ← → to browse.
          {saveError && <span className="record-rate-error"> {saveError}</span>}
        </p>
      )}

      <p className="record-count">
        {filtered.length} {filtered.length === 1 ? 'record' : 'records'}
        {sort === 'genre' && ' · records with more than one genre appear in each'}
      </p>

      {/* ── Sections ── */}
      {sections.map(([heading, items]) => (
        <section key={heading} className="page-section">
          <h2 className="page-section-heading">{heading}</h2>
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
