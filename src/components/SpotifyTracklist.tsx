'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// Minimal types for Spotify's iFrame API (https://developer.spotify.com/documentation/embeds)
interface EmbedController {
  loadUri(uri: string): void
  play(): void
  togglePlay(): void
  destroy(): void
  addListener(event: 'ready' | 'playback_update', cb: (e: { data: { isPaused: boolean; position: number; duration: number } }) => void): void
}
interface IFrameAPI {
  createController(el: HTMLElement, options: { uri: string; width?: string | number; height?: number }, cb: (c: EmbedController) => void): void
}
declare global {
  interface Window { onSpotifyIframeApiReady?: (api: IFrameAPI) => void }
}

// Resolves to null if Spotify's API can't load (blocked, offline), so callers can fall back.
let apiPromise: Promise<IFrameAPI | null> | null = null
function loadSpotifyApi() {
  if (!apiPromise) {
    apiPromise = new Promise(resolve => {
      const timer = setTimeout(() => { console.warn('Spotify iFrame API did not load; using plain embeds'); resolve(null) }, 5000)
      window.onSpotifyIframeApiReady = api => { clearTimeout(timer); resolve(api) }
      const s = document.createElement('script')
      s.src = 'https://open.spotify.com/embed/iframe-api/v1'
      s.async = true
      s.onerror = () => { clearTimeout(timer); resolve(null) }
      document.body.appendChild(s)
    })
  }
  return apiPromise
}

// Spotify track IDs per album, written by scripts/fetch-spotify-albums.ts
const tracksCache = new Map<string, [string, string][] | null>()
function useSpotifyTracks(releaseId: number | null, albumId?: string) {
  const key = albumId ? String(releaseId) : null
  const [tracks, setTracks] = useState<[string, string][] | null>(key ? tracksCache.get(key) ?? null : null)
  useEffect(() => {
    if (!key) { setTracks(null); return }
    if (tracksCache.has(key)) { setTracks(tracksCache.get(key)!); return }
    let live = true
    fetch(`/data/spotify/${key}.json`)
      .then(r => (r.ok ? r.json() : null))
      .catch(() => null)
      .then(d => { tracksCache.set(key, d); if (live) setTracks(d) })
    return () => { live = false }
  }, [key])
  return tracks
}

const norm = (s: string) => s
  .toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/\s+-\s+.*$/, '')                 // " - Remastered 2009", " - Live"
  .replace(/\(.*?\)|\[.*?\]/g, ' ')
  .replace(/&/g, 'and')
  .replace(/[^a-z0-9]/g, '')

// Pair each Discogs track with a Spotify track: by title first, then by position
// when both lists are the same length.
function pairTracks(discogs: { title: string }[], spotify: [string, string][]) {
  const byName = new Map<string, string>()
  for (const [id, name] of spotify) if (!byName.has(norm(name))) byName.set(norm(name), id)
  return discogs.map((t, i) => {
    const n = norm(t.title)
    if (byName.has(n)) return byName.get(n)!
    const loose = spotify.find(([, name]) => {
      const m = norm(name)
      return n.length > 3 && m.length > 3 && (m.startsWith(n) || n.startsWith(m))
    })
    if (loose) return loose[0]
    return discogs.length === spotify.length ? spotify[i][0] : null
  })
}

interface Props {
  releaseId: number | null
  albumId?: string
  tracklist: { position: string; title: string; duration: string }[]
  /** Called with true while a track is playing, false when paused or stopped. */
  onPlayingChange?: (playing: boolean) => void
}

export default function SpotifyTracklist({ releaseId, albumId, tracklist, onPlayingChange }: Props) {
  const spotify = useSpotifyTracks(releaseId, albumId)
  const ids = useMemo(() => (spotify ? pairTracks(tracklist, spotify) : []), [spotify, tracklist])

  const wrapRef = useRef<HTMLDivElement>(null)
  const controller = useRef<EmbedController | null>(null)
  const pendingPlay = useRef(false)
  const [current, setCurrent] = useState<string | null>(null)
  const [paused, setPaused] = useState(true)

  // Tear the player down when the record changes or the modal closes.
  useEffect(() => () => {
    controller.current?.destroy()
    controller.current = null
    if (wrapRef.current) wrapRef.current.innerHTML = ''
    setCurrent(null)
    setPaused(true)
  }, [releaseId])

  const play = useCallback(async (trackId: string) => {
    const uri = `spotify:track:${trackId}`
    if (controller.current) {
      if (trackId === current) { controller.current.togglePlay(); return }
      pendingPlay.current = true
      controller.current.loadUri(uri)
      setCurrent(trackId)
      return
    }
    setCurrent(trackId)
    const api = await loadSpotifyApi()
    if (!wrapRef.current) return
    if (!api) {
      // Fallback: Spotify's plain single-track player (one more click to start).
      wrapRef.current.innerHTML = ''
      const f = document.createElement('iframe')
      f.src = `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`
      f.width = '100%'
      f.height = '80'
      f.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture'
      f.title = 'Spotify player'
      wrapRef.current.appendChild(f)
      setPaused(false)
      return
    }
    // Spotify replaces this element with its iframe, so give it one React doesn't own.
    const el = document.createElement('div')
    wrapRef.current.appendChild(el)
    pendingPlay.current = true
    setCurrent(trackId)
    api.createController(el, { uri, width: '100%', height: 80 }, c => {
      controller.current = c
      c.addListener('ready', () => {
        if (pendingPlay.current) { pendingPlay.current = false; c.play() }
      })
      c.addListener('playback_update', e => setPaused(e.data.isPaused))
    })
  }, [current])

  useEffect(() => { onPlayingChange?.(current != null && !paused) }, [current, paused, onPlayingChange])

  const hasAny = ids.some(Boolean)

  return (
    <section className="rm-section">
      <h3>
        Tracklist
        {hasAny && <span className="rm-tracks-hint"> · press ▶ to play via Spotify</span>}
      </h3>
      <ol className="rm-tracks">
        {tracklist.map((t, i) => {
          const id = ids[i]
          const isCurrent = id != null && id === current
          return (
            <li key={i} className={isCurrent ? 'is-current' : ''}>
              {id ? (
                <button
                  type="button"
                  className="rm-play"
                  onClick={() => play(id)}
                  aria-label={`${isCurrent && !paused ? 'Pause' : 'Play'} ${t.title}`}
                >
                  <span className="rm-play-pos" aria-hidden>{t.position || i + 1}</span>
                  <span className="rm-play-icon" aria-hidden>{isCurrent && !paused ? '❚❚' : '▶'}</span>
                </button>
              ) : (
                <span className="rm-mono rm-muted">{t.position || i + 1}</span>
              )}
              <span>{t.title}</span>
              <span className="rm-mono rm-muted">{t.duration}</span>
            </li>
          )
        })}
      </ol>
      <div ref={wrapRef} className={`rm-now-playing${current ? ' is-active' : ''}`} />
      {current && <p className="rm-muted rm-listen-note">Full tracks when you're signed in to Spotify in this browser; 30-second previews otherwise.</p>}
    </section>
  )
}
