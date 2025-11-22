import React, { useRef, useEffect, useState } from 'react';
import { Clip } from '../types';

interface VideoPlayerProps {
  videoUrl: string;
  activeClip: Clip | null;
  isProcessing: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, activeClip, isProcessing }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Helper to parse MM:SS to seconds
  const parseTime = (timeStr: string) => {
    const [min, sec] = timeStr.split(':').map(Number);
    return min * 60 + sec;
  };

  useEffect(() => {
    if (activeClip && videoRef.current) {
        const startSeconds = parseTime(activeClip.startTime);
        videoRef.current.currentTime = startSeconds;
        videoRef.current.play();
        setIsPlaying(true);
    }
  }, [activeClip]);

  // Stop at end of clip
  const handleTimeUpdate = () => {
      if (videoRef.current && activeClip) {
          const endSeconds = parseTime(activeClip.endTime);
          if (videoRef.current.currentTime >= endSeconds) {
              videoRef.current.pause();
              setIsPlaying(false);
              videoRef.current.currentTime = parseTime(activeClip.startTime); // Loop back to start
          }
      }
  };

  const togglePlay = () => {
      if (videoRef.current) {
          if (isPlaying) {
              videoRef.current.pause();
          } else {
              videoRef.current.play();
          }
          setIsPlaying(!isPlaying);
      }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-black/50 rounded-xl overflow-hidden relative group">
      {/* Phone Frame Mockup */}
      <div className="relative h-[500px] aspect-[9/16] bg-black rounded-[2rem] overflow-hidden shadow-2xl border-[8px] border-darker ring-1 ring-white/10">
        
        {/* Video Element - Using Object-Cover to simulate cropping */}
        <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-cover"
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            loop={false}
            muted={false}
        />

        {/* Captions Overlay Simulation */}
        {activeClip && isPlaying && (
            <div className="absolute bottom-20 left-0 right-0 px-6 text-center">
                <p className="text-white font-black text-xl uppercase drop-shadow-md animate-pulse bg-black/40 rounded-lg py-1">
                    {activeClip.transcriptSummary.substring(0, 20)}...
                </p>
            </div>
        )}

        {/* Play/Pause Overlay */}
        <div 
            onClick={togglePlay}
            className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-200 cursor-pointer ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}
        >
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 text-white">
                {isPlaying ? (
                    <div className="w-4 h-4 bg-white rounded-sm" /> // Stop icon look
                ) : (
                    <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current translate-x-0.5"><path d="M8 5v14l11-7z" /></svg>
                )}
            </div>
        </div>

        {/* UI Overlays for "Shorts" Look */}
        <div className="absolute right-2 bottom-24 flex flex-col gap-4">
             <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md"></div>
             <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md"></div>
             <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md"></div>
        </div>

      </div>

      <div className="mt-6 text-center text-gray-400 text-sm">
        {isProcessing ? "Analyzing video content..." : (activeClip ? `Previewing: ${activeClip.title}` : "Select a clip to preview")}
      </div>
    </div>
  );
};

export default VideoPlayer;