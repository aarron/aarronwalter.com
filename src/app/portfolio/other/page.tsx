import type { Metadata } from 'next'
import FooterWave from '@/components/FooterWave'

export const metadata: Metadata = {
  title: 'Consulting & Publishing — Aarron Walter',
  description: 'Author, speaker, advisor, and podcast co-host — ongoing consulting and publishing work.',
}

export default function OtherPage() {
  const CONSULTING_CLIENTS = [
    'Google', 'Intuit', 'Peloton', 'IBM', 'Zendesk', 'LinkedIn', 'Atlassian',
    'AT&T', 'The White House', 'US Department of State', 'CDC', 'WHO', 'W3C',
    'Goldman Sachs', 'Lloyd\'s Bank', 'Capital One', 'American Express',
    'L\'Oréal Paris', 'FirstMark Capital', 'Stanford dSchool',
  ]

  return (
    <>
      <article>
        {/* ── Header ── */}
        <header className="portfolio-header">
          <a href="/" className="portfolio-back t-label">← My work</a>
          <p className="t-label portfolio-eyebrow">Ongoing</p>
          <h1 className="portfolio-title">Consulting &amp; Publishing</h1>
          <p className="portfolio-roles">
            Author &nbsp;·&nbsp; Speaker &nbsp;·&nbsp; Advisor &nbsp;·&nbsp; Podcast Co-host
          </p>
        </header>

        {/* ── Content ── */}
        <div className="portfolio-content">

          {/* Overview */}
          <p className="portfolio-lead">
            Since 2008, I've advised organizations large and small on design strategy, product
            thinking, and team dynamics — while writing, speaking, and co-hosting podcasts that
            have reached millions of people across the design and technology world.
          </p>

          {/* Consulting */}
          <section className="portfolio-section">
            <h2 className="portfolio-section-title">Consulting</h2>

            <div className="case-study">
              <h3 className="case-study-title">Clients</h3>
              <div className="case-study-body">
                <ul className="portfolio-list">
                  {CONSULTING_CLIENTS.map(client => (
                    <li key={client}>{client}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="case-study">
              <h3 className="case-study-title">What People Say</h3>
              <div className="case-study-body">

                <blockquote className="testimonial">
                  <p className="testimonial-quote">"Aarron helped remind us how important it is to reflect on how design affects our lives and emotions."</p>
                  <cite className="testimonial-attribution">
                    Toke Nygaard
                    <span className="testimonial-role">Chief Creative Officer, Zendesk</span>
                  </cite>
                </blockquote>

                <blockquote className="testimonial">
                  <p className="testimonial-quote">"His balance of storytelling sparked thoughtful discussion and introduced frameworks for inclusive design that teams could implement."</p>
                  <cite className="testimonial-attribution">
                    Evan English
                    <span className="testimonial-role">VP, American Express</span>
                  </cite>
                </blockquote>

                <blockquote className="testimonial">
                  <p className="testimonial-quote">"Aarron transforms complex design concepts into simple, memorable stories."</p>
                  <cite className="testimonial-attribution">
                    Jeffrey Zeldman
                    <span className="testimonial-role">Co-founder, An Event Apart</span>
                  </cite>
                </blockquote>

                <blockquote className="testimonial">
                  <p className="testimonial-quote">"Employees raved about his humility, kindness, and focus on humanity."</p>
                  <cite className="testimonial-attribution">
                    Kara DeFrias
                    <span className="testimonial-role">Intuit</span>
                  </cite>
                </blockquote>

                <blockquote className="testimonial">
                  <p className="testimonial-quote">"Made the case for design as a contribution of all roles."</p>
                  <cite className="testimonial-attribution">
                    Steve Turbeck
                    <span className="testimonial-role">Goldman Sachs</span>
                  </cite>
                </blockquote>

              </div>
            </div>
          </section>

          {/* Speaking */}
          <section className="portfolio-section">
            <h2 className="portfolio-section-title">Speaking</h2>

            <div className="case-study">
              <div className="case-study-meta">
                <div className="case-study-meta-item">
                  <span className="case-study-meta-label">Since</span>
                  <span className="case-study-meta-value">2008</span>
                </div>
                <div className="case-study-meta-item">
                  <span className="case-study-meta-label">Conferences</span>
                  <span className="case-study-meta-value">80+ across 5 continents</span>
                </div>
                <div className="case-study-meta-item">
                  <span className="case-study-meta-label">US reach</span>
                  <span className="case-study-meta-value">20+ states</span>
                </div>
              </div>
              <div className="case-study-body">
                <p>Regular keynote speaker at design and technology conferences worldwide. I've spoken in Japan, New Zealand, Australia, Germany, France, Spain, Portugal, Sweden, Norway, Iceland, Poland, the UK, Israel, Peru, Canada, and across the United States.</p>
              </div>
            </div>
          </section>

          {/* Writing */}
          <section className="portfolio-section">
            <h2 className="portfolio-section-title">Writing</h2>

            <div className="case-study">
              <h3 className="case-study-title">Designing for Emotion — Second Edition</h3>
              <div className="case-study-meta">
                <div className="case-study-meta-item">
                  <span className="case-study-meta-label">Publisher</span>
                  <span className="case-study-meta-value">A Book Apart</span>
                </div>
              </div>
              <div className="case-study-body">
                <p>Case studies and psychologically grounded principles for designing products that connect with people on a human level. The second edition addresses new challenges for modern web professionals while carrying optimism about what design can accomplish.</p>

                <blockquote className="testimonial" style={{ marginTop: '1.5rem' }}>
                  <p className="testimonial-quote">"Emotion becomes an unfair advantage for your business."</p>
                  <cite className="testimonial-attribution">
                    Jake Knapp
                    <span className="testimonial-role">Author of Sprint</span>
                  </cite>
                </blockquote>

                <blockquote className="testimonial">
                  <p className="testimonial-quote">"Goes beyond just functional to what is truly delightful."</p>
                  <cite className="testimonial-attribution">
                    Julie Zhuo
                    <span className="testimonial-role">Author of The Making of a Manager</span>
                  </cite>
                </blockquote>
              </div>
            </div>

            <div className="case-study">
              <h3 className="case-study-title">Other Books</h3>
              <div className="case-study-body">
                <ul className="portfolio-list">
                  <li><em>Principles of Product Design</em> — best practices from world-class design teams</li>
                  <li><em>Design Leadership Handbook</em> — tactical approaches for design leaders (Design Better)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Podcasts */}
          <section className="portfolio-section">
            <h2 className="portfolio-section-title">Podcasts</h2>

            <div className="case-study">
              <h3 className="case-study-title">Design Better</h3>
              <div className="case-study-meta">
                <div className="case-study-meta-item">
                  <span className="case-study-meta-label">Downloads</span>
                  <span className="case-study-meta-value">4 million+</span>
                </div>
                <div className="case-study-meta-item">
                  <span className="case-study-meta-label">Recognition</span>
                  <span className="case-study-meta-value">Award-winning · Webby-nominated</span>
                </div>
              </div>
              <div className="case-study-body">
                <p>Co-hosted podcast exploring the creative process, design, and technology through conversations with some of the most interesting people working today. Guests include John Cleese, Seth Godin, Debbie Millman, and Jason Mayden.</p>
                <p style={{ marginTop: '1rem', fontStyle: 'italic', color: 'rgba(0,0,0,0.5)', fontSize: '0.875rem' }}>"Sharp, to the point, full of valuable information." — Vanity Fair</p>
                <p style={{ fontStyle: 'italic', color: 'rgba(0,0,0,0.5)', fontSize: '0.875rem' }}>"Subscribe to flex your boss muscle." — Architectural Digest</p>
              </div>
            </div>

            <div className="case-study">
              <h3 className="case-study-title">Reconsidering</h3>
              <div className="case-study-body">
                <p>Co-hosted with Bob Baxley and Meredith Black. Explores career, relationships, and values during life's major transitions. Guests include Dan Pink, Oliver Burkeman, Tina Roth Eisenberg, and Katherine May.</p>
              </div>
            </div>
          </section>

        </div>
      </article>

      {/* ── Prev / Next ── */}
      <nav className="portfolio-nav" aria-label="Portfolio navigation">
        <a href="/portfolio/rtsl" className="portfolio-nav-link">
          <span className="portfolio-nav-dir">← Previous</span>
          <span className="portfolio-nav-title">Resolve to Save Lives</span>
        </a>
        <a href="/" className="portfolio-nav-link is-next">
          <span className="portfolio-nav-dir">Home →</span>
          <span className="portfolio-nav-title">All work</span>
        </a>
      </nav>

      {/* ── Footer ── */}
      <footer className="site-footer">
        <div className="footer-wave-wrap" aria-hidden="true">
          <FooterWave />
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
