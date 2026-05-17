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

        {/* ── My Collaborator ── */}
        <div className="pf-stacked-case" style={{ borderTop: 'none' }}>
          <div className="pf-stacked-case__text" style={{ maxWidth: '68ch' }}>
            <p className="pf-label">Process</p>
            <h2 className="pf-heading">My Collaborator</h2>
            <p className="pf-body">
              I designed and built this site working with{' '}
              <a href="https://claude.ai/code" target="_blank" rel="noopener noreferrer">Claude Code</a>,{' '}
              <a href="https://www.anthropic.com" target="_blank" rel="noopener noreferrer">Anthropic</a>&rsquo;s agentic
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
            <p className="pf-label">The Feels</p>
            <h2 className="pf-heading">Design Influences</h2>
            <p className="pf-body">
              The visual language of the site draws from a few places. The stacked ridgeline plot
              in this header is not synthetic &mdash; it&rsquo;s actual radio emission data from{' '}
              <strong>
                <a href="https://en.wikipedia.org/wiki/PSR_B1919%2B21" target="_blank" rel="noopener noreferrer">PSR B1919+21</a>
              </strong>
              , the first radio pulsar ever discovered, recorded at
              318&thinsp;MHz by{' '}
              <a href="https://ui.adsabs.harvard.edu/abs/1970PhDT........13C" target="_blank" rel="noopener noreferrer">Harold Craft</a>{' '}
              at{' '}
              <a href="https://en.wikipedia.org/wiki/Arecibo_Observatory" target="_blank" rel="noopener noreferrer">Arecibo Observatory</a>{' '}
              in 1970.{' '}
              <a href="https://en.wikipedia.org/wiki/Peter_Saville_(graphic_designer)" target="_blank" rel="noopener noreferrer">Peter Saville</a>{' '}
              used the same dataset for Joy Division&rsquo;s{' '}
              <em><a href="https://boingboing.net/2023/05/16/the-origins-of-the-legendary-album-cover-for-joy-divisions-unknown-pleasures.html" target="_blank" rel="noopener noreferrer">Unknown Pleasures</a></em>{' '}
              cover. The subtle animation reflects the pulsar&rsquo;s actual 1.3373-second period.
            </p>
            <p className="pf-body" style={{ marginTop: '1rem' }}>
              The weathered landscapes of{' '}
              <a href="https://en.wikipedia.org/wiki/Tatooine" target="_blank" rel="noopener noreferrer">Tatooine</a>{' '}
              and{' '}
              <a href="https://en.wikipedia.org/wiki/Arrakis" target="_blank" rel="noopener noreferrer">Arrakis</a>{' '}
              inspired the color palette here
              of warm cream, deep ink tones, cold grays, spice red. As a child of the 1970s and 80s, these places feel like a second home to me. The sounds of{' '}
              <a href="https://open.spotify.com/artist/6ozJOabZpwD8cSxLTljn1y" target="_blank" rel="noopener noreferrer">Hans Zimmer</a>,{' '}
              <a href="https://open.spotify.com/artist/1BGN1IdyiSR0ZYrkoKNchl" target="_blank" rel="noopener noreferrer">Tangerine Dream</a>,{' '}
              <a href="https://open.spotify.com/artist/2VJjRFDMvpRnapb6yv40iZ" target="_blank" rel="noopener noreferrer">Boards of Canada</a>, and{' '}
              <a href="https://open.spotify.com/artist/38DX4hQVvPBs3PThDIAK11" target="_blank" rel="noopener noreferrer">Carbon Based Lifeforms</a>{' '}
              were playing while I designed this site. No doubt this music influenced things.
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
                <a href="https://f37foundry.com/fonts/f37-lineca" target="_blank" rel="noopener noreferrer">F37 Lineca</a>
              </strong>{' '}
              by <a href="https://f37foundry.com/" target="_blank" rel="noopener noreferrer">F37 Foundry</a> &mdash; a contemporary serif with an optical elegance that holds up
              at both large and small sizes. Its slightly negative sidebearing at display scale
              gives the headings their tight, confident stance.
            </p>
            <p className="pf-body" style={{ marginTop: '1rem' }}>
              Body copy, labels, and UI text are set in{' '}
              <a href="https://fonts.adobe.com/fonts/aktiv-grotesk" target="_blank" rel="noopener noreferrer">Aktiv Grotesk</a>{' '}
              by <a href="https://www.daltonmaag.com/" target="_blank" rel="noopener noreferrer">Dalton Maag</a>, served via
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

        {/* ── Audio Nerdery ── */}
        <div className="pf-stacked-case">
          <div className="pf-stacked-case__text" style={{ maxWidth: '68ch' }}>
            <p className="pf-label">Audio Nerdery</p>
            <h2 className="pf-heading">Sound Setup</h2>
            <p className="pf-body">
              Music matters to me, and dialing in the right listening experience is half the fun. After plenty of tinkering, here&rsquo;s the setup that keeps me happy in the studio: a{' '}
              <a href="https://en.wikipedia.org/wiki/Thorens" target="_blank" rel="noopener noreferrer">Thorens TD125 Mk&thinsp;II</a>{' '}
              turntable, a{' '}
              <a href="https://www.mcintoshlabs.com/products/integrated-amplifiers/MA5100" target="_blank" rel="noopener noreferrer">McIntosh MA5100</a>{' '}
              integrated amp, and a pair of{' '}
              <a href="https://www.klipsch.com/products/heresy-iv-floorstanding-speaker" target="_blank" rel="noopener noreferrer">Klipsch Heresy IV</a>{' '}
              speakers. Warm sound, beautiful objects. My kids will fight over this gear when I die.
            </p>
          </div>
        </div>

        {/* ── Accessibility ── */}
        <div className="pf-stacked-case">
          <div className="pf-stacked-case__text" style={{ maxWidth: '68ch' }}>
            <p className="pf-label">Accessibility</p>
            <h2 className="pf-heading">WCAG 2.1 AA</h2>
            <p className="pf-body">
              The site targets{' '}
              <a href="https://www.w3.org/TR/WCAG21/" target="_blank" rel="noopener noreferrer">WCAG 2.1 Level AA</a>{' '}
              compliance. A full audit was conducted covering
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
            <div className="colophon-stack-row">
              <dt className="colophon-stack-term">Framework</dt>
              <dd className="colophon-stack-def">
                <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer">Next.js</a> 16 App Router (TypeScript)
              </dd>
            </div>
            <div className="colophon-stack-row">
              <dt className="colophon-stack-term">Styling</dt>
              <dd className="colophon-stack-def">
                <a href="https://tailwindcss.com" target="_blank" rel="noopener noreferrer">Tailwind CSS</a> v4 + custom design system in globals.css
              </dd>
            </div>
            <div className="colophon-stack-row">
              <dt className="colophon-stack-term">Deployment</dt>
              <dd className="colophon-stack-def">
                <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">Vercel</a> — pushed to master, ships automatically
              </dd>
            </div>
            <div className="colophon-stack-row">
              <dt className="colophon-stack-term">Analytics</dt>
              <dd className="colophon-stack-def">
                <a href="https://vercel.com/analytics" target="_blank" rel="noopener noreferrer">Vercel Web Analytics</a>
              </dd>
            </div>
            <div className="colophon-stack-row">
              <dt className="colophon-stack-term">Contact form</dt>
              <dd className="colophon-stack-def">
                <a href="https://resend.com" target="_blank" rel="noopener noreferrer">Resend</a> — email delivery via verified domain
              </dd>
            </div>
            <div className="colophon-stack-row">
              <dt className="colophon-stack-term">Now Listening</dt>
              <dd className="colophon-stack-def">
                <a href="https://www.discogs.com/developers" target="_blank" rel="noopener noreferrer">Discogs API</a>
              </dd>
            </div>
            <div className="colophon-stack-row">
              <dt className="colophon-stack-term">Now Reading</dt>
              <dd className="colophon-stack-def">
                <a href="https://openlibrary.org/dev/docs/api" target="_blank" rel="noopener noreferrer">Open Library Covers API</a>
              </dd>
            </div>
            <div className="colophon-stack-row">
              <dt className="colophon-stack-term">Animations</dt>
              <dd className="colophon-stack-def">
                Canvas 2D — real terrain from{' '}
                <a href="https://www.ncei.noaa.gov/products/etopo-global-relief-model" target="_blank" rel="noopener noreferrer">ETOPO1</a>{' '}
                (reading),{' '}
                <a href="https://en.wikipedia.org/wiki/PSR_B1919%2B21" target="_blank" rel="noopener noreferrer">PSR B1919+21</a>{' '}
                pulsar (colophon), LIGO{' '}
                <a href="https://gwosc.org/events/GW150914/" target="_blank" rel="noopener noreferrer">GW150914</a>{' '}
                (listening), 2004 Sumatra{' '}
                <a href="https://www.iris.edu/hq/" target="_blank" rel="noopener noreferrer">IRIS/USGS</a>{' '}
                seismogram (Mailchimp), geomagnetic{' '}
                <a href="https://kp.gfz-potsdam.de/" target="_blank" rel="noopener noreferrer">Ap index</a>{' '}
                (InVision),{' '}
                <a href="https://gml.noaa.gov/ccgg/trends/" target="_blank" rel="noopener noreferrer">Mauna Loa CO₂</a>{' '}
                (RTSL), SILSO{' '}
                <a href="https://www.sidc.be/SILSO/datafiles" target="_blank" rel="noopener noreferrer">sunspot</a>{' '}
                (books),{' '}
                <a href="https://psl.noaa.gov/enso/mei/" target="_blank" rel="noopener noreferrer">ENSO MEI</a>{' '}
                (consulting),{' '}
                <a href="https://tidesandcurrents.noaa.gov/" target="_blank" rel="noopener noreferrer">NOAA tide gauge</a>{' '}
                (footer)
              </dd>
            </div>
            <div className="colophon-stack-row">
              <dt className="colophon-stack-term">Source</dt>
              <dd className="colophon-stack-def">
                <a href="https://github.com/aarron/aarronwalter.com" target="_blank" rel="noopener noreferrer">github.com/aarron/aarronwalter.com</a>
              </dd>
            </div>
          </dl>
        </div>

      </article>

      <PortfolioFooter />
    </>
  )
}
