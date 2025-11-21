
import React, { useState } from 'react';
import { Goal } from '../types';
import { GlassCard } from './GlassCard';
import { ProgressBar } from './ProgressBar';
import { CATEGORIES } from '../constants';
import { Plus, Minus, Check, GripVertical } from 'lucide-react';

interface GoalCardProps {
  goal: Goal;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onOpenDetails: (goal: Goal) => void;
  isDragging?: boolean;
}

export const GoalCard: React.FC<GoalCardProps> = ({ 
  goal, 
  onIncrement, 
  onDecrement, 
  onOpenDetails,
  isDragging 
}) => {
  const category = CATEGORIES.find(c => c.id === goal.category) || CATEGORIES[0];
  const [justCompleted, setJustCompleted] = useState(false);

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (goal.currentCount < goal.targetCount) {
      onIncrement(goal.id);
      if (goal.currentCount + 1 === goal.targetCount) {
        setJustCompleted(true);
        setTimeout(() => setJustCompleted(false), 2000);
      }
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (goal.currentCount > 0) {
      onDecrement(goal.id);
    }
  };

  const isCompleted = goal.currentCount >= goal.targetCount;
  
  const progressColorClass = isCompleted 
    ? 'from-green-400 to-green-600' 
    : category.color;

  return (
    <div className={`relative group transition-transform duration-200 ${isDragging ? 'opacity-50 scale-95' : ''}`}>
       {/* Completion Animation Overlay */}
       {justCompleted && (
        <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center">
           <div className="w-full h-full absolute bg-white/20 rounded-3xl animate-ping"></div>
           <Check className="w-16 h-16 text-green-600 drop-shadow-lg animate-bounce" />
        </div>
      )}

      <GlassCard 
        className={`relative overflow-hidden p-5 ${isCompleted ? 'bg-green-50/40 border-green-200/50' : ''}`}
        onClick={() => onOpenDetails(goal)}
        interactive
      >
        {/* Drag Handle */}
        <div className="absolute right-3 top-3 text-black/10 cursor-grab active:cursor-grabbing">
          <GripVertical size={16} />
        </div>

        {/* Header: Icon + Info */}
        <div className="flex items-start gap-4 mb-4 pr-6">
            <div className={`
                w-14 h-14 rounded-2xl flex-shrink-0 shadow-sm overflow-hidden border border-white/40
                bg-gradient-to-br ${category.color}
                flex items-center justify-center relative
            `}>
                {goal.imageUrl ? (
                <img src={goal.imageUrl} alt={goal.title} className="w-full h-full object-cover" />
                ) : (
                <span className="text-white font-bold text-xl bg-black/10 w-full h-full flex items-center justify-center backdrop-blur-sm">
                    {goal.title.charAt(0)}
                </span>
                )}
                 {isCompleted && (
                    <div className="absolute inset-0 bg-green-500/30 backdrop-blur-sm flex items-center justify-center">
                        <Check className="text-white drop-shadow-md" size={24} />
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0 pt-1">
                <h3 className="font-bold text-slate-800 text-lg leading-tight truncate mb-2">
                    {goal.title}
                </h3>
                <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100/80 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                        {goal.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100/80 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                        {goal.timeframe}
                    </span>
                </div>
            </div>
        </div>

        {/* Middle: Progress Bar Inline with Count */}
        <div className="mb-4 flex items-center gap-3">
             <div className="flex-1">
                <ProgressBar 
                    current={goal.currentCount} 
                    total={goal.targetCount} 
                    colorClass={progressColorClass}
                />
             </div>
             <span className="text-xs font-bold text-slate-400 whitespace-nowrap">
               <span className="text-slate-800 text-sm">{goal.currentCount}</span> / {goal.targetCount}
             </span>
        </div>

        {/* Bottom: Actions (Split Buttons) */}
        <div className="flex items-center gap-3">
             <button 
                onClick={handleDecrement}
                disabled={goal.currentCount === 0}
                className="flex-1 h-10 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:shadow-sm active:scale-95 transition-all flex items-center justify-center disabled:opacity-40 disabled:active:scale-100"
             >
                <Minus size={20} strokeWidth={2.5} />
             </button>

             <button 
                onClick={handleIncrement}
                disabled={isCompleted}
                className={`
                    flex-1 h-10 rounded-xl flex items-center justify-center text-white shadow-md active:scale-95 transition-all
                    ${isCompleted 
                    ? 'bg-green-500 cursor-default shadow-none opacity-50' 
                    : `bg-gradient-to-br ${category.color} shadow-blue-500/10 hover:shadow-blue-500/25`}
                `}
             >
                 {isCompleted ? (
                     <Check size={22} strokeWidth={3} />
                 ) : (
                     <Plus size={24} strokeWidth={3} />
                 )}
             </button>
        </div>
      </GlassCard>
    </div>
  );
};
