'use client'

import type { Note } from '@/lib/notes-feed'
import Image from 'next/image'

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

function ArticleIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  )
}

function RoundupIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  )
}

function HeadphoneIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/>
      <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.14v14l11-7-11-7z"/>
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17L17 7M17 7H7M17 7v10"/>
    </svg>
  )
}

function BriefIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2"/>
      <polyline points="3 9 12 15 21 9"/>
    </svg>
  )
}

interface CardThumbProps {
  src: string
  variant: 'post' | 'roundup' | 'podcast' | 'video' | 'brief'
}

function CardThumb({ src, variant }: CardThumbProps) {
  const sizeMap = {
    podcast: { w: 160, h: 160 },
    video:   { w: 160, h: 160 },
    post:    { w: 160, h: 160 },
    roundup: { w: 160, h: 160 },
    brief:   { w: 160, h: 160 },
  }
  const { w, h } = sizeMap[variant]
  return (
    <div className={`note-card__thumb note-card__thumb--${variant}`}>
      <Image src={src} alt="" width={w} height={h} className="note-card__thumb-img" unoptimized aria-hidden="true" />
    </div>
  )
}

export default function NoteCard({ note }: { note: Note }) {
  const date = formatDate(note.pubDate)

  if (note.type === 'podcast') {
    return (
      <a href={note.link} target="_blank" rel="noopener noreferrer" className="note-card note-card--podcast">
        <div className="note-card__inner">
          {note.thumb && <CardThumb src={note.thumb} variant="podcast" />}
          <div className="note-card__body">
            <span className="note-card__type"><HeadphoneIcon />Podcast</span>
            <h2 className="note-card__title">{note.title}</h2>
            {note.excerpt && <p className="note-card__excerpt">{note.excerpt}</p>}
            <span className="note-card__meta">
              <time className="note-card__date" dateTime={note.pubDate}>{date}</time>
              <span className="note-card__cta">Listen <ArrowIcon /></span>
            </span>
          </div>
        </div>
      </a>
    )
  }

  if (note.type === 'video') {
    return (
      <a href={note.link} target="_blank" rel="noopener noreferrer" className="note-card note-card--video">
        <div className="note-card__inner">
          {note.thumb && <CardThumb src={note.thumb} variant="video" />}
          <div className="note-card__body">
            <span className="note-card__type"><PlayIcon />Video</span>
            <h2 className="note-card__title">{note.title}</h2>
            {note.excerpt && <p className="note-card__excerpt">{note.excerpt}</p>}
            <span className="note-card__meta">
              <time className="note-card__date" dateTime={note.pubDate}>{date}</time>
              <span className="note-card__cta">Watch <ArrowIcon /></span>
            </span>
          </div>
        </div>
      </a>
    )
  }

  if (note.type === 'roundup') {
    return (
      <a href={note.link} target="_blank" rel="noopener noreferrer" className="note-card note-card--roundup">
        <div className="note-card__inner">
          {note.thumb && <CardThumb src={note.thumb} variant="roundup" />}
          <div className="note-card__body">
            <span className="note-card__type"><RoundupIcon />Roundup</span>
            <h2 className="note-card__title">
              {note.title.replace(/^The Roundup:\s*/i, '').replace(/^Roundup:\s*/i, '')}
            </h2>
            {note.excerpt && <p className="note-card__excerpt">{note.excerpt}</p>}
            <span className="note-card__meta">
              <time className="note-card__date" dateTime={note.pubDate}>{date}</time>
              <span className="note-card__cta">Read <ArrowIcon /></span>
            </span>
          </div>
        </div>
      </a>
    )
  }

  if (note.type === 'brief') {
    return (
      <a href={note.link} target="_blank" rel="noopener noreferrer" className="note-card note-card--brief">
        <div className="note-card__inner">
          {note.thumb && <CardThumb src={note.thumb} variant="brief" />}
          <div className="note-card__body">
            <span className="note-card__type"><BriefIcon />The Brief</span>
            <h2 className="note-card__title">
              {note.title.replace(/^The Brief:\s*/i, '').replace(/^The Brief\s*—\s*/i, '')}
            </h2>
            {note.excerpt && <p className="note-card__excerpt">{note.excerpt}</p>}
            <span className="note-card__meta">
              <time className="note-card__date" dateTime={note.pubDate}>{date}</time>
              <span className="note-card__cta">Read <ArrowIcon /></span>
            </span>
          </div>
        </div>
      </a>
    )
  }

  // Default: post / essay
  return (
    <a href={note.link} target="_blank" rel="noopener noreferrer" className="note-card note-card--post">
      <div className="note-card__inner">
        {note.thumb && <CardThumb src={note.thumb} variant="post" />}
        <div className="note-card__body">
          <span className="note-card__type"><ArticleIcon />Note</span>
          <h2 className="note-card__title">{note.title}</h2>
          {note.excerpt && <p className="note-card__excerpt">{note.excerpt}</p>}
          <span className="note-card__meta">
            <span className="note-card__date">{date}</span>
            <span className="note-card__cta">Read <ArrowIcon /></span>
          </span>
        </div>
      </div>
    </a>
  )
}
