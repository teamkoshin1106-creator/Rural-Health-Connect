/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { 
  AlertTriangle, 
  Phone, 
  MapPin 
} from 'lucide-react';
import { AppHeader } from './components/AppHeader';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './pages/Dashboard';
import { Onboarding } from './pages/Onboarding';
import { SymptomChecker } from './pages/SymptomChecker';
import { Settings } from './pages/Settings';
import { Pharmacy } from './pages/Pharmacy';
import { Doctors } from './pages/Doctors';
import { Reminders } from './pages/Reminders';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { storage } from './lib/storage';
import './i18n/config';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    const memory = storage.getMemory();
    setOnboarded(!!memory.profile?.onboarded);
  }, []);

  if (onboarded === null) return null;
  if (!onboarded) return <Navigate to="/onboarding" replace />;
  
  return <>{children}</>;
};

export default function App() {
  const [isEmergency, setIsEmergency] = useState(false);

  return (
    <Router>
      <div className={cn(
        "min-h-screen flex flex-col max-w-md mx-auto relative shadow-2xl shadow-emerald-900/10 transition-colors duration-500",
        isEmergency ? "bg-rose-50" : "bg-slate-50/50"
      )}>
        <AppHeader />
        
        <main className="flex-1 overflow-y-auto">
          <Suspense fallback={<PlaceholderPage title="common.loading" />}>
            <Routes>
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/symptoms" element={<ProtectedRoute><SymptomChecker /></ProtectedRoute>} />
              <Route path="/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
              <Route path="/records" element={<ProtectedRoute><PlaceholderPage title="nav.records" /></ProtectedRoute>} />
              <Route path="/pharmacy" element={<ProtectedRoute><Pharmacy /></ProtectedRoute>} />
              <Route path="/doctors" element={<ProtectedRoute><Doctors /></ProtectedRoute>} />
              <Route path="/appointments" element={<ProtectedRoute><Doctors /></ProtectedRoute>} />
              <Route path="/emergency" element={<ProtectedRoute><PlaceholderPage title="nav.emergency" /></ProtectedRoute>} />
              <Route path="/summary" element={<ProtectedRoute><PlaceholderPage title="nav.summary" /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            </Routes>
          </Suspense>
        </main>

        <BottomNav />
        
        {/* Floating SOS Button */}
        <div className="fixed bottom-24 right-4 z-40">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsEmergency(!isEmergency)}
            className={cn(
              "w-14 h-14 rounded-full text-white shadow-lg flex items-center justify-center transition-all duration-500",
              isEmergency ? "bg-rose-600 shadow-rose-300 scale-110" : "bg-rose-500 shadow-rose-200"
            )}
          >
            <div className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-20" />
            <span className="font-black text-xs tracking-tighter">SOS</span>
          </motion.button>
        </div>

        {/* Emergency Overlay */}
        <AnimatePresence>
          {isEmergency && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-rose-600/95 z-[60] flex flex-col items-center justify-center p-8 text-white text-center"
            >
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-8"
              >
                <AlertTriangle size={48} />
              </motion.div>
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Emergency Mode</h2>
              <p className="text-rose-100 mb-12">Immediate assistance is being coordinated. Stay calm.</p>
              
              <div className="w-full space-y-4">
                <button className="w-full py-5 bg-white text-rose-600 rounded-3xl font-black text-lg shadow-xl flex items-center justify-center gap-3">
                  <Phone size={24} /> CALL AMBULANCE (108)
                </button>
                <button className="w-full py-5 bg-rose-700 text-white rounded-3xl font-black text-lg border border-rose-500 flex items-center justify-center gap-3">
                  <MapPin size={24} /> NEAREST HOSPITAL
                </button>
                <button 
                  onClick={() => setIsEmergency(false)}
                  className="w-full py-4 text-rose-200 font-bold text-sm"
                >
                  CANCEL EMERGENCY
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Router>
  );
}
