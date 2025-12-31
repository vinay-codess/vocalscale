import React, { useState, useEffect } from 'react';

export const AudioVisualizer: React.FC<{ isPlaying?: boolean }> = ({ isPlaying }) => {
  // Generate random heights for the fake waveform bars
  const [bars, setBars] = useState<number[]>([]);

  useEffect(() => {
    // Use timeout to avoid synchronous state update warning
    const timer = setTimeout(() => {
      setBars(Array.from({ length: 40 }, () => Math.floor(Math.random() * 40) + 10));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center justify-center gap-[2px] h-16 w-full max-w-xs mx-auto overflow-hidden">
      {bars.map((height, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-full ${i % 2 === 0 ? 'bg-blue-500' : 'bg-blue-300'} ${isPlaying ? 'animate-pulse' : ''}`}
          style={{ 
            height: `${height}%`,
            opacity: i < 10 || i > 30 ? 0.5 : 1 // Fade edges
          }}
        />
      ))}
    </div>
  );
};
