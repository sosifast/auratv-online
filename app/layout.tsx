import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AuraTV - Nonton Streaming Film & Serial TV Online Gratis",
    template: "%s | AuraTV"
  },
  description: "AuraTV adalah platform streaming online gratis untuk menonton film dan serial TV favorit Anda. Nikmati ribuan konten berkualitas tinggi dengan subtitle Indonesia.",
  keywords: ["streaming gratis", "nonton film online", "serial tv", "drama korea", "anime", "film bioskop", "AuraTV"],
  authors: [{ name: "AuraTV Indonesia" }],
  creator: "AuraTV Indonesia",
  publisher: "AuraTV Indonesia",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    title: "AuraTV - Nonton Streaming Film & Serial TV Online Gratis",
    description: "Platform streaming online gratis untuk menonton film dan serial TV favorit Anda",
    siteName: "AuraTV",
  },
  twitter: {
    card: "summary_large_image",
    title: "AuraTV - Nonton Streaming Film & Serial TV Online Gratis",
    description: "Platform streaming online gratis untuk menonton film dan serial TV favorit Anda",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
