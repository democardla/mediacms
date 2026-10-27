import en from './locales/en.json';
import zhHans from './locales/zh-Hans.json';

export const isChinesePlayerLocale = () => typeof document !== 'undefined' && /^zh(?:-|$)/i.test(document.documentElement.lang || '');
export const playerUiText = (key) => (isChinesePlayerLocale() ? zhHans.ui[key] || key : en.ui[key] || key);
export const videoJsLanguages = isChinesePlayerLocale() ? { 'zh-CN': zhHans.videoJs } : {};
export const videoJsLanguage = isChinesePlayerLocale() ? 'zh-CN' : 'en';
