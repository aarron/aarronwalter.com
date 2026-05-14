import type { Metadata } from 'next'
import FooterWave from '@/components/FooterWave'

export const metadata: Metadata = {
  title: 'Resolve to Save Lives — Aarron Walter',
  description: 'Director of Product & Design, US COVID Response at Resolve to Save Lives (2020–2022).',
}

export default function RTSLPage() {
  return (
    <>
      <article>
        {/* ── Header ── */}
        <header className="portfolio-header">
          <a href="/" className="portfolio-back t-label">← My work</a>
          <p className="t-label portfolio-eyebrow">2020–2022</p>
          <h1 className="portfolio-title">Resolve to Save Lives</h1>
          <p className="portfolio-roles">
            Director of Product &amp; Design &nbsp;·&nbsp; US COVID Response
          </p>
        </header>

        {/* ── Content ── */}
        <div className="portfolio-content">

          {/* Overview */}
          <p className="portfolio-lead">
            In April 2020, at the onset of the COVID-19 pandemic, I joined Resolve to Save Lives —
            a non-profit founded by Dr. Tom Frieden, former CDC Director under President Obama.
            Leading an 8-person cross-disciplinary team, I helped build products and strategy that
            supported life-saving pandemic response decisions across multiple countries.
          </p>

          {/* Stats */}
          <div className="portfolio-stats">
            <div className="portfolio-stat">
              <div className="portfolio-stat-value">8</div>
              <div className="portfolio-stat-label">Person team led</div>
            </div>
            <div className="portfolio-stat">
              <div className="portfolio-stat-value">$2M</div>
              <div className="portfolio-stat-label">Budget managed</div>
            </div>
            <div className="portfolio-stat">
              <div className="portfolio-stat-value">$75M</div>
              <div className="portfolio-stat-label">Digital public service project co-led</div>
            </div>
            <div className="portfolio-stat">
              <div className="portfolio-stat-value">4</div>
              <div className="portfolio-stat-label">Products built and deployed</div>
            </div>
          </div>

          {/* Product Impact */}
          <section className="portfolio-section">
            <h2 className="portfolio-section-title">Product Impact</h2>
            <ul className="portfolio-list">
              <li>Co-created COVID hotspot dashboard with Africa CDC, used by country leaders and the African Union to shape pandemic response decisions</li>
              <li>Co-created a COVID dashboard with Franklin County, OH Department of Public Health</li>
              <li>Co-led fundraising for a $75 million digital public service project</li>
              <li>Supported creation of a digital transformation strategy for Africa CDC</li>
              <li>Served as temporary advisor to WHO on the creation of digital smart vaccine credentials</li>
              <li>Supported CDC's use of technology in pandemic response</li>
              <li>Built four products deployed across public health jurisdictions in multiple states</li>
            </ul>
          </section>

          {/* Team */}
          <section className="portfolio-section">
            <h2 className="portfolio-section-title">Team &amp; Operations</h2>
            <ul className="portfolio-list">
              <li>Recruited and hired SVP of Technology to unify efforts across initiatives</li>
              <li>Recruited and hired Chief Digital Advisor for Africa CDC as part of a secondment agreement</li>
              <li>Inherited leadership of the team during a difficult period and brought stability and direction</li>
              <li>Managed reporting to donors and navigated complex relationships with external partners</li>
              <li>Worked across cultures and time zones with epidemiologists, scientists, government officials, and large NGOs including WHO, CDC, and Africa CDC</li>
              <li>Facilitated an executive leadership retreat</li>
            </ul>
          </section>

          {/* Case Study */}
          <section className="portfolio-section">
            <h2 className="portfolio-section-title">Case Study</h2>

            <div className="case-study">
              <h3 className="case-study-title">Africa CDC COVID Hotspot Dashboard</h3>
              <div className="case-study-meta">
                <div className="case-study-meta-item">
                  <span className="case-study-meta-label">Partners</span>
                  <span className="case-study-meta-value">Africa CDC &amp; African Union</span>
                </div>
                <div className="case-study-meta-item">
                  <span className="case-study-meta-label">Live at</span>
                  <span className="case-study-meta-value">africacdccovid.org</span>
                </div>
              </div>
              <div className="case-study-body">
                <p>Starting in April 2020 with a design sprint to explore how technology could support pandemic response, our team's central thesis was that "boxing in the virus through contact tracing" would be the most effective strategy. We moved fast — using Google Sheets for data storage and Node.js to reduce server-side development — building under the kind of high-stakes conditions where leaders were using our dashboards to decide whether to shut down cities and countries.</p>
                <p>The Africa CDC dashboard tracked COVID cases, tests, deaths, and key outbreak indicators defined by epidemiologists. It was used directly by Africa CDC leaders and the African Union to shape continent-wide COVID response.</p>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="portfolio-section">
            <h2 className="portfolio-section-title">Testimonials</h2>

            <blockquote className="testimonial">
              <p className="testimonial-quote">"Aarron brought structured thinking to problem solving, was a great team leader and collaborator — a rare combination of someone who is skillful at work and wise in life too."</p>
              <cite className="testimonial-attribution">
                Rahul Mullick
                <span className="testimonial-role">Senior Vice President of Technology, Resolve to Save Lives</span>
              </cite>
            </blockquote>

            <blockquote className="testimonial">
              <p className="testimonial-quote">"Aarron brought a calm, empathic style. He managed to direct the team and rally partners to achieve excellent design and product outcomes."</p>
              <cite className="testimonial-attribution">
                Daniel Burka
                <span className="testimonial-role">Director of Product and Design, Resolve to Save Lives</span>
              </cite>
            </blockquote>
          </section>

        </div>
      </article>

      {/* ── Prev / Next ── */}
      <nav className="portfolio-nav" aria-label="Portfolio navigation">
        <a href="/portfolio/invision" className="portfolio-nav-link">
          <span className="portfolio-nav-dir">← Previous</span>
          <span className="portfolio-nav-title">InVision</span>
        </a>
        <a href="/portfolio/other" className="portfolio-nav-link is-next">
          <span className="portfolio-nav-dir">Next →</span>
          <span className="portfolio-nav-title">Consulting &amp; Publishing</span>
        </a>
      </nav>

      {/* ── Footer ── */}
      <footer className="site-footer site-footer--light">
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
