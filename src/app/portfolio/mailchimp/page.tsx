import type { Metadata } from 'next'
import { ogImage } from '@/lib/og'
import LightboxImage from '@/components/LightboxImage'
import PortfolioPanel from '@/components/PortfolioPanel'
import BrowserFrame from '@/components/BrowserFrame'
import BrowserFrameGrid from '@/components/BrowserFrameGrid'
import PageHeader from '@/components/PageHeader'
import StatBlock from '@/components/StatBlock'
import CaseStudySection from '@/components/CaseStudySection'
import TestimonialPair from '@/components/TestimonialPair'
import PortfolioNav from '@/components/PortfolioNav'
import PortfolioFooter from '@/components/PortfolioFooter'
import RidgelineCanvas from '@/components/RidgelineCanvas'
import { SEISMIC_DATA } from '@/lib/seismic-data'

export const metadata: Metadata = {
  title: 'Mailchimp',
  description: "As Mailchimp's fourth employee, Aarron Walter helped grow a scrappy email tool into a $12B SaaS platform — leading UX, product, and R&D from 2008 to 2016.",
  openGraph: {
    title: 'Mailchimp — Aarron Walter',
    description: "As Mailchimp's fourth employee, Aarron Walter helped grow a scrappy email tool into a $12B SaaS platform — leading UX, product, and R&D from 2008 to 2016.",
    url: 'https://aarronwalter.com/portfolio/mailchimp',
    images: ogImage('Mailchimp', 'Director of UX — GM of New Products — VP of R&D. Helped grow a scrappy email tool into a $12B platform.'),
  },
  alternates: { canonical: 'https://aarronwalter.com/portfolio/mailchimp' },
}

export default function MailchimpPage() {
  return (
    <>
      <article className="page-article">

        {/* ── Header with seismic ridgeline ── */}
        <div className="mailchimp-hero">
          <RidgelineCanvas
            className="mailchimp-seismic"
            data={SEISMIC_DATA}
            ampRef={0.32}
            animate="breath"
          />
          <span className="viz-credit"><a href="https://ds.iris.edu/wilber3/find_event/5747228" target="_blank" rel="noopener noreferrer">2004 Sumatra M9.1</a> · IRIS/USGS · IU.ANMO.00.BHZ</span>
          <PageHeader eyebrow="2008–2016" title="Mailchimp" />
        </div>

        {/* ── Brand Hero: Lead ── */}
        <div className="pf-brand-hero">
          <p className="pf-brand-lead">
            As Mailchimp&rsquo;s fourth employee, I helped grow a scrappy email tool into an
            industry-leading SaaS platform &mdash; 15 million customers, $750M+ ARR, and a $12
            billion acquisition by Intuit. Along the way, I shaped company strategy and built a
            design practice that became a benchmark for the SaaS industry.
          </p>
        </div>

        {/* ── Stats ── */}
        <StatBlock
          heading="By the numbers"
          stats={[
            { value: '15M',   label: 'Customers at exit' },
            { value: '$750M+', label: 'Annual recurring revenue' },
            { value: '$12B',  label: 'Intuit acquisition' },
            { value: '16',    label: 'Largest team managed' },
          ]}
        />

        {/* ── Full-bleed team photo ── */}
        <div className="pf-full-bleed">
          <img
            src="/portfolio/mailchimp/redesign/redesign-process-photo.jpeg"
            alt="Mailchimp design team collaborating"
          />
        </div>

        {/* ── Awards & Recognition ── */}
        <div className="pf-awards-block">
          <p className="pf-awards-block__intro">
            Our years at Mailchimp were a rare kind of moment. We shipped one of the first design
            systems, wrote a voice and tone guide that became a reference for the whole industry,
            and pioneered emotional design in software when most teams were still optimizing for
            clicks. The talent across design, research, and engineering was extraordinary — and it
            showed. A scrappy underdog became the leader of its category, and the practices we
            worked out together quietly shaped how software design is done today.
          </p>
          <p className="pf-awards-block__heading">Awards &amp; Recognition</p>
          <div className="pf-awards">
            {[
              { year: '2011', name: '.Net Mag Redesign of the Year' },
              { year: '2013', name: '.Net Mag Redesign of the Year' },
              { year: '2013', name: 'Good Design Awards' },
              { year: '2015', name: 'Webby Awards' },
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

        {/* ── Testimonials ── */}
        <TestimonialPair
          testimonials={[
            {
              quote: 'Aarron was an exceptional people manager and leader for our product team. Everyone relied on Aarron to be our signal in a sea of noise — for every day he brought a wellspring of perspective and insight to our projects. Aarron is quite simply one of the most brilliant, empathetic people I’ve ever had the pleasure of working with.',
              name: 'Todd Dominey',
              role: 'Senior Director of Design, Mailchimp',
              avatar: '/portfolio/mailchimp/todd-dominey.jpg',
            },
            {
              quote: 'From a front row seat, I’ve seen how Aarron’s love of teaching and storytelling gains organizational support for projects and ideas large and small. He has a rare combination of solid research chops, killer design skills, and a gift for communication. There’s no better UX pro out there.',
              name: 'Gregg Bernstein',
              role: 'Research Manager, Mailchimp',
              avatar: '/portfolio/mailchimp/gregg-bernstein.jpg',
            },
          ]}
        />

        {/* ────────────────────────────────────────────────
            CASE STUDY 1: Design System
        ──────────────────────────────────────────────── */}
        <CaseStudySection
          label="Case Study · 2010"
          heading="Design System"
          meta={[{ label: 'My role', value: 'Director of UX' }]}
          panel={
            <PortfolioPanel items={[
              { src: '/portfolio/mailchimp/redesign/design-system/baseline.png', alt: 'Mailchimp design system — baseline grid' },
              { src: '/portfolio/mailchimp/redesign/design-system/icons.png', alt: 'Design system icons' },
              { src: '/portfolio/mailchimp/redesign/design-system/forms.png', alt: 'Design system forms' },
              { src: '/portfolio/mailchimp/redesign/design-system/menus.png', alt: 'Design system menus' },
            ]} />
          }
        >
          <p className="pf-body">
            We built one of the earliest design systems on the web and published it openly to
            spark a deeper conversation in the design community — back then, the practice barely
            had a name. It became a foundational reference as the field took shape.
          </p>
          <p className="pf-body" style={{ marginTop: '1rem' }}>
            The system pulled together components for layout, forms, icons, menus, and data
            tables, giving the team a shared foundation to build on as the product grew more
            complex.
          </p>
        </CaseStudySection>

        {/* ────────────────────────────────────────────────
            CASE STUDY 2: User Personas
        ──────────────────────────────────────────────── */}
        {/* Personas — 2×2 image grid left, copy right (bespoke layout kept as-is) */}
        <div className="persona-split">
          <div className="persona-split__images">
            <LightboxImage src="/portfolio/mailchimp/personas/pr-manager-final.jpg" alt="PR Manager — Eliza" />
            <LightboxImage src="/portfolio/mailchimp/personas/receptionist-final.jpg" alt="Receptionist — Ada" />
            <LightboxImage src="/portfolio/mailchimp/personas/developer-final.jpg" alt="Developer — Andre" />
            <LightboxImage src="/portfolio/mailchimp/personas/studio-consultant-final.jpg" alt="Studio Consultant — Mario" />
          </div>
          <div className="persona-split__text">
            <p className="pf-label">Case Study · 2012</p>
            <h2 className="pf-heading">User Personas</h2>
            <div className="pf-meta">
              <div className="pf-meta-item">
                <span className="pf-meta-label">My role</span>
                <span className="pf-meta-value">Director of UX</span>
              </div>
            </div>
            <p className="pf-body" style={{ marginTop: '0.75rem' }}>
              As the product strategy shifted, we needed a sharper picture of who we were designing
              for. Our research team ran a study and built out personas for the people behind the
              work — a PR Manager, Receptionist, Developer, and Studio Consultant. We blew up the
              findings into posters and hung them by the espresso machine at HQ — a daily reminder
              that real people sit behind every design decision.
            </p>
          </div>
        </div>

        {/* ────────────────────────────────────────────────
            CASE STUDY 3: Gemini
        ──────────────────────────────────────────────── */}
        <CaseStudySection
          label="Case Study · 2015"
          heading="Gemini, Multi-User Email"
          meta={[
            { label: 'My role', value: 'General Manager of New Products' },
            { label: 'Outcome', value: 'Became Mailchimp Inbox' },
          ]}
          panel={
            <BrowserFrame>
              <video
                src="/portfolio/mailchimp/gemini/gemini-video.mp4"
                autoPlay muted loop playsInline
                aria-label="Gemini app demo"
              />
            </BrowserFrame>
          }
        >
          <p className="pf-body">
            We assembled a team of designers, developers, and researchers and took a vague idea to
            a market-ready product in under a year. The app let teams pull multiple email and social
            accounts into one place, assign messages, add notes, tag, escalate, and follow
            conversation threads. It eventually became Mailchimp Inbox.
          </p>
        </CaseStudySection>

        {/* Gemini desktop UI — 2×2 browser frame grid */}
        <div className="pf-panel-wrap">
          <BrowserFrameGrid>
            <BrowserFrame>
              <img src="/portfolio/mailchimp/gemini/gemini-inbox.png" alt="Gemini inbox view" />
            </BrowserFrame>
            <BrowserFrame>
              <img src="/portfolio/mailchimp/gemini/gemini-message-view.png" alt="Gemini message view" />
            </BrowserFrame>
            <BrowserFrame>
              <img src="/portfolio/mailchimp/gemini/gemini-tagging.png" alt="Gemini tagging" />
            </BrowserFrame>
            <BrowserFrame>
              <img src="/portfolio/mailchimp/gemini/gemini-filters.png" alt="Gemini search" />
            </BrowserFrame>
          </BrowserFrameGrid>
        </div>

        {/* ────────────────────────────────────────────────
            CASE STUDY 4: 2013 Redesign
        ──────────────────────────────────────────────── */}
        <CaseStudySection
          label="Case Study · 2013"
          heading="The Big Redesign"
          meta={[
            { label: 'Recognition', value: '.Net Mag Redesign of the Year · Good Design Awards' },
          ]}
          flip
          style={{ marginTop: 'clamp(3rem, 8vw, 7rem)' }}
          panel={
            <BrowserFrame>
              <img src="/portfolio/mailchimp/redesign/homepage.png" alt="Mailchimp redesign homepage" />
            </BrowserFrame>
          }
        >
          <p className="pf-body">
            As mobile became the default, we rethought Mailchimp from the ground up. Deep research
            into how people actually worked — across devices, locations, and teams — shaped a full
            redesign of the web app, marketing site, and a new set of native mobile apps. The work
            won multiple awards and set a new bar for SaaS design.
          </p>
        </CaseStudySection>

        {/* Secondary redesign screenshots */}
        <div className="pf-panel-wrap">
          <BrowserFrameGrid>
            <BrowserFrame>
              <img src="/portfolio/mailchimp/redesign/list-view.png" alt="Mailchimp lists redesign" />
            </BrowserFrame>
            <BrowserFrame>
              <img src="/portfolio/mailchimp/redesign/neapolitan.jpeg" alt="Neapolitan design system" />
            </BrowserFrame>
          </BrowserFrameGrid>
        </div>

        {/* ────────────────────────────────────────────────
            CASE STUDY 5: High Five
        ──────────────────────────────────────────────── */}
        <CaseStudySection
          label="Case Study · 2013"
          heading="The High Five Moment"
          panel={
            <BrowserFrameGrid layout="stack">
              <BrowserFrame>
                <video src="/portfolio/mailchimp/high-five/high5.mov" autoPlay muted loop playsInline aria-label="High Five moment screen recording" />
              </BrowserFrame>
              <BrowserFrame>
                <video src="/portfolio/mailchimp/high-five/high5tweets.mov" autoPlay muted loop playsInline aria-label="Customer tweets about the High Five moment" />
              </BrowserFrame>
            </BrowserFrameGrid>
          }
        >
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
        </CaseStudySection>

        {/* ────────────────────────────────────────────────
            CASE STUDY 6: Voice & Tone
        ──────────────────────────────────────────────── */}
        <div className="pf-stacked-case">
          <div className="pf-stacked-case__text">
            <p className="pf-label">Case Study · 2011</p>
            <h2 className="pf-heading">Voice &amp; Tone Guide</h2>
            <p className="pf-body">
              As Mailchimp grew, keeping a unified writing voice across teams and platforms became
              critical. Kate Kiefer Lee was the driver and the magic behind this work — she shaped
              what became one of the first voice and tone guides in software, pairing a standard
              brand voice with tone variations for different emotional contexts. I contributed early
              thinking on aligning tone to user emotion and how the site itself could carry those
              ideas into the design. The guide inspired teams at dozens of companies and was cited
              at conferences and in publications for years after.
            </p>
          </div>
          <BrowserFrameGrid>
            <BrowserFrame>
              <img src="/portfolio/mailchimp/voice-and-tone/voice-tone3.png" alt="Voice and Tone guide — tone examples" />
            </BrowserFrame>
            <BrowserFrame>
              <img src="/portfolio/mailchimp/voice-and-tone/voice-tone1.png" alt="Voice and Tone guide" />
            </BrowserFrame>
            <BrowserFrame>
              <img src="/portfolio/mailchimp/voice-and-tone/voice-tone2.png" alt="Voice and Tone guide — emotional tone mapping" />
            </BrowserFrame>
            <BrowserFrame>
              <img src="/portfolio/mailchimp/voice-and-tone/voice-tone4.png" alt="Voice and Tone guide — writing samples" />
            </BrowserFrame>
          </BrowserFrameGrid>
        </div>

      </article>

      {/* ── Prev / Next ── */}
      <PortfolioNav
        prev={{ href: '/', label: 'All work', dir: '← Home' }}
        next={{ href: '/portfolio/invision', label: 'InVision' }}
      />

      {/* ── Footer ── */}
      <PortfolioFooter />
    </>
  )
}
