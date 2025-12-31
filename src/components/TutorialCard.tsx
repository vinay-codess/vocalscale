import React from 'react';
import { PlayCircle } from 'lucide-react';

interface TutorialCardProps {
  title: string;
  duration: string;
  thumbnailUrl?: string; // Optional custom thumbnail
  onClick?: () => void;
}

const TutorialCard: React.FC<TutorialCardProps> = ({ title, duration, thumbnailUrl, onClick }) => {
  return (
    <div 
      className="group cursor-pointer flex flex-col gap-3"
      onClick={onClick}
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-100">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <PlayCircle className="text-blue-500 w-12 h-12 opacity-80 group-hover:scale-110 transition-transform" />
          </div>
        )}
        
        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md font-medium">
          {duration}
        </div>
        
        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
      </div>

      {/* Content */}
      <div>
        <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
          {title}
        </h4>
      </div>
    </div>
  );
};

export default TutorialCard;
