'use client'

import { useEffect, useState } from 'react'

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

interface Seg {
  char: string
  isDigit: boolean
  digitIndex: number
}

function parse(value: string): Seg[] {
  return value.split('').map(char => ({
    char,
    isDigit: /\d/.test(char),
    digitIndex: /\d/.test(char) ? parseInt(char, 10) : 0,
  }))
}

export default function OdometerValue({ value }: { value: string }) {
  const [active, setActive] = useState(false)

  useEffect(() => {
    // One-frame delay so the browser has painted the initial state
    const id = requestAnimationFrame(() => {
      const t = setTimeout(() => setActive(true), 80)
      return () => clearTimeout(t)
    })
    return () => cancelAnimationFrame(id)
  }, [])

  const segments = parse(value)

  return (
    <span className="odometer-value" aria-label={value}>
      {segments.map((seg, i) =>
        seg.isDigit ? (
          // Numeric: a clipped reel that rolls up from 0 → target digit
          <span key={i} className="odometer-cell">
            <span
              className="odometer-reel"
              style={{
                transform: active
                  ? `translateY(-${seg.digitIndex * 10}%)`
                  : 'translateY(0%)',
                transitionDelay: active ? `${i * 55}ms` : '0ms',
              }}
            >
              {DIGITS.map(d => (
                <span key={d} className="odometer-digit">{d}</span>
              ))}
            </span>
          </span>
        ) : (
          // Symbol / letter: slides up from below
          <span key={i} className="odometer-cell">
            <span
              className="odometer-symbol"
              style={{
                transform: active ? 'translateY(0%)' : 'translateY(105%)',
                opacity: active ? 1 : 0,
                transitionDelay: active ? `${i * 55}ms` : '0ms',
              }}
            >
              {seg.char}
            </span>
          </span>
        )
      )}
    </span>
  )
}
