// Live GitHub activity for /making, refreshed once a day.
//
// With GITHUB_TOKEN set (a token for Aarron's account that can read his private
// and Design Better repositories), this asks GitHub's GraphQL API for commits per
// repository per day over the past year. Without a token, or if GitHub fails, it
// falls back to the snapshot in src/data/github-activity.json, so the page always
// renders.

import snapshotJson from '@/data/github-activity.json'
import { projects } from '@/data/projects'
import commitTimesJson from '@/data/commit-times.json'
import type { CommitTimes } from '@/components/CommitClockCanvas'

export interface Activity {
  generated: string
  days:      [string, number, [string, number][]][]   // date, commits, top projects that day
  byProject: Record<string, [string, number][]>       // project slug → [date, commits][]
}

const snapshot = snapshotJson as unknown as Activity
const DAY = 86400000
const iso = (d: Date) => d.toISOString().slice(0, 10)

const QUERY = `
  query($from: DateTime!, $to: DateTime!) {
    viewer {
      contributionsCollection(from: $from, to: $to) {
        commitContributionsByRepository(maxRepositories: 100) {
          repository { nameWithOwner }
          contributions(first: 100) { nodes { occurredAt commitCount } }
        }
      }
    }
  }`

interface RepoContributions {
  repository: { nameWithOwner: string }
  contributions: { nodes: { occurredAt: string; commitCount: number }[] }
}

async function fetchWindow(token: string, from: Date, to: Date): Promise<RepoContributions[]> {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'aarronwalter.com' },
    body: JSON.stringify({ query: QUERY, variables: { from: from.toISOString(), to: to.toISOString() } }),
    next: { revalidate: 86400 },
  })
  if (!res.ok) throw new Error(`GitHub GraphQL HTTP ${res.status}`)
  lastScopes = res.headers.get('x-oauth-scopes') ?? '(fine-grained or none reported)'
  const json = await res.json()
  if (json.errors?.length) throw new Error(json.errors[0].message)
  return json.data.viewer.contributionsCollection.commitContributionsByRepository
}
let lastScopes = ''

export async function getActivity(): Promise<Activity> {
  const token = process.env.GITHUB_TOKEN
  if (!token) return snapshot

  try {
    const end = new Date()
    const gridStart = new Date(end.getTime() - (364 + end.getUTCDay()) * DAY)   // Sunday, 53 weeks back

    // One query per ~month keeps each repository under GitHub's 100-day page limit.
    const windows: [Date, Date][] = []
    for (let from = gridStart; from < end; ) {
      const to = new Date(Math.min(end.getTime(), from.getTime() + 30 * DAY))
      windows.push([from, to])
      from = new Date(to.getTime() + 1000)
    }
    const results = (await Promise.all(windows.map(([f, t]) => fetchWindow(token, f, t)))).flat()

    const slugOf = new Map<string, string>()
    for (const p of projects) for (const r of p.repos) slugOf.set(r.toLowerCase(), p.slug)

    const perDay = new Map<string, number>()
    const perProjectDay = new Map<string, Map<string, number>>()
    for (const repo of results) {
      const slug = slugOf.get(repo.repository.nameWithOwner.toLowerCase())
      for (const { occurredAt, commitCount } of repo.contributions.nodes) {
        const day = occurredAt.slice(0, 10)
        perDay.set(day, (perDay.get(day) ?? 0) + commitCount)
        if (!slug) continue
        if (!perProjectDay.has(slug)) perProjectDay.set(slug, new Map())
        const m = perProjectDay.get(slug)!
        m.set(day, (m.get(day) ?? 0) + commitCount)
      }
    }

    const days: Activity['days'] = []
    for (let t = gridStart.getTime(); t <= end.getTime(); t += DAY) {
      const day = iso(new Date(t))
      const top = [...perProjectDay.entries()]
        .map(([slug, m]) => [slug, m.get(day) ?? 0] as [string, number])
        .filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]).slice(0, 3)
      days.push([day, perDay.get(day) ?? 0, top])
    }
    // If the token can see far less than the snapshot did (for example only public
    // repositories), it is missing access; keep the snapshot rather than shrink the year.
    const liveTotal = days.reduce((a, d) => a + d[1], 0)
    const snapTotal = snapshot.days.reduce((a, d) => a + d[1], 0)
    if (liveTotal < snapTotal * 0.6) {
      const perRepo = new Map<string, number>()
      for (const r of results) perRepo.set(r.repository.nameWithOwner, (perRepo.get(r.repository.nameWithOwner) ?? 0) + r.contributions.nodes.reduce((a, n) => a + n.commitCount, 0))
      console.warn(`GitHub returned ${liveTotal} commits vs ${snapTotal} in the snapshot; check the token's access. Using snapshot.`)
      console.warn(`Token scopes: ${lastScopes}. Repos seen: ${[...perRepo].sort((a, b) => b[1] - a[1]).map(([r, n]) => `${r}=${n}`).join(', ')}`)
      return snapshot
    }

    const byProject = Object.fromEntries(
      [...perProjectDay.entries()].map(([slug, m]) => [slug, [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]))]),
    )
    return { generated: iso(end), days, byProject }
  } catch (err) {
    console.error('GitHub activity fetch failed; using snapshot.', err)
    return snapshot
  }
}

// ── Commit times, for the 24-hour clock behind the page header ──


const timesSnapshot = commitTimesJson as unknown as CommitTimes
const TIME_ZONE = 'America/New_York'   // where the work happens (Athens, Georgia)

const HISTORY = `
  query($owner: String!, $name: String!, $since: GitTimestamp!, $author: ID!, $after: String) {
    repository(owner: $owner, name: $name) {
      defaultBranchRef { target { ... on Commit {
        history(first: 100, since: $since, author: { id: $author }, after: $after) {
          nodes { authoredDate }
          pageInfo { hasNextPage endCursor }
        }
      } } }
    }
  }`

async function gql(token: string, query: string, variables: Record<string, unknown>) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'aarronwalter.com' },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 86400 },
  })
  if (!res.ok) throw new Error(`GitHub GraphQL HTTP ${res.status}`)
  const json = await res.json()
  if (json.errors?.length) throw new Error(json.errors[0].message)
  return json.data
}

// Local date and fractional hour for a UTC timestamp.
const localParts = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
})
function local(ts: string) {
  const p = Object.fromEntries(localParts.formatToParts(new Date(ts)).map(x => [x.type, x.value]))
  return { day: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour) + Number(p.minute) / 60 }
}

export async function getCommitTimes(): Promise<CommitTimes> {
  const token = process.env.GITHUB_TOKEN
  if (!token) return timesSnapshot
  try {
    const since = new Date(Date.now() - 365 * DAY)
    const { viewer } = await gql(token, `{ viewer { id } }`, {})
    // Repositories with commits in the past year, from the contributions API.
    const windows: [Date, Date][] = []
    for (let from = since; from < new Date(); ) {
      const to = new Date(Math.min(Date.now(), from.getTime() + 30 * DAY))
      windows.push([from, to]); from = new Date(to.getTime() + 1000)
    }
    const repos = new Set(
      (await Promise.all(windows.map(([f, t]) => fetchWindow(token, f, t)))).flat().map(r => r.repository.nameWithOwner),
    )

    const stamps: string[] = []
    await Promise.all([...repos].map(async full => {
      const [owner, name] = full.split('/')
      let after: string | null = null
      for (let page = 0; page < 30; page++) {
        const data = await gql(token, HISTORY, { owner, name, since: since.toISOString(), author: viewer.id, after })
        const history = data.repository?.defaultBranchRef?.target?.history
        if (!history) break
        for (const n of history.nodes) stamps.push(n.authoredDate)
        if (!history.pageInfo.hasNextPage) break
        after = history.pageInfo.endCursor
      }
    }))
    if (stamps.length < timesSnapshot.points.length * 0.6) {
      console.warn(`GitHub returned ${stamps.length} commit times vs ${timesSnapshot.points.length} in the snapshot; check the token's access. Using snapshot.`)
      return timesSnapshot
    }

    const locals = stamps.map(local).sort((a, b) => a.day.localeCompare(b.day))
    const start = locals[0].day
    const t0 = Date.parse(start + 'T00:00:00Z')
    const points = locals.map(l => [Math.round((Date.parse(l.day + 'T00:00:00Z') - t0) / DAY), Math.round(l.hour * 100) / 100] as [number, number])
    return { start, days: points[points.length - 1][0] + 1, points }
  } catch (err) {
    console.error('GitHub commit-time fetch failed; using snapshot.', err)
    return timesSnapshot
  }
}
