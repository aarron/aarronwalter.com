'use client'

import type { VinylRecord } from '@/data/records'

export interface RecordMeta {
  found: boolean
  cover?:     string | null
  thumb?:     string | null
  genres?:    string[]
  styles?:    string[]
  country?:   string
  tracklist?: { position: string; title: string; duration: string }[]
  discogsUrl?: string
}

interface Props {
  record: VinylRecord
  meta:   RecordMeta
  onOpen: (record: VinylRecord, meta: RecordMeta) => void
}

export default function RecordCard({ record, meta, onOpen }: Props) {
  const cover = meta.cover ?? meta.thumb

  return (
    <button
      className="record-card"
      onClick={() => onOpen(record, meta)}
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
            <span className="record-cover-letter">
              {record.artist.replace(/^(The |A )/, '').charAt(0)}
            </span>
          </div>
        )}
        {record.rating === 5 && <span className="book-fav-star" aria-hidden>★</span>}
      </div>
      <p className="record-card-artist">{record.artist}</p>
      <p className="book-card-author">{record.title}</p>
    </button>
  )
}
