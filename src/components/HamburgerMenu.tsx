'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

const PORTFOLIO_LINKS = [
  { label: 'Mailchimp',              href: '/portfolio/mailchimp' },
  { label: 'InVision',               href: '/portfolio/invision' },
  { label: 'Resolve to Save Lives',  href: '/portfolio/rtsl' },
  { label: 'Consulting',             href: '/portfolio/other' },
  { label: 'My Books',               href: '/portfolio/books' },
]

const TOP_LINKS = [
  { label: 'Home',      href: '/' },
  { label: 'Reading',   href: '/reading' },
  { label: 'Listening', href: '/listening' },
  { label: 'About',     href: '/about' },
  { label: 'Contact',   href: '/contact' },
]

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const firstLinkRef = useRef<HTMLAnchorElement>(null)
  const btnRef       = useRef<HTMLButtonElement>(null)

  const close = () => setOpen(false)

  // Focus first nav link when drawer opens; restore to button on close
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => firstLinkRef.current?.focus())
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { close(); btnRef.current?.focus() }
    }
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

  const isPortfolioActive = pathname.startsWith('/portfolio/')

  return (
    <>
      <button
        ref={btnRef}
        className={`hamburger-btn${open ? ' is-open' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="nav-drawer"
      >
        <span className="hamburger-bar" />
        <span className="hamburger-bar" />
        <span className="hamburger-bar" />
      </button>

      {/* Backdrop */}
      <div
        className={`nav-backdrop${open ? ' is-visible' : ''}`}
        onClick={close}
        aria-hidden
      />

      {/* Drawer */}
      <nav
        id="nav-drawer"
        className={`nav-drawer${open ? ' is-open' : ''}`}
        aria-label="Site navigation"
        aria-hidden={!open}
      >
        <ul className="nav-list">

          {/* Home */}
          <li>
            <a
              ref={firstLinkRef}
              href="/"
              className={`nav-link${pathname === '/' ? ' nav-link--active' : ''}`}
              onClick={close}
            >
              Home
            </a>
          </li>

          {/* Portfolio section */}
          <li className="nav-portfolio-section">
            <span className={`nav-section-label${isPortfolioActive ? ' nav-section-label--active' : ''}`}>
              Portfolio
            </span>
            <ul className="nav-sublist">
              {PORTFOLIO_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <a
                    href={href}
                    className={`nav-sublink${pathname === href ? ' nav-sublink--active' : ''}`}
                    onClick={close}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </li>

          {/* Reading, Listening, About, Contact */}
          {TOP_LINKS.filter(l => l.label !== 'Home').map(({ label, href }) => (
            <li key={href}>
              <a
                href={href}
                className={`nav-link${pathname === href ? ' nav-link--active' : ''}`}
                onClick={close}
              >
                {label}
              </a>
            </li>
          ))}

        </ul>

        {/* Footer — hairline + Design Better logo */}
        <div className="nav-footer">
          <a
            href="https://designbetterpodcast.com"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-db-logo"
            aria-label="Design Better Podcast"
          >
            <Image
              src="/db-logos/DesignBetterWhite.svg"
              alt="Design Better"
              width={200}
              height={54}
            />
          </a>
        </div>
      </nav>
    </>
  )
}
