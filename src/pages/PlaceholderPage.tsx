import React from 'react';
import { useTranslation } from 'react-i18next';

import { TopBar } from '../components/TopBar';

export const PlaceholderPage = ({ title }: { title: string }) => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar title={t(title)} />
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-4">
      <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
      </div>
      <h2 className="text-xl font-bold text-slate-900">{t(title)}</h2>
      <p className="text-slate-500">This module is being optimized for offline-first rural access.</p>
    </div>
  );
};
