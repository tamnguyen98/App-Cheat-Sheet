/**
 * i18n: English + Spanish + Vietnamese. Auto-detect + settings selector.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './en';
import { es } from './es';
import { vi } from './vi';

export const LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'es', label: 'Spanish' },
  { id: 'vi', label: 'Vietnamese' },
] as const;

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
    vi: { translation: vi },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
