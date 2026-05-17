/** Returns an OpenGraph images array pointing at the dynamic /api/og route. */
export function ogImage(title: string, description?: string) {
  const params = new URLSearchParams({ title })
  if (description) params.set('description', description)
  return [
    {
      url: `/api/og?${params.toString()}`,
      width: 1200,
      height: 630,
      alt: title,
    },
  ]
}
