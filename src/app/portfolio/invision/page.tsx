import type { Metadata } from 'next'
import FooterWave from '@/components/FooterWave'

export const metadata: Metadata = {
  title: 'InVision — Aarron Walter',
  description: 'VP of Design Education & Content at InVision (2016–2020).',
}

export default function InVisionPage() {
  return (
    <>
      <article className="page-article">
        {/* ── Header ── */}
        <header className="portfolio-header">
          <a href="/" className="portfolio-back t-label">← My work</a>
          <p className="t-label portfolio-eyebrow">2016–2020</p>
          <h1 className="portfolio-title">InVision</h1>
          <hr className="page-header-rule" />
          <p className="portfolio-roles">
            VP of Design Education &nbsp;·&nbsp; VP of Content
          </p>
        </header>

        {/* ── Content ── */}
        <div className="portfolio-content">

          {/* Overview */}
          <p className="portfolio-lead">
            Recruited by InVision to assemble a team tasked with demonstrating design's business
            impact and identifying best practices among the world's most mature design organizations.
            I built a 12-person cross-functional group — writers, photographers, videographers,
            editors, and industry experts — whose work shaped design practices across thousands
            of organizations.
          </p>

          {/* Stats */}
          <div className="portfolio-stats">
            <div className="portfolio-stat">
              <div className="portfolio-stat-value">11</div>
              <div className="portfolio-stat-label">Books published</div>
            </div>
            <div className="portfolio-stat">
              <div className="portfolio-stat-value">400K+</div>
              <div className="portfolio-stat-label">Book downloads</div>
            </div>
            <div className="portfolio-stat">
              <div className="portfolio-stat-value">$3M+</div>
              <div className="portfolio-stat-label">Annual recurring revenue</div>
            </div>
            <div className="portfolio-stat">
              <div className="portfolio-stat-value">2.5M+</div>
              <div className="portfolio-stat-label">Podcast downloads</div>
            </div>
            <div className="portfolio-stat">
              <div className="portfolio-stat-value">150K</div>
              <div className="portfolio-stat-label">Email subscribers</div>
            </div>
            <div className="portfolio-stat">
              <div className="portfolio-stat-value">600%</div>
              <div className="portfolio-stat-label">First-year subscriber growth</div>
            </div>
          </div>

          {/* Marketing Impact */}
          <section className="portfolio-section">
            <h2 className="portfolio-section-title">Impact</h2>
            <ul className="portfolio-list">
              <li>Built DesignBetter.co into a brand-defining property generating customer leads with 150,000 email subscribers and 600% first-year growth</li>
              <li>Published 11 books downloaded 400,000+ times across ebook, PDF, and audiobook formats, generating over $3M ARR</li>
              <li>Launched an award-winning, Webby-nominated podcast reaching 40,000+ listeners per episode and 2.5 million total downloads</li>
              <li>Co-created a design maturity model adopted by Fortune 100 companies including Google, IBM, Verizon, and Cisco</li>
              <li>Co-developed the Design Exchange, an international networking initiative connecting designers from leading organizations worldwide</li>
              <li>Co-created a worldwide Design Leadership Community with thousands of participating design leaders</li>
              <li>Established growth strategies and OKRs in collaboration with the executive leadership team</li>
            </ul>
          </section>

          {/* Team */}
          <section className="portfolio-section">
            <h2 className="portfolio-section-title">Team &amp; Operations</h2>
            <ul className="portfolio-list">
              <li>Built and managed a 12-person cross-functional creative team spanning writing, video, photography, editing, and research</li>
              <li>Developed team members through mentorship and deliberate career growth</li>
              <li>Collaborated with Marketing, Sales, and Product on shared initiatives</li>
              <li>Oversaw a demanding publication schedule across multiple platforms and formats</li>
              <li>Communicated organizational vision and strategy at major company offsites</li>
            </ul>
          </section>

          {/* Design Better */}
          <section className="portfolio-section">
            <h2 className="portfolio-section-title">Design Better Library</h2>

            <div className="case-study">
              <h3 className="case-study-title">11 Books, Free for the Design Community</h3>
              <div className="case-study-body">
                <p>Working alongside experts from design teams at Airbnb, Pinterest, Shopify, Dropbox, the New York Times, and others, our team developed a resource library addressing the most pressing topics in software design. Each book offered practical, real-world guidance supplemented by video interviews with accomplished designers.</p>
                <p>Titles included <em>Business Thinking for Designers</em>, <em>DesignOps Handbook</em>, <em>Design Systems Handbook</em>, <em>Design Leadership Handbook</em>, <em>Principles of Product Design</em>, and more — all available free at DesignBetter.com.</p>
              </div>
            </div>

            <div className="case-study">
              <h3 className="case-study-title">The New Design Frontier — Research Study</h3>
              <div className="case-study-meta">
                <div className="case-study-meta-item">
                  <span className="case-study-meta-label">Scope</span>
                  <span className="case-study-meta-value">2,200+ designers surveyed globally</span>
                </div>
                <div className="case-study-meta-item">
                  <span className="case-study-meta-label">Reach</span>
                  <span className="case-study-meta-value">Most comprehensive report of its category</span>
                </div>
              </div>
              <div className="case-study-body">
                <p>A survey of thousands of companies examining the correlation between design maturity and business results. The key finding: industry leaders distinguish themselves by treating the digital interface as a critical business asset. High-design-maturity organizations demonstrated measurable cost reductions, revenue increases, enhanced brand positioning, and improved market standing.</p>
                <p>The resulting design maturity model was adopted by Fortune 100 companies and became one of the most referenced frameworks in the design leadership community.</p>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="portfolio-section">
            <h2 className="portfolio-section-title">Testimonials</h2>

            <blockquote className="testimonial">
              <p className="testimonial-quote">"Personally, Aarron has been one of my most trusted mentors, and his guidance and feedback have been critical to the growth of my career over the past six years. He has a practical, honest leadership style that opens doors for the best creativity from his team members."</p>
              <cite className="testimonial-attribution">
                <img src="/portfolio/Other/eli-woolery.jpg" alt="Eli Woolery" className="testimonial-avatar" />
                Eli Woolery
                <span className="testimonial-role">Senior Director of Design Education, InVision</span>
              </cite>
            </blockquote>

            <blockquote className="testimonial">
              <p className="testimonial-quote">"The most important thing to know about Aarron Walter is that if he's in your corner, you're psyched. The work will be great. The team will be lit-up and cared for. When Aarron's in the room, so is inspiration."</p>
              <cite className="testimonial-attribution">
                <img src="/portfolio/Other/susan-kaplow.jpg" alt="Susan Kaplow" className="testimonial-avatar" />
                Susan Kaplow
                <span className="testimonial-role">VP of Content, InVision</span>
              </cite>
            </blockquote>
          </section>

        </div>
      </article>

      {/* ── Prev / Next ── */}
      <nav className="portfolio-nav" aria-label="Portfolio navigation">
        <a href="/portfolio/mailchimp" className="portfolio-nav-link">
          <span className="portfolio-nav-dir">← Previous</span>
          <span className="portfolio-nav-title">Mailchimp</span>
        </a>
        <a href="/portfolio/rtsl" className="portfolio-nav-link is-next">
          <span className="portfolio-nav-dir">Next →</span>
          <span className="portfolio-nav-title">Resolve to Save Lives</span>
        </a>
      </nav>

      {/* ── Footer ── */}
      <footer className="site-footer site-footer--light">
        <div className="footer-wave-wrap" aria-hidden="true">
          <FooterWave />
        </div>
        <div className="footer-inner">
        <span className="t-caption">© {new Date().getFullYear()} <strong className="footer-name">Aarron Walter</strong></span>
        <nav className="footer-links">
          <a href="https://designbetterpodcast.com" target="_blank" rel="noopener noreferrer">Design Better</a>
          <a href="https://linkedin.com/in/aarronwalter" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </nav>
        </div>
      </footer>
    </>
  )
}
