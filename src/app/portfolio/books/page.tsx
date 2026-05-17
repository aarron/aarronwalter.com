import type { Metadata } from 'next'
import { ogImage } from '@/lib/og'
import PageHeader from '@/components/PageHeader'
import CaseStudySection from '@/components/CaseStudySection'
import BookFrame from '@/components/BookFrame'
import TestimonialPair from '@/components/TestimonialPair'
import PortfolioNav from '@/components/PortfolioNav'
import PortfolioFooter from '@/components/PortfolioFooter'
import JsonLd from '@/components/JsonLd'
import RidgelineCanvas from '@/components/RidgelineCanvas'
import { SUNSPOT_DATA } from '@/lib/natural-data'

export const metadata: Metadata = {
  title: 'My Books',
  description: 'Aarron Walter is the author of Designing for Emotion (A Book Apart) and co-author of Principles of Product Design and Design Leadership Handbook.',
  openGraph: {
    title: 'My Books — Aarron Walter',
    description: 'Author of Designing for Emotion and co-author of Principles of Product Design and Design Leadership Handbook.',
    url: 'https://aarronwalter.com/portfolio/books',
    images: ogImage('My Books', 'Author of Designing for Emotion and co-author of Principles of Product Design and Design Leadership Handbook.'),
  },
  alternates: { canonical: 'https://aarronwalter.com/portfolio/books' },
}

const BOOKS_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Book',
      name: 'Designing for Emotion',
      author: { '@type': 'Person', name: 'Aarron Walter', url: 'https://aarronwalter.com' },
      publisher: { '@type': 'Organization', name: 'A Book Apart' },
      datePublished: '2011',
      url: 'https://designbetterpodcast.com/p/designing-for-emotion',
      description: 'How emotion, personality, and surprise can turn a useful product into one people love.',
    },
    {
      '@type': 'Book',
      name: 'Principles of Product Design',
      author: { '@type': 'Person', name: 'Aarron Walter', url: 'https://aarronwalter.com' },
      publisher: { '@type': 'Organization', name: 'Design Better' },
      datePublished: '2018',
      url: 'https://designbetterpodcast.com/p/principles-of-product-design',
      description: 'Distills the practices that show up again and again at the design teams doing the best work.',
    },
    {
      '@type': 'Book',
      name: 'Design Leadership Handbook',
      author: [
        { '@type': 'Person', name: 'Aarron Walter', url: 'https://aarronwalter.com' },
        { '@type': 'Person', name: 'Eli Woolery' },
      ],
      publisher: { '@type': 'Organization', name: 'Design Better' },
      datePublished: '2019',
      url: 'https://designbetterpodcast.com/p/design-leadership-handbook',
      description: 'A guide for designers stepping into their first leadership role.',
    },
  ],
}

export default function BooksPage() {
  return (
    <>
      <JsonLd data={BOOKS_JSON_LD} />

      <article className="page-article">

        {/* ── Header ── */}
        {/* ── Header with daily sunspot number (1950–2009, 11-year solar cycle) ── */}
        <div className="books-hero">
          <RidgelineCanvas
            className="books-sunspot"
            data={SUNSPOT_DATA}
            ampRef={0.50}
            animate="breath"
          />
          <PageHeader title="My Books" />
        </div>

        {/* ── Lead ── */}
        <div className="pf-brand-hero">
          <p className="pf-brand-lead">
            Writing has been a thread running through my entire career — a way to work through ideas, share what I've learned, and contribute something lasting to the design community. My books all circle the same territory: how emotion, leadership, and craft combine to make products that genuinely connect with people.
          </p>
        </div>

        {/* ────────────────────────────────────────────────
            Designing for Emotion
        ──────────────────────────────────────────────── */}
        <CaseStudySection
          label="A Book Apart · 2011, 2nd Ed. 2020"
          heading="Designing for Emotion"
          meta={[
            { label: 'Publisher', value: 'A Book Apart' },
            { label: 'Edition',   value: 'Second edition' },
          ]}
          panel={
            <div style={{ marginTop: 'clamp(2rem, 3.5vw, 3rem)' }}>
              <BookFrame src="/portfolio/Other/designing-for-emotion.png" alt="Designing for Emotion — book cover" />
            </div>
          }
        >
          <p className="pf-body">
            My first book, Designing for Emotion, makes the case that emotion isn&rsquo;t a
            finishing layer on a product &mdash; it&rsquo;s the thing that decides whether people
            trust it, return to it, or tell their friends about it. Drawing from psychology,
            storytelling, and interface design, I lay out how personality, surprise, and small
            human details can turn a useful product into one people actually love.
          </p>
          <p className="pf-body" style={{ marginTop: '1rem' }}>
            The work has been put into practice at companies like Mailchimp, Zappos, and Apple,
            and the principles have held up across a decade of platform shifts. The updated edition
            extends the ideas to new contexts and includes fresh examples from teams working at
            scale. Jeffrey Zeldman called it &ldquo;the book I wish I had written&rdquo;; Jason
            Fried and others have called it essential reading for anyone building products for
            people.
          </p>
          <a
            href="https://designbetterpodcast.com/p/designing-for-emotion"
            target="_blank"
            rel="noopener noreferrer"
            className="pf-text-link"
            style={{ marginTop: '1.25rem', display: 'inline-block' }}
          >
            Available now on Design Better →
          </a>
        </CaseStudySection>

        <TestimonialPair
          testimonials={[
            {
              quote: 'Emotion becomes an unfair advantage for your business.',
              name: 'Jake Knapp',
              role: 'Author of Sprint',
              avatar: '/portfolio/Other/designing-for-emotion.png',
            },
            {
              quote: 'Goes beyond just functional to what is truly delightful.',
              name: 'Julie Zhuo',
              role: 'Author of The Making of a Manager',
              avatar: '/portfolio/Other/designing-for-emotion2.jpg',
            },
          ]}
        />

        {/* ────────────────────────────────────────────────
            Principles of Product Design
        ──────────────────────────────────────────────── */}
        <CaseStudySection
          label="Design Better · 2018"
          heading="Principles of Product Design"
          meta={[
            { label: 'Publisher', value: 'Design Better / InVision' },
            { label: 'Format',    value: 'Free ebook, audiobook, PDF' },
          ]}
          panel={
            <div style={{ marginTop: 'clamp(2rem, 3.5vw, 3rem)' }}>
              <BookFrame src="/portfolio/Other/principles-of-product-design.png" alt="Principles of Product Design — book cover" />
            </div>
          }
        >
          <p className="pf-body">
            Principles of Product Design distills the practices that show up again and again at
            the design teams doing the best work &mdash; what they research, how they prototype,
            how they think in systems, and how they work across functions. I wrote it with input
            from practitioners at Netflix, Google, Slack, Airbnb, and Dropbox, pulling the
            patterns out of dozens of conversations and turning them into something a designer at
            any level can put to use on Monday morning.
          </p>
          <p className="pf-body" style={{ marginTop: '1rem' }}>
            Published as part of the Design Better library, the book has been downloaded over
            400,000 times alongside the other ten titles in the series.
          </p>
          <a
            href="https://designbetterpodcast.com/p/principles-of-product-design"
            target="_blank"
            rel="noopener noreferrer"
            className="pf-text-link"
            style={{ marginTop: '1.25rem', display: 'inline-block' }}
          >
            Available on Design Better →
          </a>
        </CaseStudySection>

        {/* ────────────────────────────────────────────────
            Design Leadership Handbook
        ──────────────────────────────────────────────── */}
        <CaseStudySection
          label="Design Better · 2019"
          heading="Design Leadership Handbook"
          meta={[
            { label: 'Co-author',  value: 'Eli Woolery' },
            { label: 'Publisher',  value: 'Design Better / InVision' },
            { label: 'Format',     value: 'Free ebook, audiobook, PDF' },
          ]}
          panel={
            <div style={{ marginTop: 'clamp(2rem, 3.5vw, 3rem)' }}>
              <BookFrame src="/portfolio/Other/Design-Leadership-Handbook.png" alt="Design Leadership Handbook — book cover" />
            </div>
          }
        >
          <p className="pf-body">
            Eli Woolery and I wrote the Design Leadership Handbook for designers stepping into
            their first leadership role &mdash; the moment when the skills that made you a great
            IC stop being the ones that make you a great leader. The book covers what no one
            teaches you in design school: how to hire and coach, run a useful critique, give
            feedback that actually changes the work, build career paths for your team, and explain
            design&rsquo;s value to people who don&rsquo;t speak the language.
          </p>
          <p className="pf-body" style={{ marginTop: '1rem' }}>
            We drew on conversations with senior design leaders at Netflix, Airbnb, Slack,
            Spotify, 3M, Twitter, and Mailchimp &mdash; people who&rsquo;d already worked through
            the problems our readers were facing. The handbook has been adopted by design programs
            at universities and used inside design organizations around the world.
          </p>
          <a
            href="https://designbetterpodcast.com/p/design-leadership-handbook"
            target="_blank"
            rel="noopener noreferrer"
            className="pf-text-link"
            style={{ marginTop: '1.25rem', display: 'inline-block' }}
          >
            Available on Design Better →
          </a>
        </CaseStudySection>

      </article>

      {/* ── Prev / Next ── */}
      <PortfolioNav
        prev={{ href: '/portfolio/other', label: 'Consulting' }}
        next={{ href: '/', label: 'All work', dir: 'Home →' }}
      />

      {/* ── Footer ── */}
      <PortfolioFooter />
    </>
  )
}
