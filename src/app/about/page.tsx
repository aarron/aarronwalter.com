import type { Metadata } from 'next'
import Image from 'next/image'
import FooterWave from '@/components/FooterWave'
import ClientLogoGrid from '@/components/ClientLogoGrid'

export const metadata: Metadata = {
  title: 'About — Aarron Walter',
  description: 'Designer, author, and co-founder of Design Better. Two decades shaping how the tech industry thinks about design.',
}

const INTERVIEWS = [
  { outlet: 'Fast Company',              title: '"Fail Fast" In Software Design Is A Myth',         href: 'https://www.fastcodesign.com/90136012/fail-fast-in-software-design-is-a-myth' },
  { outlet: 'Design Matters',            title: 'With Debbie Millman',                              href: 'http://observermedia.designobserver.com/audio/ben-chestnut-and-aarron-walter/37883/' },
  { outlet: 'TechCrunch',               title: 'The Most Overlooked Aspect Of UX Design',           href: 'http://techcrunch.com/2015/11/22/the-most-overlooked-aspect-of-ux-design-could-be-the-most-important/' },
  { outlet: 'Inside Intercom',           title: 'InVision\'s Aarron Walter on Design Culture',      href: 'https://blog.intercom.com/invisions-aarron-walter-on-design-culture/' },
  { outlet: 'This Is Product Management',title: 'Getting Out of the Office is Product Management',  href: 'http://www.thisisproductmanagement.com/episodes/getting-out-of-the-office-is-product-management' },
  { outlet: 'The Big Web Show',          title: 'With Jeffrey Zeldman',                             href: 'http://5by5.tv/bigwebshow/143' },
  { outlet: 'User Defenders Podcast',    title: 'Looking Down the Road',                            href: 'http://userdefenders.com/podcast/027-looking-down-the-road-with-aarron-walter/' },
  { outlet: 'Designer News Podcast',     title: '',                                                 href: 'https://www.designernews.co/podcast/44040' },
  { outlet: 'The UX and Growth Podcast', title: 'Building UX Team Design Education',                href: 'http://www.uxandgrowth.com/building-ux-team-design-education-aarron-walter' },
  { outlet: 'Ways We Work',             title: 'Design Leadership and Creative Inputs',             href: 'http://wayswework.io/interviews/aarron-walter-vice-president-of-design-education-at-invision-on-the-challenges-of-design-leadership-and-the-importance-of-creative-inputs' },
  { outlet: 'Medium',                    title: 'Advice for Designers',                             href: 'https://medium.com/ways-we-work/advice-for-designers-a-conversation-with-aarron-walter-c4812f90ea6e#.u6em0ei6d' },
  { outlet: 'nGen Works',               title: 'The MailChimp Story',                              href: 'http://ngenworks.com/business/the-mailchimp-story/' },
  { outlet: 'The UX Intern',             title: '',                                                 href: 'http://theuxintern.com/' },
  { outlet: '.net Magazine',             title: 'Designing Emotion',                                href: 'http://www.netmagazine.com/interviews/aarron-walter-designing-emotion' },
  { outlet: 'The Web Ahead',             title: '',                                                 href: 'http://5by5.tv/webahead/10' },
  { outlet: 'The East Wing',             title: '',                                                 href: 'http://theeastwing.net/episodes/30' },
  { outlet: 'Lullabot',                  title: 'Creative Process Episode 4',                       href: 'http://www.lullabot.com/blog/podcasts/creative-process-episode-4-interview-aarron-walter' },
  { outlet: 'The Iowa Idea Podcast',     title: '',                                                 href: 'https://www.theiowaidea.com/2020/06/29/23-aarron-walter/' },
]

export default function AboutPage() {
  return (
    <>
      <article className="page-article about-article">

        <div className="about-illustration-wrap">
          <div className="about-illustration-blend" aria-hidden="true">
            <Image
              src="/Aarron.jpg"
              alt=""
              width={2000}
              height={1842}
              className="about-illustration"
              priority
            />
          </div>
          <p className="about-illustration-credit">Illustration by Jason Chatfield</p>
        </div>

        <header className="page-header">
          <h1 className="page-header-title">About</h1>
          <hr className="page-header-rule" />
        </header>

        <div className="page-content about-content">

          <p className="about-lead">
            I&rsquo;ve spent twenty years influencing how the tech industry thinks about design —
            from building the UX practice at Mailchimp to advising the White House, WHO, and
            hundreds of companies worldwide.
          </p>

          <section className="portfolio-section">
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
            <h2 className="portfolio-section-title">Organizations I&rsquo;ve Helped</h2>
            <ClientLogoGrid />
          </section>

          <section className="portfolio-section">
            <h2 className="portfolio-section-title">Select Interviews</h2>
            <ul className="portfolio-list">
              {INTERVIEWS.map(({ outlet, title, href }) => (
                <li key={outlet}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="about-interview-link">
                    <strong>{outlet}</strong>
                    {title && <span className="about-interview-title"> — {title}</span>}
                  </a>
                </li>
              ))}
            </ul>
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
