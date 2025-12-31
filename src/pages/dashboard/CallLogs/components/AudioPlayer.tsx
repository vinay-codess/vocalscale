import React, { useState } from 'react';
import { Play, Pause } from 'lucide-react';

interface AudioPlayerProps {
  duration: number; // in seconds
  src?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ duration, src }) => {
  const [playing, setPlaying] = useState(false);

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate stable waveform once on mount
  const [waveform] = useState(() => {
    return [...Array(60)].map(() => Math.max(20, Math.random() * 100));
  });

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
      <button 
        onClick={() => {
           setPlaying(!playing);
           if (src) console.log('Playing:', src);
        }}
        className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
      >
        {playing ? (
          <Pause size={20} fill="currentColor" />
        ) : (
          <Play size={20} fill="currentColor" className="ml-1" />
        )}
      </button>
      
      <span className="text-xs font-mono text-gray-500">
        {playing ? "0:12" : "0:00"}
      </span>
      
      <div className="flex-1 flex items-center gap-1 h-8">
        {waveform.map((height, i) => (
           <div 
             key={i} 
             className={`w-1 rounded-full ${playing && i < 15 ? 'bg-blue-600' : 'bg-blue-200'}`} 
             style={{ height: `${height}%` }}
           ></div>
        ))}
      </div>
      
      <span className="text-xs font-mono text-gray-500">
        {formatTime(duration)}
      </span>
    </div>
  );
};

export default AudioPlayer;
