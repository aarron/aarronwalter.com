'use client'

import { useState, useEffect, useRef } from 'react'
import type { VinylRecord } from '@/data/records'

export interface RecordMeta {
  found: boolean
  cover?: string | null
  genres?: string[]
  styles?: string[]
  tracklist?: { position: string; title: string; duration: string }[]
  country?: string
  discogsUrl?: string
}

interface Props {
  record: VinylRecord
  onOpen: (record: VinylRecord, meta: RecordMeta) => void
}

export default function RecordCard({ record, onOpen }: Props) {
  const [meta, setMeta] = useState<RecordMeta | null>(null)
  const ref = useRef<HTMLButtonElement>(null)
  const fetched = useRef(false)

  useEffect(() => {
    if (!record.releaseId) return
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fetched.current) {
          fetched.current = true
          fetch(`/api/record?releaseId=${record.releaseId}`)
            .then(r => r.json())
            .then(setMeta)
            .catch(() => setMeta({ found: false }))
        }
      },
      { rootMargin: '400px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [record.releaseId])

  const cover = meta?.cover

  return (
    <button
      ref={ref}
      className="record-card"
      onClick={() => onOpen(record, meta ?? { found: false })}
      aria-label={`${record.artist} — ${record.title}`}
    >
      <div className="record-cover-wrap">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            className="record-cover-img"
            loading="lazy"
          />
        ) : (
          <div className="record-cover-placeholder">
            <span className="record-cover-letter">{record.artist.replace(/^(The |A ) /, '').charAt(0)}</span>
          </div>
        )}
        {record.rating === 5 && <span className="book-fav-star" aria-hidden>★</span>}
      </div>
      <p className="record-card-artist">{record.artist}</p>
      <p className="book-card-author">{record.title}</p>
    </button>
  )
}
