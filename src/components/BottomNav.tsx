import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Stethoscope, 
  Bell, 
  FileText, 
  Pill, 
  Settings,
  PlusCircle
} from 'lucide-react';
import { cn } from '../lib/utils';

export const BottomNav = () => {
  const { t } = useTranslation();

  const navItems = [
    { icon: LayoutDashboard, label: 'nav.dashboard', path: '/' },
    { icon: Stethoscope, label: 'nav.symptoms', path: '/symptoms' },
    { icon: PlusCircle, label: 'nav.emergency', path: '/emergency', primary: true },
    { icon: Pill, label: 'nav.reminders', path: '/reminders' },
    { icon: Settings, label: 'nav.settings', path: '/settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-emerald-50 px-2 pb-safe pt-2">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex flex-col items-center gap-1 p-2 transition-all duration-300",
              item.primary ? "relative -top-8" : "",
              isActive && !item.primary ? "text-emerald-600" : "text-slate-400"
            )}
          >
            {({ isActive }) => item.primary ? (
              <div className="flex flex-col items-center gap-1">
                <div className="w-14 h-14 rounded-full medical-gradient shadow-lg shadow-emerald-200 flex items-center justify-center text-white ring-4 ring-white animate-pulse">
                  <item.icon size={28} />
                </div>
                <span className="text-[10px] font-bold text-emerald-600 mt-1">{t(item.label)}</span>
              </div>
            ) : (
              <>
                <item.icon size={24} className={cn("transition-transform", isActive && "scale-110")} />
                <span className="text-[10px] font-medium">{t(item.label)}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
