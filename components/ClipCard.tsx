import React from 'react';
import { Clip } from '../types';
import { PlayIcon, SparklesIcon } from './Icons';

interface ClipCardProps {
  clip: Clip;
  isActive: boolean;
  onClick: () => void;
}

const ClipCard: React.FC<ClipCardProps> = ({ clip, isActive, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        relative p-4 rounded-xl border cursor-pointer transition-all duration-300 group
        ${isActive 
          ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
          : 'bg-surface border-white/5 hover:border-primary/50 hover:bg-surface/80'
        }
      `}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${isActive ? 'bg-primary text-white' : 'bg-white/10 text-gray-400'}`}>
                 <PlayIcon />
            </div>
            <span className="text-xs font-mono text-gray-400">{clip.startTime} - {clip.endTime}</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-secondary/20 to-primary/20 border border-white/10">
            <SparklesIcon />
            <span className="text-xs font-bold text-white">{clip.viralScore}</span>
        </div>
      </div>
      
      <h3 className="text-sm font-semibold text-white mb-2 leading-snug">{clip.title}</h3>
      
      <p className="text-xs text-gray-400 line-clamp-2 mb-3">
        {clip.reasoning}
      </p>

      <div className="flex gap-2 mt-2">
          <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-white/5 text-gray-500 border border-white/5">
              Draft
          </span>
          <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-white/5 text-gray-500 border border-white/5">
              9:16
          </span>
      </div>
    </div>
  );
};

export default ClipCard;