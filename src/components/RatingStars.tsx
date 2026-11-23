'use client'

import { useState } from 'react'

interface Props {
  rating: number
  /** When provided, the stars are clickable. Clicking the current rating clears it. */
  onRate?: (rating: number) => void
  size?: 'small' | 'large'
}

// Filled stars show the rating; outlined stars show what's left out of five.
export default function RatingStars({ rating, onRate, size = 'small' }: Props) {
  const [hover, setHover] = useState(0)

  if (!onRate) {
    if (!rating) return null
    return (
      <p className={`rating-stars rating-stars--${size}`} aria-label={`Rated ${rating} out of 5`}>
        {[1, 2, 3, 4, 5].map(n => (
          <span key={n} className={n <= rating ? 'is-on' : 'is-off'} aria-hidden>{n <= rating ? '★' : '☆'}</span>
        ))}
      </p>
    )
  }

  const shown = hover || rating
  return (
    <div
      className={`rating-stars rating-stars--${size} is-editable${hover ? ' is-previewing' : ''}`}
      role="radiogroup"
      aria-label={`Your rating: ${rating ? `${rating} of 5` : 'unrated'}`}
      onMouseLeave={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={rating === n}
          aria-label={`${n} star${n === 1 ? '' : 's'}${rating === n ? ' (click to clear)' : ''}`}
          title={rating === n ? 'Click to clear' : `Rate ${n}`}
          className={n <= shown ? 'is-on' : 'is-off'}
          onMouseEnter={() => setHover(n)}
          onFocus={() => setHover(n)}
          onBlur={() => setHover(0)}
          onClick={e => { e.stopPropagation(); onRate(rating === n ? 0 : n) }}
        >{n <= shown ? '★' : '☆'}</button>
      ))}
      <span className="rating-stars-value" aria-hidden>{shown ? `${shown}/5` : 'Unrated'}</span>
    </div>
  )
}
