'use client';

import Link from 'next/link';
import { Play, Eye, Flame } from 'lucide-react';

interface Channel {
  id: number;
  slug: string;
  name: string;
  logo: string;
  category: string;
}

export default function ChannelCard({ channel }: { channel: Channel }) {
  // Generate a random viewer count for simulation
  const viewers = Math.floor(Math.random() * 5000) + 1000;

  return (
    <Link 
      href={`/${channel.slug}`} 
      className="group relative flex-shrink-0 w-[240px] md:w-[320px] aspect-video rounded-xl overflow-hidden glass-card"
    >
      <div className="absolute inset-0 bg-gray-900 animate-pulse group-hover:hidden -z-10"></div>
      <img 
        src={channel.logo} 
        alt={channel.name} 
        className="w-full h-full object-contain p-6 scale-90 group-hover:scale-110 transition-transform duration-500"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-100 p-4 flex flex-col justify-end">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex items-center gap-1 bg-red-600 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse-red"></div>
            Live
          </div>
          <div className="flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded text-[9px] font-bold text-gray-300">
             <Eye className="w-2.5 h-2.5" />
             {viewers.toLocaleString()}
          </div>
        </div>
        
        <h3 className="text-white font-bold text-sm md:text-base group-hover:text-[#0070f3] transition-colors line-clamp-1">{channel.name}</h3>
        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest leading-none mt-1">{channel.category}</p>
        
        {/* Play Button Icon on Hover */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0070f3] p-4 rounded-full shadow-2xl">
          <Play className="w-6 h-6 fill-white text-white" />
        </div>
      </div>
    </Link>
  );
}
