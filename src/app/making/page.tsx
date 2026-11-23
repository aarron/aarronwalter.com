import type { Metadata } from 'next'
import FooterWave from '@/components/FooterWave'
import ActivityGrid from '@/components/ActivityGrid'
import ProjectLanes from '@/components/ProjectLanes'
import { projects } from '@/data/projects'
import activityJson from '@/data/github-activity.json'

export const metadata: Metadata = {
  title: 'Making',
  description: 'Things Aarron Walter has been building: tools for Design Better, his community and his own curiosity.',
}

const activity = activityJson as unknown as {
  generated: string
  days: [string, number, [string, number][]][]
  byProject: Record<string, [string, number][]>
}

const names = Object.fromEntries(projects.map(p => [p.slug, p.name]))

// Swimlanes: featured projects first (in the order listed), then the rest by
// how much work went into them. Projects with no commits are left out.
const featured = projects.filter(p => p.featured)
const others = projects.filter(p => !p.featured)
const commitsFor = (slug: string) => (activity.byProject[slug] ?? []).reduce((a, d) => a + d[1], 0)
const lanes = [
  ...featured,
  ...[...others].sort((a, b) => commitsFor(b.slug) - commitsFor(a.slug)),
]
  .filter(p => commitsFor(p.slug) > 0)
  .map(p => ({ slug: p.slug, name: p.name, featured: !!p.featured, days: activity.byProject[p.slug] }))
const laneStart = lanes.flatMap(l => l.days.map(d => d[0])).sort()[0] ?? activity.days[0][0]
// Start the axis on the first of that month
const axisStart = laneStart.slice(0, 8) + '01'

const host = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/$/, '')

export default function MakingPage() {
  return (
    <>
      <article className="page-article">
        <header className="page-header">
          <h1 className="page-header-title">Making</h1>
          <hr className="page-header-rule" />
          <p className="page-header-intro">
            I&rsquo;m constantly building new websites, software, and hardware projects. My curiosity
            is boundless it would seem. Here are a few things I&rsquo;ve been working on lately.
          </p>
          <p className="making-github">
            <a href="https://github.com/aarron" target="_blank" rel="noopener noreferrer">github.com/aarron →</a>
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
                <article key={p.slug} id={p.slug} className="project">
                  <header className="project-head">
                    {p.context && <p className="project-context">{p.context}</p>}
                    <h3 className="project-name">{p.name}</h3>
                    <p className="project-pitch">{p.pitch}</p>
                  </header>
                  <div className="project-body">
                    <p className="project-about">{p.about}</p>
                    {p.highlights && (
                      <ul className="project-highlights">
                        {p.highlights.map(h => <li key={h}>{h}</li>)}
                      </ul>
                    )}
                    <ul className="project-stack" aria-label="Built with">
                      {p.stack.map(s => <li key={s}>{s}</li>)}
                    </ul>
                    {(p.url || p.repo) && (
                      <p className="project-links">
                        {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer">Visit {host(p.url)} →</a>}
                        {p.repo && <a href={p.repo} target="_blank" rel="noopener noreferrer">Code on GitHub →</a>}
                      </p>
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
