import type { Metadata } from 'next'
import PageHeader from '@/components/PageHeader'
import RidgelineCanvas from '@/components/RidgelineCanvas'
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
          <RidgelineCanvas className="colophon-flock" />
          <PageHeader title="Colophon" />
        </div>

        {/* ── Lead ── */}
        <div className="pf-brand-hero">
          <p className="pf-brand-lead">
            For the curious, and for my own memory, here's how this site came to be.
          </p>
        </div>

        {/* ── Claude Code ── */}
        <div className="pf-stacked-case">
          <div className="pf-stacked-case__text" style={{ maxWidth: '68ch' }}>
            <p className="pf-label">Process</p>
            <h2 className="pf-heading">My Collaborator</h2>
            <p className="pf-body">
              I designed and built this site working with Claude Code, Anthropic&rsquo;s agentic
              coding tool as an experiment and learning process. Designing a personal website is, in my
              experience, one of the hardest of projects &mdash; the combination of blank-canvas
              freedom, deep personal investment, and the gap between ideas and execution tends to
              make them stall. Claude Code narrowed that gap in a way I hadn&rsquo;t experienced
              before. I could stay focused on the creative decisions rather than getting lost in
              implementation details. That&rsquo;s new for me and magical.
            </p>
          </div>
        </div>

        {/* ── Design ── */}
        <div className="pf-stacked-case">
          <div className="pf-stacked-case__text" style={{ maxWidth: '68ch' }}>
            <p className="pf-label">Aesthetic</p>
            <h2 className="pf-heading">Design Influences</h2>
            <p className="pf-body">
              The visual language of the site draws from a few places. The stacked ridgeline plot
              in this header is not synthetic &mdash; it&rsquo;s actual radio emission data from{' '}
              <strong>PSR B1919+21</strong>, the first radio pulsar ever discovered, recorded at
              318&thinsp;MHz by Harold Craft at Arecibo Observatory in 1970. Peter Saville used the
              same dataset for Joy Division&rsquo;s{' '}
              <em><a href="https://boingboing.net/2023/05/16/the-origins-of-the-legendary-album-cover-for-joy-divisions-unknown-pleasures.html" target="_blank">Unknown Pleasures</a></em>{' '}
              cover. The subtle animation reflects the pulsar&rsquo;s actual 1.3373-second period.
            </p>
            <p className="pf-body" style={{ marginTop: '1rem' }}>
              The weathered landscapes of <a href="https://en.wikipedia.org/wiki/Tatooine" target="_blank">Tatooine</a> and Arakis inspired the color palette here
              of warm cream, deep ink tones, cold grays, spice red. As a child of the 1970s and 80s, these places feel like a second home to me. The sounds of Hans Zimmer, Tangerine Dream, Boards of Canada, and Carbon Based Lifeforms were playing while I designed this site. No doubt this music influenced things.
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
              by <a href="https://f37foundry.com/" target="_blank">F37 Foundry</a> &mdash; a contemporary serif with an optical elegance that holds up
              at both large and small sizes. Its slightly negative sidebearing at display scale
              gives the headings their tight, confident stance.
            </p>
            <p className="pf-body" style={{ marginTop: '1rem' }}>
              Body copy, labels, and UI text are set in <a href="https://fonts.adobe.com/fonts/aktiv-grotesk" target="_blank">Aktiv Grotesk by Dalton Maag</a>, served via
              Adobe Fonts. It pairs well with Lineca without competing.
            </p>
          </div>

          {/* Type specimen */}
          <div className="colophon-specimen">
            <div className="colophon-specimen-row">
              <span className="colophon-specimen-display">Jedi knights vex Sith lords by quickly zapping the forgotten Wampa.</span>
              <span className="colophon-specimen-label">F37 Lineca — Display</span>
            </div>
            <div className="colophon-specimen-row">
              <span className="colophon-specimen-body">Joy quivers as love tears us apart; bleak fog hazes my dim, wrecked exit now.</span>
              <span className="colophon-specimen-label">Aktiv Grotesk — Body</span>
            </div>
          </div>
        </div>
        
        {/* ── Claude Code ── */}
        <div className="pf-stacked-case">
          <div className="pf-stacked-case__text" style={{ maxWidth: '68ch' }}>
            <p className="pf-label">Audio Nerdery</p>
            <h2 className="pf-heading">Sound Setup</h2>
            <p className="pf-body">
              Music matters to me, and dialing in the right listening experience is half the fun. After plenty of tinkering, here's the setup that keeps me happy in the studio: a Thorens TD125 Mk II turntable, a McIntosh MA5100 integrated amp, and a pair of Klipsch Heresy IV speakers. Warm sound, beautiful objects. My kids will fight over this gear when I die.
            </p>
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
              { term: 'Animations',   def: 'Canvas 2D — marching squares (topo), PSR B1919+21 pulsar data (colophon), sinusoidal waves' },
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
