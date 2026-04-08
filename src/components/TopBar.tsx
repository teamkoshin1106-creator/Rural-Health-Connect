import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';

interface TopBarProps {
  title: string;
  onBack?: () => void;
  className?: string;
  showBack?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  title, 
  onBack, 
  className,
  showBack = true 
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-4 flex items-center gap-4 shadow-sm",
      className
    )}>
      {showBack && (
        <button 
          onClick={handleBack}
          className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all active:scale-95"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
      )}
      <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight truncate">
        {title}
      </h1>
    </header>
  );
};
