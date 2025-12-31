import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export const Button = ({ children, className, ...props }: ButtonProps) => {
  return (
    <button
      className={cn("bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors", className)}
      {...props}
    >
      {children}
    </button>
  );
};
