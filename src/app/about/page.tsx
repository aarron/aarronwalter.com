import type { Metadata } from 'next'
import Image from 'next/image'
import FooterWave from '@/components/FooterWave'

export const metadata: Metadata = {
  title: 'About — Aarron Walter',
  description: 'Designer, author, and co-founder of Design Better. Two decades shaping how the tech industry thinks about design.',
}

const CLIENTS = [
  'Google', 'The White House', 'LinkedIn', 'Goldman Sachs', 'USAA', 'Intuit',
  'US Department of State', 'Wells Fargo', "Lloyd's Bank", 'Peloton', 'Atlassian',
  'WHO', 'CDC', 'W3C', "L'Oréal Paris", 'State Farm', 'The Home Depot',
  'VMware', 'Booz Allen Hamilton', 'Crate and Barrel', 'FirstMark Capital',
  'Capital One', 'IBM', 'Zendesk', 'AT&T',
]

const INTERVIEWS = [
  { outlet: 'Fast Company', title: '"Fail Fast" In Software Design Is A Myth' },
  { outlet: 'Design Matters', title: 'With Debbie Millman' },
  { outlet: 'TechCrunch', title: 'The Most Overlooked Aspect Of UX Design' },
  { outlet: 'Inside Intercom', title: '' },
  { outlet: 'This Is Product Management', title: '' },
  { outlet: 'The Big Web Show', title: 'With Jeffrey Zeldman' },
  { outlet: 'User Defenders Podcast', title: '' },
  { outlet: 'Ways We Work', title: '' },
  { outlet: '.net Magazine', title: '' },
  { outlet: 'The Web Ahead', title: '' },
  { outlet: 'The East Wing', title: '' },
  { outlet: 'Lullabot', title: '' },
]

export default function AboutPage() {
  return (
    <>
      <article className="page-article about-article">

        {/* Illustration — bleeds 10% off the right edge, white removed via multiply */}
        <div className="about-illustration-wrap" aria-hidden="true">
          <Image
            src="/Aarron.jpg"
            alt=""
            width={2000}
            height={1842}
            className="about-illustration"
            priority
          />
        </div>


        <header className="page-header">
          <h1 className="page-header-title">About</h1>
          <hr className="page-header-rule" />
          <p className="page-header-intro">
            Designer, author, and co-founder of Design Better.
            Two decades shaping how the tech industry thinks about design.
          </p>
        </header>

        <div className="page-content about-content">

          <p className="portfolio-lead">
            I&rsquo;ve spent twenty years influencing how the tech industry thinks about design —
            from building the UX practice at Mailchimp to advising the White House, WHO, and
            hundreds of companies worldwide.
          </p>

          <section className="portfolio-section">
            <h2 className="portfolio-section-title">Background</h2>
            <div className="about-bio">
              <p>
                Most recently I served as Director of Product and Design on the prevent epidemics team
                at Resolve to Save Lives, where my team created tools to help fight COVID-19 in the US,
                Africa, and India. Formerly, I was VP of Content at InVision, drawing upon twenty years
                of experience running product teams and teaching design to help companies enact design
                best practices.
              </p>
              <p>
                I founded the UX practice at Mailchimp and helped grow the product from a few thousand
                users to more than 15 million. My design guidance has helped the White House, the US
                Department of State, and many Fortune 500 companies, startups, and venture capital firms.
              </p>
              <p>
                I am a regular keynote speaker and have spoken at more than a hundred conferences, events,
                and companies on five continents. I co-host the Webby-nominated Design Better podcast and
                Reconsidering, a podcast exploring how to live a more satisfying life. My work has been
                featured in Fast Company, TechCrunch, Vanity Fair, Architectural Digest, and many other
                publications.
              </p>
            </div>
          </section>

          <section className="portfolio-section">
            <h2 className="portfolio-section-title">What People Say</h2>

            <blockquote className="testimonial">
              <p className="testimonial-quote">
                &ldquo;Aarron is unique and always delivers more than promised. He is a uniquely talented
                designer, creative director, lecturer, and manager. He&rsquo;s a born educator. As responsible
                and mature as he is spontaneous and delightful. As witty as he is thoughtful. A true
                one-of-a-kind talent.&rdquo;
              </p>
              <cite className="testimonial-attribution">
                Jeffrey Zeldman
                <span className="testimonial-role">Co-founder, An Event Apart · Automattic</span>
              </cite>
            </blockquote>

            <blockquote className="testimonial">
              <p className="testimonial-quote">
                &ldquo;Aarron&rsquo;s contributions to the practice of user experience are numerous, from the
                books, articles, and presentations he&rsquo;s authored to the best-in-class products he&rsquo;s
                imagined and developed. He has a rare combination of solid research chops, killer design
                skills, and a gift for communication. There&rsquo;s no better UX pro out there.&rdquo;
              </p>
              <cite className="testimonial-attribution">
                Gregg Bernstein
                <span className="testimonial-role">User Research Leader</span>
              </cite>
            </blockquote>
          </section>

          <section className="portfolio-section">
            <h2 className="portfolio-section-title">Organizations I&rsquo;ve Helped</h2>
            <ul className="about-clients">
              {CLIENTS.map(c => (
                <li key={c} className="about-client">{c}</li>
              ))}
            </ul>
          </section>

          <section className="portfolio-section">
            <h2 className="portfolio-section-title">Select Interviews</h2>
            <ul className="portfolio-list">
              {INTERVIEWS.map(({ outlet, title }) => (
                <li key={outlet}>
                  <strong>{outlet}</strong>
                  {title && <span style={{ color: 'rgba(44,42,42,0.55)' }}> — {title}</span>}
                </li>
              ))}
            </ul>
          </section>

          <section className="portfolio-section">
            <h2 className="portfolio-section-title">Get in Touch</h2>
            <p style={{ marginBottom: '1.5rem', color: 'rgba(44,42,42,0.7)', lineHeight: 1.7 }}>
              I&rsquo;m available for speaking engagements at conferences and corporate events.
            </p>
            <a href="/contact" className="about-cta">Contact Aarron →</a>
          </section>

        </div>
      </article>

      <footer className="site-footer site-footer--light">
        <div className="footer-wave-wrap" aria-hidden="true"><FooterWave /></div>
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
