import english from './locales/en.json';
import simplifiedChinese from './locales/zh-Hans.json';

type Locale = Record<string, string>;

const dictionaries: Record<'en' | 'zh-Hans', Locale> = {
    en: english,
    'zh-Hans': simplifiedChinese,
};

export function editorText(keyOrEnglishText: string, variables: Record<string, string | number> = {}): string {
    const language = typeof document === 'undefined' ? 'en' : document.documentElement.lang.toLowerCase();
    const dictionary = language.startsWith('zh') ? dictionaries['zh-Hans'] : dictionaries.en;
    const englishKey = Object.keys(dictionaries.en).find((key) => dictionaries.en[key] === keyOrEnglishText);
    const template = dictionary[keyOrEnglishText] ?? (englishKey ? dictionary[englishKey] : undefined) ?? keyOrEnglishText;

    return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name: string) => {
        return Object.prototype.hasOwnProperty.call(variables, name) ? String(variables[name]) : match;
    });
}
