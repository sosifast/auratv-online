'use client';

import React, { useEffect, useRef } from 'react';
import Script from 'next/script';
import adData from '../lib/adstera.json';

export function NativeBanner() {
  return (
    <div className="w-full my-8 flex justify-center">
      <div className="w-full max-w-5xl overflow-hidden">
        <div id={`container-${adData.native.key}`}></div>
        <Script 
          src={adData.native.src} 
          strategy="afterInteractive" 
          data-cfasync="false" 
          async 
        />
      </div>
    </div>
  );
}

export function Popunder() {
  return (
    <Script 
      src={adData.poper.src} 
      strategy="lazyOnload" 
      data-cfasync="false"
    />
  );
}

export function Banner728x90() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const script = document.createElement('script');
      const conf = document.createElement('script');
      conf.innerHTML = `
        atOptions = {
          'key' : '${adData.banner728x90.key}',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
      `;
      script.src = `https://www.highperformanceformat.com/${adData.banner728x90.key}/invoke.js`;
      script.async = true;
      
      containerRef.current.appendChild(conf);
      containerRef.current.appendChild(script);
    }
  }, []);

  return (
    <div className="w-full flex justify-center my-4 overflow-hidden min-h-[90px]">
      <div ref={containerRef} className="max-w-full overflow-x-auto scroller-hide"></div>
    </div>
  );
}

export function Banner300x250() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const script = document.createElement('script');
      const conf = document.createElement('script');
      conf.innerHTML = `
        atOptions = {
          'key' : '${adData.banner300x250.key}',
          'format' : 'iframe',
          'height' : 250,
          'width' : 300,
          'params' : {}
        };
      `;
      script.src = `https://www.highperformanceformat.com/${adData.banner300x250.key}/invoke.js`;
      script.async = true;

      containerRef.current.appendChild(conf);
      containerRef.current.appendChild(script);
    }
  }, []);

  return (
    <div className="flex justify-center my-4 overflow-hidden min-h-[250px]">
      <div ref={containerRef}></div>
    </div>
  );
}
