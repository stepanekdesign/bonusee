
import React from 'react';
import { GlassCard } from './GlassCard';
import { X, Crown, Star, Zap, Infinity as InfinityIcon, BarChart3 } from 'lucide-react';

interface UpgradeViewProps {
  onClose: () => void;
  onSubscribe: () => void;
}

export const UpgradeView: React.FC<UpgradeViewProps> = ({ onClose, onSubscribe }) => {
  const features = [
    { icon: InfinityIcon, title: 'Unlimited Goals', desc: 'Track as many habits as you want' },
    { icon: Zap, title: 'AI Generation', desc: 'Unlimited AI icon generation' },
    { icon: BarChart3, title: 'Advanced Analytics', desc: 'Deep dive into your progress' },
    { icon: Star, title: 'Custom Themes', desc: 'Unlock exclusive glass themes' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-xl" onClick={onClose}></div>
      
      <div className="w-full max-w-sm relative animate-slide-up">
        <div className="absolute -top-20 left-0 right-0 flex justify-center pointer-events-none">
            <div className="w-64 h-64 bg-gradient-to-b from-amber-300/40 to-orange-400/40 rounded-full blur-3xl"></div>
        </div>

        <GlassCard className="bg-white/80 backdrop-blur-2xl border-white/60 shadow-2xl relative overflow-hidden max-h-[85vh] overflow-y-auto no-scrollbar">
           <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full hover:bg-black/5 transition-colors z-20 text-slate-500">
             <X size={20} />
           </button>

           {/* Hero Section - Compacted */}
           <div className="text-center pt-2 pb-4 relative z-10">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-amber-300 to-orange-500 rounded-2xl shadow-lg flex items-center justify-center mb-3 rotate-3">
                 <Crown size={32} className="text-white drop-shadow-md" fill="currentColor" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Bonusee <span className="text-amber-500">Pro</span></h2>
              <p className="text-slate-500 text-sm font-medium px-6">Unlock the full potential.</p>
           </div>

           {/* Features - Compacted */}
           <div className="space-y-2 mb-5">
              {features.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/50 transition-colors">
                      <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                          <f.icon size={18} />
                      </div>
                      <div>
                          <h3 className="font-bold text-slate-800 text-sm leading-tight">{f.title}</h3>
                          <p className="text-[11px] text-slate-500 leading-tight">{f.desc}</p>
                      </div>
                  </div>
              ))}
           </div>

           {/* Pricing & Action - Compacted */}
           <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center space-y-3">
               <div>
                   <span className="text-2xl font-bold text-slate-900">$1.99</span>
                   <span className="text-slate-400 text-sm font-medium"> / month</span>
               </div>
               <button 
                 onClick={onSubscribe}
                 className="w-full py-3 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
               >
                   Upgrade Now <Zap size={16} fill="currentColor" />
               </button>
               <p className="text-[10px] text-slate-400">
                   Secure payment via App Store. Cancel anytime.
               </p>
           </div>
        </GlassCard>
      </div>
    </div>
  );
};
