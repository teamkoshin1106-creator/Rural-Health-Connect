import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  Square, 
  Image as ImageIcon, 
  Send, 
  X, 
  AlertTriangle,
  Stethoscope,
  Activity,
  ArrowLeft,
  Loader2,
  Pill as PillIcon,
  Phone,
  ChevronRight,
  ChevronDown,
  Info,
  MapPin,
  Clock,
  Calendar,
  Star,
  CheckCircle2,
  ExternalLink,
  User
} from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { offlineTriage } from '../services/offlineTriage';
import { orchestrationService } from '../services/orchestrationService';
import { storage } from '../lib/storage';
import { AIAnalysisResult, Doctor, Pharmacy, MedicalFacility, FollowUpTask, Consultation } from '../types';
import { cn } from '../lib/utils';
import { ConsultationRoom } from './ConsultationRoom';

export const SymptomChecker = () => {
  const { t, i18n } = useTranslation();
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedDifferential, setExpandedDifferential] = useState<number | null>(null);
  
  // Orchestration state
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [facilities, setFacilities] = useState<MedicalFacility[]>([]);
  const [followUps, setFollowUps] = useState<FollowUpTask[]>([]);
  const [activeConsultationId, setActiveConsultationId] = useState<string | null>(null);

  // Conversational state
  const [followUpAnswers, setFollowUpAnswers] = useState<{ question: string; answer: string }[]>([]);
  const [currentFollowUpIndex, setCurrentFollowUpIndex] = useState(-1);
  const [currentAnswer, setCurrentAnswer] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleAnalyze = async (answers = followUpAnswers) => {
    if (!text && images.length === 0) return;

    setIsAnalyzing(true);
    setError(null);
    const memory = storage.getMemory();

    try {
      let aiResult: AIAnalysisResult;
      if (navigator.onLine) {
        aiResult = await geminiService.analyzeSymptoms(text, memory, images, i18n.language, answers);
        
        if (aiResult.followUpQuestions && aiResult.followUpQuestions.length > 0 && currentFollowUpIndex === -1) {
          setResult(aiResult);
          setCurrentFollowUpIndex(0);
          setIsAnalyzing(false);
          return;
        }
        // Cache successful analysis for offline use
        storage.saveKnowledge(text.substring(0, 50), aiResult);
      } else {
        aiResult = offlineTriage.analyze(text, memory);
      }

      setResult(aiResult);
      setCurrentFollowUpIndex(-1);

      // Orchestrate care
      const matchedDoctors = orchestrationService.getMatchingDoctors(aiResult, i18n.language);
      setDoctors(matchedDoctors);

      const lat = memory.profile?.latitude || 12.9716;
      const lng = memory.profile?.longitude || 77.5946;
      
      setPharmacies(orchestrationService.getNearbyPharmacies(lat, lng));
      setFacilities(orchestrationService.getNearbyFacilities(lat, lng));
      setFollowUps(orchestrationService.generateFollowUpTasks(aiResult));

    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBookConsultation = (doctor: Doctor) => {
    if (!result) return;
    
    const consultation: Consultation = {
      id: crypto.randomUUID(),
      doctorId: doctor.id,
      patientId: storage.getMemory().profile?.id || 'anonymous',
      status: 'active',
      mode: doctor.consultationModes[0],
      soapPackage: result,
      createdAt: Date.now(),
      syncStatus: navigator.onLine ? 'synced' : 'pending'
    };

    storage.saveConsultation(consultation);
    setActiveConsultationId(consultation.id);
  };

  if (activeConsultationId) {
    return <ConsultationRoom consultationId={activeConsultationId} onBack={() => setActiveConsultationId(null)} />;
  }

  const handleAnswerFollowUp = () => {
    if (!currentAnswer || !result?.followUpQuestions) return;
    
    const newAnswers = [...followUpAnswers, { 
      question: result.followUpQuestions[currentFollowUpIndex], 
      answer: currentAnswer 
    }];
    setFollowUpAnswers(newAnswers);
    setCurrentAnswer('');

    if (currentFollowUpIndex < result.followUpQuestions.length - 1) {
      setCurrentFollowUpIndex(currentFollowUpIndex + 1);
    } else {
      // All questions answered, re-analyze
      handleAnalyze(newAnswers);
    }
  };

  if (result && currentFollowUpIndex !== -1 && result.followUpQuestions) {
    return (
      <div className="p-4 space-y-6 pb-24">
        <header className="flex items-center gap-4">
          <button onClick={() => { setResult(null); setCurrentFollowUpIndex(-1); setFollowUpAnswers([]); }} className="p-2 rounded-full bg-slate-100">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold text-slate-900">Follow-up Questions</h2>
        </header>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="premium-card space-y-6"
        >
          <div className="space-y-2">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Question {currentFollowUpIndex + 1} of {result.followUpQuestions.length}</p>
            <h3 className="text-lg font-bold text-slate-900">{result.followUpQuestions[currentFollowUpIndex]}</h3>
          </div>

          <textarea
            value={currentAnswer}
            onChange={e => setCurrentAnswer(e.target.value)}
            className="w-full h-32 bg-emerald-50/30 border border-emerald-50 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none text-slate-700"
            placeholder="Type your answer here..."
          />

          <button
            onClick={handleAnswerFollowUp}
            disabled={!currentAnswer}
            className="w-full medical-gradient text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-200 disabled:opacity-50"
          >
            {currentFollowUpIndex < result.followUpQuestions.length - 1 ? "Next Question" : "Get Final Analysis"}
          </button>
        </motion.div>
      </div>
    );
  }

  if (result && currentFollowUpIndex === -1) {
    return (
      <div className="p-4 space-y-8 pb-24">
        <header className="flex items-center justify-between">
          <button onClick={() => { setResult(null); setFollowUpAnswers([]); }} className="p-2 rounded-full bg-white border border-slate-100 shadow-sm">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analysis Complete</span>
          </div>
        </header>

        {/* Main Condition Hero Card */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className={cn(
            "p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden",
            result.riskLevel === 'emergency' ? "bg-rose-600 shadow-rose-200" :
            result.riskLevel === 'high' ? "bg-amber-500 shadow-amber-100" :
            "bg-emerald-600 shadow-emerald-100"
          )}>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 blur-xl" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[10px] font-black uppercase tracking-widest">
                  {result.riskLevel} Risk
                </div>
                <div className="flex items-center gap-1.5">
                  <Activity size={16} className="animate-pulse" />
                  <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">AI Intelligence</span>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-black leading-tight tracking-tighter">
                  {result.conditionHypotheses[0]}
                </h2>
                <div className="flex items-center gap-2 text-white/80">
                  <Star size={16} fill="currentColor" />
                  <span className="text-sm font-bold">Confidence: {(result.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/10 border border-white/10">
                <p className="text-sm font-medium leading-relaxed">
                  {result.whenToWorry}
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3 -mt-12 px-4 relative z-20">
          <div className="bg-white p-4 rounded-3xl shadow-lg border border-slate-100 flex flex-col items-center text-center gap-1">
            <Stethoscope size={20} className="text-emerald-500" />
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Specialist</p>
            <p className="text-xs font-black text-slate-900">{result.likelySpecialist}</p>
          </div>
          <div className="bg-white p-4 rounded-3xl shadow-lg border border-slate-100 flex flex-col items-center text-center gap-1">
            <Clock size={20} className="text-amber-500" />
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Action Time</p>
            <p className="text-xs font-black text-slate-900">Immediate</p>
          </div>
        </div>

        {/* Why this is happening */}
        <section className="premium-card space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Clinical Reasoning</h3>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">{result.auditTrail.reasoning}</p>
        </section>

        {/* Differentials */}
        {result.differentials && result.differentials.length > 0 && (
          <section className="space-y-3">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Activity size={18} className="text-emerald-500" />
              Differential Possibilities
            </h3>
            <div className="space-y-3">
              {result.differentials.map((d, i) => (
                <div 
                  key={i} 
                  className="premium-card !p-0 overflow-hidden border border-slate-100"
                  onClick={() => setExpandedDifferential(expandedDifferential === i ? null : i)}
                >
                  <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        d.confidence > 0.6 ? "bg-emerald-500" :
                        d.confidence > 0.3 ? "bg-amber-500" :
                        "bg-slate-300"
                      )} />
                      <span className="font-bold text-slate-900">{d.condition}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">
                        {(d.confidence * 100).toFixed(0)}%
                      </span>
                      {expandedDifferential === i ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                  </div>
                  <AnimatePresence>
                    {expandedDifferential === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4 border-t border-slate-50"
                      >
                        <p className="text-xs text-slate-600 leading-relaxed mt-3">
                          <span className="font-bold text-slate-900">Reasoning:</span> {d.reason}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Medication Interaction */}
        {result.medicationInteraction && (
          <div className={cn(
            "p-4 rounded-2xl border-2 space-y-2",
            result.medicationInteraction.severity === 'high' ? "border-rose-200 bg-rose-50" :
            result.medicationInteraction.severity === 'medium' ? "border-amber-200 bg-amber-50" :
            "border-emerald-200 bg-emerald-50"
          )}>
            <div className="flex items-center gap-2">
              <PillIcon size={20} className={cn(
                result.medicationInteraction.severity === 'high' ? "text-rose-500" :
                result.medicationInteraction.severity === 'medium' ? "text-amber-500" :
                "text-emerald-500"
              )} />
              <h4 className="font-bold text-slate-900">Medication Warning</h4>
            </div>
            <p className="text-sm font-bold text-slate-800">{result.medicationInteraction.warning}</p>
            <p className="text-xs text-slate-600">{result.medicationInteraction.details}</p>
          </div>
        )}

        {/* Image Analysis */}
        {result.imageAnalysis && (
          <section className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase">Visual Analysis</h4>
            <div className="grid grid-cols-2 gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative rounded-2xl overflow-hidden aspect-square border-2 border-slate-100">
                  <img src={img} alt="Uploaded" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className={cn(
                    "absolute top-2 right-2 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest text-white shadow-lg",
                    result.imageAnalysis?.severity.toLowerCase().includes('high') || result.imageAnalysis?.severity.toLowerCase().includes('severe') 
                      ? "bg-rose-500" : "bg-emerald-500"
                  )}>
                    {result.imageAnalysis?.severity}
                  </div>
                  {/* Simulated Overlay Marker */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 border-2 border-dashed border-rose-400 rounded-full animate-pulse flex items-center justify-center">
                      <div className="w-1 h-1 bg-rose-500 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="premium-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">Infection Risk:</span>
                <span className={cn(
                  "text-xs font-bold px-2 py-0.5 rounded-full",
                  result.imageAnalysis.infectionRisk.toLowerCase().includes('high') ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
                )}>
                  {result.imageAnalysis.infectionRisk}
                </span>
              </div>
              <ul className="space-y-1">
                {result.imageAnalysis.findings.map((f, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-center gap-2">
                    <Info size={12} className="text-emerald-500" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Suggestions */}
        <div className="grid grid-cols-2 gap-4">
          <div className="premium-card !p-4 space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase">OTC Suggestions</h4>
            <ul className="space-y-1">
              {result.suggestions.otcMedicines.map((m, i) => (
                <li key={i} className="text-xs font-bold text-emerald-700">{m}</li>
              ))}
            </ul>
          </div>
          <div className="premium-card !p-4 space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase">Likely Tests</h4>
            <ul className="space-y-1">
              {result.suggestions.diagnostics.map((d, i) => (
                <li key={i} className="text-xs font-bold text-slate-700">{d}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommended Doctors */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <User size={18} className="text-emerald-500" />
              Recommended Doctors
            </h3>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-wider">
              {result.riskLevel === 'emergency' ? 'Urgent Care' : 'Specialist Match'}
            </span>
          </div>
          <div className="space-y-4">
            {doctors.map((doc, i) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="premium-card !p-4 border border-slate-100 relative overflow-hidden"
              >
                {i === 0 && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[8px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">
                    Best Match
                  </div>
                )}
                <div className="flex gap-4">
                  <div className="relative">
                    <img src={doc.photoUrl} alt={doc.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-50" referrerPolicy="no-referrer" />
                    <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-lg shadow-sm">
                      <div className="flex items-center gap-0.5 text-[10px] font-bold text-amber-500">
                        <Star size={10} fill="currentColor" /> {doc.rating}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">{doc.name}</h4>
                    <p className="text-[10px] font-medium text-slate-500">{doc.specialization} • {doc.experience}y Exp</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {doc.languages.map(lang => (
                        <span key={lang} className="text-[8px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded uppercase">{lang}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock size={12} className="text-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-600">{doc.earliestSlot}</span>
                  </div>
                  <button 
                    onClick={() => handleBookConsultation(doc)}
                    className="medical-gradient text-white text-[10px] font-bold px-4 py-2 rounded-xl shadow-md shadow-emerald-100"
                  >
                    Book Consultation
                  </button>
                </div>
                <div className="mt-3 p-2 bg-emerald-50/50 rounded-lg">
                  <p className="text-[9px] text-emerald-700 leading-relaxed italic">
                    <span className="font-bold">Why:</span> {doc.matchReason}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Nearby Pharmacies */}
        <section className="space-y-3">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <PillIcon size={18} className="text-emerald-500" />
            Nearby Pharmacies
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
            {pharmacies.map((pharma) => (
              <div key={pharma.id} className="min-w-[200px] premium-card !p-4 border border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{pharma.name}</h4>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    pharma.isOpen ? "bg-emerald-500" : "bg-rose-500"
                  )} />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <MapPin size={12} /> {pharma.distance} km away
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-emerald-600 font-bold">
                    <CheckCircle2 size={12} /> Medicines Available
                  </div>
                </div>
                <button className="w-full py-2 rounded-xl bg-slate-50 text-slate-600 text-[10px] font-bold border border-slate-100">
                  Reserve Medicines
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* PHC & Lab Referrals */}
        <section className="space-y-3">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <MapPin size={18} className="text-emerald-500" />
            PHC & Diagnostic Referrals
          </h3>
          <div className="space-y-3">
            {facilities.map((fac) => (
              <div key={fac.id} className="premium-card !p-4 border border-slate-100 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900">{fac.name}</h4>
                    <span className="text-[8px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase">{fac.type}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">{fac.services.join(' • ')}</p>
                  <p className="text-[10px] font-bold text-emerald-600">{fac.distance} km away</p>
                </div>
                <button className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                  <ExternalLink size={18} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Follow-up Continuity */}
        <section className="premium-card !p-5 bg-emerald-50 border-emerald-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-emerald-900 flex items-center gap-2">
              <Calendar size={18} />
              Proactive Follow-up Plan
            </h3>
          </div>
          <div className="space-y-3">
            {followUps.map((task) => (
              <div key={task.id} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-emerald-100 shadow-sm">
                <div className="mt-1 p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <Clock size={14} />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-slate-900">{task.title}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">{task.description}</p>
                  <p className="text-[9px] font-bold text-emerald-600 mt-1 uppercase tracking-wider">
                    Due in {Math.round((task.dueAt - Date.now()) / (60 * 60 * 1000))} hours
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Emergency Escalation (Only if high risk) */}
        {result.riskLevel === 'emergency' && (
          <section className="p-6 rounded-3xl bg-rose-600 text-white space-y-6 shadow-xl shadow-rose-200">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-white/20 animate-pulse">
                <AlertTriangle size={32} />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tighter">Emergency Protocol</h3>
                <p className="text-xs font-medium opacity-80">Life-threatening symptoms detected</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button className="bg-white text-rose-600 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg">
                <Phone size={20} /> CALL 108
              </button>
              <button className="bg-rose-700 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 border border-rose-500">
                <MapPin size={20} /> ROUTE TO PHC
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-black/10 border border-white/10 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Nearest Emergency Hub</p>
              <p className="text-sm font-bold">District Trauma Centre (12.5 km)</p>
              <p className="text-[10px] opacity-80">Estimated travel time: 22 mins via NH-4</p>
            </div>
          </section>
        )}

        {/* SOAP Summary */}
        <section className="premium-card bg-slate-900 text-slate-300 !p-5 space-y-4">
          <h4 className="text-xs font-bold text-slate-500 uppercase">Doctor SOAP Summary</h4>
          <div className="space-y-3 font-mono text-[10px]">
            <div>
              <span className="text-emerald-500 font-bold">S (Subjective):</span>
              <p className="mt-1">{result.soapSummary.subjective}</p>
            </div>
            <div>
              <span className="text-emerald-500 font-bold">O (Objective):</span>
              <p className="mt-1">{result.soapSummary.objective}</p>
            </div>
            <div>
              <span className="text-emerald-500 font-bold">A (Assessment):</span>
              <p className="mt-1">{result.soapSummary.assessment}</p>
            </div>
            <div>
              <span className="text-emerald-500 font-bold">P (Plan):</span>
              <p className="mt-1">{result.soapSummary.plan}</p>
            </div>
          </div>
        </section>

        {/* Audit Trail & Explainability */}
        <section className="premium-card space-y-3">
          <div className="flex items-center gap-2">
            <Stethoscope size={18} className="text-emerald-500" />
            <h4 className="text-xs font-bold text-slate-900 uppercase">AI Reasoning Trail</h4>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <p className="text-[10px] text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-900">Logic:</span> {result.auditTrail.reasoning}
            </p>
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
              <span className="text-[8px] font-bold text-slate-400 uppercase">Sources:</span>
              {result.auditTrail.sources.map((s, i) => (
                <span key={i} className="text-[8px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
          <p className="text-[10px] text-slate-500 leading-relaxed italic">
            {result.disclaimer}
          </p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          {result.riskLevel === 'emergency' ? (
            <>
              <button className="col-span-2 medical-gradient text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-200">
                <Activity size={20} /> {t('symptoms.ambulance')}
              </button>
              <button className="bg-white border border-emerald-100 text-emerald-700 py-4 rounded-2xl font-bold">
                {t('symptoms.nearestPHC')}
              </button>
            </>
          ) : (
            <>
              <button className="medical-gradient text-white py-4 rounded-2xl font-bold">
                {t('symptoms.sendToDoctor')}
              </button>
              <button className="bg-white border border-emerald-100 text-emerald-700 py-4 rounded-2xl font-bold">
                {t('symptoms.nearestPHC')}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-24">
      <header className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900">{t('symptoms.title')}</h2>
        <p className="text-slate-500 text-sm">{t('symptoms.subtitle')}</p>
      </header>

      <div className="premium-card space-y-4">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          className="w-full h-40 bg-emerald-50/10 border border-slate-100 rounded-[24px] p-5 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none text-slate-700 font-medium"
          placeholder={t('symptoms.describePlaceholder')}
        />

        {/* Demo Mode Quick Fill */}
        {storage.getMemory().profile?.demoMode && (
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Chest Pain', text: 'I have sharp chest pain and shortness of breath.' },
              { label: 'Fever', text: 'High fever, headache and body aches for 2 days.' },
              { label: 'Skin Rash', text: 'Red itchy rash on my arm after gardening.' }
            ].map((demo) => (
              <button
                key={demo.label}
                onClick={() => setText(demo.text)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
              >
                + {demo.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all",
              isRecording ? "bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-200" : "bg-slate-50 text-slate-600 border border-slate-100"
            )}
          >
            {isRecording ? <Square size={16} /> : <Mic size={16} />}
            {isRecording ? t('symptoms.stopRecording') : t('symptoms.voiceRecord')}
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-50 text-slate-600 border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
          >
            <ImageIcon size={16} />
            {t('symptoms.uploadImage')}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
            multiple
            accept="image/*"
          />
        </div>

        {images.length > 0 && (
          <div className="flex flex-wrap gap-3 pt-2">
            {images.map((img, i) => (
              <div key={i} className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm">
                <img src={img} className="w-full h-full object-cover" />
                <button
                  onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                  className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-lg backdrop-blur-sm"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleAnalyze}
        disabled={isAnalyzing || (!text && images.length === 0)}
        className="w-full py-5 medical-gradient text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-200 disabled:opacity-50 flex items-center justify-center gap-3 transition-all active:scale-95"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            {t('symptoms.analyzing')}
          </>
        ) : (
          <>
            <Stethoscope size={20} />
            {t('symptoms.analyze')}
          </>
        )}
      </button>

      {!navigator.onLine && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-xs font-medium">
          <AlertTriangle size={14} />
          {t('symptoms.offlineWarning')}
        </div>
      )}
    </div>
  );
};
