'use client';

import React, { useState, useEffect } from 'react';
import VideoPlayer from './VideoPlayer';
import { Server, ChevronDown, Check } from 'lucide-react';

interface StreamPlayerProps {
  channel: any;
  labels?: {
    select_server: string;
  };
}

interface StreamServer {
  id: string;
  name: string;
  url: string;
}

export default function StreamPlayer({ channel, labels }: StreamPlayerProps) {
  const [servers, setServers] = useState<StreamServer[]>([]);
  const [activeServer, setActiveServer] = useState<StreamServer | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const extractedServers: StreamServer[] = [];
    
    // 1. Check for standard keys
    if (channel.url_stream) {
      extractedServers.push({ id: "1", name: "Server 1", url: channel.url_stream });
    } else if (channel.url) {
      extractedServers.push({ id: "1", name: "Server 1", url: channel.url });
    }

    // 2. Check for url_stream_X keys
    Object.keys(channel).forEach((key) => {
      if (key.startsWith('url_stream_')) {
        const num = key.split('_').pop() || "0";
        const url = channel[key];
        
        // Skip if this URL is already the same as Server 1 to avoid duplicates
        if (extractedServers.length > 0 && extractedServers[0].url === url) return;

        extractedServers.push({
          id: num,
          name: `Server ${num}`,
          url: url
        });
      }
    });

    // Remove potential duplicates by URL
    const uniqueServers = Array.from(new Map(extractedServers.map(s => [s.url, s])).values());
    uniqueServers.sort((a, b) => parseInt(a.id) - parseInt(b.id));

    setServers(uniqueServers);
    if (uniqueServers.length > 0) {
      setActiveServer(uniqueServers[0]);
    }
  }, [channel]);

  if (!activeServer) return null;

  const videoJsOptions = {
    autoplay: true,
    controls: true,
    responsive: true,
    fluid: true,
    preload: 'auto',
    sources: [{
      src: activeServer.url,
      type: 'application/x-mpegURL'
    }]
  };

  return (
    <div className="space-y-6">
      {/* Player Display */}
      <div className="rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue-900/10 bg-black border-4 border-white/50 relative">
        <VideoPlayer options={videoJsOptions} key={activeServer.url} />
      </div>

      {/* Server Selector Dropdown (Shown if servers > 1) */}
      {servers.length > 1 && (
        <div className="relative">
          <label className="flex items-center gap-2 mb-3 px-1 text-gray-500 font-bold text-[10px] uppercase tracking-widest">
            <Server size={14} className="text-blue-600" />
            {labels?.select_server || 'Pilih Server Streaming'}
          </label>
          
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="w-full md:w-80 flex items-center justify-between px-6 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-blue-200 transition-all font-bold text-sm text-gray-900 focus:ring-4 focus:ring-blue-50"
          >
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              {activeServer.name}
            </div>
            <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <div className="absolute top-full left-0 mt-3 w-full md:w-80 bg-white rounded-[1.5rem] border border-gray-100 shadow-2xl z-[999] py-3 animate-in fade-in slide-in-from-top-2 duration-300">
              {servers.map((server) => (
                <button
                  key={server.url}
                  onClick={() => {
                    setActiveServer(server);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-6 py-4 text-sm font-bold transition-colors ${
                    activeServer.id === server.id 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex flex-col items-start gap-0.5">
                    <span>{server.name}</span>
                  </div>
                  {activeServer.id === server.id && <Check size={16} className="text-blue-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
