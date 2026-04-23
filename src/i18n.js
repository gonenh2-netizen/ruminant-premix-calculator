/**
 * i18n setup — react-i18next with four languages:
 *   en (English, default)  ·  vi (Vietnamese)  ·  th (Thai)  ·  zh (Chinese, simplified)
 *
 * Pragmatic scope: UI chrome is translated (section titles, buttons,
 * labels, warnings). Scientific terminology (nutrient names like "Zinc",
 * product brands like "Availa-4", stage names) stays in English —
 * that mirrors local ruminant-nutrition industry convention.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import vi from './locales/vi.json';
import th from './locales/th.json';
import zh from './locales/zh.json';

export const SUPPORTED_LANGS = [
  { code: 'en', label: 'English',    flag: '🇺🇸' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'th', label: 'ไทย',        flag: '🇹🇭' },
  { code: 'zh', label: '简体中文',    flag: '🇨🇳' },
];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      vi: { translation: vi },
      th: { translation: th },
      zh: { translation: zh },
    },
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGS.map((l) => l.code),
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'premix_calculator_language',
    },
  });

export default i18n;
