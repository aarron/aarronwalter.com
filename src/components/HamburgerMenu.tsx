'use client'

import { useState, useEffect } from 'react'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Portfolio', href: '/#work' },
  { label: 'Reading', href: '/reading' },
  { label: 'Listening', href: '/listening' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: 'https://www.aarronwalter.com/contact' },
]

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false)

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // Push page content when open
  useEffect(() => {
    const el = document.getElementById('page-content')
    if (el) el.classList.toggle('nav-open', open)
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      if (el) el.classList.remove('nav-open')
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <button
        className={`hamburger-btn${open ? ' is-open' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        <span className="hamburger-bar" />
        <span className="hamburger-bar" />
        <span className="hamburger-bar" />
      </button>

      {/* Backdrop */}
      <div
        className={`nav-backdrop${open ? ' is-visible' : ''}`}
        onClick={() => setOpen(false)}
        aria-hidden
      />

      {/* Drawer */}
      <nav
        className={`nav-drawer${open ? ' is-open' : ''}`}
        aria-label="Site navigation"
        aria-hidden={!open}
      >
        <ul className="nav-list">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                className="nav-link"
                onClick={() => setOpen(false)}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
