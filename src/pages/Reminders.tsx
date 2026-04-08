import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { 
  Pill, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  ChevronRight
} from 'lucide-react';
import { storage } from '../lib/storage';
import { cn } from '../lib/utils';

import { TopBar } from '../components/TopBar';

export const Reminders = () => {
  const { t } = useTranslation();
  const memory = storage.getMemory();
  const reminders = memory.reminders || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar title={t('nav.reminders')} />
      
      <div className="p-4 space-y-6 pb-24">
        <header className="flex justify-between items-end">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Your daily medication schedule
            </p>
          </div>
          <button className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200">
            <Plus size={20} />
          </button>
        </header>

      <div className="space-y-4">
        {reminders.length > 0 ? (
          reminders.map((reminder, index) => (
            <motion.div
              key={reminder.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "bg-white rounded-[32px] p-5 border border-slate-100 shadow-sm flex items-center justify-between group",
                reminder.status === 'completed' && "opacity-60"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                  reminder.status === 'completed' ? "bg-emerald-50 text-emerald-500" : "bg-blue-50 text-blue-500"
                )}>
                  <Pill size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{reminder.medicationName}</h3>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <Clock size={10} />
                    {reminder.time}
                  </div>
                </div>
              </div>

              <button className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                reminder.status === 'completed' 
                  ? "bg-emerald-500 text-white" 
                  : "bg-slate-100 text-slate-400 hover:bg-emerald-500 hover:text-white"
              )}>
                <CheckCircle2 size={20} />
              </button>
            </motion.div>
          ))
        ) : (
          <div className="bg-white rounded-[32px] p-8 text-center space-y-4 border border-slate-100">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <Pill size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900">No active reminders</h3>
              <p className="text-xs text-slate-500">Add your medications to start tracking</p>
            </div>
            <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest">
              Add Medication
            </button>
          </div>
        )}
      </div>

      {/* Refill Alerts Section */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Refill Alerts</h3>
        <div className="bg-amber-50 border border-amber-100 rounded-[32px] p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <AlertCircle size={20} />
            </div>
            <div>
              <h4 className="font-bold text-amber-900 text-sm">Metformin 500mg</h4>
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">2 days left</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-amber-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest">
            Order
          </button>
        </div>
      </div>
    </div>
  );
};
