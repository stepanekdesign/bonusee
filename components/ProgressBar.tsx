
import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  colorClass?: string; // Can be a bg-color or a bg-gradient
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, colorClass }) => {
  const percentage = Math.min(Math.max((current / total) * 100, 0), 100);

  // Default to blue if no class provided
  const fillClass = colorClass || 'bg-blue-500';

  return (
    <div className="h-3 w-full bg-black/5 rounded-full overflow-hidden backdrop-blur-sm border border-white/20">
      <div 
        className={`h-full ${fillClass} bg-gradient-to-r transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1) shadow-[0_0_10px_rgba(255,255,255,0.5)]`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
