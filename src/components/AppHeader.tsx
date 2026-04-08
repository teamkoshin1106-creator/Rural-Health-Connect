import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { Heart, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { storage } from '../lib/storage';

export const AppHeader = () => {
  const { t } = useTranslation();
  const networkStatus = useNetworkStatus();
  const navigate = useNavigate();
  const [isDemoRunning, setIsDemoRunning] = useState(false);

  const runEvaluatorFlow = async () => {
    if (isDemoRunning) return;
    setIsDemoRunning(true);
    
    // Ensure demo mode is on
    storage.setDemoMode(true);
    
    // Sequence: Dashboard -> AI Result -> Doctor -> Pharmacy -> SOS
    navigate('/');
    await new Promise(r => setTimeout(r, 1500));
    navigate('/symptoms');
    await new Promise(r => setTimeout(r, 1500));
    navigate('/doctors');
    await new Promise(r => setTimeout(r, 1500));
    navigate('/pharmacy');
    await new Promise(r => setTimeout(r, 1500));
    
    // For SOS, we just show the dashboard and maybe a hint
    navigate('/');
    setIsDemoRunning(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg medical-gradient flex items-center justify-center shadow-lg shadow-emerald-100">
          <Heart className="text-white w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <h1 className="font-black text-slate-900 text-sm leading-none tracking-tighter uppercase">
            Rural Health
          </h1>
          <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest">Connect</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Hidden Evaluator Flow Shortcut */}
        <button 
          onClick={runEvaluatorFlow}
          className="w-6 h-6 flex items-center justify-center text-slate-200 hover:text-emerald-500 transition-colors opacity-20 hover:opacity-100"
          title="Evaluator Flow"
        >
          <Zap className="w-3 h-3" />
        </button>

        <div className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all duration-500",
          networkStatus === 'online' ? "bg-emerald-50 text-emerald-600" :
          networkStatus === 'low' ? "bg-amber-50 text-amber-600" :
          "bg-rose-50 text-rose-600"
        )}>
          <div className={cn(
            "w-1.5 h-1.5 rounded-full animate-pulse",
            networkStatus === 'online' ? "bg-emerald-500" :
            networkStatus === 'low' ? "bg-amber-500" :
            "bg-rose-500"
          )} />
          {t(`common.${networkStatus}`)}
        </div>
      </div>
    </header>
  );
};
