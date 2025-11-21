
import React, { useState, useEffect } from 'react';
import { Goal, ViewState, UserProfile, AppSettings, SettingsTab } from './types';
import { MOCK_GOAL } from './constants';
import { Home } from './views/Home';
import { AddGoal } from './components/AddGoal';
import { GoalDetail } from './components/GoalDetail';
import { AuthModal } from './components/AuthModal';
import { UpgradeView } from './components/UpgradeView';
import { SettingsModal } from './components/SettingsModal';
import { GlassCard } from './components/GlassCard';
import { DemoBanner } from './components/DemoBanner';
import { dbService, authStateListener, logoutUser, deleteUserAccount } from './services/firebase';
import { Plus, Home as HomeIcon, Compass, Archive, Menu, Settings, User, Bell, Shield, CircleHelp, LogOut, Crown, Star, ArrowRight, Lock } from 'lucide-react';

// Background blobs component
const Background = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden bg-blue-50">
    <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-300/30 rounded-full blur-3xl animate-float mix-blend-multiply filter opacity-70"></div>
    <div className="absolute top-[20%] right-[-100px] w-[400px] h-[400px] bg-cyan-300/30 rounded-full blur-3xl animate-float-delayed mix-blend-multiply filter opacity-70"></div>
    <div className="absolute bottom-0 left-[10%] w-[600px] h-[600px] bg-indigo-300/30 rounded-full blur-3xl animate-float mix-blend-multiply filter opacity-70"></div>
  </div>
);

export default function App() {
  // --- STATE ---
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [view, setView] = useState<ViewState>('HOME');
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Settings State
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTab>(null);
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('bonusee-settings');
    return saved ? JSON.parse(saved) : {
      language: 'en',
      notifications: {
        dailyReminder: false,
        inactivityAlert: true,
        weeklyReport: false,
        marketing: true
      }
    };
  });

  // --- EFFECTS ---

  // 1. Listen for Auth Changes
  useEffect(() => {
    const unsubscribe = authStateListener((currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
      
      if (!currentUser) {
        // Fallback for Guest Mode: Load from Generic LocalStorage if exists, else MOCK_GOAL
        const saved = localStorage.getItem('bonusee-goals-guest');
        setGoals(saved ? JSON.parse(saved) : [MOCK_GOAL]);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Subscribe to Data (Firestore or LocalStorage based on user)
  useEffect(() => {
    if (loadingAuth) return;

    const userId = user ? user.uid : 'guest';
    
    // If real firebase, this sets up a listener. If mock, it fetches once.
    const unsubscribe = dbService.subscribe(userId, (fetchedGoals) => {
       setGoals(fetchedGoals);
       // If guest, ensure we sync state to local storage for persistence across reloads
       if (!user) {
          localStorage.setItem('bonusee-goals-guest', JSON.stringify(fetchedGoals));
       }
    });

    return () => {
        if (unsubscribe) unsubscribe();
    };
  }, [user, loadingAuth]);

  // 3. Persist Settings
  useEffect(() => {
    localStorage.setItem('bonusee-settings', JSON.stringify(appSettings));
  }, [appSettings]);

  // --- HELPERS ---
  const activeCount = goals.filter(g => !g.isArchived).length;
  const isPremium = user?.isPremium || false;
  const isLimitReached = !isPremium && activeCount >= 3;

  // --- HANDLERS ---

  const handleAddGoal = async (newGoalData: Omit<Goal, 'id' | 'createdAt' | 'lastUpdated' | 'currentCount' | 'isArchived'>) => {
    if (isLimitReached) {
        setView('UPGRADE');
        return;
    }

    const uid = user ? user.uid : 'guest';
    
    const newGoalBase = {
      ...newGoalData,
      currentCount: 0,
      isArchived: false,
      createdAt: Date.now(),
      lastUpdated: Date.now(),
    };

    // Optimistic UI Update
    const tempId = crypto.randomUUID();
    const optimisticGoal = { ...newGoalBase, id: tempId } as Goal;
    setGoals(prev => [optimisticGoal, ...prev]);
    setView('HOME');

    // DB Persist
    try {
        await dbService.add(uid, newGoalBase);
        // Real Firestore subscription will update the list with the real ID shortly
    } catch (e) {
        console.error("Failed to add goal", e);
        // Revert on failure
        setGoals(prev => prev.filter(g => g.id !== tempId));
        alert("Failed to save goal. Please check your connection.");
    }
  };

  const updateGoalCount = (id: string, delta: number) => {
    const uid = user ? user.uid : 'guest';
    const goalToUpdate = goals.find(g => g.id === id);
    if (!goalToUpdate) return;

    const newCount = Math.max(0, Math.min(goalToUpdate.currentCount + delta, goalToUpdate.targetCount));
    const updatedGoal = { ...goalToUpdate, currentCount: newCount, lastUpdated: Date.now() };
    
    // Optimistic Update
    setGoals(prev => prev.map(g => g.id === id ? updatedGoal : g));
    
    // DB Update
    if (user) {
        dbService.update(uid, updatedGoal);
    } else {
        // For guest, update entire array in local storage via service helper
        const newGoals = goals.map(g => g.id === id ? updatedGoal : g);
        dbService.saveLocal('guest', newGoals);
    }
  };

  const handleUpdateGoal = (updatedGoal: Goal) => {
    const uid = user ? user.uid : 'guest';
    
    setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
    if (selectedGoal?.id === updatedGoal.id) {
      setSelectedGoal(updatedGoal);
    }
    
    if (user) dbService.update(uid, updatedGoal);
    else {
         const newGoals = goals.map(g => g.id === updatedGoal.id ? updatedGoal : g);
         dbService.saveLocal('guest', newGoals);
    }
  };

  const handleDeleteGoal = (id: string) => {
    const uid = user ? user.uid : 'guest';
    setGoals(prev => prev.filter(g => g.id !== id));
    
    if (user) dbService.delete(uid, id);
    else {
         const newGoals = goals.filter(g => g.id !== id);
         dbService.saveLocal('guest', newGoals);
    }
  };

  const handleArchiveGoal = (id: string) => {
     const uid = user ? user.uid : 'guest';
     const goal = goals.find(g => g.id === id);
     if (!goal) return;

     const updatedGoal = { ...goal, isArchived: !goal.isArchived };
     
     setGoals(prev => prev.map(g => g.id === id ? updatedGoal : g));
     if (selectedGoal?.id === id) {
         setSelectedGoal(updatedGoal);
     }

     if (user) dbService.update(uid, updatedGoal);
     else {
         const newGoals = goals.map(g => g.id === id ? updatedGoal : g);
         dbService.saveLocal('guest', newGoals);
     }
  };

  const handleReorder = (reorderedGoals: Goal[]) => {
    setGoals(reorderedGoals);
    // Persist order
    const uid = user ? user.uid : 'guest';
    dbService.saveLocal(uid, reorderedGoals); 
  };

  const handleSubscribe = () => {
      // Mock Subscription
      alert("Payment processing...");
      setTimeout(() => {
        alert("Upgraded to Premium! (Mock)");
        if (user) setUser({...user, isPremium: true});
        setView('HOME');
      }, 1000);
  };

  const handleDeleteAccount = async () => {
      if (!user) return;
      try {
          setLoadingAuth(true);
          await deleteUserAccount(user.uid);
          setUser(null);
          setGoals([MOCK_GOAL]);
          setView('HOME');
          setActiveSettingsTab(null);
      } catch (e) {
          alert("Failed to delete account. Please try logging in again first.");
      } finally {
          setLoadingAuth(false);
      }
  };

  const renderView = () => {
    switch (view) {
      case 'HOME':
        return (
          <Home 
            goals={goals} 
            onIncrement={(id) => updateGoalCount(id, 1)}
            onDecrement={(id) => updateGoalCount(id, -1)}
            onOpenDetails={(goal) => setSelectedGoal(goal)}
            onReorder={handleReorder}
            onUpgrade={() => setView('UPGRADE')}
            isPremium={isPremium}
          />
        );
      case 'DISCOVER':
        return (
          <div className="flex flex-col items-center justify-center h-[70vh] text-center px-6 space-y-6">
             <div className="w-24 h-24 bg-gradient-to-tr from-pink-400 to-yellow-400 rounded-full animate-pulse blur-sm opacity-50 absolute"></div>
             <div className="relative z-10">
                <Compass size={64} className="text-slate-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-700 mb-2">Coming Soon</h2>
                <p className="text-slate-500 leading-relaxed">
                  We are negotiating with top partners to bring you exclusive loyalty programs directly within Bonusee.
                </p>
             </div>
          </div>
        );
      case 'ARCHIVE':
         const archivedGoals = goals.filter(g => g.isArchived);
         return (
            <div className="space-y-6 pb-32 pt-8">
                <h1 className="text-3xl font-bold text-slate-800">Archive</h1>
                {archivedGoals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <Archive size={48} className="mb-4 opacity-50" />
                        <p>No archived goals.</p>
                    </div>
                ) : (
                    archivedGoals.map(g => (
                        <div key={g.id} className="opacity-75 grayscale hover:grayscale-0 transition-all">
                            <div onClick={() => setSelectedGoal(g)} className="bg-white/40 p-4 rounded-2xl border border-white/40 flex justify-between items-center cursor-pointer hover:bg-white/60">
                                <div className="flex items-center gap-3">
                                   <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center`}>
                                      {g.imageUrl ? <img src={g.imageUrl} className="w-full h-full object-cover rounded-xl" /> : <span className="text-slate-500 font-bold">{g.title[0]}</span>}
                                   </div>
                                   <span className="font-medium text-slate-700">{g.title}</span>
                                </div>
                                <span className="text-xs bg-slate-200 px-2 py-1 rounded text-slate-500">Archived</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
         );
      case 'MORE':
        return (
           <div className="space-y-6 pb-32 pt-8">
             <h1 className="text-3xl font-bold text-slate-800 mb-6 ml-1">Menu</h1>
             
             {/* Profile / Auth Card Section */}
             <div className="animate-fade-in">
               {user ? (
                  <GlassCard className="bg-white/60 flex items-center gap-4 relative overflow-hidden group">
                      {/* Gradient decoration */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                      
                      {user.isPremium && (
                          <div className="absolute top-0 right-0 bg-gradient-to-bl from-amber-300 to-orange-400 text-white px-3 py-1 rounded-bl-2xl text-[10px] font-bold flex items-center gap-1 shadow-sm z-10">
                              <Crown size={10} fill="white" /> PRO
                          </div>
                      )}
                      
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-white/50 shadow-lg bg-slate-200 relative z-10">
                            {user.photoURL ? (
                                <img src={user.photoURL} className="w-full h-full object-cover" alt="Profile" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xl font-bold">
                                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : <User size={24} />}
                                </div>
                            )}
                        </div>
                        <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-400 border-2 border-white rounded-full z-20" title="Online"></div>
                      </div>

                      <div className="flex-1 min-w-0 relative z-10">
                          <h3 className="text-lg font-bold text-slate-800 truncate">
                            {user.displayName || "Bonusee User"}
                          </h3>
                          <p className="text-slate-500 text-xs truncate font-medium">
                            {user.email}
                          </p>
                          <div className="mt-1 flex items-center gap-1">
                            <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                                {user.isPremium ? 'Premium Plan' : 'Free Plan'}
                            </span>
                          </div>
                      </div>
                      
                      <button 
                        onClick={() => {
                           if(window.confirm("Log out?")) logoutUser();
                        }} 
                        className="p-2.5 bg-white/50 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors border border-transparent hover:border-red-100 relative z-10"
                      >
                          <LogOut size={20} />
                      </button>
                  </GlassCard>
               ) : (
                  <div 
                      onClick={() => setShowAuthModal(true)}
                      className="group relative overflow-hidden p-6 rounded-3xl shadow-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-95"
                  >
                      {/* Dark Card Background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 z-0"></div>
                      
                      {/* Decorative Blobs */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/30 rounded-full blur-2xl -mr-10 -mt-10 z-0 group-hover:bg-blue-500/40 transition-colors"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full blur-xl -ml-5 -mb-5 z-0"></div>
                      
                      <div className="relative z-10 flex items-center gap-5">
                          <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shadow-inner border border-white/10 group-hover:border-white/30 transition-colors">
                              <User size={28} />
                          </div>
                          <div className="flex-1">
                              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-200 transition-colors">Sign In / Sign Up</h3>
                              <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">Sync your goals & unlock Pro features</p>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 group-hover:bg-white/20 group-hover:text-white transition-all">
                             <ArrowRight size={16} />
                          </div>
                      </div>
                  </div>
               )}
             </div>

             {/* Premium Upsell (if free) */}
             {!user?.isPremium && (
                 <div 
                    onClick={() => setView('UPGRADE')}
                    className="bg-gradient-to-br from-amber-100 to-orange-100 p-5 rounded-3xl border border-orange-200/50 relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
                 >
                    <div className="flex items-start gap-4 relative z-10">
                        <div className="p-2 bg-orange-400 rounded-xl text-white shadow-md group-hover:scale-110 transition-transform">
                            <Crown size={24} fill="currentColor" />
                        </div>
                        <div>
                            <h3 className="font-bold text-amber-900">Upgrade to Premium</h3>
                            <p className="text-xs text-amber-800/80 mt-1 leading-relaxed">
                                Get unlimited goals, custom themes, and detailed analytics for just $1.99/mo.
                            </p>
                        </div>
                    </div>
                    <Star size={100} className="absolute -right-4 -bottom-4 text-orange-300/20 rotate-12 group-hover:rotate-[20deg] transition-transform" fill="currentColor" />
                 </div>
             )}

             <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-2">Settings</h3>
                <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-white/40 overflow-hidden">
                   {[
                     { icon: Settings, label: 'General Settings', tab: 'GENERAL' },
                     { icon: Bell, label: 'Notifications', tab: 'NOTIFICATIONS' },
                     { icon: Shield, label: 'Privacy & Security', tab: 'PRIVACY' },
                     { icon: CircleHelp, label: 'Help & Support', tab: 'HELP' }
                   ].map((item, i) => (
                     <button 
                        key={i} 
                        onClick={() => setActiveSettingsTab(item.tab as SettingsTab)}
                        className="w-full flex items-center gap-4 p-4 hover:bg-white/40 transition-colors border-b last:border-0 border-white/20 text-left group"
                     >
                        <div className="p-2 rounded-xl bg-white/50 text-slate-600 group-hover:text-blue-600 transition-colors">
                          <item.icon size={20} />
                        </div>
                        <span className="font-medium text-slate-700">{item.label}</span>
                     </button>
                   ))}
                </div>
             </div>
             
             <div className="text-center pt-4">
                <p className="text-xs text-slate-400">Bonusee v1.2 (Build 30)</p>
             </div>
           </div>
        );
      default:
        return null;
    }
  };

  // Navigation Item Helper
  const NavItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 w-16 transition-all duration-200 ${active ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
    >
      <Icon size={24} strokeWidth={active ? 2.5 : 2} className={active ? 'drop-shadow-sm' : ''} />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );

  if (loadingAuth) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-blue-50">
            <div className="animate-bounce text-blue-500">
                <Crown size={40} fill="currentColor" className="opacity-50" />
            </div>
        </div>
    );
  }

  return (
    <>
      <DemoBanner />
      <Background />
      
      <main className="max-w-md mx-auto min-h-screen relative px-4 pb-safe">
        {renderView()}

        {/* Navigation Bar */}
        <div className="fixed bottom-6 left-4 right-4 max-w-md mx-auto z-40 pb-[env(safe-area-inset-bottom)]">
           <nav className="bg-white/80 backdrop-blur-2xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-3xl h-20 flex items-center justify-between px-2 relative">
              
              <div className="flex items-center justify-between w-full px-2">
                {/* Left Group */}
                <div className="flex gap-2">
                   <NavItem icon={HomeIcon} label="Home" active={view === 'HOME'} onClick={() => setView('HOME')} />
                   <NavItem icon={Compass} label="Discover" active={view === 'DISCOVER'} onClick={() => setView('DISCOVER')} />
                </div>

                {/* Center Space for FAB */}
                <div className="w-16"></div>

                {/* Right Group */}
                <div className="flex gap-2">
                   <NavItem icon={Archive} label="Archive" active={view === 'ARCHIVE'} onClick={() => setView('ARCHIVE')} />
                   <NavItem icon={Menu} label="Menu" active={view === 'MORE'} onClick={() => setView('MORE')} />
                </div>
              </div>

              {/* Floating Action Button (Center) */}
              <div className="absolute left-1/2 -translate-x-1/2 -top-5">
                 <button 
                    onClick={() => {
                        if (isLimitReached) setView('UPGRADE');
                        else setView('ADD');
                    }}
                    className={`
                        w-20 h-20 rounded-full shadow-xl flex items-center justify-center text-white transform transition-all hover:scale-105 active:scale-95 border-4 border-gray-50/50 backdrop-blur-sm
                        ${isLimitReached 
                            ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-orange-500/30' 
                            : 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/30'}
                    `}
                 >
                    {isLimitReached ? (
                        <Lock size={32} strokeWidth={2.5} />
                    ) : (
                        <Plus size={38} strokeWidth={3} />
                    )}
                 </button>
              </div>

           </nav>
        </div>
      </main>

      {/* Modals */}
      {view === 'ADD' && (
        <AddGoal 
          onSave={handleAddGoal} 
          onCancel={() => setView('HOME')} 
        />
      )}

      {selectedGoal && (
        <GoalDetail 
          goal={selectedGoal}
          onClose={() => setSelectedGoal(null)}
          onUpdate={handleUpdateGoal}
          onDelete={handleDeleteGoal}
          onArchive={handleArchiveGoal}
        />
      )}

      {showAuthModal && (
          <AuthModal 
            onClose={() => setShowAuthModal(false)}
            onLoginSuccess={() => setShowAuthModal(false)}
          />
      )}
      
      {view === 'UPGRADE' && (
          <UpgradeView 
             onClose={() => setView('HOME')} 
             onSubscribe={handleSubscribe}
          />
      )}

      {activeSettingsTab && (
        <SettingsModal
          initialTab={activeSettingsTab}
          onClose={() => setActiveSettingsTab(null)}
          settings={appSettings}
          onUpdateSettings={setAppSettings}
          user={user}
          onLogout={logoutUser}
          onDeleteAccount={handleDeleteAccount}
        />
      )}
    </>
  );
}
