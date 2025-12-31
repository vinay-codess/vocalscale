import type React from 'react';

interface OptionCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  time: string;
  onClick: () => void;
}

const OptionCard: React.FC<OptionCardProps> = ({ icon: Icon, title, description, time, onClick }) => (
  <button 
    onClick={onClick}
    className="flex-1 text-left p-6 border-2 border-gray-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
  >
    <div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center mb-4 text-gray-600 group-hover:text-blue-600 group-hover:border-blue-200">
      <Icon size={24} />
    </div>
    <h3 className="font-bold text-lg text-gray-900 mb-1">{title}</h3>
    <p className="text-sm text-gray-500 mb-3">{description}</p>
    <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded group-hover:bg-blue-200 group-hover:text-blue-800">
      {time}
    </span>
  </button>
);

export default OptionCard;
