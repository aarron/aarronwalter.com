import type { Metadata } from 'next'
import PageHeader from '@/components/PageHeader'
import StatBlock from '@/components/StatBlock'
import CaseStudySection from '@/components/CaseStudySection'
import TestimonialPair from '@/components/TestimonialPair'
import PortfolioNav from '@/components/PortfolioNav'
import PortfolioFooter from '@/components/PortfolioFooter'

export const metadata: Metadata = {
  title: 'Consulting',
  description: 'Speaker, advisor, and consultant — Aarron Walter has advised Google, IBM, the White House, WHO, and hundreds of companies on design strategy and product thinking.',
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
      <article className="page-article">

        {/* ── Header ── */}
        <PageHeader eyebrow="2008–Present" title="Consulting" />

        {/* ── Brand Hero ── */}
        <div className="pf-brand-hero">
          <p className="pf-brand-lead">
            Since 2008, I&rsquo;ve advised organizations large and small on design strategy,
            product thinking, and team dynamics &mdash; and along the way, written, spoken, and
            co-hosted podcasts that have reached millions of people across design and technology.
          </p>
        </div>

        {/* ── Clients ── */}
        <CaseStudySection
          label="Consulting · 2008–Present"
          heading="Clients"
          panel={
            <img
              src="/portfolio/Other/consulting-logos.png"
              alt="Consulting clients including Google, IBM, LinkedIn, Atlassian, and more"
              className="consulting-logos"
            />
          }
        >
          <p className="pf-body">
            I&rsquo;ve worked with global brands, government agencies, financial institutions,
            and startups &mdash; helping teams sharpen their design practice, communicate its
            value, and build products that connect with people on a human level.
          </p>
          <ul className="portfolio-list" style={{ marginTop: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
            {CONSULTING_CLIENTS.map(client => (
              <li key={client}>{client}</li>
            ))}
          </ul>
        </CaseStudySection>

        {/* ── Testimonials ── */}
        <TestimonialPair
          testimonials={[
            {
              quote: 'Aarron is well versed in his work in designing for emotion. In such turbulent times, Aarron helped remind us how important it is to take a moment to reflect on how design affects our lives in how we feel and at work, to design for all the complexities of human emotion.',
              name: 'Toke Nygaard',
              role: 'Chief Creative Officer, Zendesk',
              avatar: '/portfolio/Other/toke.jpg',
            },
            {
              quote: 'Aarron\'s balance of storytelling and illustrative examples sparked thought provoking discussion and inspired our teams. Most importantly, he introduced concepts and frameworks for inclusive design that can easily be put into practice.',
              name: 'Evan English',
              role: 'VP Product Design & Research, American Express',
              avatar: '/portfolio/Other/evan-english.jpg',
            },
          ]}
        />

        <TestimonialPair
          testimonials={[
            {
              quote: 'Aarron Walter is a superb speaker, author, designer, and creative leader. Aarron has the gift of transforming complex design concepts into simple, compelling stories that are memorable, entertaining, and warmly relatable.',
              name: 'Jeffrey Zeldman',
              role: 'Co-founder, An Event Apart',
              avatar: '/portfolio/Other/zeldman.jpg',
            },
            {
              quote: 'Aarron role models all the characteristics that make for a great designer and leader: humility, kindness, ridiculous smarts, and a focus on humanity.',
              name: 'Kara DeFrias',
              role: 'Intuit QuickBooks',
              avatar: '/portfolio/Other/kara-defrias.jpg',
            },
          ]}
        />

        <TestimonialPair
          testimonials={[
            {
              quote: 'Our audiences love Aarron! A true industry thought leader and experienced public speaker, Aarron was incredibly engaging and informative.',
              name: 'Rachel Wan',
              role: 'Growth Tribe',
              avatar: '/portfolio/Other/rachael-wan.jpg',
            },
            {
              quote: 'Aarron gave a fantastic talk at Goldman Sachs. He was able to make the case for design being an endeavor that all roles contribute to.',
              name: 'Steve Turbeck',
              role: 'Goldman Sachs',
              avatar: '/portfolio/Other/steve-turbek.jpg',
            },
          ]}
        />

        {/* ── Speaking ── */}
        <div className="pf-stacked-case" style={{ paddingBottom: 'clamp(1.5rem, 2.5vw, 2rem)' }}>
          <div className="pf-stacked-case__text" style={{ marginBottom: 0 }}>
            <p className="pf-label">Speaking · 2008–Present</p>
            <h2 className="pf-heading">Speaking</h2>
            <p className="pf-body">
              Regular keynote speaker at design and technology conferences worldwide. I&rsquo;ve
              spoken in Japan, New Zealand, Australia, Germany, France, Spain, Portugal, Sweden,
              Norway, Iceland, Poland, the UK, Israel, Peru, Canada, and across the United States.
            </p>
          </div>
        </div>

        <StatBlock
          stats={[
            { value: '80+',  label: 'Conferences' },
            { value: '5',    label: 'Continents' },
            { value: '20+',  label: 'US states' },
            { value: '2008', label: 'Speaking since' },
          ]}
        />

      </article>

      {/* ── Prev / Next ── */}
      <PortfolioNav
        prev={{ href: '/portfolio/rtsl', label: 'Resolve to Save Lives' }}
        next={{ href: '/portfolio/books', label: 'My Books' }}
      />

      {/* ── Footer ── */}
      <PortfolioFooter />
    </>
  )
}
