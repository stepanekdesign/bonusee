import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  onClick,
  interactive = false 
}) => {
  return (
    <div 
      onClick={onClick}
      className={`
        glass-panel rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]
        transition-all duration-300 border border-white/40
        ${interactive ? 'active:scale-95 hover:shadow-lg cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
