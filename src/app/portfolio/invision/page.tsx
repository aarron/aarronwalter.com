import type { Metadata } from 'next'
import { ogImage } from '@/lib/og'
import PageHeader from '@/components/PageHeader'
import StatBlock from '@/components/StatBlock'
import PortfolioPanel from '@/components/PortfolioPanel'
import BrowserFrame from '@/components/BrowserFrame'
import BrowserFrameGrid from '@/components/BrowserFrameGrid'
import TestimonialPair from '@/components/TestimonialPair'
import PortfolioNav from '@/components/PortfolioNav'
import PortfolioFooter from '@/components/PortfolioFooter'
import RidgelineCanvas from '@/components/RidgelineCanvas'
import { AP_DATA } from '@/lib/natural-data'

export const metadata: Metadata = {
  title: 'InVision',
  description: 'VP of Design Education & Content at InVision (2016–2020). Aarron Walter built Design Better, a podcast and publication reaching millions of designers worldwide.',
  openGraph: {
    title: 'InVision — Aarron Walter',
    description: 'VP of Design Education & Content at InVision (2016–2020). Built Design Better — a podcast and publication reaching millions of designers worldwide.',
    url: 'https://aarronwalter.com/portfolio/invision',
    images: ogImage('InVision', 'VP of Design Education & Content. Built Design Better — a podcast and publication reaching millions of designers.'),
  },
  alternates: { canonical: 'https://aarronwalter.com/portfolio/invision' },
}

export default function InVisionPage() {
  return (
    <>
      <article className="page-article">

        {/* ── Header with geomagnetic Ap index (solar storms, 1990–2019) ── */}
        <div className="invision-hero">
          <RidgelineCanvas
            className="invision-aurora"
            data={AP_DATA}
            ampRef={0.45}
            animate="breath"
          />
          <PageHeader eyebrow="2016–2020" title="InVision" />
        </div>

        {/* ── Brand Hero ── */}
        <div className="pf-brand-hero">
          <p className="pf-brand-lead">
            InVision recruited me to build a team that could show design&rsquo;s business impact
            and surface best practices from the world&rsquo;s most mature design organizations.
            I assembled a twelve-person cross-functional group &mdash; writers, photographers,
            videographers, editors, and industry experts &mdash; and the work we produced together
            shaped design practices at thousands of organizations worldwide.
          </p>
        </div>

        {/* ── Stats ── */}
        <StatBlock
          heading="By the numbers"
          stats={[
            { value: '11',    label: 'Books published' },
            { value: '400K+', label: 'Book downloads' },
            { value: '$3M+',  label: 'Annual recurring revenue' },
            { value: '2.5M+', label: 'Podcast downloads' },
            { value: '150K',  label: 'Email subscribers' },
            { value: '600%',  label: 'First-year subscriber growth' },
          ]}
        />

        {/* ────────────────────────────────────────────────
            SECTION 1: Design Better
        ──────────────────────────────────────────────── */}
        <div className="pf-stacked-case">
          <div className="pf-stacked-case__text">
            <p className="pf-label">Publication · 2016–2020</p>
            <h2 className="pf-heading">Design Better</h2>
            <div className="pf-meta">
              <div className="pf-meta-item">
                <span className="pf-meta-label">My role</span>
                <span className="pf-meta-value">VP of Design Education &amp; Content</span>
              </div>
              <div className="pf-meta-item">
                <span className="pf-meta-label">Property</span>
                <span className="pf-meta-value">DesignBetter.com</span>
              </div>
            </div>
            <p className="pf-body">
              Eli Woolery and I built DesignBetter.com from the ground up at InVision &mdash; a
              publication and podcast for the global design community, covering design leadership,
              design systems, research, and strategy. With a small team of writers, editors, and
              producers, we grew the publication to 150,000 email subscribers, up 600% in its first
              year, and it became one of the most trusted voices in design.
            </p>
            <p className="pf-body" style={{ marginTop: '1rem' }}>
              We launched the Design Better podcast alongside it, earning a Webby nomination and
              pulling in 40,000+ listeners per episode. Guests included design leaders from Google,
              Airbnb, Twitter, Apple, and Shopify, and the show passed 2.5 million total downloads.
            </p>
            <p className="pf-body" style={{ marginTop: '1rem' }}>
              Eli and I took Design Better independent from InVision in 2023.
            </p>
          </div>
          <BrowserFrameGrid>
            <BrowserFrame>
              <img src="/portfolio/invision/design-better/homepage.webp" alt="Design Better homepage" />
            </BrowserFrame>
            <BrowserFrame>
              <img src="/portfolio/invision/design-better/book-detail.webp" alt="Design Better book detail page" />
            </BrowserFrame>
            <BrowserFrame>
              <img src="/portfolio/invision/design-better/designops-article.webp" alt="DesignOps article on Design Better" />
            </BrowserFrame>
            <BrowserFrame>
              <img src="/portfolio/invision/design-better/business-impact-article.webp" alt="Business impact of design article" />
            </BrowserFrame>
            <BrowserFrame>
              <img src="/portfolio/invision/design-better/conversations.webp" alt="Design Better conversations" />
            </BrowserFrame>
            <BrowserFrame>
              <img src="/portfolio/invision/design-better/podcast.webp" alt="Design Better podcast" />
            </BrowserFrame>
          </BrowserFrameGrid>
        </div>

        {/* ── Testimonials ── */}
        <TestimonialPair
          testimonials={[
            {
              quote: 'The most important thing to know about Aarron Walter is that if he\'s in your corner, you\'re psyched. The work will be great. The team will be lit-up and cared for. When Aarron\'s in the room, so is inspiration.',
              name: 'Susan Kaplow',
              role: 'VP of Content, InVision',
              avatar: '/portfolio/Other/susan-kaplow.jpg',
            },
            {
              quote: 'Personally, Aarron has been one of my most trusted mentors, and his guidance and feedback have been critical to the growth of my career over the past six years. He has a practical, honest leadership style that opens doors for the best creativity from his team members.',
              name: 'Eli Woolery',
              role: 'Senior Director of Design Education, InVision',
              avatar: '/portfolio/Other/eli-woolery.jpg',
            },
          ]}
        />

        {/* ────────────────────────────────────────────────
            SECTION 2: The Design Better Library
        ──────────────────────────────────────────────── */}
        <div className="pf-stacked-case">
          <div className="pf-stacked-case__text">
            <p className="pf-label">Case Study · 2017–2020</p>
            <h2 className="pf-heading">The Design Better Library</h2>
              <p className="pf-body">
              Working alongside experts from design teams at Airbnb, Pinterest, Shopify, Dropbox,
              the New York Times, and others, we produced eleven books offering practical,
              real-world guidance on the most pressing topics in software design. Each title came
              with a companion series of video interviews with accomplished practitioners.
            </p>
            <p className="pf-body" style={{ marginTop: '1rem' }}>
              Titles included <em>Business Thinking for Designers</em>, the{' '}
              <em>DesignOps Handbook</em>, the <em>Design Systems Handbook</em>, the{' '}
              <em>Design Leadership Handbook</em>, and <em>Principles of Product Design</em>{' '}
              &mdash; all free to the design community at DesignBetter.co. The library generated
              over $3M ARR across ebook, PDF, and audiobook formats.
            </p>
          </div>
          <StatBlock
            stats={[
              { value: '11',       label: 'Books published' },
              { value: '400,000+', label: 'Downloads' },
              { value: '$3M+',     label: 'Revenue ARR' },
            ]}
          />
          <PortfolioPanel className="ds-panel--compact" items={[
            { src: '/portfolio/invision/design-better-library/business-thinking.webp',         alt: 'Business Thinking for Designers' },
            { src: '/portfolio/invision/design-better-library/designops-handbook.webp',          alt: 'DesignOps Handbook' },
            { src: '/portfolio/invision/design-better-library/design-systems-handbook.webp',     alt: 'Design Systems Handbook' },
            { src: '/portfolio/invision/design-better-library/design-leadership-handbook.webp',  alt: 'Design Leadership Handbook' },
            { src: '/portfolio/invision/design-better-library/product-design.webp',              alt: 'Principles of Product Design' },
            { src: '/portfolio/invision/design-better-library/design-thinking-handbook.webp',    alt: 'Design Thinking Handbook' },
            { src: '/portfolio/invision/design-better-library/sprints-handbook.webp',            alt: 'Sprints Handbook' },
            { src: '/portfolio/invision/design-better-library/remote-handbook.webp',             alt: 'Remote Work for Design Teams' },
            { src: '/portfolio/invision/design-better-library/animation-handbook.webp',          alt: 'Animation Handbook' },
            { src: '/portfolio/invision/design-better-library/design-engineering-handbook.webp', alt: 'Design Engineering Handbook' },
          ]} />
        </div>

        {/* ────────────────────────────────────────────────
            SECTION 3: Interviews
        ──────────────────────────────────────────────── */}
        <div className="pf-stacked-case">
          <div className="pf-stacked-case__text">
            <p className="pf-label">Video · 2017–2020</p>
            <h2 className="pf-heading">Interviews</h2>
            <p className="pf-body">
              To accompany the books, we produced a series of in-depth video interviews with design
              leaders from the world&rsquo;s most influential companies. Each conversation offered
              a candid look at craft, leadership, and the evolving role of design in business
              &mdash; episodes that became foundational resources for design teams worldwide.
            </p>
          </div>
          <div className="browser-frame-grid">
            <video
              src="/portfolio/invision/interviews/john-maeda-trust-in-design.mp4"
              poster="/portfolio/invision/interviews/john-maeda-trust-in-design.jpg"
              controls
              playsInline
              aria-label="John Maeda — Trust in Design"
              style={{ width: '100%', display: 'block', borderRadius: '6px' }}
            />
            <video
              src="/portfolio/invision/interviews/katie-dill-design-critiques.mp4"
              poster="/portfolio/invision/interviews/katie-dill-design-critiques.jpg"
              controls
              playsInline
              aria-label="Katie Dill — Design Critiques"
              style={{ width: '100%', display: 'block', borderRadius: '6px' }}
            />
            <video
              src="/portfolio/invision/interviews/lori-kaplan-apple-hig-story.mp4"
              poster="/portfolio/invision/interviews/lori-kaplan-apple-hig-story.jpg"
              controls
              playsInline
              aria-label="Lori Kaplan — Apple HIG Story"
              style={{ width: '100%', display: 'block', borderRadius: '6px' }}
            />
            <video
              src="/portfolio/invision/interviews/design-sprints-at-google.mp4"
              poster="/portfolio/invision/interviews/design-sprints-at-google.jpg"
              controls
              playsInline
              aria-label="Design Sprints at Google"
              style={{ width: '100%', display: 'block', borderRadius: '6px' }}
            />
            <video
              src="/portfolio/invision/interviews/twitter-horizons.mp4"
              poster="/portfolio/invision/interviews/twitter-horizons.jpg"
              controls
              playsInline
              aria-label="Twitter Horizons"
              style={{ width: '100%', display: 'block', borderRadius: '6px' }}
            />
            <video
              src="/portfolio/invision/interviews/john-maeda-design-thinking.mp4"
              controls
              playsInline
              aria-label="John Maeda — Design Thinking"
              style={{ width: '100%', display: 'block', borderRadius: '6px' }}
            />
          </div>
        </div>

        {/* ────────────────────────────────────────────────
            SECTION 4: The New Design Frontier
        ──────────────────────────────────────────────── */}
        <div className="pf-stacked-case">
          <div className="pf-stacked-case__text">
            <p className="pf-label">Research · 2018</p>
            <h2 className="pf-heading">The New Design Frontier</h2>
            <div className="pf-meta">
              <div className="pf-meta-item">
                <span className="pf-meta-label">Scope</span>
                <span className="pf-meta-value">2,200+ designers surveyed globally</span>
              </div>
              <div className="pf-meta-item">
                <span className="pf-meta-label">Adopted by</span>
                <span className="pf-meta-value">Fortune 100 — Google, IBM, Verizon, Cisco</span>
              </div>
            </div>
            <p className="pf-body">
              Leah Buley on our team led this effort &mdash; doing the impressive research and
              modeling that turned a survey of thousands of companies into a working maturity model.
              The study examined the correlation between design maturity and business results, and
              the key finding held up: industry leaders distinguish themselves by treating the
              digital interface as a critical business asset. High-maturity organizations showed
              measurable cost reductions, revenue gains, stronger brand positioning, and improved
              market standing.
            </p>
            <p className="pf-body" style={{ marginTop: '1rem' }}>
              The resulting design maturity model was adopted by Fortune 100 companies and became
              one of the most referenced frameworks in the design leadership community. Alongside
              it, we co-created the Design Leadership Community, a global network of thousands of
              design leaders, and the Design Exchange &mdash; an international initiative
              connecting practitioners from leading organizations across the globe.
            </p>
          </div>
          <PortfolioPanel className="ds-panel--half" items={[
            { src: '/portfolio/invision/new-design-frontier/slide-01.webp', alt: 'The New Design Frontier — cover' },
            { src: '/portfolio/invision/new-design-frontier/slide-02.webp', alt: 'The New Design Frontier — page 2' },
            { src: '/portfolio/invision/new-design-frontier/slide-03.webp', alt: 'The New Design Frontier — page 3' },
            { src: '/portfolio/invision/new-design-frontier/slide-04.webp', alt: 'The New Design Frontier — page 4' },
            { src: '/portfolio/invision/new-design-frontier/slide-05.webp', alt: 'The New Design Frontier — page 5' },
            { src: '/portfolio/invision/new-design-frontier/slide-06.webp', alt: 'The New Design Frontier — page 6' },
            { src: '/portfolio/invision/new-design-frontier/slide-07.webp', alt: 'The New Design Frontier — page 7' },
            { src: '/portfolio/invision/new-design-frontier/slide-08.webp', alt: 'The New Design Frontier — page 8' },
            { src: '/portfolio/invision/new-design-frontier/slide-09.webp', alt: 'The New Design Frontier — page 9' },
            { src: '/portfolio/invision/new-design-frontier/slide-10.webp', alt: 'The New Design Frontier — page 10' },
          ]} />
        </div>

      </article>

      {/* ── Prev / Next ── */}
      <PortfolioNav
        prev={{ href: '/portfolio/mailchimp', label: 'Mailchimp' }}
        next={{ href: '/portfolio/rtsl', label: 'Resolve to Save Lives' }}
      />

      {/* ── Footer ── */}
      <PortfolioFooter />
    </>
  )
}
