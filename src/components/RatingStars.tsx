'use client'

interface Props {
  rating: number
  /** When provided, the stars are clickable. Clicking the current rating clears it. */
  onRate?: (rating: number) => void
  size?: 'small' | 'large'
}

export default function RatingStars({ rating, onRate, size = 'small' }: Props) {
  if (!onRate) {
    if (!rating) return null
    return (
      <p className={`rating-stars rating-stars--${size}`} aria-label={`Rated ${rating} out of 5`}>
        {'★'.repeat(rating)}<span className="rating-stars-empty">{'★'.repeat(5 - rating)}</span>
      </p>
    )
  }

  return (
    <div className={`rating-stars rating-stars--${size} is-editable`} role="radiogroup" aria-label="Your rating">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={rating === n}
          aria-label={`${n} star${n === 1 ? '' : 's'}`}
          className={n <= rating ? 'is-on' : ''}
          onClick={e => { e.stopPropagation(); onRate(rating === n ? 0 : n) }}
        >★</button>
      ))}
    </div>
  )
}
