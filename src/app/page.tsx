import Image from 'next/image'
import { getLatestEpisode } from '@/lib/podcast'
import AudioPlayer from '@/components/AudioPlayer'
import GuestCard from '@/components/GuestCard'
import HeroWaves from '@/components/HeroWaves'
import WaveTransition from '@/components/WaveTransition'
import FooterWave from '@/components/FooterWave'

function SpotifyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.516 17.32a.747.747 0 01-1.029.249c-2.818-1.723-6.365-2.112-10.542-1.157a.747.747 0 11-.333-1.456c4.571-1.045 8.492-.595 11.655 1.337a.747.747 0 01.249 1.027zm1.472-3.274a.935.935 0 01-1.286.307c-3.225-1.983-8.143-2.558-11.958-1.399a.935.935 0 01-.577-1.782c4.356-1.325 9.768-.683 13.514 1.589a.934.934 0 01.307 1.285zm.127-3.408C15.27 8.39 9.266 8.19 5.888 9.244a1.122 1.122 0 11-.651-2.147c3.927-1.19 10.454-.961 14.582 1.535a1.122 1.122 0 11-1.104 1.956v.05z"/>
    </svg>
  )
}

function ApplePodcastsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm0 4.419a7.581 7.581 0 110 15.162A7.581 7.581 0 0112 4.419zm0 2.129a5.452 5.452 0 100 10.904A5.452 5.452 0 0012 6.548zm0 1.935a.968.968 0 110 1.936.968.968 0 010-1.936zm-.484 3.226h.968v5.161h-.968v-5.161z"/>
    </svg>
  )
}

function OvercastIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.4a9.6 9.6 0 110 19.2A9.6 9.6 0 0112 2.4zm0 3.6a6 6 0 100 12A6 6 0 0012 6zm0 2.4a3.6 3.6 0 110 7.2A3.6 3.6 0 0112 8.4zm-1.08 5.628l-.84 2.052a4.799 4.799 0 01-2.268-3.9h2.172c.072.684.408 1.296.936 1.848zm2.16 0c.528-.552.864-1.164.936-1.848h2.172a4.799 4.799 0 01-2.268 3.9l-.84-2.052zM12 10.8a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4zm-4.08-.6H5.748a4.799 4.799 0 012.268-3.9l.84 2.052A2.399 2.399 0 007.92 10.2zm8.16 0a2.399 2.399 0 00-.936-1.848l.84-2.052a4.799 4.799 0 012.268 3.9H16.08z"/>
    </svg>
  )
}

const FEATURED_GUESTS = [
  {
    name: 'Kamasi Washington',
    role: 'Jazz Musician & Composer',
    image: '/guests/kamasi-washington.png',
    href: 'https://designbetterpodcast.com/p/kamasi-washington',
  },
  {
    name: 'David Sedaris',
    role: 'Author & Humorist',
    image: '/guests/david-sedaris.png',
    href: 'https://designbetterpodcast.com/p/david-sedaris-how-one-of-the-worlds',
  },
  {
    name: 'Paula Scher',
    role: 'Graphic Designer, Pentagram',
    image: '/guests/paula-scher.png',
    href: 'https://designbetterpodcast.com/p/paula-scher',
  },
  {
    name: 'Tony Fadell',
    role: 'Inventor of the iPod',
    image: '/guests/tony-fadell.png',
    href: 'https://designbetterpodcast.com/p/tony-fadell-how-to-build-the-future',
  },
  {
    name: 'John Cleese',
    role: 'Comedian & Writer',
    image: '/guests/john-cleese.png',
    href: 'https://designbetterpodcast.com/p/john-cleese',
  },
  {
    name: 'Paola Antonelli',
    role: 'Senior Curator, MoMA',
    image: '/guests/paola-antonelli.png',
    href: 'https://designbetterpodcast.com/p/paola-antonelli',
  },
  {
    name: 'Eileen Fisher',
    role: 'Fashion Designer',
    image: '/guests/eileen-fisher.png',
    href: 'https://designbetterpodcast.com/p/rewind-eileen-fisher-embracing-imperfect',
  },
  {
    name: 'OK Go',
    role: 'Band & Visual Artists',
    image: '/guests/ok-go.png',
    href: 'https://designbetterpodcast.com/p/ok-go',
  },
  {
    name: 'Jae Park',
    role: 'VP Design, Ford EV',
    image: '/guests/jae-park.png',
    href: 'https://designbetterpodcast.com/p/jae-park',
  },
]

export default async function Home() {
  const episode = await getLatestEpisode()

  return (
    <>
      {/* ── Hero + Work (shared canvas) ──────────────── */}
      <div className="hero-work-wrap">
      <HeroWaves className="hero-waves" />

      <section className="hero">


        <div className="hero-content">
          <h1 className="t-display hero-name" aria-label="Aarron Walter">
            <span style={{ display: 'block' }}>Aarron</span>
            <span style={{ display: 'block' }}>Walter</span>
          </h1>

          <hr className="hero-rule" />

          <p className="t-body hero-intro">
            I&rsquo;m the co-founder of Design Better and have spent two decades influencing how
            the tech industry thinks about design&mdash;from building the UX practice at Mailchimp
            to advising the White House, WHO, and hundreds of companies worldwide.
          </p>

          <div className="hero-links">
            <a href="https://www.aarronwalter.com/s/aarron-walter-resume.pdf" target="_blank" rel="noopener noreferrer" className="hero-link">Resume</a>
            <span className="hero-link-sep" aria-hidden="true">·</span>
            <a href="https://www.linkedin.com/in/aarron/" target="_blank" rel="noopener noreferrer" className="hero-link">LinkedIn</a>
            <span className="hero-link-sep" aria-hidden="true">·</span>
            <a href="https://twitter.com/aarron" target="_blank" rel="noopener noreferrer" className="hero-link">Twitter</a>
            <span className="hero-link-sep" aria-hidden="true">·</span>
            <a href="https://medium.com/@aarron" target="_blank" rel="noopener noreferrer" className="hero-link">Medium</a>
            <span className="hero-link-sep" aria-hidden="true">·</span>
            <a href="https://www.aarronwalter.com/contact" target="_blank" rel="noopener noreferrer" className="hero-link">Email</a>
          </div>
        </div>
      </section>

      {/* ── My Work ──────────────────────────────────────── */}
      <section className="work-section">
        <div className="work-inner">
          <div className="work-header">
            <span className="t-label" style={{ color: 'rgba(44,42,42,0.4)' }}>My Work</span>
          </div>
          <ol className="work-list">
            {[
              { index: '01', company: 'Mailchimp', role: 'Director of UX · GM of New Products · VP of R&D', years: '2008–2016', href: '/portfolio/mailchimp' },
              { index: '02', company: 'InVision', role: 'VP of Design Education & Content', years: '2016–2020', href: '/portfolio/invision' },
              { index: '03', company: 'Resolve to Save Lives', role: 'Director of Product, US COVID Response', years: '2020–2022', href: '/portfolio/rtsl' },
              { index: '04', company: 'Consulting & Publishing', role: 'Author · Speaker · Advisor', years: 'Ongoing', href: '/portfolio/other' },
            ].map((item) => (
              <li key={item.company} className="work-item">
                <a href={item.href} className="work-link">
                  <span className="t-label work-index">{item.index}</span>
                  <span className="t-headline work-company">{item.company}</span>
                  <span className="work-meta">
                    <span className="work-role">{item.role}</span>
                    <span className="t-label work-years">{item.years}</span>
                  </span>
                  <span className="work-arrow" aria-hidden="true">→</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      </div>{/* end .hero-work-wrap */}

      {/* ── Wave transition: cream → dark ─────────────────── */}
      <div className="wave-bridge" aria-hidden="true">
        <WaveTransition />
      </div>

      {/* ── Design Better + Guests (unified dark section) ── */}
      <section className="db-section">
        <div className="db-columns">

          {/* Left — logo, description, stats, player */}
          <div className="db-left">
            <Image
              src="/db-logos/DesignBetterRed.svg"
              alt="Design Better"
              width={540}
              height={290}
              className="db-logo-img"
              priority
            />
            <p className="t-body db-description">
              Design Better explores the intersection of design, technology, and the creative
              process through conversations with inspiring guests across many creative fields.
            </p>

            <div className="db-subscribe">
              <a href="https://open.spotify.com/show/59RliaMdeDAkEgp9nj1Mkj" target="_blank" rel="noopener noreferrer" className="db-subscribe-btn">
                <SpotifyIcon />
                Spotify
              </a>
              <a href="https://podcasts.apple.com/us/podcast/design-better/id1266839739" target="_blank" rel="noopener noreferrer" className="db-subscribe-btn">
                <ApplePodcastsIcon />
                Apple
              </a>
              <a href="https://overcast.fm/itunes1266839739" target="_blank" rel="noopener noreferrer" className="db-subscribe-btn">
                <OvercastIcon />
                Overcast
              </a>
            </div>

            <dl className="db-stats">
              <div className="db-stat">
                <dt className="db-stat-label">Subscribers</dt>
                <dd className="db-stat-value">234,546</dd>
              </div>
              <div className="db-stat">
                <dt className="db-stat-label">Episodes</dt>
                <dd className="db-stat-value">281</dd>
              </div>
              <div className="db-stat">
                <dt className="db-stat-label">Spotify Followers</dt>
                <dd className="db-stat-value">101,744</dd>
              </div>
              <div className="db-stat">
                <dt className="db-stat-label">Annual Listeners</dt>
                <dd className="db-stat-value">311,528</dd>
              </div>
            </dl>

            {episode ? (
              <AudioPlayer episode={episode} />
            ) : (
              <p className="t-caption" style={{ color: 'rgba(243,231,214,0.4)' }}>
                Episode unavailable.{' '}
                <a href="https://designbetterpodcast.com" target="_blank" rel="noopener noreferrer" style={{ color: '#FF4725' }}>
                  designbetterpodcast.com
                </a>
              </p>
            )}

            <div className="db-follow-links">
              <a href="http://designbetterpodcast.com" target="_blank" rel="noopener noreferrer" className="db-follow-link">Substack</a>
              <span className="db-follow-sep" aria-hidden="true">·</span>
              <a href="https://www.youtube.com/@designbetterpod" target="_blank" rel="noopener noreferrer" className="db-follow-link">YouTube</a>
              <span className="db-follow-sep" aria-hidden="true">·</span>
              <a href="https://designbetter.careers/" target="_blank" rel="noopener noreferrer" className="db-follow-link">Careers</a>
              <span className="db-follow-sep" aria-hidden="true">·</span>
              <a href="https://designbetter.team/" target="_blank" rel="noopener noreferrer" className="db-follow-link">For Teams</a>
            </div>
          </div>

          {/* Right — featured guests */}
          <div className="db-right">
            <div className="guests-header">
              <span className="t-label" style={{ color: 'rgba(243,231,214,0.45)' }}>
                Selected episodes
              </span>
              <a
                href="https://designbetterpodcast.com"
                target="_blank"
                rel="noopener noreferrer"
                className="t-label"
                style={{ color: '#FF4725', textDecoration: 'none' }}
              >
                All episodes →
              </a>
            </div>
            <div className="guests-grid">
              {FEATURED_GUESTS.map((guest) => (
                <GuestCard key={guest.name} {...guest} />
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="site-footer">
        <div className="footer-wave-wrap" aria-hidden="true">
          <FooterWave color="rgba(243, 231, 214, 0.35)" />
        </div>
        <div className="footer-inner">
        <span className="t-caption">© {new Date().getFullYear()} Aarron Walter</span>
        <nav className="footer-links">
          <a href="https://designbetterpodcast.com" target="_blank" rel="noopener noreferrer">Design Better</a>
          <a href="https://linkedin.com/in/aarronwalter" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </nav>
        </div>
      </footer>
    </>
  )
}
