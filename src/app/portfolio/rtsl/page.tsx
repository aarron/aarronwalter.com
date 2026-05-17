import type { Metadata } from 'next'
import { ogImage } from '@/lib/og'
import PageHeader from '@/components/PageHeader'
import StatBlock from '@/components/StatBlock'
import CaseStudySection from '@/components/CaseStudySection'
import BrowserFrame from '@/components/BrowserFrame'
import BrowserFrameGrid from '@/components/BrowserFrameGrid'
import TestimonialPair from '@/components/TestimonialPair'
import PortfolioNav from '@/components/PortfolioNav'
import PortfolioFooter from '@/components/PortfolioFooter'
import RidgelineCanvas from '@/components/RidgelineCanvas'
import { CO2_DATA } from '@/lib/natural-data'

export const metadata: Metadata = {
  title: 'Resolve to Save Lives',
  description: 'Director of Product & Design for the US COVID Response at Resolve to Save Lives (2020–2022). Aarron Walter led design for public health tools used across the country.',
  openGraph: {
    title: 'Resolve to Save Lives — Aarron Walter',
    description: 'Director of Product & Design for the US COVID Response at Resolve to Save Lives (2020–2022). Led design for public health tools used across the country.',
    url: 'https://aarronwalter.com/portfolio/rtsl',
    images: ogImage('Resolve to Save Lives', 'Director of Product & Design for the US COVID Response. Built public health tools for WHO, Africa CDC, and more.'),
  },
  alternates: { canonical: 'https://aarronwalter.com/portfolio/rtsl' },
}

export default function RTSLPage() {
  return (
    <>
      <article className="page-article">

        {/* ── Header with Mauna Loa CO₂ seasonal cycle (1960–2019) ── */}
        <div className="rtsl-hero">
          <RidgelineCanvas
            className="rtsl-co2"
            data={CO2_DATA}
            ampRef={0.10}
            animate="breath"
          />
          <span className="viz-credit"><a href="https://gml.noaa.gov/ccgg/trends/" target="_blank" rel="noopener noreferrer">Mauna Loa CO₂</a> · NOAA GML · 1960–2019</span>
          <PageHeader eyebrow="2020–2022" title="Resolve to Save Lives" />
        </div>

        {/* ── Brand Hero ── */}
        <div className="pf-brand-hero">
          <p className="pf-brand-lead">
            In April 2020, at the onset of the COVID-19 pandemic, I joined Resolve to Save Lives —
            a non-profit founded by Dr. Tom Frieden, former CDC Director under President Obama.
            Leading an 8-person cross-disciplinary team, I built products and strategy that
            supported pandemic response decisions across multiple countries.
          </p>
          <p className="pf-brand-lead" style={{ marginTop: '1rem' }}>
            The work was deeply technical and required tight collaboration with doctors,
            epidemiologists, and public health experts who&rsquo;d spent careers in fields I was
            learning from scratch. There were moments when I felt out of my depth &mdash; but I
            pressed forward through bureaucracy, setbacks, and the constant stress of a pandemic.
            This was literally life or death work.
          </p>
        </div>

        {/* ── Stats ── */}
        <StatBlock
          heading="By the numbers"
          stats={[
            { value: '8',    label: 'Person team led' },
            { value: '$2M',  label: 'Budget managed' },
            { value: '$75M', label: 'Digital public service project co-led' },
            { value: '6',    label: 'Products built and deployed' },
          ]}
        />

        {/* ────────────────────────────────────────────────
            SECTION 1: Africa CDC COVID Hotspot Dashboard
        ──────────────────────────────────────────────── */}
        <div className="pf-stacked-case">
          <div className="pf-stacked-case__text">
            <p className="pf-label">Case Study · 2020–2021</p>
            <h2 className="pf-heading">Africa CDC COVID Hotspot Dashboard</h2>
            <div className="pf-meta">
              <div className="pf-meta-item">
                <span className="pf-meta-label">Partners</span>
                <span className="pf-meta-value">Africa CDC &amp; African Union</span>
              </div>
              <div className="pf-meta-item">
                <span className="pf-meta-label">My role</span>
                <span className="pf-meta-value">Director of Product</span>
              </div>
            </div>
            <p className="pf-body">
              Starting in April 2020 with a design sprint to explore how technology could support
              pandemic response, our team&rsquo;s central thesis was that &ldquo;boxing in the
              virus through contact tracing&rdquo; would be the most effective strategy. We moved
              fast &mdash; using Google Sheets for data storage and Node.js to reduce server-side
              development &mdash; building under the kind of high-stakes conditions where leaders
              were using our dashboards to decide whether to shut down cities and countries.
            </p>
            <p className="pf-body" style={{ marginTop: '1rem' }}>
              The Africa CDC dashboard tracked COVID cases, tests, deaths, and key outbreak
              indicators defined by epidemiologists. It was used directly by Africa CDC leaders
              and the African Union to shape continent-wide COVID response.
            </p>
          </div>
          <BrowserFrame>
            <div style={{ height: '720px', overflowY: 'auto' }}>
              <img
                src="/portfolio/rtsl/africa-cdc/africacdchotspotdb.png"
                alt="Africa CDC COVID Hotspot Dashboard"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
          </BrowserFrame>
        </div>

        {/* ────────────────────────────────────────────────
            SECTION 2: WHO Vaccine Credentials
        ──────────────────────────────────────────────── */}
        <CaseStudySection
          label="Case Study · 2021"
          heading="WHO Vaccine Credentials"
          meta={[
            { label: 'Partner', value: 'World Health Organization' },
            { label: 'My role', value: 'Temporary Advisor' },
          ]}
          panel={
            <BrowserFrame>
              <img
                src="/portfolio/rtsl/product-overview-2.png"
                alt="WHO Vaccine Credentials overview"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </BrowserFrame>
          }
        >
          <p className="pf-body">
            I served as a temporary advisor to the World Health Organization on the creation of
            digital smart vaccine credentials &mdash; a global standard for verifiable proof of
            vaccination during the COVID-19 pandemic. Working with WHO technical teams, I helped
            shape the product strategy and design approach for a credential system that needed to
            work across vastly different technological contexts, from high-resource settings to
            low-connectivity environments.
          </p>
          <p className="pf-body" style={{ marginTop: '1rem' }}>
            The initiative aimed to establish interoperable standards that governments and health
            authorities worldwide could adopt, ensuring that vaccine records could be trusted and
            verified across borders.
          </p>
        </CaseStudySection>

        {/* ── Testimonials ── */}
        <TestimonialPair
          testimonials={[
            {
              quote: 'Aarron brought structured thinking to problem solving, was a great team leader and collaborator — a rare combination of someone who is skillful at work and wise in life too.',
              name: 'Rahul Mullick',
              role: 'Senior Vice President of Technology, Resolve to Save Lives',
              avatar: '/portfolio/rtsl/rahul-mullick.jpg',
            },
            {
              quote: 'Aarron brought a calm, empathic style. He managed to direct the team and rally partners to achieve excellent design and product outcomes.',
              name: 'Daniel Burka',
              role: 'Director of Product and Design, Resolve to Save Lives',
              avatar: '/portfolio/rtsl/daniel-burka.jpg',
            },
          ]}
        />

        {/* ────────────────────────────────────────────────
            SECTION 3: ZEBRA
        ──────────────────────────────────────────────── */}
        <div className="pf-stacked-case">
          <div className="pf-stacked-case__text">
            <p className="pf-label">Case Study · 2021–2022</p>
            <h2 className="pf-heading">ZEBRA</h2>
            <div className="pf-meta">
              <div className="pf-meta-item">
                <span className="pf-meta-label">Partner</span>
                <span className="pf-meta-value">Zambia National Public Health Institute</span>
              </div>
              <div className="pf-meta-item">
                <span className="pf-meta-label">My role</span>
                <span className="pf-meta-value">Design Lead</span>
              </div>
            </div>
            <p className="pf-body">
              We designed an emergency response platform for the Zambia National Public Health
              Institute (ZNPHI) in partnership with Resolve to Save Lives, to help the
              country&rsquo;s public health teams coordinate during disease outbreaks and other
              health emergencies. Gloria Nunez led the project and I led the design, working
              alongside stakeholders from WHO, Africa CDC, US CDC, and ZNPHI leadership through
              a week-long design sprint that shaped the direction of everything that followed.
            </p>
            <p className="pf-body" style={{ marginTop: '1rem' }}>
              Called ZEBRA &mdash; the Zambia Emergency Bridge to Response Application &mdash;
              the platform gives incident managers a single place to register events, build
              response teams, run risk assessments, and track activities across Zambia&rsquo;s
              116 health districts. We designed for the conditions where it actually has to work:
              low bandwidth, varied devices, and a chain of users that stretches from
              community-based volunteers in remote villages to national leadership in Lusaka.
              The system connects to Zambia&rsquo;s existing surveillance infrastructure so
              frontline staff and decision-makers work from the same picture during a crisis.
              We built ZEBRA on DHIS2 &mdash; an open-source, web-based health management
              information platform widely used across Africa and the developing world.
            </p>
          </div>
          <BrowserFrameGrid className="browser-frame-masonry">
            <BrowserFrame>
              <img src="/portfolio/rtsl/zebra/dashboard-modal.png" alt="Dashboard modal" />
            </BrowserFrame>
            <BrowserFrame>
              <img src="/portfolio/rtsl/zebra/incident-action-plan-with-data.png" alt="Incident Action Plan with data" />
            </BrowserFrame>
            <BrowserFrame>
              <img src="/portfolio/rtsl/zebra/incident-action-plan-edit-2.png" alt="Incident Action Plan edit" />
            </BrowserFrame>
            <BrowserFrame>
              <img src="/portfolio/rtsl/zebra/im-team-builder-modal.png" alt="IM Team Builder modal" />
            </BrowserFrame>
            <BrowserFrame>
              <img src="/portfolio/rtsl/zebra/epi-tracker-risk-unknown.png" alt="Epi Tracker — risk unknown" />
            </BrowserFrame>
          </BrowserFrameGrid>
        </div>

      </article>

      {/* ── Prev / Next ── */}
      <PortfolioNav
        prev={{ href: '/portfolio/invision', label: 'InVision' }}
        next={{ href: '/portfolio/other', label: 'Consulting' }}
      />

      {/* ── Footer ── */}
      <PortfolioFooter />
    </>
  )
}
