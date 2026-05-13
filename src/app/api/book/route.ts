import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') || ''
  const author = searchParams.get('author') || ''

  const query = [title, author].filter(Boolean).join(' ')
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=1&fields=title,author_name,cover_i,first_publish_year,subject,isbn`

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'aarronwalter.com/1.0' },
      next: { revalidate: 86400 * 30 }, // cache 30 days
    })
    const data = await res.json()
    const doc = data.docs?.[0]
    if (!doc) return NextResponse.json({ found: false })

    const coverUrl = doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
      : doc.isbn?.[0]
      ? `https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-M.jpg`
      : null

    return NextResponse.json({
      found: true,
      title: doc.title,
      author: doc.author_name?.[0] ?? author,
      coverUrl,
      firstPublished: doc.first_publish_year,
      subjects: (doc.subject ?? []).slice(0, 5),
      coverId: doc.cover_i ?? null,
      isbn: doc.isbn?.[0] ?? null,
    })
  } catch {
    return NextResponse.json({ found: false }, { status: 500 })
  }
}
