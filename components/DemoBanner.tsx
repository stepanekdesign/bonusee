
import React, { useState, useEffect } from 'react';
import { X, Info, Database } from 'lucide-react';

export const DemoBanner = () => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-4 py-3 relative shadow-md z-[60]">
      <div className="max-w-md mx-auto flex items-center gap-3">
        <div className="p-1.5 bg-white/10 rounded-full shrink-0 animate-pulse">
            <Database size={14} className="text-blue-300" />
        </div>
        <p className="text-xs font-medium leading-tight flex-1 text-slate-200">
          <span className="font-bold text-white">Demo Mode:</span> Data is saved locally on your device. Sign up & login works for testing.
        </p>
        <button 
          onClick={() => setVisible(false)} 
          className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
