'use client'

import { useState, useEffect, useRef } from 'react'
import type { Book } from '@/data/books'

export interface BookMeta {
  found: boolean
  coverUrl?: string | null
  firstPublished?: number
  subjects?: string[]
}

interface Props {
  book: Book
  onOpen: (book: Book, meta: BookMeta) => void
}

export default function BookCard({ book, onOpen }: Props) {
  const [meta, setMeta] = useState<BookMeta | null>(null)
  const ref = useRef<HTMLButtonElement>(null)
  const fetched = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fetched.current) {
          fetched.current = true
          const q = encodeURIComponent(`${book.title} ${book.author}`)
          fetch(
            `https://openlibrary.org/search.json?q=${q}&limit=1&fields=cover_i,isbn,first_publish_year,subject`,
            { signal: AbortSignal.timeout(8000) }
          )
            .then(r => r.json())
            .then(data => {
              const doc = data.docs?.[0]
              if (!doc) { setMeta({ found: false }); return }
              const coverUrl = doc.cover_i
                ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
                : doc.isbn?.[0]
                ? `https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-M.jpg`
                : null
              setMeta({
                found: true,
                coverUrl,
                firstPublished: doc.first_publish_year,
                subjects: (doc.subject ?? []).slice(0, 5),
              })
            })
            .catch(() => setMeta({ found: false }))
        }
      },
      { rootMargin: '400px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [book.title, book.author])

  return (
    <button
      ref={ref}
      className={`book-card${book.favorite ? ' is-favorite' : ''}`}
      onClick={() => onOpen(book, meta ?? { found: false })}
      aria-label={`${book.title}${book.author ? `, ${book.author}` : ''}`}
    >
      <div className="book-cover-wrap">
        {meta?.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={meta.coverUrl}
            alt=""
            className="book-cover-img"
            loading="lazy"
          />
        ) : (
          <div className="book-cover-placeholder">
            <span className="book-cover-letter">{book.title.replace(/^(The|A|An) /, '').charAt(0)}</span>
          </div>
        )}
        {book.favorite && <span className="book-fav-star" aria-hidden>★</span>}
      </div>
      <p className="book-card-title">{book.title}</p>
      {book.author && <p className="book-card-author">{book.author}</p>}
    </button>
  )
}
