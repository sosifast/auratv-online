'use client';

import React, { useState } from 'react';
import { Heart, Copy, Check, ExternalLink, QrCode } from 'lucide-react';

interface DonationMethod {
  id: string;
  name: string;
  image_icon: string;
  image_qr_url?: string;
  account?: string;
  network?: string;
  link?: string;
}

export default function DonationClient({ donationData, dict }: { donationData: DonationMethod[], dict: any }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedQR, setSelectedQR] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const donationTitle = dict.common.donation_title || 'Support AuraTV';

  return (
    <div className="h-full overflow-y-auto bg-[#f8fafc] py-16 px-4 sm:px-6 lg:px-8 font-sans selection:bg-blue-100 selection:text-blue-900 scroll-smooth">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100 rounded-full blur-[100px] opacity-50"></div>
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-purple-100 rounded-full blur-[80px] opacity-40"></div>
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center p-3 bg-red-100 rounded-2xl mb-6 shadow-sm">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            {donationTitle.split(' ')[0]} <span className="text-blue-600">{donationTitle.split(' ').slice(1).join(' ')}</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {dict.common.donation_desc || 'Your support helps us keep the stream alive.'}
          </p>
        </div>

        {/* Donation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {donationData.map((method, index) => (
            <div 
              key={method.id + index}
              className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-6 flex flex-col hover:translate-y-[-4px] transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-2 shadow-inner border border-slate-50">
                    <img 
                      src={method.image_icon} 
                      alt={method.name} 
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{method.name}</h3>
                    {method.network && (
                      <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                        {method.network}
                      </span>
                    )}
                  </div>
                </div>
                {method.image_qr_url && (
                  <button 
                    onClick={() => setSelectedQR(selectedQR === `${method.id}-${index}` ? null : `${method.id}-${index}`)}
                    className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-blue-600"
                  >
                    <QrCode className="w-6 h-6" />
                  </button>
                )}
              </div>

              {selectedQR === `${method.id}-${index}` && method.image_qr_url && (
                <div className="mb-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-inner flex flex-col items-center animate-fade-in">
                  <img 
                    src={method.image_qr_url} 
                    alt={`${method.name} QR Code`} 
                    className="w-48 h-48 rounded-lg mb-2"
                  />
                  <span className="text-xs text-slate-400">{dict.common.scan_qr}</span>
                </div>
              )}

              <div className="mt-auto">
                {method.account && (
                  <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-4 border border-slate-100 group">
                    <div className="flex flex-col truncate mr-2">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{dict.common.account_address}</span>
                      <span className="text-sm font-medium text-slate-700 truncate">{method.account}</span>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(method.account!, method.id + index)}
                      className="shrink-0 p-2 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 hover:text-blue-600 transition-all active:scale-95"
                    >
                      {copiedId === method.id + index ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                )}
                
                {method.link && (
                  <a 
                    href={method.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
                  >
                    <span>{dict.common.donate_with} {method.name}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
