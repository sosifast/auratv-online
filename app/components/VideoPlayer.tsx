'use client';

import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

interface VideoPlayerProps {
  options: any;
  onReady?: (player: any) => void;
}

export const VideoPlayer = (props: VideoPlayerProps) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const { options, onReady } = props;

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      if (!videoRef.current) return;

      const videoElement = document.createElement("video-js");
      videoElement.classList.add('vjs-big-play-centered');
      videoElement.setAttribute('crossorigin', 'anonymous');
      videoRef.current.appendChild(videoElement);

      // Advanced options for better HLS support across browsers
      const playerOptions = {
        ...options,
        html5: {
          vhs: {
            overrideNative: true, // Force Video.js to handle HLS even if browser supports it (more consistent)
            withCredentials: false
          },
          nativeVideoTracks: false,
          nativeAudioTracks: false,
          nativeTextTracks: false
        }
      };

      const player = playerRef.current = videojs(videoElement, playerOptions, () => {
        console.log('Video.js player is ready');
        onReady && onReady(player);
      });

      // Error handling with more detail
      player.on('error', () => {
        const error = player.error();
        if (error) {
          console.error('VideoJS Error Code:', error.code);
          console.error('VideoJS Error Message:', error.message);
        }
      });

      // Automatic retry logic on source error
      player.on('stalled', () => {
        console.warn('Playback stalled, attempting to recover...');
      });

    } else {
      const player = playerRef.current;
      player.autoplay(options.autoplay);
      player.src(options.sources);
    }
  }, [options, videoRef]);

  // Dispose the player on unmount
  useEffect(() => {
    const player = playerRef.current;
    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return (
    <div data-vjs-player className="w-full relative group">
      <div ref={videoRef} className="rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500 ring-1 ring-white/10" />
      
      <style jsx global>{`
        .video-js {
          width: 100%;
          height: auto;
          aspect-ratio: 16/9;
          background-color: #000;
          border-radius: 2.5rem;
          overflow: hidden;
        }
        .video-js .vjs-tech {
          object-fit: contain;
        }
        .vjs-big-play-button {
          background-color: rgba(37, 99, 235, 0.9) !important;
          border: none !important;
          border-radius: 50% !important;
          width: 90px !important;
          height: 90px !important;
          line-height: 90px !important;
          margin-top: -45px !important;
          margin-left: -45px !important;
          box-shadow: 0 0 30px rgba(37, 99, 235, 0.4) !important;
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
        }
        .video-js:hover .vjs-big-play-button {
          transform: scale(1.1);
        }
        .vjs-control-bar {
          background: linear-gradient(to top, rgba(0,0,0,0.8), transparent) !important;
          height: 60px !important;
          padding: 0 15px !important;
          border-bottom-left-radius: 2.5rem;
          border-bottom-right-radius: 2.5rem;
        }
        .vjs-slider {
          background-color: rgba(255,255,255,0.2) !important;
        }
        .vjs-play-progress {
          background-color: #2563eb !important;
        }
      `}</style>
    </div>
  );
}

export default VideoPlayer;
