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
      // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode. 
      const videoElement = document.createElement("video-js");

      videoElement.classList.add('vjs-big-play-centered');
      videoElement.setAttribute('crossorigin', 'anonymous');
      videoRef.current?.appendChild(videoElement);

      const player = playerRef.current = videojs(videoElement, {
        ...options,
        html5: {
          vhs: {
            withCredentials: false
          }
        }
      }, () => {
        console.log('Video.js player is ready');
        onReady && onReady(player);
      });

      // Error handling
      player.on('error', () => {
        const error = player.error();
        console.error('VideoJS Error:', error.code, error.message);
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
    <div data-vjs-player className="w-full relative">
      <div ref={videoRef} className="rounded-[2rem] overflow-hidden shadow-2xl" />
      <style jsx global>{`
        .video-js {
          background-color: #000;
          border-radius: 2rem;
        }
        .vjs-big-play-button {
          background-color: rgba(37, 99, 235, 0.8) !important;
          border: none !important;
          border-radius: 50% !important;
          width: 80px !important;
          height: 80px !important;
          line-height: 80px !important;
          margin-top: -40px !important;
          margin-left: -40px !important;
        }
        .vjs-control-bar {
          background-color: rgba(0, 0, 0, 0.5) !important;
          backdrop-filter: blur(10px);
          border-bottom-left-radius: 2rem;
          border-bottom-right-radius: 2rem;
          padding: 0 10px;
        }
      `}</style>
    </div>
  );
}

export default VideoPlayer;
