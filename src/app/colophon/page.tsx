import type { Metadata } from 'next'
import PageHeader from '@/components/PageHeader'
import FlockCanvas from '@/components/FlockCanvas'
import PortfolioFooter from '@/components/PortfolioFooter'
import { ogImage } from '@/lib/og'

export const metadata: Metadata = {
  title: 'Colophon',
  description: 'How aarronwalter.com was designed and built — tools, typefaces, tech stack, and acknowledgements.',
  openGraph: {
    title: 'Colophon — Aarron Walter',
    description: 'How aarronwalter.com was designed and built — tools, typefaces, tech stack, and acknowledgements.',
    url: 'https://aarronwalter.com/colophon',
    images: ogImage('Colophon', 'How this site was designed and built.'),
  },
  alternates: { canonical: 'https://aarronwalter.com/colophon' },
}

export default function ColophonPage() {
  return (
    <>
      <article className="page-article">

        {/* ── Header with flock in top right ── */}
        <div className="colophon-hero">
          <FlockCanvas className="colophon-flock" />
          <PageHeader title="Colophon" />
        </div>

        {/* ── Lead ── */}
        <div className="pf-brand-hero">
          <p className="pf-brand-lead">
            A colophon is a note at the end of a book describing how it was made &mdash; the paper,
            the typefaces, the press. This is mine for the site.
          </p>
        </div>

        {/* ── Claude Code ── */}
        <div className="pf-stacked-case">
          <div className="pf-stacked-case__text" style={{ maxWidth: '68ch' }}>
            <p className="pf-label">Process</p>
            <h2 className="pf-heading">Built with Claude Code</h2>
            <p className="pf-body">
              I designed and built this site working with Claude Code, Anthropic&rsquo;s agentic
              coding tool. It was an amazing process. Designing a personal website is, in my
              experience, one of the hardest of projects &mdash; the combination of blank-canvas
              freedom, deep personal investment, and the gap between ideas and execution tends to
              make them stall. Claude Code narrowed that gap in a way I hadn&rsquo;t experienced
              before. I could stay focused on the creative decisions rather than getting lost in
              implementation details. That&rsquo;s new for me.
            </p>
            <p className="pf-body" style={{ marginTop: '1rem' }}>
              The workflow was close to pair programming: I&rsquo;d describe what I wanted, Claude
              would propose and implement it, and I&rsquo;d refine. Having an AI collaborator that
              could hold the full context of the codebase while I stayed in the design headspace
              changed how the work felt. Fewer interruptions. More flow.
            </p>
          </div>
        </div>

        {/* ── Design ── */}
        <div className="pf-stacked-case">
          <div className="pf-stacked-case__text" style={{ maxWidth: '68ch' }}>
            <p className="pf-label">Aesthetic</p>
            <h2 className="pf-heading">Design Influences</h2>
            <p className="pf-body">
              The visual language of the site draws from a few places. The topographic contour
              lines that animate through the header and background were inspired in part by album
              cover art &mdash; particularly Joy Division&rsquo;s <em>Unknown Pleasures</em>,
              with its iconic stacked radio-wave pulses, and work associated with Broken Bells,
              whose covers combine precise graphic geometry with something organic underneath. I
              wanted that same tension: structured, but alive.
            </p>
            <p className="pf-body" style={{ marginTop: '1rem' }}>
              The warm cream palette and deep ink tones are a deliberate reaction against the
              cold grays that dominate so many portfolio sites. The signal red accent was chosen
              for its energy and its contrast &mdash; it appears sparingly, which is what keeps it
              working. The overall effect I was after was something that felt more like print than
              software.
            </p>
          </div>
        </div>

        {/* ── Typography ── */}
        <div className="pf-stacked-case">
          <div className="pf-stacked-case__text" style={{ maxWidth: '68ch' }}>
            <p className="pf-label">Typography</p>
            <h2 className="pf-heading">Typefaces</h2>
            <p className="pf-body">
              Display headings are set in{' '}
              <strong style={{ fontFamily: 'Lineca, sans-serif', fontWeight: 400, fontSize: '1.1em', letterSpacing: '-0.02em' }}>
                F37 Lineca
              </strong>{' '}
              by F37 Foundry &mdash; a contemporary serif with an optical elegance that holds up
              at both large and small sizes. Its slightly negative sidebearing at display scale
              gives the headings their tight, confident stance.
            </p>
            <p className="pf-body" style={{ marginTop: '1rem' }}>
              Body copy, labels, and UI text are set in Aktiv Grotesk by Dalton Maag, served via
              Adobe Fonts. It pairs well with Lineca without competing &mdash; clean, neutral,
              legible at any weight.
            </p>
          </div>

          {/* Type specimen */}
          <div className="colophon-specimen">
            <div className="colophon-specimen-row">
              <span className="colophon-specimen-display">Aa Bb Cc</span>
              <span className="colophon-specimen-label">F37 Lineca — Display</span>
            </div>
            <div className="colophon-specimen-row">
              <span className="colophon-specimen-body">Aa Bb Cc Dd Ee Ff</span>
              <span className="colophon-specimen-label">Aktiv Grotesk — Body</span>
            </div>
          </div>
        </div>

        {/* ── Accessibility ── */}
        <div className="pf-stacked-case">
          <div className="pf-stacked-case__text" style={{ maxWidth: '68ch' }}>
            <p className="pf-label">Accessibility</p>
            <h2 className="pf-heading">WCAG 2.1 AA</h2>
            <p className="pf-body">
              The site targets WCAG 2.1 Level AA compliance. A full audit was conducted covering
              landmark roles, heading structure, image alt text, keyboard navigation, focus
              management, color contrast, and motion preferences. All decorative canvas animations
              are hidden for users who have enabled{' '}
              <code className="colophon-code">prefers-reduced-motion</code> in their OS settings.
              The lightbox, hamburger navigation, and contact form all have proper focus management
              so keyboard and screen reader users aren&rsquo;t left stranded.
            </p>
            <p className="pf-body" style={{ marginTop: '1rem' }}>
              If you spot something that feels off, please{' '}
              <a
                href="https://github.com/aarron/aarronwalter.com/issues/new?labels=bug&title=%5BBug%5D+"
                target="_blank"
                rel="noopener noreferrer"
                className="pf-text-link"
              >
                file a bug
              </a>
              .
            </p>
          </div>
        </div>

        {/* ── Tech Stack ── */}
        <div className="pf-stacked-case">
          <div className="pf-stacked-case__text" style={{ maxWidth: '68ch' }}>
            <p className="pf-label">Under the Hood</p>
            <h2 className="pf-heading">Tech Stack</h2>
            <p className="pf-body">
              The site is a statically generated Next.js application deployed on Vercel.
            </p>
          </div>

          <dl className="colophon-stack">
            {[
              { term: 'Framework',    def: 'Next.js 16 App Router (TypeScript)' },
              { term: 'Styling',      def: 'Tailwind CSS v4 + custom design system in globals.css' },
              { term: 'Deployment',   def: 'Vercel — pushed to master, ships automatically' },
              { term: 'Analytics',    def: 'Vercel Web Analytics' },
              { term: 'Contact form', def: 'Resend — email delivery via verified domain' },
              { term: 'Now Listening',def: 'Discogs API' },
              { term: 'Now Reading',  def: 'Open Library Covers API' },
              { term: 'Animations',   def: 'Canvas 2D — marching squares (topo), Boids (flock), sinusoidal waves' },
              { term: 'Source',       def: 'github.com/aarron/aarronwalter.com' },
            ].map(({ term, def }) => (
              <div key={term} className="colophon-stack-row">
                <dt className="colophon-stack-term">{term}</dt>
                <dd className="colophon-stack-def">{def}</dd>
              </div>
            ))}
          </dl>
        </div>

      </article>

      <PortfolioFooter />
    </>
  )
}
