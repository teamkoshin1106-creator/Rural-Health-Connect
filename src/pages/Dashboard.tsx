import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Calendar, 
  Clock, 
  ArrowRight, 
  Activity,
  Heart,
  Thermometer,
  Stethoscope,
  Pill,
  CheckCircle2,
  AlertCircle,
  FileText,
  MapPin,
  Phone,
  AlertTriangle,
  ChevronRight,
  Mic,
  ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { storage } from '../lib/storage';
import { MedicalMemory, AIAnalysisResult, Doctor, Pharmacy, MedicalFacility } from '../types';
import { orchestrationService } from '../services/orchestrationService';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [memory, setMemory] = useState<MedicalMemory>(storage.getMemory());
  const [showDemoTour, setShowDemoTour] = useState(!!memory.profile?.demoMode);
  const [tourStep, setTourStep] = useState(0);
  const [latestAnalysis, setLatestAnalysis] = useState<AIAnalysisResult | null>(null);
  const [recommendedDoctor, setRecommendedDoctor] = useState<Doctor | null>(null);
  const [nearbyPharmacy, setNearbyPharmacy] = useState<Pharmacy | null>(null);
  const [nearbyPHC, setNearbyPHC] = useState<MedicalFacility | null>(null);

  useEffect(() => {
    const mem = storage.getMemory();
    setMemory(mem);
    
    // Get latest analysis from cache
    const cache = storage.getKnowledgeCache();
    const analyses = Object.values(cache) as { data: AIAnalysisResult, timestamp: number }[];
    if (analyses.length > 0) {
      const latest = analyses.sort((a, b) => b.timestamp - a.timestamp)[0].data;
      setLatestAnalysis(latest);
      
      const doctors = orchestrationService.getMatchingDoctors(latest, i18n.language);
      setRecommendedDoctor(doctors[0]);
    }

    const lat = mem.profile?.latitude || 13.0698;
    const lng = mem.profile?.longitude || 77.7982;
    
    const pharmacies = orchestrationService.getNearbyPharmacies(lat, lng);
    setNearbyPharmacy(pharmacies[0]);

    const facilities = orchestrationService.getNearbyFacilities(lat, lng);
    setNearbyPHC(facilities.find(f => f.type === 'PHC') || facilities[0]);
  }, [i18n.language]);

  const isEmergency = latestAnalysis?.riskLevel === 'emergency';

  return (
    <div className="p-4 space-y-8 pb-32 relative min-h-screen">
      {/* Demo Tour Overlay */}
      <AnimatePresence>
        {showDemoTour && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[32px] p-8 shadow-2xl max-w-xs w-full space-y-6 text-center"
            >
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Heart className="animate-pulse w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  {t('dashboard.demoMode')}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  {t(`dashboard.tour.step${tourStep + 1}`)}
                </p>
              </div>
              <div className="flex items-center justify-between pt-4">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className={cn("w-2 h-2 rounded-full transition-all duration-300", i === tourStep ? "bg-emerald-500 w-6" : "bg-slate-200")} />
                  ))}
                </div>
                <button 
                  onClick={() => tourStep < 2 ? setTourStep(tourStep + 1) : setShowDemoTour(false)}
                  className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-slate-200"
                >
                  {tourStep < 2 ? t('common.next') : t('common.finish')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{t('common.appName')}</p>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {t('dashboard.welcome')}, {memory.profile?.fullName.split(' ')[0] || 'Patient'}
          </h2>
        </div>
        <button onClick={() => navigate('/settings')} className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm hover:text-emerald-500 transition-colors">
          <Heart size={20} />
        </button>
      </header>

      {/* 1. AI Symptom Checker CTA */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => navigate('/symptoms')}
        className="premium-card medical-gradient text-white p-8 space-y-6 cursor-pointer group relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform" />
        
        <div className="flex items-start justify-between relative z-10">
          <div className="space-y-2">
            <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">
              {t('dashboard.symptomCheckerCTA')}
            </h3>
            <p className="text-sm font-bold opacity-80 max-w-[200px]">
              {t('dashboard.symptomCheckerDesc')}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover:rotate-6 transition-transform">
            <Stethoscope size={28} />
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2 relative z-10">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
              <Mic size={14} />
            </div>
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
              <ImageIcon size={14} />
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Voice & Image Support</span>
        </div>
      </motion.section>

      {/* 2. Today's Medication Timeline */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('nav.reminders')}</h3>
          <button onClick={() => navigate('/reminders')} className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{t('dashboard.viewAll')}</button>
        </div>
        <div className="space-y-4 relative before:absolute before:left-[23px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
          {memory.reminders.length > 0 ? (
            memory.reminders.slice(0, 2).map((reminder, i) => {
              const med = memory.medications.find(m => m.id === reminder.medicationId);
              return (
                <div key={reminder.id} className="flex gap-4 relative">
                  <div className={cn(
                    "w-12 h-12 rounded-full border-4 border-slate-50 shadow-sm flex items-center justify-center z-10 transition-colors",
                    reminder.status === 'completed' ? "bg-emerald-500 text-white" : "bg-white text-slate-300"
                  )}>
                    {reminder.status === 'completed' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                  </div>
                  <div className={cn(
                    "flex-1 p-5 rounded-[32px] border transition-all",
                    reminder.status === 'completed' ? "bg-emerald-50/30 border-emerald-100" : "bg-white border-slate-100 shadow-sm"
                  )}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{reminder.time}</span>
                      {reminder.status === 'completed' && <span className="text-[8px] font-black text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-full">Taken</span>}
                    </div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{med?.name || 'Medicine'}</h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{med?.dosage} • {reminder.status === 'completed' ? 'Dose confirmed' : 'Upcoming dose'}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-10 text-center bg-white rounded-[32px] border border-slate-100 border-dashed">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No activities scheduled for today</p>
            </div>
          )}
        </div>
      </section>

      {/* 3. Recommended Doctor */}
      {recommendedDoctor && (
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('dashboard.recommendedDoctor')}</h3>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/doctors')}
            className="premium-card !p-5 border border-slate-100 flex items-center gap-4 cursor-pointer hover:border-emerald-200 transition-colors"
          >
            <div className="relative">
              <img src={recommendedDoctor.photoUrl} alt={recommendedDoctor.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-50" referrerPolicy="no-referrer" />
              <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-lg shadow-sm">
                <div className="flex items-center gap-0.5 text-[10px] font-bold text-amber-500">
                  <Heart size={10} fill="currentColor" />
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{recommendedDoctor.name}</h4>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{recommendedDoctor.specialization}</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-widest">Available Now</span>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{recommendedDoctor.earliestSlot}</span>
              </div>
            </div>
            <ChevronRight size={20} className="text-slate-300" />
          </motion.div>
        </section>
      )}

      {/* 4. Nearby Pharmacy / PHC */}
      <section className="grid grid-cols-2 gap-4">
        {nearbyPharmacy && (
          <div 
            onClick={() => navigate('/pharmacy')}
            className="premium-card !p-5 border border-slate-100 space-y-3 cursor-pointer hover:border-blue-200 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Pill size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('dashboard.nearbyPharmacy')}</h4>
              <p className="text-xs font-black text-slate-900 uppercase tracking-tight truncate">{nearbyPharmacy.name}</p>
              <div className="flex items-center gap-1 text-[8px] font-bold text-emerald-600 uppercase tracking-widest">
                <MapPin size={8} /> {nearbyPharmacy.distance} km
              </div>
            </div>
          </div>
        )}
        {nearbyPHC && (
          <div 
            onClick={() => navigate('/records')}
            className="premium-card !p-5 border border-slate-100 space-y-3 cursor-pointer hover:border-purple-200 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <MapPin size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('dashboard.nearbyPHC')}</h4>
              <p className="text-xs font-black text-slate-900 uppercase tracking-tight truncate">{nearbyPHC.name}</p>
              <div className="flex items-center gap-1 text-[8px] font-bold text-emerald-600 uppercase tracking-widest">
                <MapPin size={8} /> {nearbyPHC.distance} km
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 5. Red SOS Emergency Floating Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/emergency')}
        className={cn(
          "fixed bottom-24 right-6 w-16 h-16 rounded-full bg-rose-600 text-white shadow-2xl flex items-center justify-center z-50",
          isEmergency && "emergency-pulse"
        )}
      >
        <div className="flex flex-col items-center">
          <Phone size={24} />
          <span className="text-[8px] font-black uppercase tracking-tighter mt-0.5">{t('common.sos')}</span>
        </div>
      </motion.button>
    </div>
  );
};
