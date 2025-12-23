import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const supabase = await createClient();

    // 1. Static Pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
    ];

    // 2. Fetch Categories
    const { data: categories } = await supabase
        .from('category')
        .select('slug, updated_at')
        .eq('status', 'Active');

    const categoryPages: MetadataRoute.Sitemap = (categories || []).map((cat) => ({
        url: `${baseUrl}/category/${cat.slug}`,
        lastModified: cat.updated_at ? new Date(cat.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    // 3. Fetch Streamings
    const { data: streamings } = await supabase
        .from('streaming')
        .select('slug, updated_at')
        .eq('status', 'Active');

    const streamingPages: MetadataRoute.Sitemap = (streamings || []).map((stream) => ({
        url: `${baseUrl}/play/${stream.slug}`,
        lastModified: stream.updated_at ? new Date(stream.updated_at) : new Date(),
        changeFrequency: 'daily',
        priority: 0.7,
    }));

    return [...staticPages, ...categoryPages, ...streamingPages];
}
