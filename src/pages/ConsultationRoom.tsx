import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Send, 
  Mic, 
  Video, 
  Phone, 
  Wifi, 
  WifiOff, 
  MessageSquare,
  User,
  ShieldCheck,
  FileText,
  Clock
} from 'lucide-react';
import { Consultation, Doctor } from '../types';
import { storage } from '../lib/storage';
import { cn } from '../lib/utils';

interface ConsultationRoomProps {
  consultationId: string;
  onBack: () => void;
}

export const ConsultationRoom = ({ consultationId, onBack }: ConsultationRoomProps) => {
  const { t } = useTranslation();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [message, setMessage] = useState('');
  const [networkStatus, setNetworkStatus] = useState<'stable' | 'moderate' | 'weak'>('stable');
  const [activeTab, setActiveTab] = useState<'chat' | 'summary'>('chat');

  useEffect(() => {
    const consultations = storage.getConsultations();
    const found = consultations.find(c => c.id === consultationId);
    if (found) {
      setConsultation(found);
      // Mock finding doctor
      setDoctor({
        id: found.doctorId,
        name: 'Dr. Ramesh Kumar',
        specialization: 'General Physician',
        languages: ['en', 'hi'],
        distance: 2.5,
        rating: 4.8,
        earliestSlot: 'Now',
        consultationModes: ['chat', 'audio'],
        matchReason: '',
        urgencyFit: 'high',
        experience: 15,
        photoUrl: 'https://picsum.photos/seed/doc1/200/200'
      });
    }

    // Simulate network monitoring
    const interval = setInterval(() => {
      const statuses: ('stable' | 'moderate' | 'weak')[] = ['stable', 'moderate', 'weak'];
      setNetworkStatus(statuses[Math.floor(Math.random() * statuses.length)]);
    }, 10000);

    return () => clearInterval(interval);
  }, [consultationId]);

  if (!consultation || !doctor) return null;

  const getRecommendedMode = () => {
    if (networkStatus === 'weak') return 'chat';
    if (networkStatus === 'moderate') return 'audio';
    return 'video';
  };

  const recommendedMode = getRecommendedMode();

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <header className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={doctor.photoUrl} alt={doctor.name} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{doctor.name}</h3>
              <p className="text-[10px] text-slate-500">{doctor.specialization}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            "px-2 py-1 rounded-full flex items-center gap-1.5",
            networkStatus === 'stable' ? "bg-emerald-50 text-emerald-600" :
            networkStatus === 'moderate' ? "bg-amber-50 text-amber-600" :
            "bg-rose-50 text-rose-600"
          )}>
            {networkStatus === 'weak' ? <WifiOff size={12} /> : <Wifi size={12} />}
            <span className="text-[10px] font-bold uppercase">{networkStatus}</span>
          </div>
        </div>
      </header>

      {/* Mode Recommendation */}
      <div className="bg-emerald-900 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span className="text-[10px] font-medium">Network optimized: <span className="font-bold uppercase">{recommendedMode}</span> recommended</span>
        </div>
        <div className="flex items-center gap-3">
          <button className={cn("p-1.5 rounded-lg", recommendedMode === 'chat' ? "bg-emerald-700" : "opacity-50")}><MessageSquare size={16} /></button>
          <button className={cn("p-1.5 rounded-lg", recommendedMode === 'audio' ? "bg-emerald-700" : "opacity-50")}><Phone size={16} /></button>
          <button className={cn("p-1.5 rounded-lg", recommendedMode === 'video' ? "bg-emerald-700" : "opacity-50")}><Video size={16} /></button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100">
        <button 
          onClick={() => setActiveTab('chat')}
          className={cn(
            "flex-1 py-3 text-xs font-bold transition-all border-b-2",
            activeTab === 'chat' ? "border-emerald-500 text-emerald-600" : "border-transparent text-slate-400"
          )}
        >
          Consultation Chat
        </button>
        <button 
          onClick={() => setActiveTab('summary')}
          className={cn(
            "flex-1 py-3 text-xs font-bold transition-all border-b-2",
            activeTab === 'summary' ? "border-emerald-500 text-emerald-600" : "border-transparent text-slate-400"
          )}
        >
          Medical Package
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
        {activeTab === 'chat' ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="bg-white/80 backdrop-blur px-3 py-1 rounded-full border border-slate-100 text-[10px] text-slate-400 font-medium">
                Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            
            <div className="flex gap-3">
              <img src={doctor.photoUrl} className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
              <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 max-w-[80%] shadow-sm">
                <p className="text-xs text-slate-700 leading-relaxed">
                  Hello! I have received your medical package. I am reviewing your symptoms and the AI analysis now. How are you feeling currently?
                </p>
              </div>
            </div>

            <div className="flex flex-row-reverse gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                ME
              </div>
              <div className="bg-emerald-600 p-3 rounded-2xl rounded-tr-none text-white max-w-[80%] shadow-md">
                <p className="text-xs leading-relaxed">
                  I am still feeling the pain in my chest, especially when I breathe deeply.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="premium-card space-y-4">
              <div className="flex items-center gap-2 text-emerald-600">
                <FileText size={18} />
                <h4 className="text-sm font-bold">SOAP Summary Package</h4>
              </div>
              <div className="space-y-3 font-mono text-[10px] bg-slate-900 text-slate-300 p-4 rounded-xl">
                <div>
                  <span className="text-emerald-500 font-bold">S (Subjective):</span>
                  <p className="mt-1">{consultation.soapPackage.soapSummary.subjective}</p>
                </div>
                <div>
                  <span className="text-emerald-500 font-bold">O (Objective):</span>
                  <p className="mt-1">{consultation.soapPackage.soapSummary.objective}</p>
                </div>
                <div>
                  <span className="text-emerald-500 font-bold">A (Assessment):</span>
                  <p className="mt-1">{consultation.soapPackage.soapSummary.assessment}</p>
                </div>
                <div>
                  <span className="text-emerald-500 font-bold">P (Plan):</span>
                  <p className="mt-1">{consultation.soapPackage.soapSummary.plan}</p>
                </div>
              </div>
            </div>

            <div className="premium-card space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase">AI Differentials</h4>
              <div className="space-y-2">
                {consultation.soapPackage.differentials.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 font-medium">{d.condition}</span>
                    <span className="font-bold text-emerald-600">{(d.confidence * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      {activeTab === 'chat' && (
        <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-3">
          <button className="p-3 rounded-2xl bg-slate-100 text-slate-500">
            <Mic size={20} />
          </button>
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button className="p-3 rounded-2xl medical-gradient text-white shadow-lg shadow-emerald-100">
            <Send size={20} />
          </button>
        </div>
      )}
    </div>
  );
};
