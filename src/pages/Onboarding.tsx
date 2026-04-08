import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Phone, 
  MapPin, 
  Droplet, 
  CheckCircle2, 
  ArrowRight, 
  Search,
  Plus,
  X,
  Pill as PillIcon
} from 'lucide-react';
import { storage } from '../lib/storage';
import { ChronicCondition, Medication } from '../types';
import { cn } from '../lib/utils';

import { useLocation } from '../hooks/useLocation';

const STEPS = ['profile', 'otp', 'conditions', 'medications'];

const CONDITION_OPTIONS = [
  'diabetes', 'hypertension', 'asthma', 'thyroid', 
  'heartDisease', 'kidneyDisease', 'arthritis', 'migraine', 'none'
];

const MOCK_MEDICINES = [
  'Metformin', 'Paracetamol', 'Dolo 650', 'Insulin', 
  'Thyroxine', 'Telmisartan', 'Amlodipine', 'Pantoprazole', 'Cetirizine'
];

export const Onboarding = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const { getLocation, loading: locationLoading, error: locationError, data: locationData } = useLocation();
  
  // Profile State
  const [profile, setProfile] = useState({
    fullName: '',
    phoneNumber: '',
    age: '',
    gender: 'male',
    bloodGroup: '',
    emergencyContact: ''
  });
  
  const [manualVillage, setManualVillage] = useState('');
  const [showManualLocation, setShowManualLocation] = useState(false);

  // OTP State
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  // Conditions State
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [otherCondition, setOtherCondition] = useState('');

  // Medications State
  const [medications, setMedications] = useState<Partial<Medication>[]>([]);
  const [currentMed, setCurrentMed] = useState<Partial<Medication> | null>(null);
  const [medSearch, setMedSearch] = useState('');

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      // Finalize
      storage.updateProfile({ 
        ...profile, 
        age: parseInt(profile.age), 
        village: locationData?.village || manualVillage || 'Unknown',
        district: locationData?.district || '',
        state: locationData?.state || '',
        latitude: locationData?.latitude,
        longitude: locationData?.longitude,
        locationResolutionStatus: locationData?.status || (manualVillage ? 'resolved' : 'none'),
        onboarded: true 
      });
      storage.setConditions(selectedConditions.map(c => ({
        id: crypto.randomUUID(),
        name: c,
        selectedAt: Date.now(),
        syncStatus: 'pending'
      })));
      medications.forEach(m => storage.addMedication(m as any));
      navigate('/');
    }
  };

  const handleSendOtp = () => {
    setIsOtpSent(true);
  };

  const handleVerifyOtp = () => {
    if (otp === '123456') {
      handleNext();
    }
  };

  const toggleCondition = (c: string) => {
    setSelectedConditions(prev => 
      prev.includes(c) ? prev.filter(item => item !== c) : [...prev, c]
    );
  };

  const addMedication = () => {
    if (currentMed && currentMed.name) {
      setMedications([...medications, currentMed]);
      setCurrentMed(null);
      setMedSearch('');
    }
  };

  const handleDemoMode = () => {
    storage.setDemoMode(true);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-white p-6 pb-24">
      {/* Demo Mode Quick Access */}
      {step === 0 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleDemoMode}
          className="fixed top-6 right-6 z-[60] bg-amber-50 text-amber-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100 shadow-sm"
        >
          Demo Mode
        </motion.button>
      )}

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-emerald-900">{t('onboarding.title')}</h2>
              <p className="text-slate-500">{t('onboarding.subtitle')}</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('onboarding.fullName')}</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={e => setProfile({...profile, fullName: e.target.value})}
                    className="w-full bg-emerald-50/50 border border-emerald-100 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    placeholder="e.g. Rajesh Kumar"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('onboarding.phoneNumber')}</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />
                    <input
                      type="tel"
                      value={profile.phoneNumber}
                      onChange={e => setProfile({...profile, phoneNumber: e.target.value})}
                      className="w-full bg-emerald-50/50 border border-emerald-100 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      placeholder="9876543210"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('onboarding.age')}</label>
                  <input
                    type="number"
                    value={profile.age}
                    onChange={e => setProfile({...profile, age: e.target.value})}
                    className="w-full bg-emerald-50/50 border border-emerald-100 rounded-2xl py-4 px-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    placeholder="45"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('onboarding.village')}</label>
                
                {!showManualLocation ? (
                  <div className={cn(
                    "premium-card border-2 transition-all duration-300",
                    locationData ? "border-emerald-500 bg-emerald-50/30" : "border-emerald-100 bg-white"
                  )}>
                    {locationLoading ? (
                      <div className="flex items-center gap-3 py-2">
                        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-medium text-emerald-700">{t('onboarding.detecting')}</span>
                      </div>
                    ) : locationData ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-emerald-700">
                            <MapPin size={20} />
                            <span className="font-bold">{t('onboarding.locationDetected')}</span>
                          </div>
                          <button 
                            onClick={getLocation}
                            className="text-xs font-bold text-emerald-600 underline"
                          >
                            {t('onboarding.retry')}
                          </button>
                        </div>
                        <div className="bg-white/50 rounded-xl p-3 border border-emerald-100">
                          <p className="text-sm font-bold text-slate-900">
                            {locationData.village || t('onboarding.locationPending')}
                          </p>
                          {locationData.district && (
                            <p className="text-xs text-slate-500">{locationData.district}, {locationData.state}</p>
                          )}
                          <p className="text-[10px] text-slate-400 mt-1 font-mono">
                            {locationData.latitude.toFixed(4)}, {locationData.longitude.toFixed(4)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <button
                          onClick={getLocation}
                          className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all"
                        >
                          <MapPin size={20} />
                          {t('onboarding.useLocation')}
                        </button>
                        {locationError && (
                          <p className="text-xs text-rose-500 font-medium text-center">
                            {locationError}. <button onClick={() => setShowManualLocation(true)} className="underline">{t('onboarding.enterManually')}</button>
                          </p>
                        )}
                        <button 
                          onClick={() => setShowManualLocation(true)}
                          className="w-full text-center text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors"
                        >
                          {t('onboarding.enterManually')}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />
                    <input
                      type="text"
                      value={manualVillage}
                      onChange={e => setManualVillage(e.target.value)}
                      className="w-full bg-emerald-50/50 border border-emerald-100 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      placeholder="Village Name"
                    />
                    <button 
                      onClick={() => setShowManualLocation(false)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-600 underline"
                    >
                      Use GPS
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('onboarding.bloodGroup')}</label>
                  <div className="relative">
                    <Droplet className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500" size={20} />
                    <input
                      type="text"
                      value={profile.bloodGroup}
                      onChange={e => setProfile({...profile, bloodGroup: e.target.value})}
                      className="w-full bg-emerald-50/50 border border-emerald-100 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      placeholder="O+"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('onboarding.emergencyContact')}</label>
                  <input
                    type="tel"
                    value={profile.emergencyContact}
                    onChange={e => setProfile({...profile, emergencyContact: e.target.value})}
                    className="w-full bg-emerald-50/50 border border-emerald-100 rounded-2xl py-4 px-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    placeholder="Emergency No."
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full medical-gradient text-white rounded-2xl py-4 font-bold shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
            >
              {t('common.continue')} <ArrowRight size={20} />
            </button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 text-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Phone size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-emerald-900">{isOtpSent ? t('onboarding.verifyOtp') : t('onboarding.sendOtp')}</h2>
              <p className="text-slate-500">{isOtpSent ? t('onboarding.otpSent') : `We'll send a code to ${profile.phoneNumber}`}</p>
            </div>

            {isOtpSent ? (
              <div className="space-y-6">
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  className="w-full bg-emerald-50/50 border border-emerald-100 rounded-2xl py-6 text-center text-3xl font-black tracking-[1em] focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="000000"
                />
                <button
                  onClick={handleVerifyOtp}
                  className="w-full medical-gradient text-white rounded-2xl py-4 font-bold shadow-lg shadow-emerald-200"
                >
                  {t('onboarding.verifyOtp')}
                </button>
              </div>
            ) : (
              <button
                onClick={handleSendOtp}
                className="w-full medical-gradient text-white rounded-2xl py-4 font-bold shadow-lg shadow-emerald-200"
              >
                {t('onboarding.sendOtp')}
              </button>
            )}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="conditions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-emerald-900">{t('onboarding.conditionsTitle')}</h2>
              <p className="text-slate-500">{t('onboarding.conditionsSubtitle')}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {CONDITION_OPTIONS.map(c => (
                <button
                  key={c}
                  onClick={() => toggleCondition(c)}
                  className={cn(
                    "p-4 rounded-2xl border text-left transition-all duration-300 flex items-center justify-between",
                    selectedConditions.includes(c) 
                      ? "bg-emerald-600 border-emerald-600 text-white shadow-md" 
                      : "bg-white border-emerald-50 text-slate-600"
                  )}
                >
                  <span className="font-bold text-sm">{t(`conditions.${c}`)}</span>
                  {selectedConditions.includes(c) && <CheckCircle2 size={16} />}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('conditions.other')}</label>
              <input
                type="text"
                value={otherCondition}
                onChange={e => setOtherCondition(e.target.value)}
                className="w-full bg-emerald-50/50 border border-emerald-100 rounded-2xl py-4 px-4 focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Type other conditions..."
              />
            </div>

            <button
              onClick={handleNext}
              className="w-full medical-gradient text-white rounded-2xl py-4 font-bold shadow-lg shadow-emerald-200"
            >
              {t('common.continue')}
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="medications"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-emerald-900">{t('onboarding.medicationsTitle')}</h2>
              <p className="text-slate-500">{t('onboarding.medicationsSubtitle')}</p>
            </div>

            {/* Added Meds List */}
            <div className="space-y-3">
              {medications.map((m, i) => (
                <div key={i} className="premium-card !p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <PillIcon size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{m.name}</p>
                      <p className="text-xs text-slate-500">{m.dosage} • {m.timing?.join(', ')}</p>
                    </div>
                  </div>
                  <button onClick={() => setMedications(medications.filter((_, idx) => idx !== i))}>
                    <X size={18} className="text-slate-400" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Med Form */}
            {!currentMed ? (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    value={medSearch}
                    onChange={e => setMedSearch(e.target.value)}
                    className="w-full bg-emerald-50/50 border border-emerald-100 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder={t('medications.search')}
                  />
                </div>
                
                {medSearch && (
                  <div className="bg-white border border-emerald-50 rounded-2xl overflow-hidden shadow-xl">
                    {MOCK_MEDICINES.filter(m => m.toLowerCase().includes(medSearch.toLowerCase())).map(m => (
                      <button
                        key={m}
                        onClick={() => setCurrentMed({ name: m, timing: [], dosage: '', frequency: '' })}
                        className="w-full text-left px-6 py-4 hover:bg-emerald-50 border-b border-emerald-50 last:border-0 transition-colors"
                      >
                        {m}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentMed({ name: medSearch, timing: [], dosage: '', frequency: '' })}
                      className="w-full text-left px-6 py-4 hover:bg-emerald-50 text-emerald-600 font-bold flex items-center gap-2"
                    >
                      <Plus size={18} /> Add "{medSearch}"
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="premium-card space-y-4 border-emerald-200"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-emerald-900">{currentMed.name}</h4>
                  <button onClick={() => setCurrentMed(null)}><X size={18} /></button>
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder={t('medications.dosage')}
                    value={currentMed.dosage}
                    onChange={e => setCurrentMed({...currentMed, dosage: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none"
                  />

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('medications.timing')}</label>
                    <div className="flex flex-wrap gap-2">
                      {['morning', 'afternoon', 'evening', 'night'].map(time => (
                        <button
                          key={time}
                          onClick={() => {
                            const timing = currentMed.timing || [];
                            setCurrentMed({
                              ...currentMed,
                              timing: timing.includes(time as any) 
                                ? timing.filter(t => t !== time) 
                                : [...timing, time as any]
                            });
                          }}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-bold transition-all",
                            currentMed.timing?.includes(time as any)
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-100 text-slate-600"
                          )}
                        >
                          {t(`medications.${time}`)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={addMedication}
                  className="w-full bg-emerald-600 text-white rounded-xl py-3 font-bold"
                >
                  {t('common.save')}
                </button>
              </motion.div>
            )}

            <button
              onClick={handleNext}
              className="w-full medical-gradient text-white rounded-2xl py-4 font-bold shadow-lg shadow-emerald-200"
            >
              {t('common.finish')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
