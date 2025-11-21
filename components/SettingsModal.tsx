
import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { SettingsTab, AppSettings, Language, UserProfile } from '../types';
import { 
  ChevronLeft, X, Globe, Bell, Shield, CircleHelp, 
  ChevronRight, Check, AlertTriangle, Mail, LogOut, Trash2
} from 'lucide-react';

interface SettingsModalProps {
  initialTab: SettingsTab;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  user: UserProfile | null;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  initialTab,
  onClose,
  settings,
  onUpdateSettings,
  user,
  onLogout,
  onDeleteAccount
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const handleLanguageChange = (lang: Language) => {
    onUpdateSettings({ ...settings, language: lang });
  };

  const toggleNotification = (key: keyof typeof settings.notifications) => {
    onUpdateSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key]
      }
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'GENERAL':
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Language</h3>
            <GlassCard className="bg-white/60 p-1">
              <button 
                onClick={() => handleLanguageChange('en')}
                className="w-full flex items-center justify-between p-4 hover:bg-white/50 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇺🇸</span>
                  <span className="font-medium text-slate-800">English</span>
                </div>
                {settings.language === 'en' && <Check size={20} className="text-blue-600" />}
              </button>
              <div className="h-px bg-slate-200/50 mx-4"></div>
              <button 
                onClick={() => handleLanguageChange('cs')}
                className="w-full flex items-center justify-between p-4 hover:bg-white/50 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇨🇿</span>
                  <span className="font-medium text-slate-800">Čeština</span>
                </div>
                {settings.language === 'cs' && <Check size={20} className="text-blue-600" />}
              </button>
            </GlassCard>

            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Appearance</h3>
            <GlassCard className="bg-white/60 p-4 flex items-center justify-between opacity-60 cursor-not-allowed">
                <span className="text-slate-800 font-medium">Dark Mode</span>
                <span className="text-xs text-slate-400 bg-slate-200 px-2 py-1 rounded">Coming Soon</span>
            </GlassCard>
          </div>
        );

      case 'NOTIFICATIONS':
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Preferences</h3>
            <GlassCard className="bg-white/60 divide-y divide-slate-200/50">
               {[
                 { key: 'dailyReminder', label: 'Daily Reminders', desc: 'Get a nudge at 8:00 PM' },
                 { key: 'inactivityAlert', label: 'Inactivity Alerts', desc: 'Notify if goals aren\'t updated for 3 days' },
                 { key: 'weeklyReport', label: 'Weekly Summary', desc: 'Your progress report every Sunday' },
                 { key: 'marketing', label: 'Product Updates', desc: 'News about features and offers' },
               ].map((item) => (
                 <label key={item.key} className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/40 transition-colors first:rounded-t-2xl last:rounded-b-2xl">
                    <div>
                       <div className="font-medium text-slate-800">{item.label}</div>
                       <div className="text-xs text-slate-500">{item.desc}</div>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.notifications[item.key as keyof typeof settings.notifications]} 
                          onChange={() => toggleNotification(item.key as keyof typeof settings.notifications)}
                          className="sr-only peer" 
                        />
                        <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-500 transition-colors duration-300"></div>
                    </div>
                 </label>
               ))}
            </GlassCard>
          </div>
        );

      case 'PRIVACY':
        return (
          <div className="space-y-6 animate-fade-in">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Data Management</h3>
             <GlassCard className="bg-white/60 p-1 space-y-1">
                <button className="w-full flex items-center gap-3 p-4 hover:bg-white/50 rounded-xl transition-colors text-left text-slate-700">
                   <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Shield size={18} /></div>
                   <div className="flex-1">
                      <span className="block font-medium">Privacy Policy</span>
                   </div>
                   <ChevronRight size={16} className="text-slate-400" />
                </button>
                <button className="w-full flex items-center gap-3 p-4 hover:bg-white/50 rounded-xl transition-colors text-left text-slate-700">
                   <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Mail size={18} /></div>
                   <div className="flex-1">
                      <span className="block font-medium">Export My Data</span>
                      <span className="text-xs text-slate-400">Download a copy of your goals</span>
                   </div>
                   <ChevronRight size={16} className="text-slate-400" />
                </button>
             </GlassCard>

             <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider ml-1">Danger Zone</h3>
             <GlassCard className="bg-red-50/50 border-red-100 p-6">
                {!user ? (
                  <div className="text-center text-slate-500 text-sm">Sign in to manage your account.</div>
                ) : (
                   <div className="space-y-4">
                      <div className="flex items-start gap-3">
                         <AlertTriangle className="text-red-500 shrink-0" />
                         <div>
                            <h4 className="font-bold text-red-700">Delete Account</h4>
                            <p className="text-xs text-red-600/80 leading-relaxed mt-1">
                              This will permanently delete your account and all associated data. 
                              This action cannot be undone.
                            </p>
                         </div>
                      </div>
                      
                      <div className="pt-2">
                        <label className="text-xs font-bold text-red-700 block mb-2">Type "DELETE" to confirm</label>
                        <input 
                           type="text" 
                           value={deleteConfirmation}
                           onChange={(e) => setDeleteConfirmation(e.target.value)}
                           placeholder="DELETE"
                           className="w-full bg-white border border-red-200 rounded-xl px-4 py-2 text-red-600 font-bold placeholder:text-red-200 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                        />
                      </div>

                      <button 
                        onClick={onDeleteAccount}
                        disabled={deleteConfirmation !== 'DELETE'}
                        className="w-full py-3 bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:shadow-none hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                      >
                         <Trash2 size={18} />
                         Permanently Delete
                      </button>
                   </div>
                )}
             </GlassCard>
          </div>
        );

      case 'HELP':
        return (
          <div className="space-y-6 animate-fade-in">
            <GlassCard className="bg-white/60 p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                   <CircleHelp size={32} />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">How can we help?</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Bonusee is designed to be simple. If you encounter issues, feel free to reach out.
                </p>
                <button className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2">
                   <Mail size={18} /> Contact Support
                </button>
            </GlassCard>

            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">FAQ</h3>
            <div className="space-y-3">
               {[
                 { q: "Is Bonusee free?", a: "Yes, you can track up to 3 goals for free forever." },
                 { q: "How do I sync data?", a: "Simply sign in to sync your goals across devices." },
                 { q: "Can I suggest features?", a: "Absolutely! Contact us via the support button." }
               ].map((item, i) => (
                 <GlassCard key={i} className="bg-white/40 p-4">
                    <h4 className="font-bold text-slate-700 text-sm mb-1">{item.q}</h4>
                    <p className="text-xs text-slate-500">{item.a}</p>
                 </GlassCard>
               ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getTitle = () => {
      switch(activeTab) {
          case 'GENERAL': return 'General Settings';
          case 'NOTIFICATIONS': return 'Notifications';
          case 'PRIVACY': return 'Privacy & Security';
          case 'HELP': return 'Help & Support';
          default: return 'Settings';
      }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-50/95 backdrop-blur-xl animate-slide-up">
       {/* Header */}
       <div className="flex items-center justify-between px-4 py-4 bg-white/50 border-b border-white/20 z-20">
        <button onClick={onClose} className="flex items-center text-blue-600 font-medium hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors">
          <ChevronLeft size={24} /> Back
        </button>
        <h2 className="text-lg font-bold text-slate-800">{getTitle()}</h2>
        <div className="w-10"></div> {/* Spacer for center alignment */}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 pb-20">
         {renderContent()}
      </div>
    </div>
  );
};
