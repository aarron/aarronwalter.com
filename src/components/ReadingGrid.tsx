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
  const [favOnly, setFavOnly] = useState(false)
  const [mounted, setMounted] = useState(false)

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

  const handleOpen = useCallback((book: Book, meta: BookMeta) => {
    setModal({ book, meta })
  }, [])

  const visibleYears = activeYear ? [activeYear] : years

  // Build buy links (no API key needed — both sites support plain search URLs)
  function indieboundUrl(book: Book) {
    return `https://www.indiebound.org/search/book?keys=${encodeURIComponent(`${book.title} ${book.author ?? ''}`)}`
  }
  function libroUrl(book: Book) {
    return `https://libro.fm/search?q=${encodeURIComponent(`${book.title} ${book.author ?? ''}`)}`
  }

  return (
    <>
      {/* ── Filters ── */}
      <div className="reading-year-nav">
        <button
          className={`reading-year-btn reading-fav-btn${favOnly ? ' is-active' : ''}`}
          onClick={() => { setFavOnly(v => !v); setActiveYear(null) }}
        >
          ★ Favorites
        </button>

        <span className="reading-filter-divider" aria-hidden>|</span>

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
      {visibleYears.map(year => {
        const booksInYear = booksByYear[year].filter(b => favOnly ? b.favorite : true)
        if (booksInYear.length === 0) return null
        return (
          <section key={year} className="reading-year-section">
            <h2 className="reading-year-heading">{year}</h2>
            <div className="book-grid">
              {booksInYear.map((book, i) => (
                <BookCard
                  key={`${year}-${i}`}
                  book={book}
                  onOpen={handleOpen}
                />
              ))}
            </div>
          </section>
        )
      })}

      {/* ── Modal ── */}
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

              {/* Cover */}
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

              {/* Details */}
              <div className="content-modal-details">
                {modal.meta.firstPublished && (
                  <p className="content-modal-eyebrow">First published {modal.meta.firstPublished}</p>
                )}
                <h2 className="content-modal-title">{modal.book.title}</h2>
                {modal.book.author && (
                  <p className="content-modal-author">{modal.book.author}</p>
                )}
                {modal.meta.subjects && modal.meta.subjects.length > 0 && (
                  <div className="content-modal-tags">
                    {modal.meta.subjects.map(s => (
                      <span key={s} className="content-modal-tag">{s}</span>
                    ))}
                  </div>
                )}

                {/* Buy links */}
                <div className="content-modal-buy-links">
                  <p className="content-modal-buy-label">Find this book</p>
                  <div className="content-modal-buy-row">
                    <a
                      href={indieboundUrl(modal.book)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="content-modal-buy-btn"
                    >
                      Print — IndieBound
                    </a>
                    <a
                      href={libroUrl(modal.book)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="content-modal-buy-btn"
                    >
                      Audio — Libro.fm
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
