import type { MetadataRoute } from 'next'

const BASE = 'https://aarronwalter.com'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${BASE}/about`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.8,
    },
    {
      url: `${BASE}/portfolio/mailchimp`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.9,
    },
    {
      url: `${BASE}/portfolio/invision`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.9,
    },
    {
      url: `${BASE}/portfolio/rtsl`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.9,
    },
    {
      url: `${BASE}/portfolio/other`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.7,
    },
    {
      url: `${BASE}/listening`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${BASE}/reading`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ]
}
