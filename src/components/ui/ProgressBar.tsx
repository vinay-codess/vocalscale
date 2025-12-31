import type React from 'react';

interface ProgressBarProps {
  step: number;
  totalSteps: number;
  title: string;
  progress: number; // 0 to 100
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ step, totalSteps, title, progress }) => {
  return (
    <div className="w-full max-w-5xl mx-auto mb-6">
      <div className="flex justify-between items-end mb-2">
        <h2 className="text-lg font-semibold text-gray-900">
          Step {step} of {totalSteps}: {title}
        </h2>
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {progress}% Complete
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
        <div 
          className="bg-blue-600 h-1.5 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};
