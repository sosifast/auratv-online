import { Metadata } from 'next';
import setup from '@/app/lib/setup.json';

export const metadata: Metadata = {
  metadataBase: new URL(setup.website_production),
  title: `Free Short Drama On ${setup.sitename}`,
  description: `Watch the best free short dramas online on ${setup.sitename}.`,
  alternates: {
    canonical: '/short',
  },
  icons: {
    icon: setup.favicon_url,
    apple: setup.logo_url,
  },
  openGraph: {
    title: `Free Short Drama On ${setup.sitename}`,
    description: `Watch the best free short dramas online on ${setup.sitename}.`,
    url: setup.website_production,
    siteName: setup.sitename,
    images: [
      {
        url: setup.logo_url,
        alt: `${setup.sitename} Logo`,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function ShortLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
