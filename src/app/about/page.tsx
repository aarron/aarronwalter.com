import type { Metadata } from 'next'
import Image from 'next/image'
import FooterWave from '@/components/FooterWave'
import ClientLogoGrid from '@/components/ClientLogoGrid'
import MountainTransition from '@/components/MountainTransition'

export const metadata: Metadata = {
  title: 'About',
  description: 'Designer, author, and co-founder of Design Better. Two decades shaping how the tech industry thinks about design.',
  openGraph: {
    title: 'About — Aarron Walter',
    description: 'Designer, author, and co-founder of Design Better. Two decades shaping how the tech industry thinks about design.',
    url: 'https://aarronwalter.com/about',
    images: [{ url: '/Aarron.jpg', alt: 'Aarron Walter' }],
  },
  alternates: { canonical: 'https://aarronwalter.com/about' },
}

const INTERVIEWS: { outlet: string; title: string; href?: string }[] = [
  { outlet: 'Fast Company',              title: '"Fail Fast" In Software Design Is A Myth',         href: 'https://www.fastcompany.com/90136012/fail-fast-in-software-design-is-a-myth' },
  { outlet: 'Design Matters',            title: 'With Debbie Millman'                                                                                                                },  // 404
  { outlet: 'TechCrunch',               title: 'The Most Overlooked Aspect Of UX Design',           href: 'http://techcrunch.com/2015/11/22/the-most-overlooked-aspect-of-ux-design-could-be-the-most-important/' },
  { outlet: 'Inside Intercom',           title: 'InVision\'s Aarron Walter on Design Culture',      href: 'https://blog.intercom.com/invisions-aarron-walter-on-design-culture/' },
  { outlet: 'This Is Product Management',title: 'Getting Out of the Office is Product Management'                                                                                   },  // 404
  { outlet: 'The Big Web Show',          title: 'With Jeffrey Zeldman',                             href: 'http://5by5.tv/bigwebshow/143' },
  { outlet: 'User Defenders Podcast',    title: 'Looking Down the Road',                            href: 'http://userdefenders.com/podcast/027-looking-down-the-road-with-aarron-walter/' },
  { outlet: 'Designer News Podcast',     title: ''                                                                                                                                  },  // site down
  { outlet: 'The UX and Growth Podcast', title: 'Building UX Team Design Education',                href: 'http://www.uxandgrowth.com/building-ux-team-design-education-aarron-walter' },
  { outlet: 'Ways We Work',             title: 'Design Leadership and Creative Inputs'                                                                                              },  // site down
  { outlet: 'Medium',                    title: 'Advice for Designers',                             href: 'https://medium.com/ways-we-work/advice-for-designers-a-conversation-with-aarron-walter-c4812f90ea6e#.u6em0ei6d' },
  { outlet: 'nGen Works',               title: 'The MailChimp Story',                              href: 'http://ngenworks.com/business/the-mailchimp-story/' },
  { outlet: 'The UX Intern',             title: '',                                                 href: 'http://theuxintern.com/' },
  { outlet: '.net Magazine',             title: 'Designing Emotion',                                href: 'http://www.netmagazine.com/interviews/aarron-walter-designing-emotion' },
  { outlet: 'The Web Ahead',             title: ''                                                                                                                                  },  // 404
  { outlet: 'The East Wing',             title: ''                                                                                                                                  },  // 404
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

          <div className="about-intro">

          <p className="about-lead">
            I&rsquo;ve spent the better part of two decades at the intersection of design and technology,
            trying to make products that feel genuinely human.
          </p>

          <section className="portfolio-section">
            <div className="about-bio">
              <p>
                These days, that passion lives most visibly in Design Better, a media company I co-founded
                with a community of nearly 250,000 designers and technology professionals worldwide, with
                subscribers on design teams at most of the Fortune 500. Talking with brilliant people about
                how great work gets made is something I&rsquo;d do for free. Don&rsquo;t tell my co-founder.
              </p>
              <p>
                I built the UX practice at Mailchimp from the ground up, back when the team was small enough
                that everyone knew everyone. By the time I left, more than 15 million people were using
                something my team helped shape — which still feels a little surreal. I went on to lead
                research at InVision, studying how design teams at places like Netflix, Spotify, and Google
                actually do their best work, and what gets in the way.
              </p>
              <p>
                When COVID-19 hit, I joined former CDC Director Dr. Tom Frieden at Resolve to Save Lives.
                My team built tools to support epidemic response efforts at the WHO, Africa CDC, and public
                health departments across the U.S. It was the most meaningful work I&rsquo;ve ever done,
                and rather stressful.
              </p>
              <p>
                I&rsquo;m also the author of <em>Designing for Emotion</em> and have advised the White House,
                the U.S. Department of State, and hundreds of companies, from early-stage startups to Fortune
                500s, on how to build better products and stronger design cultures. I&rsquo;ve spoken at over
                a hundred conferences on five continents, which means I have a lot of opinions about airport
                lounges.
              </p>
            </div>
          </section>

          </div>{/* end .about-intro */}

          <section className="portfolio-section">
            <h2 className="portfolio-section-title">Organizations I&rsquo;ve Helped</h2>
            <ClientLogoGrid />
          </section>

        </div>
      </article>

      <div className="wave-bridge" aria-hidden="true">
        <MountainTransition />
      </div>

      <div className="about-dark">
        <section className="portfolio-section">
          <h2 className="portfolio-section-title">Select Interviews</h2>
          <ul className="portfolio-list">
            {INTERVIEWS.map(({ outlet, title, href }) => (
              <li key={outlet}>
                {href ? (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="about-interview-link">
                    <strong>{outlet}</strong>
                    {title && <span className="about-interview-title"> — {title}</span>}
                  </a>
                ) : (
                  <span className="about-interview-link about-interview-link--dead">
                    <strong>{outlet}</strong>
                    {title && <span className="about-interview-title"> — {title}</span>}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <footer className="site-footer">
        <div className="footer-wave-wrap" aria-hidden="true"><FooterWave color="rgba(243, 231, 214, 0.35)" /></div>
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
