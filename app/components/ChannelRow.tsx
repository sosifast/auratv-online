'use client';

import ChannelCard from './ChannelCard';
import { ChevronRight } from 'lucide-react';

interface RowProps {
  title: string;
  channels: any[];
  icon?: React.ReactNode;
}

export default function ChannelRow({ title, channels, icon }: RowProps) {
  if (channels.length === 0) return null;

  return (
    <div className="space-y-4 mb-12">
      <div className="flex items-center justify-between px-6 md:px-12">
        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 tracking-tight group cursor-pointer">
          {icon}
          {title}
          <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[#0070f3]" />
        </h2>
        <button className="text-xs font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-colors">See All</button>
      </div>
      
      <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 md:px-12 py-2">
        {channels.map((channel) => (
          <ChannelCard key={channel.id} channel={channel} />
        ))}
        {/* Placeholder for "more" card */}
        <div className="flex-shrink-0 w-[100px] flex items-center justify-center text-gray-800 text-6xl font-black">
          +
        </div>
      </div>
    </div>
  );
}
