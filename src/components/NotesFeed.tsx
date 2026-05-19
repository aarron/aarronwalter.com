'use client'

import { useState } from 'react'
import NoteCard from './NoteCard'
import type { Note, NoteType } from '@/lib/notes-feed'

const FILTERS: { label: string; value: NoteType | 'all' }[] = [
  { label: 'All',     value: 'all'     },
  { label: 'Podcast', value: 'podcast' },
  { label: 'Video',   value: 'video'   },
  { label: 'The Brief',   value: 'brief'   },
  { label: 'The Roundup', value: 'roundup' },
  { label: 'Notes',       value: 'post'    },
]

export default function NotesFeed({ notes }: { notes: Note[] }) {
  const [active, setActive] = useState<NoteType | 'all'>('all')

  const filtered = active === 'all' ? notes : notes.filter(n => n.type === active)

  return (
    <>
      <div className="page-filter-nav page-filter-nav--stacked">
        <a
          href="https://db-corpus.vercel.app/api/feed"
          target="_blank"
          rel="noopener noreferrer"
          className="feed-rss-btn"
          aria-label="RSS feed"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <circle cx="5" cy="19" r="2.5"/>
            <path d="M4 4a1 1 0 0 1 0 2C10.627 6 16 11.373 16 18a1 1 0 0 1-2 0C14 12.477 9.523 8 4 8a1 1 0 0 1 0-2z"/>
            <path d="M4 11a1 1 0 0 1 0 2c2.757 0 5 2.243 5 5a1 1 0 0 1-2 0c0-3.86-3.14-7-7-7a1 1 0 0 1 0-2z"/>
          </svg>
          RSS
        </a>
        <div className="page-filter-btns">
          {FILTERS.map(f => (
            <button
              key={f.value}
              className={`page-filter-btn${active === f.value ? ' is-active' : ''}`}
              onClick={() => setActive(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="notes-empty">No posts found. Check back soon.</p>
      ) : (
        <div className="notes-feed">
          {filtered.map(note => (
            <NoteCard key={note.link} note={note} />
          ))}
        </div>
      )}
    </>
  )
}
