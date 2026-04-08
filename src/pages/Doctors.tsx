import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { 
  Stethoscope, 
  Star, 
  MapPin, 
  Calendar, 
  Video, 
  MessageSquare, 
  Phone,
  Clock,
  ChevronRight
} from 'lucide-react';
import { orchestrationService } from '../services/orchestrationService';
import { storage } from '../lib/storage';
import { cn } from '../lib/utils';

import { TopBar } from '../components/TopBar';

export const Doctors = () => {
  const { t, i18n } = useTranslation();
  const memory = storage.getMemory();
  const doctors = orchestrationService.getMatchingDoctors({ riskLevel: 'normal' } as any, i18n.language);

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar title={t('nav.appointments')} />
      
      <div className="p-4 space-y-6 pb-24">
        <header className="space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Recommended specialists for you
          </p>
        </header>

      <div className="space-y-4">
        {doctors.map((doctor, index) => (
          <motion.div
            key={doctor.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-[32px] p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
          >
            {/* Urgency Fit Badge */}
            <div className={cn(
              "absolute top-0 right-0 px-4 py-1 rounded-bl-2xl text-[8px] font-black uppercase tracking-widest",
              doctor.urgencyFit === 'high' ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"
            )}>
              {doctor.urgencyFit === 'high' ? 'Urgent Priority' : 'Available Now'}
            </div>

            <div className="flex gap-4 mb-4">
              <div className="relative">
                <img 
                  src={doctor.photoUrl} 
                  alt={doctor.name}
                  className="w-16 h-16 rounded-2xl object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-lg shadow-sm flex items-center justify-center">
                  <Star className="text-amber-400 w-3 h-3 fill-amber-400" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900">{doctor.name}</h3>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">
                  {doctor.specialization}
                </p>
                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1">
                    <MapPin size={10} /> {doctor.distance} km
                  </span>
                  <span className="flex items-center gap-1">
                    <Star size={10} className="text-amber-400" /> {doctor.rating}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3 mb-4">
              <p className="text-[10px] font-medium text-slate-600 italic">
                "{doctor.matchReason}"
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {doctor.consultationModes.includes('video') && <Video size={16} className="text-slate-400" />}
                {doctor.consultationModes.includes('audio') && <Phone size={16} className="text-slate-400" />}
                {doctor.consultationModes.includes('chat') && <MessageSquare size={16} className="text-slate-400" />}
              </div>
              <button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-colors flex items-center gap-2">
                Book Slot <ChevronRight size={12} />
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              <div className="flex items-center gap-1">
                <Clock size={10} /> {doctor.earliestSlot}
              </div>
              <div>{doctor.experience} Years Exp.</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
