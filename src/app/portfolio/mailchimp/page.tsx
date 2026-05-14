import type { Metadata } from 'next'
import FooterWave from '@/components/FooterWave'

export const metadata: Metadata = {
  title: 'Mailchimp — Aarron Walter',
  description: 'Director of UX, GM of New Products, VP of R&D at Mailchimp (2008–2016).',
}

export default function MailchimpPage() {
  return (
    <>
      <article>
        {/* ── Header ── */}
        <header className="portfolio-header">
          <a href="/" className="portfolio-back t-label">← My work</a>
          <p className="t-label portfolio-eyebrow">2008–2016</p>
          <h1 className="portfolio-title">Mailchimp</h1>
          <p className="portfolio-roles">
            Director of UX &nbsp;·&nbsp; GM of New Products &nbsp;·&nbsp; VP of R&amp;D
          </p>
        </header>

        {/* ── Content ── */}
        <div className="portfolio-content">

          {/* Overview */}
          <p className="portfolio-lead">
            As the fourth employee hired by the founders, I helped transform a small email tool
            serving thousands into an industry-leading SaaS platform with 15 million customers
            and over $750 million ARR. Intuit acquired Mailchimp for $12 billion. I shaped company
            strategy and established an award-winning design practice that influenced the SaaS
            industry.
          </p>

          {/* Stats */}
          <div className="portfolio-stats">
            <div className="portfolio-stat">
              <div className="portfolio-stat-value">15M</div>
              <div className="portfolio-stat-label">Customers at exit</div>
            </div>
            <div className="portfolio-stat">
              <div className="portfolio-stat-value">$750M+</div>
              <div className="portfolio-stat-label">Annual recurring revenue</div>
            </div>
            <div className="portfolio-stat">
              <div className="portfolio-stat-value">$12B</div>
              <div className="portfolio-stat-label">Intuit acquisition</div>
            </div>
            <div className="portfolio-stat">
              <div className="portfolio-stat-value">16</div>
              <div className="portfolio-stat-label">Largest team managed</div>
            </div>
          </div>

          {/* Product Impact */}
          <section className="portfolio-section">
            <h2 className="portfolio-section-title">Product Impact</h2>
            <ul className="portfolio-list">
              <li>Founded the first UX design practice as the company's first designer hire</li>
              <li>Shaped brand voice and personality across the platform — widely cited as a model for the industry</li>
              <li>Partnered with lead engineering to transform a proof-of-concept into a stable, profitable platform</li>
              <li>Co-created company and product strategy from early-stage through maturity</li>
              <li>Led multiple major product redesigns and feature rollouts</li>
              <li>Led user research initiatives that shaped the product direction</li>
              <li>Co-created one of the first voice and tone guides in the software industry</li>
            </ul>
          </section>

          {/* Team Impact */}
          <section className="portfolio-section">
            <h2 className="portfolio-section-title">Team &amp; Operations</h2>
            <ul className="portfolio-list">
              <li>Hired and built foundational teams: product design, UX research, front-end engineering, new products, and R&amp;D</li>
              <li>Coached junior talent into senior leadership roles</li>
              <li>Led creation of two design systems</li>
              <li>Built alliances across engineering, product, support, and marketing</li>
              <li>Communicated strategy and vision at all-hands and team meetings</li>
            </ul>
          </section>

          {/* Case Studies */}
          <section className="portfolio-section">
            <h2 className="portfolio-section-title">Case Studies</h2>

            <div className="case-study">
              <h3 className="case-study-title">Design System — 2010</h3>
              <div className="case-study-meta">
                <div className="case-study-meta-item">
                  <span className="case-study-meta-label">Challenge</span>
                  <span className="case-study-meta-value">Streamline design and development as the business scaled</span>
                </div>
              </div>
              <div className="case-study-body">
                <p>Produced one of the earliest design systems on the web. We published it openly to inspire a deeper conversation in the design community — at the time, the practice barely had a name. The work became a foundational reference during the nascent design systems era.</p>
              </div>
            </div>

            <div className="case-study">
              <h3 className="case-study-title">User Personas</h3>
              <div className="case-study-meta">
                <div className="case-study-meta-item">
                  <span className="case-study-meta-label">Challenge</span>
                  <span className="case-study-meta-value">Product strategy changes required better understanding of customer traits, behaviors, and needs</span>
                </div>
              </div>
              <div className="case-study-body">
                <p>The user research team conducted a study creating detailed persona documents — PR Manager, Receptionist, Developer, Studio Consultant. We turned the findings into large-format posters displayed near the espresso machine at headquarters: a constant reminder that customers drive every design decision.</p>
              </div>
            </div>

            <div className="case-study">
              <h3 className="case-study-title">Gemini — Multi-User Email App</h3>
              <div className="case-study-meta">
                <div className="case-study-meta-item">
                  <span className="case-study-meta-label">My role</span>
                  <span className="case-study-meta-value">General Manager of New Products</span>
                </div>
                <div className="case-study-meta-item">
                  <span className="case-study-meta-label">Team</span>
                  <span className="case-study-meta-value">Designers, researchers, engineers</span>
                </div>
                <div className="case-study-meta-item">
                  <span className="case-study-meta-label">Outcome</span>
                  <span className="case-study-meta-value">Became Mailchimp Inbox</span>
                </div>
              </div>
              <div className="case-study-body">
                <p>Led a cross-functional team to design and ship a working web and mobile app that let teams aggregate multiple email and social accounts, assign messages, add notes, tag, escalate, and follow conversation threads. Deliverables included the product, pricing structure, and go-to-market strategy. The product eventually became Mailchimp Inbox.</p>
              </div>
            </div>

            <div className="case-study">
              <h3 className="case-study-title">2013 Redesign</h3>
              <div className="case-study-meta">
                <div className="case-study-meta-item">
                  <span className="case-study-meta-label">Recognition</span>
                  <span className="case-study-meta-value">.Net Mag Redesign of the Year · Good Design Awards</span>
                </div>
              </div>
              <div className="case-study-body">
                <p>As mobile devices became ubiquitous, we rethought Mailchimp from top to bottom. Extensive user research on changing work patterns and device/location collaboration informed a full redesign of the web app, marketing site, and new mobile apps. The initiative won multiple awards and set a new bar for the SaaS category.</p>
              </div>
            </div>

            <div className="case-study">
              <h3 className="case-study-title">High Five — Emotional Design Moment</h3>
              <div className="case-study-body">
                <p>We recognized the emotional journey of sending an email campaign: anxiety leading up to it, then joy when it reaches thousands of inboxes. So we designed a celebration moment — a high five — that acknowledged the accomplishment. Tens of thousands of customers shared the experience on social media. The feature was cited in design publications and conferences worldwide as a defining example of emotional design in software.</p>
              </div>
            </div>

            <div className="case-study">
              <h3 className="case-study-title">Voice &amp; Tone Guide</h3>
              <div className="case-study-body">
                <p>As Mailchimp grew, maintaining a unified writing voice across teams and platforms became critical. We published one of the first voice and tone guides in the software industry — presenting a standard brand voice alongside tone variations for different emotional contexts. It inspired design teams at dozens of companies and was regularly cited at conferences and in publications for years after.</p>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="portfolio-section">
            <h2 className="portfolio-section-title">Testimonials</h2>

            <blockquote className="testimonial">
              <p className="testimonial-quote">"Aarron was an exceptional people manager and leader for our product team. Everyone relied on Aarron to be our signal in a sea of noise — for every day he brought a wellspring of perspective and insight to our projects. His particular skill I remember most was his ability to align a team around a singular 'north star' to help motivate and inspire. Aarron is quite simply one of the most brilliant, empathetic people I've ever had the pleasure of working with."</p>
              <cite className="testimonial-attribution">
                Todd Dominey
                <span className="testimonial-role">Senior Director of Design, Mailchimp</span>
              </cite>
            </blockquote>

            <blockquote className="testimonial">
              <p className="testimonial-quote">"From a front row seat, I've seen how Aarron's love of teaching and storytelling gains organizational support for projects and ideas large and small. He has a rare combination of solid research chops, killer design skills, and a gift for communication. There's no better UX pro out there."</p>
              <cite className="testimonial-attribution">
                Gregg Bernstein
                <span className="testimonial-role">Research Manager, Mailchimp</span>
              </cite>
            </blockquote>
          </section>

          {/* Awards */}
          <section className="portfolio-section">
            <h2 className="portfolio-section-title">Awards &amp; Recognition</h2>
            <ul className="awards-list">
              <li>2011 .Net Mag Redesign of the Year</li>
              <li>2013 .Net Mag Redesign of the Year</li>
              <li>2013 Good Design Awards</li>
              <li>2015 Webby Awards</li>
              <li>2015 Creative Loafing ATL Best Of</li>
              <li>2016 Communication Arts Annual</li>
              <li>2016 AIA Regional Design Awards</li>
              <li>2017 3× Gold One Show Pencils</li>
              <li>2017 Cannes Grand Prix Lion</li>
            </ul>
          </section>

        </div>
      </article>

      {/* ── Prev / Next ── */}
      <nav className="portfolio-nav" aria-label="Portfolio navigation">
        <a href="/" className="portfolio-nav-link">
          <span className="portfolio-nav-dir">← Home</span>
          <span className="portfolio-nav-title">All work</span>
        </a>
        <a href="/portfolio/invision" className="portfolio-nav-link is-next">
          <span className="portfolio-nav-dir">Next →</span>
          <span className="portfolio-nav-title">InVision</span>
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
