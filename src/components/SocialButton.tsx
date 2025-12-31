import React from 'react';
import { cn } from '../lib/utils';

interface SocialProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  text: string;
}

const SocialButton: React.FC<SocialProps> = ({ icon, text, className, ...props }) => (
  <button 
    className={cn(
      "flex-1 flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2.5 hover:bg-gray-50 active:bg-gray-100 active:scale-[0.98] transition-all duration-200 text-sm font-medium text-gray-700",
      className
    )}
    {...props}
  >
    {icon}
    {text}
  </button>
);

export default SocialButton;
