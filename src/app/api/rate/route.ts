import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

// Local-only rating endpoint. It rewrites the rating in src/data/records.ts,
// so it is disabled everywhere except `npm run dev` on your own machine.
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const host = req.headers.get('host') ?? ''
  if (!/^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host)) {
    return NextResponse.json({ error: 'Local requests only' }, { status: 403 })
  }

  let body: { releaseId?: unknown; rating?: unknown }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Bad JSON' }, { status: 400 }) }
  const { releaseId, rating } = body
  if (!Number.isInteger(releaseId) || !Number.isInteger(rating) || (rating as number) < 0 || (rating as number) > 5) {
    return NextResponse.json({ error: 'releaseId must be an integer and rating 0–5' }, { status: 400 })
  }

  const file = join(process.cwd(), 'src/data/records.ts')
  const src = await readFile(file, 'utf8')
  const pattern = new RegExp(`rating: \\d, (released: [^,]+, releaseId: ${releaseId} \\})`, 'g')
  if (!pattern.test(src)) {
    return NextResponse.json({ error: `Release ${releaseId} not found` }, { status: 404 })
  }
  await writeFile(file, src.replace(pattern, `rating: ${rating}, $1`))
  return NextResponse.json({ ok: true, releaseId, rating })
}
