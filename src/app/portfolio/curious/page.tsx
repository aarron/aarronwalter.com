import type { Metadata } from 'next'
import { ogImage } from '@/lib/og'
import PageHeader from '@/components/PageHeader'
import CaseStudySection from '@/components/CaseStudySection'
import BrowserFrame from '@/components/BrowserFrame'
import PortfolioNav from '@/components/PortfolioNav'
import PortfolioFooter from '@/components/PortfolioFooter'
import RidgelineCanvas from '@/components/RidgelineCanvas'

export const metadata: Metadata = {
  title: 'Curious',
  description:
    'Curious is an AI interview studio that researches your guest, drafts questions in your voice, and coaches you after the interview. Aarron Walter designed and built it end to end.',
  // ── Unlisted preview: keep this page out of search + AI crawlers while in review ──
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Curious — Aarron Walter',
    description:
      'An AI interview studio — researches your guest, drafts questions in your voice, and coaches you after. Designed and built solo, end to end.',
    url: 'https://aarronwalter.com/portfolio/curious',
    images: ogImage('Curious', 'An AI interview studio, designed and built solo — research, questions in your voice, live mode, and a coach’s retrospective.'),
  },
  alternates: { canonical: 'https://aarronwalter.com/portfolio/curious' },
}

export default function CuriousPage() {
  return (
    <>
      <article className="page-article curious-article">

        {/* ── Header with PSR B1919+21 — the first radio pulsar ever discovered ── */}
        <div className="curious-hero">
          <RidgelineCanvas
            className="curious-pulsar"
            animate="breath"
          />
          <span className="viz-credit">Data source: <a href="https://en.wikipedia.org/wiki/PSR_B1919%2B21" target="_blank" rel="noopener noreferrer">PSR B1919+21</a> · first radio pulsar · Arecibo, 1967</span>
          <PageHeader eyebrow="Designed &amp; built solo" title="Curious" />
        </div>

        {/* ── Brand Hero: Lead ── */}
        <div className="pf-brand-hero">
          <p className="pf-brand-lead">
            Co-hosting Design Better taught me that the interview is won or lost in the
            preparation &mdash; and that the prep is brutal, lonely work. So I built the tool I
            wished I had. <a href="https://imcurious.io" target="_blank" rel="noopener noreferrer">Curious</a> is
            an AI interview studio: it researches your guest, drafts questions in your voice,
            lets co-hosts and producers work the same doc in real time, and gives you a
            coach&rsquo;s read after the tape stops rolling.
          </p>
          <p className="pf-brand-lead" style={{ marginTop: '1rem' }}>
            This one is different from the rest of my work here. I didn&rsquo;t direct a team &mdash;
            I designed and shipped it myself, end to end: the product thinking, the
            &ldquo;Paper &amp; Ink&rdquo; design system, and the full-stack engineering, from the
            multi-model AI pipeline to the real-time collaboration layer and Stripe billing.
          </p>
        </div>

        {/* ── Product showcase: live interview mode ── */}
        <div className="pf-panel-wrap curious-hero-shot">
          <BrowserFrame>
            <img
              src="/portfolio/curious/live-interview.png"
              alt="Curious running a live interview — the prep doc, question queue, live signals, and team chat"
            />
          </BrowserFrame>
        </div>

        {/* ────────────────────────────────────────────────
            FEATURE 1: The dossier
        ──────────────────────────────────────────────── */}
        <CaseStudySection
          label="Feature · The dossier"
          heading="Know your guest like an old friend"
          meta={[{ label: 'My role', value: 'Design + engineering' }]}
          panel={
            <BrowserFrame>
              <img src="/portfolio/curious/dossier.png" alt="A Curious guest dossier — bio snapshot, recent work, and books" />
            </BrowserFrame>
          }
        >
          <p className="pf-body">
            Give Curious a name and a link. Minutes later you&rsquo;re reading a working
            dossier &mdash; the guest&rsquo;s philosophies and contrarian positions, recent work
            and media, books, previous appearances, and the things they care about more than
            people realize.
          </p>
          <p className="pf-body" style={{ marginTop: '1rem' }}>
            Then it goes where search can&rsquo;t. Curious writes a short, share-ready note and
            your guest forwards it to the people who know them best &mdash; a former cofounder,
            an old editor. What those people volunteer becomes angles no amount of Googling would
            surface. No cold outreach, no scraping.
          </p>
        </CaseStudySection>

        {/* ────────────────────────────────────────────────
            FEATURE 2: The question pool
        ──────────────────────────────────────────────── */}
        <CaseStudySection
          label="Feature · The question pool"
          heading="Never start from a blank page"
          meta={[{ label: 'Under the hood', value: 'Claude · ChatGPT · Gemini · Perplexity' }]}
          flip
          panel={
            <BrowserFrame>
              <img src="/portfolio/curious/question-pool.png" alt="A researched question pool in Curious — questions by topic, each with source links" />
            </BrowserFrame>
          }
        >
          <p className="pf-body">
            Before you write a word, Curious has done the reading. Every interview opens with a
            pool of researched questions, organized by topic, each grounded in a real source you
            can open and check. The busywork is handled; the judgment stays yours.
          </p>
          <p className="pf-body" style={{ marginTop: '1rem' }}>
            Four AI models research the guest in parallel, each from a different angle &mdash;
            Claude the close reader, ChatGPT the generalist, Gemini the lateral thinker,
            Perplexity the librarian &mdash; so the pool is broad and well-sourced before you make
            it your own. Orchestrating them without turning the app into a slow, brittle mess was
            the hardest engineering problem in the build.
          </p>
        </CaseStudySection>

        {/* ────────────────────────────────────────────────
            FEATURE 3: Your voice
        ──────────────────────────────────────────────── */}
        <CaseStudySection
          label="Feature · Your voice"
          heading="Ask questions only you could ask"
          panel={
            <BrowserFrame>
              <img src="/portfolio/curious/voice.png" alt="Tuning the voice of your interview questions in Curious" />
            </BrowserFrame>
          }
        >
          <p className="pf-body">
            The best interviewers work from principles &mdash; open, neutral, one thought at a
            time, written to draw out a story rather than a yes. I studied John Sawatsky&rsquo;s
            method and the producers behind shows like <em>Fresh Air</em> and{' '}
            <em>This American Life</em>, and baked those rules into how Curious writes and flags
            questions.
          </p>
          <p className="pf-body" style={{ marginTop: '1rem' }}>
            Then it makes them yours. Curious learns how you sound and tunes every question to
            your voice &mdash; the more you edit and keep, the sharper the next set gets.
          </p>
        </CaseStudySection>

        {/* ────────────────────────────────────────────────
            FEATURE 4: Live mode
        ──────────────────────────────────────────────── */}
        <CaseStudySection
          label="Feature · Live mode"
          heading="Run the interview together"
          meta={[{ label: 'Real-time', value: 'PartyKit — presence, signals, shared queue' }]}
          flip
          panel={
            <BrowserFrame>
              <img src="/portfolio/curious/collab-panel.png" alt="The live interview panel — signals, up-next queue, and team chat" />
            </BrowserFrame>
          }
        >
          <p className="pf-body">
            Co-hosts, producers, and researchers work the same interview at the same time. A
            live chat with tapbacks runs beside the questions, and large signals tell each other
            when to <em>go deeper</em> or <em>wrap soon</em> &mdash; without a word spoken on tape.
          </p>
          <p className="pf-body" style={{ marginTop: '1rem' }}>
            A shared question queue lets the team shape the direction of the conversation, live.
            I built the whole layer on PartyKit &mdash; presence, edit-awareness, and
            optimistic-locked saves so two hosts never clobber each other&rsquo;s work.
          </p>
        </CaseStudySection>

        {/* ────────────────────────────────────────────────
            FEATURE 5: The retrospective
        ──────────────────────────────────────────────── */}
        <CaseStudySection
          label="Feature · The retrospective"
          heading="A coach&rsquo;s read on every interview"
          panel={
            <BrowserFrame>
              <img src="/portfolio/curious/review-panel.png" alt="The retrospective — a coach's read on the interview" />
            </BrowserFrame>
          }
        >
          <p className="pf-body">
            Drop in the recording or transcript and Curious gives you the game film: the moments
            where a question sparked something real, the follow-up you missed, your talk-time
            against the guest&rsquo;s, and one thing to practice before the next conversation.
          </p>
          <p className="pf-body" style={{ marginTop: '1rem' }}>
            Every interview makes you better at the next one. That was the whole point &mdash; not
            to replace the host, but to give any host the reps that used to take a career.
          </p>
        </CaseStudySection>

        {/* ────────────────────────────────────────────────
            Built end to end — the stack
        ──────────────────────────────────────────────── */}
        <div className="pf-awards-block">
          <p className="pf-awards-block__intro">
            I&rsquo;ve spent two decades leading design and product teams. Building Curious alone
            &mdash; design, frontend, backend, AI, billing, infrastructure &mdash; was a way to
            close the distance between the whiteboard and the thing that actually ships, and to
            stay honest about how software really gets made in the age of AI.
          </p>
          <h3 className="pf-awards-block__heading">Built with</h3>
          <dl className="pf-awards">
            {[
              { year: 'Framework',  name: 'Next.js 16 · React 19' },
              { year: 'Design',     name: '“Paper & Ink” system · EB Garamond' },
              { year: 'AI',         name: 'Claude · ChatGPT · Gemini · Perplexity' },
              { year: 'Speech',     name: 'AssemblyAI transcription' },
              { year: 'Real-time',  name: 'PartyKit WebSocket rooms' },
              { year: 'Data',       name: 'Neon Postgres' },
              { year: 'Billing',    name: 'Stripe — checkout, portal, webhooks' },
              { year: 'Platform',   name: 'Vercel · Blob · Resend · Sentry' },
            ].map((a) => (
              <div key={a.name} className="pf-award-item">
                <dt className="pf-award-year">{a.year}</dt>
                <dd className="pf-award-name">{a.name}</dd>
              </div>
            ))}
          </dl>
        </div>

      </article>

      {/* ── Prev / Next ── */}
      <PortfolioNav
        prev={{ href: '/', label: 'All work', dir: '← Home' }}
        next={{ href: '/portfolio/mailchimp', label: 'Mailchimp' }}
      />

      {/* ── Footer ── */}
      <PortfolioFooter />
    </>
  )
}
