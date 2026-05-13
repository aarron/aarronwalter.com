'use client'

import { useState } from 'react'
import type { Book } from '@/data/books'

export interface BookMeta {
  found: boolean
  coverUrl?: string | null
  firstPublished?: number
  subjects?: string[]
  description?: string | null
}

interface Props {
  book: Book
  meta: BookMeta
  onOpen: (book: Book, meta: BookMeta) => void
}

export default function BookCard({ book, meta, onOpen }: Props) {
  // Track whether the img loaded a real image (not a 1×1 OL placeholder)
  const [imgValid, setImgValid] = useState<boolean | null>(null)

  const coverUrl = meta.coverUrl
  const showCover = coverUrl && imgValid !== false

  return (
    <button
      className={`book-card${book.favorite ? ' is-favorite' : ''}`}
      onClick={() => onOpen(book, meta)}
      aria-label={`${book.title}${book.author ? `, ${book.author}` : ''}`}
    >
      <div className="book-cover-wrap">
        {coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt=""
            className="book-cover-img"
            loading="lazy"
            style={{ display: imgValid === false ? 'none' : undefined }}
            onLoad={e => {
              const img = e.currentTarget
              // OL serves a 1×1 GIF for missing covers — reject those specifically.
              // SVGs and all other real images are accepted on successful load.
              setImgValid(!(img.naturalWidth === 1 && img.naturalHeight === 1))
            }}
            onError={() => setImgValid(false)}
          />
        )}
        {!showCover && (
          <div className="book-cover-placeholder">
            <span className="book-cover-letter">
              {book.title.replace(/^(The|A|An) /, '').charAt(0)}
            </span>
          </div>
        )}
        {book.favorite && (
          <span className="book-fav-badge" aria-hidden>★ Fav</span>
        )}
      </div>
      <p className="book-card-title">{book.title}</p>
      {book.author && <p className="book-card-author">{book.author}</p>}
    </button>
  )
}
