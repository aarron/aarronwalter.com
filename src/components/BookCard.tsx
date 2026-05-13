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

// ── Global request throttle (max 4 concurrent Open Library fetches) ──────────
let _active = 0
const _queue: Array<() => void> = []
const MAX_CONCURRENT = 4

function scheduleRequest(run: () => Promise<void>) {
  const execute = () => {
    _active++
    run().finally(() => {
      _active--
      if (_queue.length > 0) {
        const next = _queue.shift()!
        next()
      }
    })
  }
  if (_active < MAX_CONCURRENT) {
    execute()
  } else {
    _queue.push(execute)
  }
}

// ── localStorage cache (30-day TTL) ──────────────────────────────────────────
const CACHE_TTL = 30 * 24 * 60 * 60 * 1000

function cacheKey(title: string, author: string) {
  return `ol:${title}:${author}`.slice(0, 120)
}

function readCache(key: string): BookMeta | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const { ts, data } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) { localStorage.removeItem(key); return null }
    return data as BookMeta
  } catch { return null }
}

function writeCache(key: string, data: BookMeta) {
  try { localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data })) } catch { /* quota full */ }
}

// ─────────────────────────────────────────────────────────────────────────────

export default function BookCard({ book, onOpen }: Props) {
  const [meta, setMeta] = useState<BookMeta | null>(null)
  const ref = useRef<HTMLButtonElement>(null)
  const fetched = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || fetched.current) return
        fetched.current = true

        // Check cache first (synchronous)
        const key = cacheKey(book.title, book.author ?? '')
        const cached = readCache(key)
        if (cached) { setMeta(cached); return }

        // Throttled network fetch
        scheduleRequest(async () => {
          const q = encodeURIComponent(`${book.title} ${book.author ?? ''}`)
          const url = `https://openlibrary.org/search.json?q=${q}&limit=1&fields=cover_i,isbn,first_publish_year,subject`
          try {
            const r = await fetch(url, { signal: AbortSignal.timeout(10000) })
            const data = await r.json()
            const doc = data.docs?.[0]
            const result: BookMeta = doc
              ? {
                  found: true,
                  coverUrl: doc.cover_i
                    ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
                    : doc.isbn?.[0]
                    ? `https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-M.jpg`
                    : null,
                  firstPublished: doc.first_publish_year,
                  subjects: (doc.subject ?? []).slice(0, 5),
                }
              : { found: false }
            setMeta(result)
            writeCache(key, result)
          } catch {
            setMeta({ found: false })
          }
        })
      },
      { rootMargin: '200px' }
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
        {book.favorite && (
          <span className="book-fav-badge" aria-hidden>★ Fav</span>
        )}
      </div>
      <p className="book-card-title">{book.title}</p>
      {book.author && <p className="book-card-author">{book.author}</p>}
    </button>
  )
}
