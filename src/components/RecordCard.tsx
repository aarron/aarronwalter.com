'use client'

import type { VinylRecord } from '@/data/records'
import RatingStars from './RatingStars'

export interface RecordMeta {
  found: boolean
  cover?:     string | null
  thumb?:     string | null
  genres?:    string[]
  styles?:    string[]
  country?:   string
  tracklist?: { position: string; title: string; duration: string }[]
  discogsUrl?: string
  /** Year the album was first released, from its Discogs master. */
  originalYear?: number | null
  /** Spotify album ID, for the player in the modal. */
  spotifyAlbumId?: string
  /** URL name: /listening/{slug} */
  slug?: string
}

interface Props {
  record: VinylRecord
  meta:   RecordMeta
  year?:  number | null
  onOpen: (record: VinylRecord, meta: RecordMeta) => void
  /** Present only in local rating mode. */
  onRate?: (releaseId: number, rating: number) => void
}

export default function RecordCard({ record, meta, year, onOpen, onRate }: Props) {
  const cover = meta.cover ?? meta.thumb

  return (
    <div className="record-card-wrap">
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
        <p className="book-card-author">{record.title}{year ? <span className="record-card-year"> · {year}</span> : null}</p>
      </button>
      {onRate && record.releaseId != null && (
        <RatingStars rating={record.rating} onRate={r => onRate(record.releaseId!, r)} />
      )}
    </div>
  )
}
