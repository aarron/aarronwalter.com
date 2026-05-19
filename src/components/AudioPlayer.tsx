'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { Episode } from '@/lib/podcast'
import { formatDuration } from '@/lib/podcast'

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M6.5 4.5l9 5.5-9 5.5V4.5z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <rect x="5" y="4" width="3.5" height="12" rx="1" />
      <rect x="11.5" y="4" width="3.5" height="12" rx="1" />
    </svg>
  )
}

export default function AudioPlayer({ episode }: { episode: Episode }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [current, setCurrent] = useState(0)
  const [total, setTotal] = useState(0)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => {
      setCurrent(audio.currentTime)
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0)
    }
    const onLoaded = () => setTotal(audio.duration)
    const onEnded = () => setPlaying(false)

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  const toggle = async () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      try {
        await audio.play()
        setPlaying(true)
      } catch {
        // Browser blocked playback (policy, network error, etc.) — reset state
        setPlaying(false)
      }
    }
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    const bar = barRef.current
    if (!audio || !bar || !audio.duration) return
    const rect = bar.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    audio.currentTime = pct * audio.duration
  }

  const seekByKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      audio.currentTime = Math.min(audio.duration, audio.currentTime + 10)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      audio.currentTime = Math.max(0, audio.currentTime - 10)
    }
  }

  const displayDuration = total > 0 ? formatDuration(Math.floor(total)) : formatDuration(episode.duration)

  return (
    <div className="player-wrap">
      <audio ref={audioRef} src={episode.audioUrl} preload="metadata" />

      <div className="player-inner">
        {episode.imageUrl && (
          <div className="player-thumb">
            <Image
              src={episode.imageUrl}
              alt={episode.title}
              width={120}
              height={120}
              className="player-thumb-img"
            />
          </div>
        )}

        <div className="player-info">
          <span className="t-label player-label">Latest Episode</span>
          <p className="player-title">{episode.title}</p>
          {episode.subtitle && (
            <p className="player-subtitle">{episode.subtitle}</p>
          )}

          <div className="player-controls">
            <button onClick={toggle} className="play-btn" aria-label={playing ? 'Pause' : 'Play'}>
              {playing ? <PauseIcon /> : <PlayIcon />}
            </button>

            <div
              className="progress-track"
              ref={barRef}
              onClick={seek}
              onKeyDown={seekByKey}
              role="slider"
              tabIndex={0}
              aria-label="Playback progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
              aria-valuetext={`${formatDuration(Math.floor(current))} of ${displayDuration}`}
            >
              <div className="progress-fill" style={{ width: `${progress}%` }} />
              <div className="progress-thumb" style={{ left: `${progress}%` }} />
            </div>

            <span className="t-caption player-time">
              {formatDuration(Math.floor(current))} / {displayDuration}
            </span>
          </div>
        </div>
      </div>

      <a href={episode.link} target="_blank" rel="noopener noreferrer" className="player-link t-label">
        Full episode →
      </a>
    </div>
  )
}
