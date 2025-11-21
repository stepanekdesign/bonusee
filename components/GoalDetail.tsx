
import React, { useState } from 'react';
import { Goal, Timeframe, CategoryType } from '../types';
import { CATEGORIES } from '../constants';
import { GlassCard } from './GlassCard';
import { 
  ChevronLeft, Trash2, ExternalLink, Save, Calendar, CheckCircle2, 
  Upload, Sparkles, ChevronDown, AlignLeft, Link as LinkIcon, 
  Hash, Repeat, Check
} from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import { generateGoalImage } from '../services/gemini';

interface GoalDetailProps {
  goal: Goal;
  onClose: () => void;
  onUpdate: (updatedGoal: Goal) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
}

export const GoalDetail: React.FC<GoalDetailProps> = ({ goal, onClose, onUpdate, onDelete, onArchive }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedGoal, setEditedGoal] = useState<Goal>(goal);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSave = () => {
    if (!editedGoal.title || editedGoal.targetCount < 1) return;
    onUpdate(editedGoal);
    onClose(); // Redirect back to home/previous screen by closing the modal
  };

  const handleChange = (field: keyof Goal, value: any) => {
    setEditedGoal(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateImage = async () => {
    if (!editedGoal.title) return;
    setIsGenerating(true);
    const prompt = `Icon for: ${editedGoal.title}. ${editedGoal.description || ''}`;
    const result = await generateGoalImage(prompt);
    if (result) {
      handleChange('imageUrl', result);
    }
    setIsGenerating(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('imageUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const categoryColor = CATEGORIES.find(c => c.id === editedGoal.category)?.color || 'from-gray-400 to-gray-500';

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-50/95 backdrop-blur-xl animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-white/50 border-b border-white/20 z-20">
        <button onClick={onClose} className="flex items-center text-blue-600 font-medium hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors">
          <ChevronLeft size={24} /> Back
        </button>
        <div className="flex gap-4">
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="text-blue-600 font-medium hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors">Edit</button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="p-6 pb-40">
          {/* Image & Top Section */}
          <div className="flex flex-col items-center mb-6">
            <div className={`relative w-24 h-24 rounded-3xl bg-gradient-to-br ${categoryColor} shadow-xl mb-4 flex items-center justify-center overflow-hidden ring-4 ring-white`}>
               {editedGoal.imageUrl ? (
                  <img src={editedGoal.imageUrl} className="w-full h-full object-cover" alt="" />
               ) : (
                  <span className="text-4xl text-white font-bold">{editedGoal.title.charAt(0)}</span>
               )}
               
               {/* Loader Overlay */}
               {isGenerating && (
                 <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-10">
                   <Sparkles className="text-white animate-spin" />
                 </div>
               )}
            </div>

            {/* Image Edit Controls */}
            {isEditing && (
              <div className="flex gap-3 mb-6 animate-fade-in">
                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-xs font-medium text-slate-600 shadow-sm border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                    <Upload size={14} />
                    <span>Upload</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                  <button 
                    type="button"
                    onClick={handleGenerateImage}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full text-xs font-medium shadow-sm hover:bg-indigo-100 disabled:opacity-50 transition-colors"
                  >
                    <Sparkles size={14} />
                    <span>Generate</span>
                  </button>
              </div>
            )}
            
            {/* Title Display (View Mode Only) */}
            {!isEditing && (
               <h1 className="text-2xl font-bold text-slate-800 text-center leading-tight px-4">{goal.title}</h1>
            )}
            
            {/* Category Selector (Always Visible logic, separate visuals) */}
            <div className="flex items-center justify-center gap-2 mt-3 text-sm text-slate-500 font-medium w-full animate-fade-in">
              {isEditing ? (
                  <div className="relative">
                      <select 
                          value={editedGoal.category}
                          onChange={(e) => handleChange('category', e.target.value)}
                          className="appearance-none px-4 py-2 pr-8 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                      >
                          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
              ) : (
                  <>
                      <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-600 font-bold flex items-center gap-1">
                         {goal.category}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-600 font-bold">
                        {goal.timeframe}
                      </span>
                  </>
              )}
            </div>
          </div>

          {/* --- VIEW MODE CONTENT --- */}
          {!isEditing && (
            <div className="space-y-6 animate-fade-in">
                {/* Progress Card */}
                <GlassCard className="mb-6 bg-white/60">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-semibold text-slate-500 uppercase">Current Cycle</span>
                    <span className="text-2xl font-bold text-slate-800">
                      {goal.currentCount} <span className="text-base text-slate-400 font-normal">/ {goal.targetCount}</span>
                    </span>
                  </div>
                  <ProgressBar current={goal.currentCount} total={goal.targetCount} colorClass={goal.currentCount >= goal.targetCount ? 'bg-green-500' : 'bg-blue-600'} />
                  <div className="mt-4 text-sm text-slate-600 flex items-center gap-2">
                    <Calendar size={16} className="text-slate-400" />
                    <span>Started: {new Date(goal.createdAt).toLocaleDateString()}</span>
                  </div>
                </GlassCard>

                <section>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1">Requirements</h3>
                    <GlassCard className="bg-white/40">
                        <p className="text-slate-700 leading-relaxed text-sm">
                        {goal.description || "No description provided."}
                        </p>
                    </GlassCard>
                </section>

                {goal.link && (
                    <section>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1">External Link</h3>
                    <GlassCard className="bg-white/40 flex items-center gap-3 text-blue-600">
                        <ExternalLink size={18} />
                        <a href={goal.link} target="_blank" rel="noreferrer" className="text-sm font-medium underline decoration-blue-300 underline-offset-4 truncate">
                            {goal.link}
                        </a>
                    </GlassCard>
                    </section>
                )}

                <section>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1">Settings</h3>
                    <GlassCard className="bg-white/40 space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-700 text-sm">Target Count</span>
                        <span className="font-bold text-slate-900">{goal.targetCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-700 text-sm">Auto-Reset (Recurring)</span>
                        <div className={`w-3 h-3 rounded-full ${goal.isRecurring ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                    </div>
                    </GlassCard>
                </section>
                
                <div className="pt-8 flex flex-col gap-3">
                    <button 
                    onClick={() => onArchive(goal.id)}
                    className="w-full py-3 rounded-2xl bg-slate-200 text-slate-600 font-medium flex items-center justify-center gap-2 hover:bg-slate-300 transition-colors"
                    >
                    <CheckCircle2 size={20} />
                    {goal.isArchived ? 'Unarchive Goal' : 'Archive Goal'}
                    </button>
                    
                    <button 
                    onClick={() => {
                        if(window.confirm('Are you sure you want to delete this goal?')) {
                        onDelete(goal.id);
                        onClose();
                        }
                    }}
                    className="w-full py-3 rounded-2xl bg-red-50 text-red-600 font-medium flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                    >
                    <Trash2 size={20} />
                    Delete Goal
                    </button>
                </div>
            </div>
          )}

          {/* --- EDIT MODE CONTENT (AddGoal Style) --- */}
          {isEditing && (
             <div className="space-y-5 animate-fade-in">
                <GlassCard className="space-y-6 bg-white/70 shadow-md p-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Goal Name</label>
                        <input 
                            type="text" 
                            value={editedGoal.title}
                            onChange={(e) => handleChange('title', e.target.value)}
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
                                    value={editedGoal.targetCount}
                                    onChange={(e) => handleChange('targetCount', parseInt(e.target.value) || 1)}
                                    className="w-full bg-white/50 border border-slate-200 rounded-2xl py-3 px-4 text-lg font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Frequency</label>
                            <div className="relative">
                                <select 
                                    value={editedGoal.timeframe}
                                    onChange={(e) => handleChange('timeframe', e.target.value)}
                                    className="w-full bg-white/50 border border-slate-200 rounded-2xl py-3.5 px-4 text-base font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none transition-all"
                                >
                                    {Object.values(Timeframe).map(t => (
                                    <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <ChevronDown size={16} />
                                </div>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="bg-white/70 shadow-md p-1">
                    <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/40 rounded-2xl transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`p-2.5 rounded-xl ${editedGoal.isRecurring ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'} transition-colors`}>
                                <Repeat size={20} />
                            </div>
                            <div>
                                <span className="text-slate-800 font-bold text-sm block">Recurring Goal</span>
                                <span className="text-slate-500 text-xs font-medium">Reset count every {editedGoal.timeframe.toLowerCase()}</span>
                            </div>
                        </div>
                        
                        <div className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={editedGoal.isRecurring} onChange={e => handleChange('isRecurring', e.target.checked)} className="sr-only peer" />
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
                            value={editedGoal.description || ''}
                            onChange={(e) => handleChange('description', e.target.value)}
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
                            value={editedGoal.link || ''}
                            onChange={(e) => handleChange('link', e.target.value)}
                            placeholder="https://..."
                            className="w-full bg-white/50 border border-slate-200 rounded-2xl py-3 px-4 text-sm text-blue-600 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium transition-all"
                        />
                    </div>
                </GlassCard>
             </div>
          )}

          {/* Floating Save Button (Only in Edit Mode) */}
          {isEditing && (
            <div className="absolute bottom-8 left-0 right-0 flex justify-center z-30 animate-slide-up">
                <button 
                onClick={handleSave}
                disabled={!editedGoal.title}
                className={`
                    bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-500/30
                    flex items-center gap-3 px-10 py-4 rounded-[2rem] border-[3px] border-white/30 backdrop-blur-md
                    transform transition-all duration-300 hover:scale-105 active:scale-95
                `}
                >
                <span className="text-lg font-bold tracking-wide">Save Changes</span>
                <div className="bg-white/20 rounded-full p-1">
                    <Check size={20} strokeWidth={3} />
                </div>
                </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
