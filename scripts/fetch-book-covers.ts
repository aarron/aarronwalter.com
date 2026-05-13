/**
 * Pre-fetches book cover metadata + descriptions from Open Library for every
 * book in books.ts. Writes results to src/data/book-covers.json.
 *
 * Run with:  npm run fetch-covers
 * Re-run whenever you add books to books.ts.
 */
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
// @ts-ignore — .ts extension needed for Node's experimental strip-types
import { books } from '../src/data/books.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '../src/data/book-covers.json')
const FIELDS = 'cover_i,isbn,first_publish_year,subject,key'
const DELAY_MS = 300  // slightly more conservative — we make 2 requests per book now
const TIMEOUT_MS = 12000

// Load existing cache so we can skip already-fetched entries
const existing: Record<string, BookCoverData> = existsSync(OUT)
  ? JSON.parse(readFileSync(OUT, 'utf8'))
  : {}

export interface BookCoverData {
  coverUrl: string | null
  firstPublished?: number
  subjects?: string[]
  /** null = fetched but not found; undefined / missing = not yet fetched */
  description?: string | null
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function cacheKey(title: string, author: string) {
  return `${title}::${author}`
}

async function searchOL(query: string): Promise<{
  cover_i?: number
  isbn?: string[]
  first_publish_year?: number
  subject?: string[]
  key?: string
} | null> {
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=1&fields=${FIELDS}`
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) })
  const data = await res.json() as { docs?: Array<{
    cover_i?: number
    isbn?: string[]
    first_publish_year?: number
    subject?: string[]
    key?: string
  }> }
  return data.docs?.[0] ?? null
}

async function fetchWorkDescription(workKey: string): Promise<string | null> {
  try {
    const url = `https://openlibrary.org${workKey}.json`
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) })
    const data = await res.json() as {
      description?: string | { type: string; value: string }
    }
    if (!data.description) return null
    const raw = typeof data.description === 'string'
      ? data.description
      : data.description.value ?? ''
    // Strip Goodreads-style "----\n source:" footers and trim
    const cleaned = raw.split(/\s*-{3,}\s*\n/)[0].trim()
    // Cap at 500 characters, break cleanly at a sentence boundary if possible
    if (cleaned.length <= 500) return cleaned
    const truncated = cleaned.slice(0, 500)
    const lastPeriod = truncated.lastIndexOf('. ')
    return lastPeriod > 200 ? truncated.slice(0, lastPeriod + 1) : truncated + '…'
  } catch {
    return null
  }
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
        // Fetch the work-level description (extra request)
        let description: string | null = null
        if (doc.key) {
          await sleep(DELAY_MS)
          description = await fetchWorkDescription(doc.key)
        }

        return {
          coverUrl,
          firstPublished: doc.first_publish_year,
          subjects: (doc.subject ?? []).slice(0, 5),
          description,
        }
      }
    } catch (e) {
      // Try next query
    }
  }

  return { coverUrl: null, description: null }
}

async function main() {
  const results: Record<string, BookCoverData> = { ...existing }
  let fetched = 0
  let skipped = 0

  const total = books.length
  console.log(`\nFetching covers + descriptions for ${total} books…\n`)

  for (let i = 0; i < books.length; i++) {
    const book = books[i]
    const key = cacheKey(book.title, book.author)

    // Skip only when BOTH coverUrl is set AND description has been attempted
    if (existing[key] && existing[key].coverUrl !== null && 'description' in existing[key]) {
      skipped++
      process.stdout.write(`  ✓ [${i + 1}/${total}] ${book.title}\n`)
      continue
    }

    // Use manual coverUrl from books.ts if provided; still fetch description
    if (book.coverUrl) {
      let description: string | null | undefined = undefined
      if ('description' in (existing[key] ?? {})) {
        description = existing[key].description
      } else {
        // Fetch description from OL by title+author search
        try {
          const q = `${book.title.replace(/^(The|A|An) /, '').split(' ').slice(0, 5).join(' ')} ${book.author.trim().split(' ').pop()}`
          const doc = await searchOL(q)
          if (doc?.key) {
            await sleep(DELAY_MS)
            description = await fetchWorkDescription(doc.key)
          } else {
            description = null
          }
        } catch {
          description = null
        }
      }
      results[key] = { coverUrl: book.coverUrl, description: description ?? null }
      process.stdout.write(`  ★ [${i + 1}/${total}] ${book.title} (manual cover)\n`)
      fetched++
      writeFileSync(OUT, JSON.stringify(results, null, 2))
      await sleep(DELAY_MS)
      continue
    }

    try {
      const data = await fetchCover(book.title, book.author)
      results[key] = data
      const icon = data.coverUrl ? '✓' : '✗'
      process.stdout.write(`  ${icon} [${i + 1}/${total}] ${book.title}${data.coverUrl ? '' : ' — no cover found'}\n`)
      fetched++
    } catch (e) {
      results[key] = { coverUrl: null, description: null }
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
