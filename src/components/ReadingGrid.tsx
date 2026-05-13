'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import BookCard, { type BookMeta } from './BookCard'
import type { Book } from '@/data/books'

interface Props {
  booksByYear: Record<number, Book[]>
  years: number[]
}

interface ModalState {
  book: Book
  meta: BookMeta
}

export default function ReadingGrid({ booksByYear, years }: Props) {
  const [modal, setModal] = useState<ModalState | null>(null)
  const [activeYear, setActiveYear] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Close on Escape
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

  const handleOpen = useCallback((book: Book, meta: BookMeta) => {
    setModal({ book, meta })
  }, [])

  const visibleYears = activeYear ? [activeYear] : years

  return (
    <>
      {/* ── Year filter ── */}
      <div className="reading-year-nav">
        <button
          className={`reading-year-btn${activeYear === null ? ' is-active' : ''}`}
          onClick={() => setActiveYear(null)}
        >
          All years
        </button>
        {years.map(y => (
          <button
            key={y}
            className={`reading-year-btn${activeYear === y ? ' is-active' : ''}`}
            onClick={() => setActiveYear(activeYear === y ? null : y)}
          >
            {y}
          </button>
        ))}
      </div>

      {/* ── Grids by year ── */}
      {visibleYears.map(year => (
        <section key={year} className="reading-year-section">
          <h2 className="reading-year-heading">{year}</h2>
          <div className="book-grid">
            {booksByYear[year].map((book, i) => (
              <BookCard
                key={`${year}-${i}`}
                book={book}
                onOpen={handleOpen}
              />
            ))}
          </div>
        </section>
      ))}

      {/* ── Modal (portal to body) ── */}
      {mounted && modal && createPortal(
        <div
          className="content-modal-overlay"
          onClick={() => setModal(null)}
          role="dialog"
          aria-modal="true"
          aria-label={modal.book.title}
        >
          <div className="content-modal" onClick={e => e.stopPropagation()}>
            <button className="content-modal-close" onClick={() => setModal(null)} aria-label="Close">×</button>
            <div className="content-modal-inner">
              <div className="content-modal-cover-wrap">
                {modal.meta.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={modal.meta.coverUrl.replace('-M.jpg', '-L.jpg')}
                    alt={modal.book.title}
                    className="content-modal-cover"
                  />
                ) : (
                  <div className="content-modal-cover-placeholder">
                    {modal.book.title.replace(/^(The|A|An) /, '').charAt(0)}
                  </div>
                )}
                {modal.book.favorite && (
                  <div className="content-modal-badge">★ Favorite</div>
                )}
              </div>
              <div className="content-modal-details">
                {modal.meta.firstPublished && (
                  <p className="content-modal-eyebrow">First published {modal.meta.firstPublished}</p>
                )}
                <h2 className="content-modal-title">{modal.book.title}</h2>
                {modal.book.author && <p className="content-modal-author">{modal.book.author}</p>}
                {modal.meta.subjects && modal.meta.subjects.length > 0 && (
                  <div className="content-modal-tags">
                    {modal.meta.subjects.map(s => (
                      <span key={s} className="content-modal-tag">{s}</span>
                    ))}
                  </div>
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
