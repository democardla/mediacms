import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enMedia from '../../../locales/en/media.json';
import zhHansMedia from '../../../locales/zh-Hans/media.json';

const pageLanguage = typeof document === 'undefined' ? 'en' : document.documentElement.lang;
const normalizedLanguage = (pageLanguage || '').toLowerCase();
const language =
  normalizedLanguage === 'zh' || /^zh[-_](?:hans|cn|sg)(?:$|[-_])/.test(normalizedLanguage)
    ? 'zh-Hans'
    : 'en';

i18n.use(initReactI18next).init({
  lng: language,
  fallbackLng: 'en',
  supportedLngs: ['en', 'zh-Hans'],
  ns: ['media'],
  defaultNS: 'media',
  resources: {
    en: { media: enMedia },
    'zh-Hans': { media: zhHansMedia },
  },
  initImmediate: false,
  interpolation: { escapeValue: false },
});

export function activeIntlLocale() {
  return i18n.language === 'zh-Hans' ? 'zh-CN' : 'en-US';
}

export default i18n;
