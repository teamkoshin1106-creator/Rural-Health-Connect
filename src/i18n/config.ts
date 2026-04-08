import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import locales from './locales.json';

const resources = {
  en: { translation: locales.en },
  hi: { translation: locales.hi },
  ta: { translation: locales.ta },
  kn: { translation: locales.kn },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    }
  });

export default i18n;
