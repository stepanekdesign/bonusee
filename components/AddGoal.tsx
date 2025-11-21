
import React, { useState, useRef } from 'react';
import { CategoryType, Timeframe, Goal } from '../types';
import { CATEGORIES } from '../constants';
import { GlassCard } from './GlassCard';
import { 
  X, Sparkles, Image as ImageIcon, Upload, ChevronRight, Check,
  CreditCard, ShoppingBasket, Utensils, Plane, Activity, ShoppingBag, Link as LinkIcon, AlignLeft, Hash, Repeat
} from 'lucide-react';
import { generateGoalImage } from '../services/gemini';

interface AddGoalProps {
  onSave: (goal: Omit<Goal, 'id' | 'createdAt' | 'lastUpdated' | 'currentCount' | 'isArchived'>) => void;
  onCancel: () => void;
}

// Map icon strings to components
const ICON_MAP: Record<string, React.ElementType> = {
  'CreditCard': CreditCard,
  'ShoppingBasket': ShoppingBasket,
  'Utensils': Utensils,
  'Plane': Plane,
  'Activity': Activity,
  'ShoppingBag': ShoppingBag,
  'Sparkles': Sparkles
};

export const AddGoal: React.FC<AddGoalProps> = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [targetCount, setTargetCount] = useState<number>(1);
  const [timeframe, setTimeframe] = useState<Timeframe>(Timeframe.Monthly);
  const [category, setCategory] = useState<CategoryType>(CategoryType.Finance);
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [isRecurring, setIsRecurring] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);

  // Drag to scroll refs
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false); // For UI feedback
  const isDraggingRef = useRef(false); // For Logic (synchronous)
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const isDown = useRef(false);

  const handleGenerateImage = async () => {
    if (!title && !description) return;
    setIsGenerating(true);
    const prompt = `Icon for: ${title}. ${description}`;
    const result = await generateGoalImage(prompt);
    if (result) {
      setImagePreview(result);
    }
    setIsGenerating(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!title || targetCount < 1) return;
    onSave({
      title,
      targetCount,
      timeframe,
      category,
      description,
      link,
      isRecurring,
      imageUrl: imagePreview
    });
  };

  // Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDown.current = true;
    isDraggingRef.current = false; // Reset logic ref
    setIsDragging(false); // Reset UI state
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    isDown.current = false;
    setIsDragging(false);
    isDraggingRef.current = false;
  };

  const handleMouseUp = () => {
    isDown.current = false;
    // Delay state reset slightly to prevent UI flicker, but ref is what matters for click logic
    setTimeout(() => {
        setIsDragging(false);
        isDraggingRef.current = false;
    }, 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    
    // Only consider it a drag if moved more than 5px to prevent blocking clicks
    if (Math.abs(walk) > 5) {
        if (!isDraggingRef.current) {
            isDraggingRef.current = true;
            setIsDragging(true);
        }
        scrollRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  // Category Card Component
  const CategoryOption = ({ cat }: { cat: typeof CATEGORIES[0] }) => {
    const Icon = ICON_MAP[cat.icon] || Sparkles;
    const isSelected = category === cat.id;
    
    return (
      <button
        type="button"
        onClick={() => {
            // Use the Ref for immediate synchronous check
            if (!isDraggingRef.current) {
                setCategory(cat.id);
            }
        }}
        className={`
          flex flex-col items-center justify-center min-w-[72px] gap-2 transition-all duration-300 group
          ${isSelected ? 'scale-110 z-10' : 'opacity-70 hover:opacity-100'}
          ${isDragging ? 'pointer-events-none cursor-grabbing' : 'cursor-pointer'} 
        `}
      >
        <div className={`
          w-14 h-14 rounded-full flex items-center justify-center shadow-sm transition-all duration-300
          ${isSelected ? `bg-gradient-to-br ${cat.color} shadow-lg ring-4 ring-white` : 'bg-white border border-slate-100'}
        `}>
          <Icon 
            size={24} 
            className={`transition-colors ${isSelected ? 'text-white' : 'text-slate-500'}`} 
            strokeWidth={isSelected ? 2.5 : 2}
          />
        </div>
        <span className={`text-[10px] font-bold tracking-wide transition-colors ${isSelected ? 'text-slate-800' : 'text-slate-400'}`}>
          {cat.name}
        </span>
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-50/95 backdrop-blur-xl animate-slide-up overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 bg-white/40 border-b border-white/20 backdrop-blur-md z-20">
        <button onClick={onCancel} className="p-2 -ml-2 rounded-full hover:bg-black/5 text-slate-600 transition-colors">
          <X size={24} />
        </button>
        <h2 className="text-lg font-bold text-slate-800">New Goal</h2>
        <button 
          onClick={handleSave}
          disabled={!title}
          className="text-blue-600 font-bold disabled:opacity-40 text-sm px-2 py-1 rounded-lg hover:bg-blue-50 transition-all"
        >
          Save
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="p-6 pb-40 space-y-8">
        
          {/* Image Section */}
          <div className="flex flex-col items-center gap-5 mt-2">
            <div className="relative w-32 h-32 rounded-[2.5rem] bg-white shadow-lg border border-slate-100 flex items-center justify-center overflow-hidden group">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-300">
                    <ImageIcon size={36} strokeWidth={1.5} />
                </div>
              )}
              {isGenerating && (
                 <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-10">
                   <Sparkles className="text-white animate-spin" size={32} />
                 </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <label className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-2xl text-xs font-bold text-slate-600 shadow-sm border border-slate-200 cursor-pointer hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all">
                <Upload size={14} />
                Upload
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </label>
              <button 
                type="button"
                onClick={handleGenerateImage}
                disabled={(!title && !description) || isGenerating}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-2xl text-xs font-bold shadow-sm hover:bg-indigo-100 disabled:opacity-50 active:scale-95 transition-all"
              >
                <Sparkles size={14} />
                AI Generate
              </button>
            </div>
          </div>

          {/* Category Horizontal Scroll (Draggable) */}
          <section className="-mx-6">
            <div className="px-6 flex justify-between items-baseline mb-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category</label>
            </div>
            <div 
              ref={scrollRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              className="flex overflow-x-auto px-6 gap-2 py-5 no-scrollbar mask-linear-gradient cursor-grab active:cursor-grabbing"
            >
              {CATEGORIES.map(cat => <CategoryOption key={cat.id} cat={cat} />)}
            </div>
          </section>

          {/* Form Fields */}
          <div className="space-y-5">
            <GlassCard className="space-y-6 bg-white/70 shadow-md p-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Goal Name</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Moneta Savings 2.9%"
                  className="w-full bg-white/50 border border-slate-200 rounded-2xl py-3.5 px-4 text-lg font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1">
                         <Hash size={12} /> Target
                    </label>
                    <div className="relative">
                        <input 
                        type="number" 
                        min="1"
                        value={targetCount}
                        onChange={(e) => setTargetCount(parseInt(e.target.value) || 1)}
                        className="w-full bg-white/50 border border-slate-200 rounded-2xl py-3 px-4 text-lg font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Frequency</label>
                    <div className="relative">
                        <select 
                            value={timeframe}
                            onChange={(e) => setTimeframe(e.target.value as Timeframe)}
                            className="w-full bg-white/50 border border-slate-200 rounded-2xl py-3.5 px-4 text-base font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none transition-all"
                        >
                            {Object.values(Timeframe).map(t => (
                            <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <ChevronRight size={16} className="rotate-90" />
                        </div>
                    </div>
                 </div>
              </div>
            </GlassCard>

            <GlassCard className="bg-white/70 shadow-md p-1">
                <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/40 rounded-2xl transition-colors">
                    <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl ${isRecurring ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'} transition-colors`}>
                            <Repeat size={20} />
                        </div>
                        <div>
                            <span className="text-slate-800 font-bold text-sm block">Recurring Goal</span>
                            <span className="text-slate-500 text-xs font-medium">Reset count every {timeframe.toLowerCase()}</span>
                        </div>
                    </div>
                    
                    <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="sr-only peer" />
                        <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-500 shadow-inner transition-colors duration-300"></div>
                    </div>
                </label>
            </GlassCard>

            <GlassCard className="space-y-5 bg-white/70 shadow-md p-6">
               <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1">
                     <AlignLeft size={12} /> Description
                </label>
                <textarea 
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add details about requirements..."
                  className="w-full bg-white/50 border border-slate-200 rounded-2xl py-3 px-4 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none font-medium transition-all"
                />
              </div>
               <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1">
                    <LinkIcon size={12} /> External Link
                </label>
                <input 
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-white/50 border border-slate-200 rounded-2xl py-3 px-4 text-sm text-blue-600 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium transition-all"
                />
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Big Floating Save Button */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none z-30">
        <button 
          onClick={handleSave}
          disabled={!title}
          className={`
            pointer-events-auto
            bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-500/30
            flex items-center gap-3 px-10 py-4 rounded-[2rem] border-[3px] border-white/30 backdrop-blur-md
            transform transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
            ${!title ? 'translate-y-32 opacity-0' : 'translate-y-0 opacity-100'}
            hover:scale-105 active:scale-95 hover:shadow-blue-500/50
          `}
        >
          <span className="text-lg font-bold tracking-wide">Save Goal</span>
          <div className="bg-white/20 rounded-full p-1">
            <Check size={20} strokeWidth={3} />
          </div>
        </button>
      </div>

    </div>
  );
};
