import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import Navbar from "./components/Navbar";
import { I18nProvider } from "./components/I18nProvider";
import { getSetup } from "./lib/data";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const setup = await getSetup();
  const title = "Free live streaming | Live TV Fifa World Cup 2026";
  const description = `Watch FIFA World Cup 2026 live and the most complete Live TV online with free HD quality. Enjoy premium football streaming access on ${setup.sitename}.`;
  
  return {
    title,
    description,
    keywords: ["live streaming", "fifa world cup 2026", "watch tv online", "free football streaming", setup.sitename.toLowerCase(), "digital tv", "live sports"],
    openGraph: {
      title,
      description,
      images: [
        {
          url: "/seo/streamku.jpg",
          width: 1200,
          height: 630,
          alt: `${setup.sitename} Live Streaming`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/seo/streamku.jpg"],
    },
    icons: {
      icon: setup.favicon_url,
      shortcut: setup.favicon_url,
      apple: setup.favicon_url,
    }
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value || "id";

  const setup = await getSetup();

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <I18nProvider initialLocale={locale}>
          <div className="flex flex-col md:flex-row h-screen bg-[#f5f5f7] overflow-hidden">
            <Navbar setup={setup} />
            <div className="order-1 md:order-2 flex-1 flex flex-col h-full relative overflow-hidden">
              {children}
            </div>
          </div>
        </I18nProvider>
      </body>
    </html>
  );
}
