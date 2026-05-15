import type { Metadata } from 'next'
import FooterWave from '@/components/FooterWave'
import OdometerValue from '@/components/OdometerValue'

export const metadata: Metadata = {
  title: 'Mailchimp',
  description: 'As Mailchimp’s fourth employee, Aarron Walter helped grow a scrappy email tool into a $12B SaaS platform — leading UX, product, and R&D from 2008 to 2016.',
  openGraph: {
    title: 'Mailchimp — Aarron Walter',
    description: 'As Mailchimp’s fourth employee, Aarron Walter helped grow a scrappy email tool into a $12B SaaS platform — leading UX, product, and R&D from 2008 to 2016.',
    url: 'https://aarronwalter.com/portfolio/mailchimp',
    images: [{ url: '/Aarron.jpg', alt: 'Aarron Walter' }],
  },
  alternates: { canonical: 'https://aarronwalter.com/portfolio/mailchimp' },
}

export default function MailchimpPage() {
  return (
    <>
      <article className="page-article">

        {/* ── Header ── */}
        <header className="portfolio-header">
          <p className="t-label portfolio-eyebrow">2008–2016</p>
          <h1 className="portfolio-title">Mailchimp</h1>
          <hr className="page-header-rule" />
        </header>

        {/* ── Brand Hero: Freddie + Lead ── */}
        <div className="pf-brand-hero">
          <img
            src="/portfolio/Mailchimp/MC%20Redesign/mc-freddie.png"
            alt="Mailchimp Freddie mascot"
            className="pf-brand-logo"
          />
          <p className="pf-brand-lead">
            As Mailchimp&rsquo;s fourth employee, I helped grow a scrappy email tool into an
            industry-leading SaaS platform &mdash; 15 million customers, $750M+ ARR, and a $12
            billion acquisition by Intuit. Along the way, I shaped company strategy and built a
            design practice that became a benchmark for the SaaS industry.
          </p>
        </div>

        {/* ── Stats ── */}
        <div className="portfolio-stats">
          <div className="portfolio-stat">
            <div className="portfolio-stat-value"><OdometerValue value="15M" /></div>
            <div className="portfolio-stat-label">Customers at exit</div>
          </div>
          <div className="portfolio-stat">
            <div className="portfolio-stat-value"><OdometerValue value="$750M+" /></div>
            <div className="portfolio-stat-label">Annual recurring revenue</div>
          </div>
          <div className="portfolio-stat">
            <div className="portfolio-stat-value"><OdometerValue value="$12B" /></div>
            <div className="portfolio-stat-label">Intuit acquisition</div>
          </div>
          <div className="portfolio-stat">
            <div className="portfolio-stat-value"><OdometerValue value="16" /></div>
            <div className="portfolio-stat-label">Largest team managed</div>
          </div>
        </div>

        {/* ── Full-bleed team photo ── */}
        <div className="pf-full-bleed">
          <img
            src="/portfolio/Mailchimp/MC%20Redesign/redesign-process-photo.jpeg"
            alt="Mailchimp design team collaborating"
          />
        </div>

        {/* ── Testimonials (near top, like original) ── */}
        <div className="pf-split pf-split--flip" style={{ borderTop: 'none' }}>
          <div className="pf-split__text">
            <p className="pf-testimonial__quote" style={{ fontSize: 'clamp(1rem, 1.6vw, 1.2rem)', fontStyle: 'italic', lineHeight: 1.6, color: '#2C2A2A', marginBottom: '0.875rem' }}>
              &ldquo;Aarron was an exceptional people manager and leader for our product team. Everyone
              relied on Aarron to be our signal in a sea of noise — for every day he brought a
              wellspring of perspective and insight to our projects. Aarron is quite simply one of the
              most brilliant, empathetic people I&rsquo;ve ever had the pleasure of working with.&rdquo;
            </p>
            <div className="pf-testimonial__attr">
              <img src="/portfolio/Mailchimp/todd-dominey.jpg" alt="Todd Dominey" className="pf-testimonial__avatar" style={{ filter: 'none' }} />
              <span>
                <span className="pf-testimonial__name" style={{ color: '#2C2A2A' }}>Todd Dominey</span>
                <span className="pf-testimonial__role" style={{ color: 'rgba(44,42,42,0.5)' }}>Senior Director of Design, Mailchimp</span>
              </span>
            </div>
          </div>
          <div className="pf-split__text" style={{ borderLeft: '1px solid rgba(44,42,42,0.09)' }}>
            <p className="pf-testimonial__quote" style={{ fontSize: 'clamp(1rem, 1.6vw, 1.2rem)', fontStyle: 'italic', lineHeight: 1.6, color: '#2C2A2A', marginBottom: '0.875rem' }}>
              &ldquo;From a front row seat, I&rsquo;ve seen how Aarron&rsquo;s love of teaching and
              storytelling gains organizational support for projects and ideas large and small. He has a
              rare combination of solid research chops, killer design skills, and a gift for
              communication. There&rsquo;s no better UX pro out there.&rdquo;
            </p>
            <div className="pf-testimonial__attr">
              <img src="/portfolio/Mailchimp/gregg-bernstein.jpg" alt="Gregg Bernstein" className="pf-testimonial__avatar" style={{ filter: 'none' }} />
              <span>
                <span className="pf-testimonial__name" style={{ color: '#2C2A2A' }}>Gregg Bernstein</span>
                <span className="pf-testimonial__role" style={{ color: 'rgba(44,42,42,0.5)' }}>Research Manager, Mailchimp</span>
              </span>
            </div>
          </div>
        </div>

        {/* ────────────────────────────────────────────────
            CASE STUDY 1: Design System
        ──────────────────────────────────────────────── */}
        <div className="pf-split">
          <div className="pf-split__text">
            <p className="pf-label">Case Study · 2010</p>
            <h2 className="pf-heading">Design System</h2>
            <p className="pf-body">
              Produced one of the earliest design systems on the web. We published it openly to
              inspire a deeper conversation in the design community — at the time, the practice
              barely had a name. The work became a foundational reference during the nascent
              design systems era.
            </p>
            <p className="pf-body" style={{ marginTop: '1rem' }}>
              The system codified components for baseline layout, forms, icons, menus, and data
              tables — enabling the team to build consistently across an increasingly complex
              product surface.
            </p>
          </div>
          <div className="pf-split__visual">
            <img
              src="/portfolio/Mailchimp/MC%20Redesign/design-system/baseline.png"
              alt="Mailchimp design system — baseline grid"
            />
          </div>
        </div>

        {/* Design system — 3-up horizontal strip at natural proportions */}
        <div className="pf-grid pf-grid--3 pf-grid--screen">
          <img src="/portfolio/Mailchimp/MC%20Redesign/design-system/forms.png" alt="Design system forms" />
          <img src="/portfolio/Mailchimp/MC%20Redesign/design-system/menus.png" alt="Design system menus" />
          <img src="/portfolio/Mailchimp/MC%20Redesign/design-system/tables-and-slats.png" alt="Design system tables" />
        </div>

        {/* ────────────────────────────────────────────────
            CASE STUDY 2: User Personas
        ──────────────────────────────────────────────── */}
        <div className="pf-section">
          <p className="pf-label">Case Study</p>
          <h2 className="pf-heading">User Personas</h2>
          <p className="pf-body" style={{ maxWidth: '60ch', marginTop: '0.75rem' }}>
            Product strategy changes required a deeper understanding of customer traits,
            behaviors, and needs. The user research team conducted a study creating detailed
            persona documents — PR Manager, Receptionist, Developer, Studio Consultant.
            We turned the findings into large-format posters displayed near the espresso
            machine at headquarters: a constant reminder that customers drive every design
            decision.
          </p>
        </div>

        {/* Persona grid — 2-up, large portrait format (2 columns × 2 rows) */}
        <div className="pf-grid pf-grid--2 pf-grid--portrait">
          <img src="/portfolio/Mailchimp/Personas/pr-manager-final.jpg" alt="PR Manager — Eliza" />
          <img src="/portfolio/Mailchimp/Personas/receptionist-final.jpg" alt="Receptionist — Ada" />
          <img src="/portfolio/Mailchimp/Personas/developer-final.jpg" alt="Developer — Andre" />
          <img src="/portfolio/Mailchimp/Personas/studio-consultant-final.jpg" alt="Studio Consultant — Mario" />
        </div>

        {/* ────────────────────────────────────────────────
            CASE STUDY 3: Gemini
        ──────────────────────────────────────────────── */}
        <div className="pf-split">
          <div className="pf-split__text">
            <p className="pf-label">Case Study</p>
            <h2 className="pf-heading">Gemini — Multi-User Email</h2>
            <div className="pf-meta">
              <div className="pf-meta-item">
                <span className="pf-meta-label">My role</span>
                <span className="pf-meta-value">General Manager of New Products</span>
              </div>
              <div className="pf-meta-item">
                <span className="pf-meta-label">Outcome</span>
                <span className="pf-meta-value">Became Mailchimp Inbox</span>
              </div>
            </div>
            <p className="pf-body">
              Led a cross-functional team to design and ship a working web and mobile app that let
              teams aggregate multiple email and social accounts, assign messages, add notes, tag,
              escalate, and follow conversation threads. The product eventually became Mailchimp Inbox.
            </p>
          </div>
          <div className="pf-split__visual">
            <img
              src="/portfolio/Mailchimp/Gemini/Screen%20Shot%202020-08-28%20at%2011.53.53%20AM.png"
              alt="Gemini conversation view"
            />
          </div>
        </div>

        {/* Desktop UI screenshots — 2×2 grid at 16:9 */}
        <div className="pf-grid pf-grid--2 pf-grid--screen">
          <img src="/portfolio/Mailchimp/Gemini/Screen%20Shot%202020-08-28%20at%2012.31.58%20PM.png" alt="Gemini inbox view" />
          <img src="/portfolio/Mailchimp/Gemini/Screen%20Shot%202020-08-28%20at%2012.32.18%20PM.png" alt="Gemini message view" />
          <img src="/portfolio/Mailchimp/Gemini/Screen%20Shot%202020-08-28%20at%2012.32.25%20PM.png" alt="Gemini tagging" />
          <img src="/portfolio/Mailchimp/Gemini/Screen%20Shot%202020-08-28%20at%2012.32.56%20PM.png" alt="Gemini search" />
        </div>

        {/* Mobile + product screenshots — 2×2 grid at 16:9 */}
        <div className="pf-grid pf-grid--2 pf-grid--screen">
          <img src="/portfolio/Mailchimp/Gemini/Screen%20Shot%202020-08-28%20at%2012.33.57%20PM.png" alt="Gemini mobile compose" />
          <img src="/portfolio/Mailchimp/Gemini/Screen%20Shot%202020-08-28%20at%2012.34.02%20PM.png" alt="Gemini mobile inbox" />
          <img src="/portfolio/Mailchimp/Gemini/Screen%20Shot%202020-08-28%20at%2012.34.07%20PM.png" alt="Gemini mobile thread" />
          <img src="/portfolio/Mailchimp/Gemini/Screen%20Shot%202020-08-28%20at%2012.32.39%20PM.png" alt="Gemini desktop detail" />
        </div>

        {/* Gemini demo video — full bleed */}
        <div className="pf-video">
          <video
            src="/portfolio/Mailchimp/Gemini/Gemini-Video.mp4"
            autoPlay
            muted
            loop
            playsInline
            aria-label="Gemini app demo"
          />
        </div>
        <p className="pf-caption">Gemini — multi-account email aggregation for teams. Became Mailchimp Inbox.</p>

        {/* ────────────────────────────────────────────────
            CASE STUDY 4: 2013 Redesign
        ──────────────────────────────────────────────── */}
        <div className="pf-split pf-split--flip">
          <div className="pf-split__text">
            <p className="pf-label">Case Study · 2013</p>
            <h2 className="pf-heading">The Big Redesign</h2>
            <div className="pf-meta">
              <div className="pf-meta-item">
                <span className="pf-meta-label">Recognition</span>
                <span className="pf-meta-value">.Net Mag Redesign of the Year · Good Design Awards</span>
              </div>
            </div>
            <p className="pf-body">
              As mobile devices became ubiquitous, we rethought Mailchimp from top to bottom.
              Extensive user research on changing work patterns and device/location collaboration
              informed a full redesign of the web app, marketing site, and new mobile apps.
              The initiative won multiple awards and set a new bar for the SaaS category.
            </p>
          </div>
          <div className="pf-split__visual">
            <img
              src="/portfolio/Mailchimp/MC%20Redesign/homepage.png"
              alt="Mailchimp redesign homepage"
            />
          </div>
        </div>

        {/* Redesign — 2-up landscape at 3:2 */}
        <div className="pf-grid pf-grid--2 pf-grid--photo">
          <img src="/portfolio/Mailchimp/MC%20Redesign/campaigns.jpeg" alt="Campaigns screen" />
          <img src="/portfolio/Mailchimp/MC%20Redesign/neapolitan.jpeg" alt="Neapolitan design" />
        </div>

        {/* ────────────────────────────────────────────────
            CASE STUDY 5: High Five
        ──────────────────────────────────────────────── */}
        <div className="pf-split">
          <div className="pf-split__text">
            <p className="pf-label">Case Study · Emotional Design</p>
            <h2 className="pf-heading">The High Five Moment</h2>
            <p className="pf-body">
              We recognized the emotional journey of sending an email campaign: anxiety leading
              up to it, then joy when it reaches thousands of inboxes. So we designed a
              celebration moment — a high five — that acknowledged the accomplishment.
            </p>
            <p className="pf-body" style={{ marginTop: '1rem' }}>
              Tens of thousands of customers shared the experience on social media. The feature
              was cited in design publications and conferences worldwide as a defining example
              of emotional design in software.
            </p>
          </div>
          <div className="pf-split__visual">
            <img
              src="/portfolio/Mailchimp/high-five/high-five.jpeg"
              alt="Mailchimp High Five celebration moment"
            />
          </div>
        </div>

        {/* ────────────────────────────────────────────────
            CASE STUDY 6: Voice & Tone
        ──────────────────────────────────────────────── */}
        <div className="pf-split pf-split--flip">
          <div className="pf-split__text">
            <p className="pf-label">Case Study · Brand</p>
            <h2 className="pf-heading">Voice &amp; Tone Guide</h2>
            <p className="pf-body">
              As Mailchimp grew, maintaining a unified writing voice across teams and platforms
              became critical. We published one of the first voice and tone guides in the
              software industry — presenting a standard brand voice alongside tone variations
              for different emotional contexts.
            </p>
            <p className="pf-body" style={{ marginTop: '1rem' }}>
              It inspired design teams at dozens of companies and was regularly cited at
              conferences and in publications for years after.
            </p>
          </div>
          <div className="pf-split__visual">
            <img
              src="/portfolio/Mailchimp/voiceandtone/voice-tone1.png"
              alt="Voice and Tone guide"
            />
          </div>
        </div>
        <div className="pf-full-bleed">
          <img
            src="/portfolio/Mailchimp/voiceandtone/voice-tone2.png"
            alt="Voice and Tone guide — emotional tone mapping"
          />
        </div>

        {/* ────────────────────────────────────────────────
            DARK SECTION: Awards
        ──────────────────────────────────────────────── */}
        <div className="pf-dark-section">
          <div className="pf-section">
            <p className="pf-label">Awards &amp; Recognition</p>
            <div className="pf-awards">
              {[
                { year: '2011', name: '.Net Mag Redesign of the Year' },
                { year: '2013', name: '.Net Mag Redesign of the Year' },
                { year: '2013', name: 'Good Design Awards' },
                { year: '2015', name: 'Webby Awards' },
                { year: '2015', name: 'Creative Loafing ATL Best Of' },
                { year: '2016', name: 'Communication Arts Annual' },
                { year: '2016', name: 'AIA Regional Design Awards' },
                { year: '2017', name: '3× Gold One Show Pencils' },
                { year: '2017', name: 'Cannes Grand Prix Lion' },
              ].map((a) => (
                <div key={a.name + a.year} className="pf-award-item">
                  <div className="pf-award-year">{a.year}</div>
                  <div className="pf-award-name">{a.name}</div>
                </div>
              ))}
            </div>
          </div>
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
