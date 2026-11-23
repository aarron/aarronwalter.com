// Live GitHub activity for /making, refreshed once a day.
//
// With GITHUB_TOKEN set (a token for Aarron's account that can read his private
// and Design Better repositories), this asks GitHub's GraphQL API for commits per
// repository per day over the past year. Without a token, or if GitHub fails, it
// falls back to the snapshot in src/data/github-activity.json, so the page always
// renders.

import snapshotJson from '@/data/github-activity.json'
import { projects } from '@/data/projects'

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
  const json = await res.json()
  if (json.errors?.length) throw new Error(json.errors[0].message)
  return json.data.viewer.contributionsCollection.commitContributionsByRepository
}

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
    // A sudden empty year means the token can't see the repositories; keep the snapshot.
    if (days.every(d => d[1] === 0)) return snapshot

    const byProject = Object.fromEntries(
      [...perProjectDay.entries()].map(([slug, m]) => [slug, [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]))]),
    )
    return { generated: iso(end), days, byProject }
  } catch (err) {
    console.error('GitHub activity fetch failed; using snapshot.', err)
    return snapshot
  }
}
