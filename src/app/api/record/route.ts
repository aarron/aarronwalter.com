import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const releaseId = searchParams.get('releaseId')

  if (!releaseId) return NextResponse.json({ found: false }, { status: 400 })

  const token = process.env.DISCOGS_TOKEN
  const headers: Record<string, string> = {
    'User-Agent': 'AarronWalterSite/1.0',
  }
  if (token) headers['Authorization'] = `Discogs token=${token}`

  try {
    const res = await fetch(`https://api.discogs.com/releases/${releaseId}`, {
      headers,
      next: { revalidate: 86400 * 30 },
    })
    if (!res.ok) return NextResponse.json({ found: false }, { status: res.status })
    const data = await res.json()

    const cover = data.images?.[0]?.uri ?? data.thumb ?? null
    const tracklist = (data.tracklist ?? []).map((t: { position: string; title: string; duration: string }) => ({
      position: t.position,
      title: t.title,
      duration: t.duration,
    }))

    return NextResponse.json({
      found: true,
      title: data.title,
      artist: data.artists_sort,
      cover,
      thumb: data.thumb,
      year: data.year,
      genres: data.genres ?? [],
      styles: data.styles ?? [],
      tracklist,
      labels: (data.labels ?? []).map((l: { name: string }) => l.name),
      country: data.country,
      notes: data.notes,
      discogsUrl: `https://www.discogs.com/release/${releaseId}`,
    })
  } catch {
    return NextResponse.json({ found: false }, { status: 500 })
  }
}
