/**
 * Syncs your Discogs collection with src/data/records.ts.
 *
 * Run with:  npm run sync-discogs            (dry run: shows what would change)
 *            npm run sync-discogs -- --apply (adds missing releases)
 *            npm run sync-discogs -- --apply --remove
 *                                            (also removes releases not on the site)
 *
 * Requires DISCOGS_TOKEN (a personal access token from
 * https://www.discogs.com/settings/developers) in your environment or .env.local.
 * New releases go into the "Uncategorized" folder (folder 1).
 */
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
// @ts-ignore
import { records } from '../src/data/records.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))

try {
  const envPath = join(__dirname, '../.env.local')
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
      const [k, ...v] = line.split('=')
      if (k && v.length && !process.env[k.trim()]) process.env[k.trim()] = v.join('=').trim()
    }
  }
} catch {}

const TOKEN = process.env.DISCOGS_TOKEN
if (!TOKEN) {
  console.error('DISCOGS_TOKEN is not set. Add it to your environment or .env.local.')
  process.exit(1)
}

const APPLY = process.argv.includes('--apply')
const REMOVE = process.argv.includes('--remove')
const API = 'https://api.discogs.com'
const HEADERS = {
  'User-Agent': 'RecordCollectionSync/1.0',
  Authorization: `Discogs token=${TOKEN}`,
}
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function call(method: string, path: string): Promise<any> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(API + path, { method, headers: HEADERS })
    await sleep(1100) // authenticated limit is 60 requests per minute
    if (res.status === 429) { await sleep(10000 * (attempt + 1)); continue }
    if (!res.ok) throw new Error(`${method} ${path} -> HTTP ${res.status}: ${await res.text()}`)
    const text = await res.text()
    return text ? JSON.parse(text) : {}
  }
  throw new Error(`${method} ${path} -> rate limited too many times`)
}

async function main() {
  const { username } = await call('GET', '/oauth/identity')
  console.log(`Discogs user: ${username}`)

  // Everything currently in the collection (folder 0 = All).
  const owned = new Map<number, { instanceId: number; folderId: number; title: string }>()
  let page = 1
  for (;;) {
    const data = await call('GET', `/users/${username}/collection/folders/0/releases?per_page=100&page=${page}`)
    for (const r of data.releases) {
      owned.set(r.id, {
        instanceId: r.instance_id,
        folderId: r.folder_id,
        title: `${r.basic_information.artists?.[0]?.name ?? ''} – ${r.basic_information.title}`,
      })
    }
    if (page >= data.pagination.pages) break
    page++
  }

  const site = new Map<number, string>()
  for (const r of records as { artist: string; title: string; releaseId: number | null }[]) {
    if (r.releaseId) site.set(r.releaseId, `${r.artist} – ${r.title}`)
  }

  const toAdd = [...site.keys()].filter(id => !owned.has(id))
  const toRemove = [...owned.keys()].filter(id => !site.has(id))

  console.log(`\nOn the site: ${site.size}   In your collection: ${owned.size}`)
  console.log(`\nTo add (${toAdd.length}):`)
  for (const id of toAdd) console.log(`  + ${id}  ${site.get(id)}`)
  console.log(`\nIn your collection but not on the site (${toRemove.length}):`)
  for (const id of toRemove) console.log(`  - ${id}  ${owned.get(id)!.title}`)

  if (!APPLY) {
    console.log('\nDry run only. Re-run with --apply to add, and --apply --remove to also remove.')
    return
  }

  for (const id of toAdd) {
    await call('POST', `/users/${username}/collection/folders/1/releases/${id}`)
    console.log(`  added ${id}  ${site.get(id)}`)
  }

  if (REMOVE) {
    for (const id of toRemove) {
      const o = owned.get(id)!
      await call('DELETE', `/users/${username}/collection/folders/${o.folderId}/releases/${id}/instances/${o.instanceId}`)
      console.log(`  removed ${id}  ${o.title}`)
    }
  }
  console.log('\nDone.')
}

main().catch(err => { console.error(err.message); process.exit(1) })
