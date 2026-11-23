import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ListeningView, { withMeta } from '../ListeningView'

// One page per record, so each has a link of its own; it opens the Listening
// page with that record's details showing.
export const dynamicParams = false

export function generateStaticParams() {
  return withMeta.filter(r => r.meta.slug).map(r => ({ slug: r.meta.slug! }))
}

const find = (slug: string) => withMeta.find(r => r.meta.slug === slug)

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const item = find(slug)
  if (!item) return {}
  const { record, meta } = item
  const year = meta.originalYear ?? record.released
  const title = `${record.title} by ${record.artist} — Listening`
  const description = `${record.artist}, ${record.title}${year ? ` (${year})` : ''}. From Aarron Walter's vinyl collection.`
  const image = meta.cover ?? meta.thumb ?? undefined
  return {
    title,
    description,
    alternates: { canonical: `/listening/${slug}` },
    openGraph: { title, description, type: 'music.album', ...(image ? { images: [{ url: image }] } : {}) },
    twitter: { card: image ? 'summary_large_image' : 'summary', title, description, ...(image ? { images: [image] } : {}) },
  }
}

export default async function RecordPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!find(slug)) notFound()
  return <ListeningView initialSlug={slug} />
}
