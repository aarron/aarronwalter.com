/**
 * Pre-fetches book cover metadata from Open Library for every book in books.ts.
 * Writes results to src/data/book-covers.json.
 *
 * Run with:  npx tsx scripts/fetch-book-covers.ts
 * Re-run whenever you add books to books.ts.
 */
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
// @ts-ignore — .ts extension needed for Node's experimental strip-types
import { books } from '../src/data/books.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '../src/data/book-covers.json')
const FIELDS = 'cover_i,isbn,first_publish_year,subject'
const DELAY_MS = 250  // 4 req/sec — well under OL's rate limit
const TIMEOUT_MS = 12000

// Load existing cache so we can skip already-fetched entries
const existing: Record<string, BookCoverData> = existsSync(OUT)
  ? JSON.parse(readFileSync(OUT, 'utf8'))
  : {}

export interface BookCoverData {
  coverUrl: string | null
  firstPublished?: number
  subjects?: string[]
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function cacheKey(title: string, author: string) {
  return `${title}::${author}`
}

async function searchOL(query: string): Promise<{ cover_i?: number; isbn?: string[]; first_publish_year?: number; subject?: string[] } | null> {
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=1&fields=${FIELDS}`
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) })
  const data = await res.json() as { docs?: Array<{ cover_i?: number; isbn?: string[]; first_publish_year?: number; subject?: string[] }> }
  return data.docs?.[0] ?? null
}

async function fetchCover(title: string, author: string): Promise<BookCoverData> {
  const shortTitle = title.replace(/^(The|A|An) /, '').split(' ').slice(0, 5).join(' ')
  const lastName = author.trim().split(' ').pop() ?? ''

  const queries = [
    `${shortTitle} ${lastName}`,
    `${title} ${author}`,
    shortTitle,
  ]

  for (const q of queries) {
    if (!q.trim()) continue
    try {
      const doc = await searchOL(q)
      if (!doc) continue

      const coverUrl = doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
        : doc.isbn?.[0]
        ? `https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-M.jpg`
        : null

      if (coverUrl || doc.first_publish_year) {
        return {
          coverUrl,
          firstPublished: doc.first_publish_year,
          subjects: (doc.subject ?? []).slice(0, 5),
        }
      }
    } catch (e) {
      // Try next query
    }
  }

  return { coverUrl: null }
}

async function main() {
  const results: Record<string, BookCoverData> = { ...existing }
  let fetched = 0
  let skipped = 0

  const total = books.length
  console.log(`\nFetching covers for ${total} books…\n`)

  for (let i = 0; i < books.length; i++) {
    const book = books[i]
    const key = cacheKey(book.title, book.author)

    // Skip if already cached (unless it had no cover — retry those)
    if (existing[key] && existing[key].coverUrl !== null) {
      skipped++
      process.stdout.write(`  ✓ [${i + 1}/${total}] ${book.title}\n`)
      continue
    }

    // Use manual coverUrl from books.ts if provided
    if (book.coverUrl) {
      results[key] = { coverUrl: book.coverUrl }
      process.stdout.write(`  ★ [${i + 1}/${total}] ${book.title} (manual)\n`)
      fetched++
      continue
    }

    try {
      const data = await fetchCover(book.title, book.author)
      results[key] = data
      const icon = data.coverUrl ? '✓' : '✗'
      process.stdout.write(`  ${icon} [${i + 1}/${total}] ${book.title}${data.coverUrl ? '' : ' — no cover found'}\n`)
      fetched++
    } catch (e) {
      results[key] = { coverUrl: null }
      process.stdout.write(`  ✗ [${i + 1}/${total}] ${book.title} — error\n`)
    }

    // Write incrementally so we don't lose progress on interruption
    writeFileSync(OUT, JSON.stringify(results, null, 2))
    await sleep(DELAY_MS)
  }

  writeFileSync(OUT, JSON.stringify(results, null, 2))
  console.log(`\nDone. Fetched: ${fetched}, Skipped (cached): ${skipped}`)
  console.log(`Output: ${OUT}\n`)
}

main().catch(console.error)
