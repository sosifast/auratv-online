import React from 'react';
import StreamPlayer from '../components/StreamPlayer';
import { getStreams, getStreamBySlug, getCategories } from '../lib/data';
import { 
  Share2, 
  Info, 
  ChevronLeft, 
  Heart, 
  MessageCircle, 
  PlayCircle
} from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { getDictionary } from '../lib/dictionary';
import { Banner728x90, Banner300x250 } from '../components/Ads';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const channel = await getStreamBySlug(resolvedParams.slug);

  if (!channel) return { title: 'Saluran Tidak Ditemukan' };

  return {
    title: channel.seo_title || `${channel.name} - VisionPro`,
    description: channel.desc_title || `Saksikan siaran langsung ${channel.name} kualitas HD di VisionPro.`,
    openGraph: {
      images: [channel.image_url],
    },
  };
}

export default async function WatchPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value || "id";
  const dict = getDictionary(locale);
  
  const [channel, streams, categories] = await Promise.all([
    getStreamBySlug(slug),
    getStreams(),
    getCategories()
  ]);

  if (!channel) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6 pb-24">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{dict.common.browse}</h1>
        <p className="text-gray-500 mb-8 font-medium">Maaf, siaran yang Anda cari sedang tidak aktif.</p>
        <Link href="/" className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-blue-200">{dict.common.home}</Link>
      </div>
    );
  }

  const otherChannels = streams.filter((s: any) => s.slug !== slug).slice(0, 4);
  const category = categories.find((c: any) => c.id === channel.id_category);

  return (
    <div className="flex flex-col h-full relative overflow-hidden animate-fade-in">
      <main className="flex-1 overflow-y-auto px-6 md:px-12 pb-24 pt-8 scrollbar-hide">
        

        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-8 transition-all font-semibold">
          <ChevronLeft className="w-5 h-5" />
          <span>{dict.common.back}</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <StreamPlayer 
              channel={channel} 
              labels={{ select_server: dict.common.select_server || 'Pilih Server Streaming' }} 
            />
            
            <Banner728x90 />
            
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8 mb-8">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 bg-gray-50 rounded-[1.5rem] p-4 border border-gray-100 flex items-center justify-center">
                    <img src={channel.image_url} alt={channel.name} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-none mb-3 line-clamp-1">{channel.name}</h1>
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 bg-red-500 text-white rounded-lg text-[10px] font-bold tracking-wide uppercase">{dict.common.live}</span>
                      <span className="text-blue-600 text-xs font-bold uppercase tracking-wider">{category?.name || 'General'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 bg-gray-50 text-gray-700 px-5 py-4 rounded-2xl hover:bg-gray-100 transition-all font-black text-sm shadow-sm border border-gray-100">
                    <Share2 className="w-5 h-5" />
                    <span className="hidden md:inline">Bagikan</span>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <PlayCircle className="w-6 h-6 text-blue-600" /> {dict.common.similar}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {streams
                    .filter((s: any) => s.id_category === channel.id_category && s.slug !== channel.slug)
                    .slice(0, 3)
                    .map((similar: any) => (
                      <Link key={similar.id} href={`/${similar.slug}`} className="group bg-gray-50 rounded-2xl p-3 border border-gray-100 hover:border-blue-100 hover:bg-white transition-all flex flex-col gap-3">
                        <div className="aspect-video w-full rounded-xl overflow-hidden bg-white flex items-center justify-center p-4">
                          <img src={similar.image_url} alt={similar.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                        </div>
                        <p className="font-bold text-gray-900 text-xs line-clamp-1 group-hover:text-blue-600 px-1 uppercase tracking-tight">{similar.name}</p>
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <Banner300x250 />

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">{dict.common.up_next || 'Up Next'}</h3>
              <div className="flex flex-col gap-4">
                {otherChannels.map((c: any) => (
                  <Link key={c.id} href={`/${c.slug}`} className="flex items-center gap-4 p-3 bg-white rounded-2xl border border-gray-50 hover:border-blue-200 hover:shadow-sm transition-all group">
                    <div className="w-20 h-14 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                      <img src={c.image_url} alt={c.name} className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{c.name}</h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{categories.find((cat: any) => cat.id === c.id_category)?.name || 'General'}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
