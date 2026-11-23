import type { Metadata } from 'next'
import Image from 'next/image'
import FooterWave from '@/components/FooterWave'
import BrowserFrame from '@/components/BrowserFrame'
import GitHubIcon from '@/components/GitHubIcon'
import StackPill from '@/components/StackPill'
import ActivityGrid from '@/components/ActivityGrid'
import ProjectLanes from '@/components/ProjectLanes'
import { projects } from '@/data/projects'
import { getActivity, getCommitTimes, type Activity } from '@/lib/github-activity'
import CommitClockCanvas from '@/components/CommitClockCanvas'

export const metadata: Metadata = {
  title: 'Making',
  description: 'Things Aarron Walter has been building: tools for Design Better, his community and his own curiosity.',
}

// Rebuilt at most once a day with the latest GitHub activity (see src/lib/github-activity.ts).
export const revalidate = 86400

const names = Object.fromEntries(projects.map(p => [p.slug, p.name]))
const featured = projects.filter(p => p.featured)
const others = projects.filter(p => !p.featured)

// Swimlanes: featured projects first (in the order listed), then the rest by
// how much work went into them. Projects with no commits are left out.
function buildLanes(activity: Activity) {
  const commitsFor = (slug: string) => (activity.byProject[slug] ?? []).reduce((a, d) => a + d[1], 0)
  const lanes = [
    ...featured,
    ...[...others].sort((a, b) => commitsFor(b.slug) - commitsFor(a.slug)),
  ]
    .filter(p => commitsFor(p.slug) > 0)
    .map(p => ({ slug: p.slug, name: p.name, featured: !!p.featured, days: activity.byProject[p.slug] }))
  const laneStart = lanes.flatMap(l => l.days.map(d => d[0])).sort()[0] ?? activity.days[0][0]
  return { lanes, axisStart: laneStart.slice(0, 8) + '01' }   // axis starts on the first of that month
}

const host = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/$/, '')

export default async function MakingPage() {
  const [activity, times] = await Promise.all([getActivity(), getCommitTimes()])
  const since = new Date(times.start + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
  const { lanes, axisStart } = buildLanes(activity)

  return (
    <>
      <article className="page-article">
        <CommitClockCanvas data={times} className="page-hero-canvas" />
        <span className="viz-credit" style={{ bottom: 'auto', top: 'calc(clamp(700px, 95vh, 1200px) * 0.42 + min(27vw, clamp(700px, 95vh, 1200px) * 0.36) + 64px)' }}>
          Data source: <a href="https://github.com/aarron" target="_blank" rel="noopener noreferrer">my commits on GitHub</a> · {times.points.length.toLocaleString()} commits since {since} · each mark at the hour it was made
        </span>
        <header className="page-header">
          <h1 className="page-header-title">Making</h1>
          <hr className="page-header-rule" />
          <p className="page-header-intro">
            I&rsquo;m constantly building new websites, software, and hardware projects. My curiosity
            is boundless it would seem. Here are a few things I&rsquo;ve been working on lately.
          </p>
          <p className="making-github">
            <a className="making-btn making-btn--ghost" href="https://github.com/aarron" target="_blank" rel="noopener noreferrer">
              <GitHubIcon /> Follow me on GitHub
            </a>
          </p>
        </header>

        <div className="page-content making">
          <section className="making-section" aria-label="Commits over the past year">
            <ActivityGrid days={activity.days} names={names} />
          </section>

          <section className="making-section" aria-labelledby="making-lanes">
            <h2 id="making-lanes" className="making-heading">Project work over time</h2>
            <p className="making-note">Each row is a project; each tick is a day of work on it. Taller ticks mean more commits that day.</p>
            <ProjectLanes lanes={lanes} start={axisStart} end={activity.generated} />
          </section>

          <section className="making-section" aria-labelledby="making-featured">
            <h2 id="making-featured" className="making-heading">Featured projects</h2>
            <div className="project-list">
              {featured.map(p => (
                <article key={p.slug} id={p.slug} className={p.image ? 'project has-image' : 'project'}>
                  {p.image && (
                    <div className="project-shot">
                      <BrowserFrame>
                        <Image src={p.image} alt={`${p.name} home page`} width={1600} height={1333} sizes="(max-width: 760px) 100vw, 50vw" />
                      </BrowserFrame>
                    </div>
                  )}
                  <header className="project-head">
                    {p.context && <p className="project-context">{p.context}</p>}
                    <h3 className="project-name">{p.name}</h3>
                    <p className="project-pitch">{p.pitch}</p>
                    {(p.url || p.repo) && (
                      <p className="project-links">
                        {p.url && <a className="making-btn" href={p.url} target="_blank" rel="noopener noreferrer">Visit {host(p.url)} <span aria-hidden="true">↗</span></a>}
                        {p.repo && <a className="making-btn making-btn--ghost" href={p.repo} target="_blank" rel="noopener noreferrer"><GitHubIcon /> View the code</a>}
                      </p>
                    )}
                  </header>
                  <div className="project-body">
                    <p className="project-about">{p.about}</p>
                    {p.highlights && (
                      <ul className="project-highlights">
                        {p.highlights.map(h => <li key={h}>{h}</li>)}
                      </ul>
                    )}
                    <div className="project-tools">
                      <p className="project-tools-label">Built with</p>
                      <ul className="project-stack">{p.stack.map(t => <StackPill key={t} name={t} />)}</ul>
                    </div>
                    {p.services && p.services.length > 0 && (
                      <div className="project-tools">
                        <p className="project-tools-label">Connects to</p>
                        <ul className="project-stack">{p.services.map(t => <StackPill key={t} name={t} />)}</ul>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="making-section" aria-labelledby="making-more">
            <h2 id="making-more" className="making-heading">More projects</h2>
            <ul className="project-more">
              {others.map(p => (
                <li key={p.slug}>
                  <span className="project-more-name">
                    {p.url ? <a href={p.url} target="_blank" rel="noopener noreferrer">{p.name}</a> : p.name}
                  </span>
                  <span className="project-more-pitch">{p.pitch}</span>
                  {p.context && <span className="project-more-context">{p.context}</span>}
                </li>
              ))}
            </ul>
          </section>

          <p className="making-footnote">
            Activity comes from GitHub and counts commits, so it measures code rather than effort.
            Updated {new Date(activity.generated + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}.
          </p>
        </div>
      </article>

      <footer className="site-footer site-footer--light">
        <div className="footer-wave-wrap" aria-hidden="true"><FooterWave /></div>
        <div className="footer-inner">
          <span className="t-caption">© {new Date().getFullYear()} <strong className="footer-name">Aarron Walter</strong></span>
          <nav className="footer-links">
            <a href="https://designbetter.com" target="_blank" rel="noopener noreferrer">Design Better</a>
            <a href="https://linkedin.com/in/aarronwalter" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </nav>
        </div>
      </footer>
    </>
  )
}
