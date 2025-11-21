
import React, { useState, useRef } from 'react';
import { Goal } from '../types';
import { GoalCard } from '../components/GoalCard';
import { Crown } from 'lucide-react';

interface HomeProps {
  goals: Goal[];
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onOpenDetails: (goal: Goal) => void;
  onReorder: (goals: Goal[]) => void;
  onUpgrade: () => void;
  isPremium: boolean;
}

export const Home: React.FC<HomeProps> = ({ goals, onIncrement, onDecrement, onOpenDetails, onReorder, onUpgrade, isPremium }) => {
  const activeGoals = goals.filter(g => !g.isArchived);
  const [draggedGoalId, setDraggedGoalId] = useState<string | null>(null);
  const dragOverItem = useRef<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedGoalId(id);
  };

  const handleDragEnter = (e: React.DragEvent, id: string) => {
    dragOverItem.current = id;
  };

  const handleDragEnd = () => {
    if (draggedGoalId && dragOverItem.current && draggedGoalId !== dragOverItem.current) {
      const oldIndex = activeGoals.findIndex(g => g.id === draggedGoalId);
      const newIndex = activeGoals.findIndex(g => g.id === dragOverItem.current);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = [...activeGoals];
        const [movedItem] = newOrder.splice(oldIndex, 1);
        newOrder.splice(newIndex, 0, movedItem);
        
        // Merge with archived items to keep full list intact
        const archived = goals.filter(g => g.isArchived);
        onReorder([...newOrder, ...archived]);
      }
    }
    setDraggedGoalId(null);
    dragOverItem.current = null;
  };

  return (
    <div className="space-y-6 pb-32">
      <header className="flex items-center justify-between sticky top-0 z-30 pt-8 pb-4 px-1 glass-panel border-none bg-white/80 backdrop-blur-xl -mx-4 px-5 rounded-b-3xl">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
          Bonusee
        </h1>
        <div className="flex items-center gap-2">
            {!isPremium && (
                <button 
                  onClick={onUpgrade}
                  className="flex items-center gap-1 bg-amber-100 text-amber-800 px-2.5 py-1.5 rounded-full text-[10px] font-bold hover:bg-amber-200 active:scale-95 transition-all cursor-pointer"
                >
                    <Crown size={12} fill="currentColor" />
                    <span>{activeGoals.length}/3</span>
                </button>
            )}
            <span className="text-sm font-semibold text-slate-500 bg-white/50 px-3 py-1 rounded-full">
            {activeGoals.length} Active
            </span>
        </div>
      </header>

      <div className="space-y-4">
        {activeGoals.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="mb-2">No active goals.</p>
            <p className="text-sm">Tap + to add your first goal.</p>
          </div>
        ) : (
          activeGoals.map((goal) => (
            <div
              key={goal.id}
              draggable
              onDragStart={(e) => handleDragStart(e, goal.id)}
              onDragEnter={(e) => handleDragEnter(e, goal.id)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className="touch-manipulation"
            >
              <GoalCard
                goal={goal}
                onIncrement={onIncrement}
                onDecrement={onDecrement}
                onOpenDetails={onOpenDetails}
                isDragging={draggedGoalId === goal.id}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
