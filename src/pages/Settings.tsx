import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Settings as SettingsIcon, 
  User, 
  Globe, 
  Bell, 
  Shield, 
  PlayCircle,
  LogOut,
  ChevronRight,
  Check
} from 'lucide-react';
import { storage } from '../lib/storage';
import { cn } from '../lib/utils';

import { TopBar } from '../components/TopBar';

export const Settings = () => {
  const { t, i18n } = useTranslation();
  const [memory, setMemory] = useState(storage.getMemory());
  const [demoMode, setDemoMode] = useState(!!memory.profile?.demoMode);

  const handleToggleDemo = (enabled: boolean) => {
    storage.setDemoMode(enabled);
    setDemoMode(enabled);
    setMemory(storage.getMemory());
    // Force reload to update all components
    window.location.reload();
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ta', name: 'Tamil' },
    { code: 'kn', name: 'Kannada' }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar title={t('nav.settings')} />
      
      <div className="p-4 space-y-6 pb-24">

      {/* Demo Mode Section */}
      <section className="premium-card bg-emerald-900 text-white !p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10">
              <PlayCircle size={20} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold">Judge Demo Mode</h3>
              <p className="text-[10px] text-emerald-300">Preload data for presentation</p>
            </div>
          </div>
          <button 
            onClick={() => handleToggleDemo(!demoMode)}
            className={cn(
              "w-12 h-6 rounded-full transition-all relative",
              demoMode ? "bg-emerald-500" : "bg-white/20"
            )}
          >
            <div className={cn(
              "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
              demoMode ? "right-1" : "left-1"
            )} />
          </button>
        </div>
        {demoMode && (
          <div className="p-3 rounded-xl bg-white/10 border border-white/10">
            <p className="text-[10px] leading-relaxed text-emerald-100">
              Demo mode is active. Patient profile, medications, and history have been preloaded for the judging flow.
            </p>
          </div>
        )}
      </section>

      {/* Language Section */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Globe size={14} />
          Language
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => i18n.changeLanguage(lang.code)}
              className={cn(
                "p-4 rounded-2xl border-2 transition-all flex items-center justify-between",
                i18n.language === lang.code 
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700" 
                  : "border-slate-100 bg-white text-slate-600"
              )}
            >
              <span className="font-bold text-sm">{lang.name}</span>
              {i18n.language === lang.code && <Check size={16} />}
            </button>
          ))}
        </div>
      </section>

      {/* General Settings */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <User size={14} />
          Account
        </h3>
        <div className="space-y-2">
          {[
            { icon: User, label: 'Edit Profile' },
            { icon: Bell, label: 'Notifications' },
            { icon: Shield, label: 'Privacy & Security' }
          ].map((item, i) => (
            <button key={i} className="w-full premium-card !p-4 flex items-center justify-between group">
              <div className="flex items-center gap-3 text-slate-700">
                <item.icon size={18} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </button>
          ))}
        </div>
      </section>

      <button className="w-full p-4 rounded-2xl bg-rose-50 text-rose-600 font-bold flex items-center justify-center gap-2 mt-8">
        <LogOut size={18} />
        Sign Out
      </button>

      <div className="text-center space-y-1 pt-4">
        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Rural Health Connect v1.0.0</p>
        <p className="text-[10px] text-slate-300">Built for Rural Healthcare Impact</p>
      </div>
    </div>
  );
};
