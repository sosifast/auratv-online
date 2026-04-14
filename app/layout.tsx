import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import Navbar from "./components/Navbar";
import { I18nProvider } from "./components/I18nProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VisionPro - Platform Live Streaming TV Terlengkap",
  description: "Nonton TV online, siaran olahraga, dan film premium kualitas HD gratis.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value || "id";

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <I18nProvider initialLocale={locale}>
          <div className="flex flex-col md:flex-row h-screen bg-[#f5f5f7] overflow-hidden">
            <Navbar />
            <div className="order-1 md:order-2 flex-1 flex flex-col h-full relative overflow-hidden">
              {children}
            </div>
          </div>
        </I18nProvider>
      </body>
    </html>
  );
}
