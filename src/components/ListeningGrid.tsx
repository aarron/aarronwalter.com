'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import RecordCard, { type RecordMeta } from './RecordCard'
import type { VinylRecord } from '@/data/records'

interface RecordWithMeta {
  record: VinylRecord
  meta:   RecordMeta
}

interface Props {
  records: RecordWithMeta[]
}

interface ModalState {
  record: VinylRecord
  meta:   RecordMeta
}

// Genres worth showing as filter pills (in display order)
const GENRE_ORDER = ['Rock', 'Funk / Soul', 'Jazz', 'Pop', 'Blues', 'Electronic', 'Folk, World, & Country', 'Reggae', 'Hip Hop']

export default function ListeningGrid({ records }: Props) {
  const [modal,   setModal]   = useState<ModalState | null>(null)
  const [search,  setSearch]  = useState('')
  const [genre,   setGenre]   = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Only show genre pills that have at least one record
  const availableGenres = GENRE_ORDER.filter(g =>
    records.some(({ meta }) => meta.genres?.includes(g))
  )

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!modal) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setModal(null) }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [modal])

  const handleOpen = useCallback((record: VinylRecord, meta: RecordMeta) => {
    setModal({ record, meta })
  }, [])

  const filtered = records.filter(({ record: r, meta }) => {
    const matchesSearch = !search.trim() ||
      r.artist.toLowerCase().includes(search.toLowerCase()) ||
      r.title.toLowerCase().includes(search.toLowerCase())
    const matchesGenre = !genre || meta.genres?.includes(genre)
    return matchesSearch && matchesGenre
  })

  return (
    <>
      {/* ── Filters ── */}
      <div className="page-filter-nav">
        <div className="page-filter-btns">
          <button
            className={`page-filter-btn${!genre ? ' is-active' : ''}`}
            onClick={() => setGenre(null)}
          >All</button>
          {availableGenres.map(g => (
            <button
              key={g}
              className={`page-filter-btn${genre === g ? ' is-active' : ''}`}
              onClick={() => setGenre(g)}
            >{g}</button>
          ))}
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

      {/* ── Grid ── */}
      <div className="book-grid record-grid">
        {filtered.map(({ record, meta }, i) => (
          <RecordCard
            key={record.releaseId ?? i}
            record={record}
            meta={meta}
            onOpen={handleOpen}
          />
        ))}
      </div>

      {/* ── Modal (portal to body) ── */}
      {mounted && modal && createPortal(
        <div
          className="content-modal-overlay"
          onClick={() => setModal(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="content-modal" onClick={e => e.stopPropagation()}>
            <button className="content-modal-close" onClick={() => setModal(null)} aria-label="Close">×</button>
            <div className="content-modal-inner">
              <div className="content-modal-cover-wrap">
                {(modal.meta.cover ?? modal.meta.thumb) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={(modal.meta.cover ?? modal.meta.thumb)!}
                    alt={modal.record.title}
                    className="content-modal-cover"
                  />
                ) : (
                  <div className="content-modal-cover-placeholder">
                    {modal.record.artist.replace(/^(The |A )/, '').charAt(0)}
                  </div>
                )}
                {modal.record.rating === 5 && (
                  <div className="content-modal-badge">★ Five Stars</div>
                )}
              </div>
              <div className="content-modal-details">
                <p className="content-modal-eyebrow">
                  {[modal.record.released, modal.meta.country].filter(Boolean).join(' · ')}
                </p>
                <h2 className="content-modal-title">{modal.record.title}</h2>
                <p className="content-modal-author">{modal.record.artist}</p>
                <p className="content-modal-label">{modal.record.label}</p>
                {(modal.meta.genres?.length || modal.meta.styles?.length) ? (
                  <div className="content-modal-tags">
                    {[...(modal.meta.genres ?? []), ...(modal.meta.styles ?? [])].slice(0, 6).map(g => (
                      <span key={g} className="content-modal-tag">{g}</span>
                    ))}
                  </div>
                ) : null}
                {modal.meta.tracklist && modal.meta.tracklist.length > 0 && (
                  <div className="record-tracklist">
                    <p className="record-tracklist-label">Tracklist</p>
                    <ol className="record-tracklist-list">
                      {modal.meta.tracklist.slice(0, 14).map((t, i) => (
                        <li key={i} className="record-tracklist-item">
                          <span className="track-pos">{t.position || i + 1}</span>
                          <span className="track-title">{t.title}</span>
                          {t.duration && <span className="track-dur">{t.duration}</span>}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                {modal.meta.discogsUrl && (
                  <a
                    href={modal.meta.discogsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="content-modal-link"
                  >
                    View on Discogs →
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
