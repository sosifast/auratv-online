import type { MetadataRoute } from 'next';
import { getStreams } from './lib/data';

const SITE_URL = 'https://streamku.net';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/browse`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/trending`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/library`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  const streams = await getStreams();
  const streamRoutes: MetadataRoute.Sitemap = streams
    .filter((stream: any) => typeof stream?.slug === 'string' && stream.slug.length > 0)
    .map((stream: any) => ({
      url: `${SITE_URL}/${stream.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    }));

  return [...staticRoutes, ...streamRoutes];
}
