'use client'

import { Fragment, useEffect, useState } from 'react'
import type { VinylRecord } from '@/data/records'
import type { RecordMeta } from './RecordCard'
import RatingStars from './RatingStars'

// Written per release by scripts/fetch-record-covers.ts into public/data/records/{id}.json
interface Credit { name: string; role: string; tracks?: string }
interface RecordDetails {
  released?: string
  country?: string
  labels: { name: string; catno: string }[]
  formats: { name: string; qty: string; descriptions: string[]; text?: string }[]
  companies: { name: string; role: string }[]
  identifiers: { type: string; value: string; description?: string }[]
  credits: Credit[]
  notes?: string
  images: { uri: string; width: number; height: number; type: string }[]
  masterUrl?: string
}

const detailsCache = new Map<number, RecordDetails | null>()

function useDetails(releaseId: number | null) {
  const [details, setDetails] = useState<RecordDetails | null | undefined>(
    releaseId != null ? detailsCache.get(releaseId) : null
  )
  useEffect(() => {
    if (releaseId == null) { setDetails(null); return }
    if (detailsCache.has(releaseId)) { setDetails(detailsCache.get(releaseId)); return }
    let live = true
    setDetails(undefined)
    fetch(`/data/records/${releaseId}.json`)
      .then(r => (r.ok ? r.json() : null))
      .catch(() => null)
      .then(d => { detailsCache.set(releaseId, d); if (live) setDetails(d) })
    return () => { live = false }
  }, [releaseId])
  return details
}

// ── Credits, grouped the way liner notes usually are ──

const CREDIT_GROUPS: { title: string; test: RegExp }[] = [
  { title: 'Production & engineering', test: /produc|engineer|record|mix|master|lacquer|cut by|edit|transfer|restor|supervis|a&r|coordinat|executive|programm|technician|tape op|balance/i },
  { title: 'Writing & arrangement', test: /written|composed|lyrics|music by|words by|arrang|songwriter|orchestrat|conduct/i },
  { title: 'Artwork & liner notes', test: /design|photo|art|liner|cover|illustrat|layout|typograph|lettering|graphics|painting/i },
]

function groupCredits(credits: Credit[]) {
  const groups = new Map<string, Map<string, { roles: Set<string>; tracks: Set<string> }>>()
  for (const c of credits) {
    const title = CREDIT_GROUPS.find(g => g.test.test(c.role))?.title ?? 'Musicians'
    if (!groups.has(title)) groups.set(title, new Map())
    const people = groups.get(title)!
    if (!people.has(c.name)) people.set(c.name, { roles: new Set(), tracks: new Set() })
    const p = people.get(c.name)!
    c.role.split(/,\s*/).forEach(r => r && p.roles.add(r.replace(/\s*\[.*?\]/g, '')))
    if (c.tracks) p.tracks.add(c.tracks)
  }
  return ['Musicians', ...CREDIT_GROUPS.map(g => g.title)]
    .filter(t => groups.has(t))
    .map(t => ({
      title: t,
      people: [...groups.get(t)!.entries()].map(([name, { roles, tracks }]) => ({
        name, roles: [...roles].join(', '), tracks: [...tracks].join(', '),
      })),
    }))
}

// Companies worth showing on a pressing; publishing and rights entries are left out.
const COMPANY_ROLES = [
  'Recorded At', 'Mixed At', 'Mastered At', 'Remastered At', 'Lacquer Cut At', 'Pressed By',
  'Manufactured By', 'Plated By', 'Printed By', 'Made By', 'Distributed By', 'Marketed By',
]

interface Props {
  record:   VinylRecord
  meta:     RecordMeta
  year:     number | null
  position: string
  hasPrev:  boolean
  hasNext:  boolean
  onPrev:   () => void
  onNext:   () => void
  onClose:  () => void
  onRate?:  (rating: number) => void
}

export default function RecordModal({ record, meta, year, position, hasPrev, hasNext, onPrev, onNext, onClose, onRate }: Props) {
  const details = useDetails(record.releaseId)
  const [imageIndex, setImageIndex] = useState(0)
  useEffect(() => { setImageIndex(0) }, [record.releaseId])

  const cover = meta.cover ?? meta.thumb ?? null
  const images = details?.images?.length ? details.images : cover ? [{ uri: cover, width: 600, height: 600, type: 'primary' }] : []
  const shown = images[imageIndex]?.uri ?? cover
  const showingSleeve = imageIndex === 0

  const label = details?.labels?.[0]
  const format = details?.formats?.map(f =>
    [f.qty !== '1' ? `${f.qty}×` : '', f.name, f.descriptions.length ? ` (${f.descriptions.join(', ')})` : '', f.text ? `, ${f.text}` : ''].join('')
  ).join(' + ')
  const companies = COMPANY_ROLES.flatMap(role => {
    const names = [...new Set(details?.companies.filter(c => c.role === role).map(c => c.name))]
    return names.length ? [{ role, names: names.join(', ') }] : []
  })
  const matrix = details?.identifiers.filter(i => i.type === 'Matrix / Runout') ?? []
  const barcode = details?.identifiers.find(i => i.type === 'Barcode')
  const credits = details ? groupCredits(details.credits) : []
  const tags = [...new Set([...(meta.genres ?? []), ...(meta.styles ?? [])])]

  return (
    <div className="rm-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={`${record.title} by ${record.artist}`}>
      {cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="rm-backdrop" src={cover} alt="" aria-hidden />
      )}

      <button className="rm-close" onClick={onClose} aria-label="Close">×</button>
      <button className="rm-step rm-step--prev" onClick={e => { e.stopPropagation(); onPrev() }} disabled={!hasPrev} aria-label="Previous record">‹</button>
      <button className="rm-step rm-step--next" onClick={e => { e.stopPropagation(); onNext() }} disabled={!hasNext} aria-label="Next record">›</button>

      <div className="rm-layout" onClick={e => e.stopPropagation()} key={record.releaseId ?? record.title}>
        {/* ── The sleeve, with the record sliding out of it ── */}
        <div className="rm-stage">
          <div className="rm-sleeve-wrap">
            {cover && (
              <div className="rm-disc" aria-hidden>
                <div className="rm-disc-spin">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="rm-disc-label" src={cover} alt="" />
                </div>
              </div>
            )}
            <div className={`rm-sleeve${showingSleeve ? '' : ' is-alt'}`}>
              {shown ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={shown} alt={showingSleeve ? `${record.title} cover` : `${record.title}, photo ${imageIndex + 1}`} />
              ) : (
                <span className="rm-sleeve-letter">{record.artist.replace(/^(The |A )/, '').charAt(0)}</span>
              )}
            </div>
          </div>
          {images.length > 1 && (
            <div className="rm-thumbs" role="tablist" aria-label="Photos of this pressing">
              {images.map((img, i) => (
                <button
                  key={img.uri}
                  role="tab"
                  aria-selected={i === imageIndex}
                  className={i === imageIndex ? 'is-active' : ''}
                  onClick={() => setImageIndex(i)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.uri} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Liner notes ── */}
        <div className="rm-panel">
          <p className="rm-eyebrow">{[year, tags[0]].filter(Boolean).join(' · ')}</p>
          <h2 className="rm-title">{record.title}</h2>
          <p className="rm-artist">{record.artist}</p>
          <RatingStars rating={record.rating} onRate={onRate} size="large" />

          {meta.spotifyAlbumId && (
            <section className="rm-section rm-listen">
              <h3>Listen</h3>
              <iframe
                key={meta.spotifyAlbumId}
                title={`${record.title} on Spotify`}
                src={`https://open.spotify.com/embed/album/${meta.spotifyAlbumId}?utm_source=generator&theme=0`}
                width="100%"
                height="352"
                loading="lazy"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              />
              <p className="rm-muted rm-listen-note">
                Full tracks if you're signed in to Spotify in this browser; 30-second previews otherwise.
              </p>
            </section>
          )}

          <section className="rm-section">
            <h3>This pressing</h3>
            <dl className="rm-facts">
              <dt>Label</dt>
              <dd>{label ? <>{label.name}{label.catno && label.catno !== 'none' && <span className="rm-mono"> {label.catno}</span>}</> : record.label}</dd>
              <dt>Format</dt>
              <dd>{format || record.format}</dd>
              {(details?.released || record.released) && <><dt>Pressed</dt><dd>{details?.released ?? record.released}{(details?.country ?? meta.country) ? `, ${details?.country ?? meta.country}` : ''}</dd></>}
              {year && <><dt>First released</dt><dd>{year}</dd></>}
              {companies.map(c => <Fragment key={c.role}><dt>{c.role}</dt><dd>{c.names}</dd></Fragment>)}
              {matrix.length > 0 && (
                <><dt>Matrix / runout</dt>
                <dd>
                  <ul className="rm-matrix">
                    {matrix.slice(0, 6).map((m, i) => (
                      <li key={i}><span className="rm-mono">{m.value}</span>{m.description && <span className="rm-muted"> {m.description}</span>}</li>
                    ))}
                  </ul>
                </dd></>
              )}
              {barcode && <><dt>Barcode</dt><dd className="rm-mono">{barcode.value}</dd></>}
            </dl>
            {details === undefined && <p className="rm-muted">Loading pressing details…</p>}
          </section>

          {credits.map(group => (
            <section key={group.title} className="rm-section">
              <h3>{group.title}</h3>
              <ul className="rm-credits">
                {group.people.map(p => (
                  <li key={p.name}>
                    <span className="rm-credit-name">{p.name}</span>
                    <span className="rm-credit-role">{p.roles}{p.tracks && <span className="rm-muted"> ({p.tracks})</span>}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {meta.tracklist && meta.tracklist.length > 0 && (
            <section className="rm-section">
              <h3>Tracklist</h3>
              <ol className="rm-tracks">
                {meta.tracklist.map((t, i) => (
                  <li key={i}>
                    <span className="rm-mono rm-muted">{t.position || i + 1}</span>
                    <span>{t.title}</span>
                    <span className="rm-mono rm-muted">{t.duration}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {tags.length > 0 && (
            <div className="rm-tags">{tags.map(t => <span key={t}>{t}</span>)}</div>
          )}

          {details?.notes && (
            <details className="rm-notes">
              <summary>Notes from Discogs</summary>
              <p>{details.notes}</p>
            </details>
          )}

          <div className="rm-links">
            {meta.discogsUrl && <a href={meta.discogsUrl} target="_blank" rel="noopener noreferrer">This pressing on Discogs →</a>}
            {details?.masterUrl && <a href={details.masterUrl} target="_blank" rel="noopener noreferrer">All versions →</a>}
          </div>
          <p className="rm-position">{position}{onRate ? ' · press 1–5 to rate and advance' : ''} · ← → to browse</p>
        </div>
      </div>
    </div>
  )
}
