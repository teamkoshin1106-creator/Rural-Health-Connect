import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { 
  ShoppingBag, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Search
} from 'lucide-react';
import { orchestrationService } from '../services/orchestrationService';
import { storage } from '../lib/storage';
import { cn } from '../lib/utils';

import { TopBar } from '../components/TopBar';

export const Pharmacy = () => {
  const { t } = useTranslation();
  const memory = storage.getMemory();
  const lat = memory.profile?.latitude || 13.0698;
  const lng = memory.profile?.longitude || 77.7982;
  const pharmacies = orchestrationService.getNearbyPharmacies(lat, lng);

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar title={t('nav.pharmacy')} />
      
      <div className="p-4 space-y-6 pb-24">
        <header className="space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Nearby verified medicine centers
          </p>
        </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input 
          type="text" 
          placeholder={t('medications.search')}
          className="w-full pl-11 pr-4 py-4 bg-white border border-slate-100 rounded-3xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
        />
      </div>

      <div className="space-y-4">
        {pharmacies.map((pharmacy, index) => (
          <motion.div
            key={pharmacy.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-[32px] p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{pharmacy.name}</h3>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <MapPin size={10} />
                    {pharmacy.distance} km away
                  </div>
                </div>
              </div>
              <div className={cn(
                "px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                pharmacy.isOpen ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              )}>
                {pharmacy.isOpen ? 'Open' : 'Closed'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-2xl">
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span className="text-[10px] font-bold text-slate-600 uppercase">Stock Available</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-2xl">
                <Clock size={12} className="text-blue-500" />
                <span className="text-[10px] font-bold text-slate-600 uppercase">Home Delivery</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                <Phone size={14} /> Call
              </button>
              <button className="flex-1 py-3 bg-emerald-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
                <MapPin size={14} /> Directions
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State Fallback (Never empty) */}
      {pharmacies.length === 0 && (
        <div className="text-center py-12 space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <AlertCircle size={32} />
          </div>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">No pharmacies found nearby</p>
          <button className="px-6 py-3 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-widest">
            Search wider area
          </button>
        </div>
      )}
    </div>
  );
};
