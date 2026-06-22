import { Metadata } from 'next';
import { getShortStreamBySlug } from '@/app/lib/api-short';
import setup from '@/app/lib/setup.json';

type Props = {
  params: Promise<{ play: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { play } = await params;
  const stream = await getShortStreamBySlug(play);

  const canonicalUrl = `/short/${play}`;

  if (!stream) {
    return {
      title: 'Stream Not Found',
      alternates: {
        canonical: canonicalUrl,
      },
    };
  }

  return {
    title: `${stream.title} - ${setup.sitename}`,
    description: stream.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: stream.title,
      description: stream.description,
      url: canonicalUrl,
      siteName: setup.sitename,
      images: [
        {
          url: stream.image,
        },
      ],
      locale: 'en_US',
      type: 'video.movie', // Atau 'website'
    },
  };
}

export default function PlayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
