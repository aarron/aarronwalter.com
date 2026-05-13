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

// ── Global request throttle (max 4 concurrent OL fetches) ─────────────────────
let _active = 0
const _queue: Array<() => void> = []
const MAX_CONCURRENT = 4

function scheduleRequest(run: () => Promise<void>) {
  const execute = () => {
    _active++
    run().finally(() => {
      _active--
      if (_queue.length > 0) _queue.shift()!()
    })
  }
  _active < MAX_CONCURRENT ? execute() : _queue.push(execute)
}

// ── localStorage cache (30-day TTL) ──────────────────────────────────────────
const CACHE_TTL = 30 * 24 * 60 * 60 * 1000

function ck(title: string, author: string) {
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
  try { localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data })) } catch { /**/ }
}

// ── Open Library search with multi-step fallback ──────────────────────────────
async function fetchMeta(title: string, author: string): Promise<BookMeta> {
  const fields = 'cover_i,isbn,first_publish_year,subject'

  // Strip common leading articles and use only first 5 words of title
  const shortTitle = title.replace(/^(The|A|An) /, '').split(' ').slice(0, 5).join(' ')
  // Use last word (surname) of author for shorter, more reliable queries
  const lastName = (author ?? '').trim().split(' ').pop() ?? ''

  // Three query strategies, tried in order
  const queries = [
    `${shortTitle} ${lastName}`,       // e.g. "Heart in Winter Barry"
    `${title} ${author}`,              // e.g. "The Heart in Winter Kevin Barry"
    shortTitle,                         // title-only fallback
  ]

  for (const q of queries) {
    if (!q.trim()) continue
    try {
      const r = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=1&fields=${fields}`,
        { signal: AbortSignal.timeout(10000) }
      )
      const data = await r.json()
      const doc = data.docs?.[0]
      if (!doc) continue

      const coverUrl = doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
        : doc.isbn?.[0]
        ? `https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-M.jpg`
        : null

      return {
        found: true,
        coverUrl,
        firstPublished: doc.first_publish_year,
        subjects: (doc.subject ?? []).slice(0, 5),
      }
    } catch { /* try next query */ }
  }

  return { found: false }
}

// ─────────────────────────────────────────────────────────────────────────────

export default function BookCard({ book, onOpen }: Props) {
  const [meta, setMeta] = useState<BookMeta | null>(null)
  // Track whether the img element's src loaded a real image (not a 1px placeholder)
  const [imgValid, setImgValid] = useState<boolean | null>(null)
  const ref = useRef<HTMLButtonElement>(null)
  const fetched = useRef(false)

  useEffect(() => {
    // If book has a manual coverUrl, use it directly — no API call needed
    if (book.coverUrl) {
      setMeta({ found: true, coverUrl: book.coverUrl })
      return
    }

    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || fetched.current) return
        fetched.current = true

        const key = ck(book.title, book.author ?? '')
        const cached = readCache(key)
        if (cached) { setMeta(cached); return }

        scheduleRequest(async () => {
          const result = await fetchMeta(book.title, book.author ?? '')
          setMeta(result)
          writeCache(key, result)
        })
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [book.title, book.author, book.coverUrl])

  // Show cover only when we have a URL AND the image loaded with real dimensions
  const coverUrl = meta?.coverUrl
  const showCover = coverUrl && imgValid !== false

  return (
    <button
      ref={ref}
      className={`book-card${book.favorite ? ' is-favorite' : ''}`}
      onClick={() => onOpen(book, meta ?? { found: false })}
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
              // Open Library returns a 1×1 GIF placeholder when no cover exists
              const img = e.currentTarget
              setImgValid(img.naturalWidth > 1 && img.naturalHeight > 1)
            }}
            onError={() => setImgValid(false)}
          />
        )}
        {!showCover && (
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
