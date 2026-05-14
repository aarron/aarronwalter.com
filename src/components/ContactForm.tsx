'use client'

import { useState, useRef, useEffect } from 'react'

type ContactType = 'general' | 'guest' | 'speaking' | ''

// Minimum ms between page load and a valid submission — bots submit instantly
const MIN_HUMAN_MS = 1800

export default function ContactForm() {
  const [type, setType]           = useState<ContactType>('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState('')
  const formRef   = useRef<HTMLFormElement>(null)
  const mountedAt = useRef<number>(0)

  useEffect(() => { mountedAt.current = Date.now() }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const data = Object.fromEntries(new FormData(e.currentTarget))

    // Honeypot: real users never fill the hidden "website" field
    if (data.website) {
      // Silently fake success — don't tip off the bot
      setSubmitted(true)
      setSubmitting(false)
      return
    }

    // Timing check: fewer than MIN_HUMAN_MS means bot auto-fill
    if (Date.now() - mountedAt.current < MIN_HUMAN_MS) {
      setSubmitted(true)
      setSubmitting(false)
      return
    }

    try {
      const res = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        setError('Something went wrong. Please try emailing me directly.')
      }
    } catch {
      setError('Something went wrong. Please try emailing me directly.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="contact-success">
        <p className="contact-success-headline">Got it — thanks.</p>
        <p className="contact-success-body">I&rsquo;ll be in touch soon.</p>
      </div>
    )
  }

  return (
    <form ref={formRef} className="contact-form" onSubmit={handleSubmit} noValidate>

      {/* Honeypot — hidden from real users, invisible bait for bots */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 0, height: 0, overflow: 'hidden' }}>
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {/* ── Always-visible: name + email ── */}
      <div className="contact-row contact-row-2">
        <div className="contact-field">
          <label className="contact-label" htmlFor="name">Your name</label>
          <input id="name" name="name" type="text" className="contact-input" required autoComplete="name" />
        </div>
        <div className="contact-field">
          <label className="contact-label" htmlFor="email">Your email</label>
          <input id="email" name="email" type="email" className="contact-input" required autoComplete="email" />
        </div>
      </div>

      {/* ── Contact type selector ── */}
      <div className="contact-field">
        <label className="contact-label">What brings you here?</label>
        <div className="contact-type-grid">
          {[
            { value: 'guest',    label: 'Podcast Guest Pitch',  sub: 'Pitch a guest for my podcast' },
            { value: 'speaking', label: 'Speaking Engagement',  sub: 'Invite me to your event' },
            { value: 'general',  label: 'General Inquiry',      sub: 'Anything else' },
          ].map(({ value, label, sub }) => (
            <button
              key={value}
              type="button"
              className={`contact-type-btn${type === value ? ' is-selected' : ''}`}
              onClick={() => setType(value as ContactType)}
            >
              <span className="contact-type-label">{label}</span>
              <span className="contact-type-sub">{sub}</span>
            </button>
          ))}
        </div>
        <input type="hidden" name="type" value={type} />
      </div>

      {/* ── Guest pitch fields ── */}
      {type === 'guest' && (
        <div className="contact-conditional">
          <div className="contact-row contact-row-2">
            <div className="contact-field">
              <label className="contact-label" htmlFor="guest_name">Guest&rsquo;s name</label>
              <input id="guest_name" name="guest_name" type="text" className="contact-input" required />
            </div>
            <div className="contact-field">
              <label className="contact-label" htmlFor="guest_linkedin">LinkedIn profile URL</label>
              <input id="guest_linkedin" name="guest_linkedin" type="url" className="contact-input" placeholder="https://linkedin.com/in/…" required />
            </div>
          </div>
          <div className="contact-field">
            <label className="contact-label" htmlFor="guest_website">
              Guest&rsquo;s website <span className="contact-optional">(optional)</span>
            </label>
            <input id="guest_website" name="guest_website" type="url" className="contact-input" placeholder="https://…" />
          </div>
          <div className="contact-field">
            <label className="contact-label" htmlFor="guest_topics">Topics they could speak to</label>
            <textarea
              id="guest_topics"
              name="guest_topics"
              className="contact-textarea"
              rows={3}
              required
              placeholder="Design process, creativity, leadership, technology…"
            />
          </div>
          <div className="contact-field">
            <label className="contact-label" htmlFor="guest_fit">
              How do they fit Design Better&rsquo;s themes?
            </label>
            <p className="contact-hint">
              Design Better explores the creative process at the intersection of design and technology.
              Help me understand why this guest belongs in that conversation.
            </p>
            <textarea
              id="guest_fit"
              name="guest_fit"
              className="contact-textarea"
              rows={4}
              required
              placeholder="What makes this person's perspective unique? What story would they tell?"
            />
          </div>
        </div>
      )}

      {/* ── Speaking fields ── */}
      {type === 'speaking' && (
        <div className="contact-conditional">
          <div className="contact-row contact-row-2">
            <div className="contact-field">
              <label className="contact-label" htmlFor="event_name">Event or company name</label>
              <input id="event_name" name="event_name" type="text" className="contact-input" required />
            </div>
            <div className="contact-field">
              <label className="contact-label" htmlFor="event_date">Approximate date</label>
              <input id="event_date" name="event_date" type="text" className="contact-input" placeholder="e.g. September 2026" />
            </div>
          </div>
          <div className="contact-row contact-row-2">
            <div className="contact-field">
              <label className="contact-label" htmlFor="event_location">Format</label>
              <select id="event_location" name="event_location" className="contact-input contact-select">
                <option value="">Select…</option>
                <option value="in-person">In-person</option>
                <option value="virtual">Virtual</option>
              </select>
            </div>
            <div className="contact-field">
              <label className="contact-label" htmlFor="event_budget">
                Budget range <span className="contact-optional">(optional)</span>
              </label>
              <input id="event_budget" name="event_budget" type="text" className="contact-input" />
            </div>
          </div>
          <div className="contact-field">
            <label className="contact-label" htmlFor="event_description">Tell me about the event</label>
            <textarea
              id="event_description"
              name="event_description"
              className="contact-textarea"
              rows={4}
              required
              placeholder="Audience, theme, what you're hoping I'll bring to it…"
            />
          </div>
        </div>
      )}

      {/* ── General message ── */}
      {type === 'general' && (
        <div className="contact-conditional">
          <div className="contact-field">
            <label className="contact-label" htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              className="contact-textarea"
              rows={6}
              required
              placeholder="What's on your mind?"
            />
          </div>
        </div>
      )}

      {type && (
        <>
          {error && <p className="contact-error">{error}</p>}
          <button type="submit" className="contact-submit" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send message'}
          </button>
        </>
      )}
    </form>
  )
}
