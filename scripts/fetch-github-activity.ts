/**
 * Builds src/data/github-activity.json for the /making page: commits per day
 * for the past year (the activity grid) and per project (the swimlanes).
 *
 * Run with:  npm run fetch-github-activity
 *
 * Needs GITHUB_TOKEN (a token that can read your private repositories, e.g. a
 * fine-grained token with "Contents: read" on all repos) in your environment
 * or .env.local. Uses GitHub's commit search, which caps each query at 1,000
 * results, so it searches in half-month windows.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
// @ts-ignore
import { projects } from '../src/data/projects.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '../src/data/github-activity.json')

try {
  const envPath = join(__dirname, '../.env.local')
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
      const [k, ...v] = line.split('=')
      if (k && v.length && !process.env[k.trim()]) process.env[k.trim()] = v.join('=').trim()
    }
  }
} catch {}

const TOKEN = process.env.GITHUB_TOKEN
const AUTHOR = process.env.GITHUB_AUTHOR ?? 'aarron'
if (!TOKEN) {
  console.error('GITHUB_TOKEN is not set. Add it to your environment or .env.local.')
  process.exit(1)
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
const iso = (d: Date) => d.toISOString().slice(0, 10)

async function search(q: string, page: number) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(
      `https://api.github.com/search/commits?q=${encodeURIComponent(q)}&per_page=100&page=${page}&sort=committer-date`,
      { headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/vnd.github+json', 'User-Agent': 'activity-script' } },
    )
    if (res.status === 403 || res.status === 429) { await sleep(15000 * (attempt + 1)); continue }
    if (!res.ok) throw new Error(`search -> HTTP ${res.status}: ${await res.text()}`)
    return res.json() as Promise<{ items: { sha: string; commit: { committer: { date: string } }; repository: { full_name: string } }[] }>
  }
  throw new Error('search rate limited too many times')
}

async function main() {
  const end = new Date()
  const start = new Date(end); start.setUTCDate(start.getUTCDate() - 371)

  const commits = new Map<string, { day: string; repo: string }>()
  for (let from = new Date(start); from <= end; ) {
    const to = new Date(from); to.setUTCDate(to.getUTCDate() + 14)
    const range = `${iso(from)}..${iso(to < end ? to : end)}`
    for (let page = 1; page <= 10; page++) {
      const data = await search(`author:${AUTHOR} committer-date:${range}`, page)
      for (const c of data.items) commits.set(c.sha, { day: c.commit.committer.date.slice(0, 10), repo: c.repository.full_name })
      await sleep(2200)   // search allows 30 requests a minute
      if (data.items.length < 100) break
    }
    process.stdout.write(`\r${range}  ${commits.size} commits`)
    from = new Date(to); from.setUTCDate(from.getUTCDate() + 1)
  }
  console.log()

  // repo → project slug
  const slugOf = new Map<string, string>()
  for (const p of projects as { slug: string; repos: string[] }[]) for (const r of p.repos) slugOf.set(r.toLowerCase(), p.slug)

  const perDay = new Map<string, number>()
  const perProjectDay = new Map<string, Map<string, number>>()
  for (const { day, repo } of commits.values()) {
    perDay.set(day, (perDay.get(day) ?? 0) + 1)
    const slug = slugOf.get(repo.toLowerCase())
    if (!slug) continue
    if (!perProjectDay.has(slug)) perProjectDay.set(slug, new Map())
    const m = perProjectDay.get(slug)!
    m.set(day, (m.get(day) ?? 0) + 1)
  }

  // Grid runs 53 weeks, Sunday to Saturday, ending this week.
  const gridStart = new Date(end); gridStart.setUTCDate(gridStart.getUTCDate() - 364 - end.getUTCDay())
  const days: [string, number, [string, number][]][] = []
  for (let d = new Date(gridStart); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const day = iso(d)
    const top = [...perProjectDay.entries()]
      .map(([slug, m]) => [slug, m.get(day) ?? 0] as [string, number])
      .filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]).slice(0, 3)
    days.push([day, perDay.get(day) ?? 0, top])
  }

  const byProject = Object.fromEntries(
    [...perProjectDay.entries()].map(([slug, m]) => [slug, [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]))]),
  )

  writeFileSync(OUT, JSON.stringify({ generated: iso(end), days, byProject }) + '\n')
  console.log(`Saved ${commits.size} commits to ${OUT}`)
}

main().catch(err => { console.error(err.message); process.exit(1) })
