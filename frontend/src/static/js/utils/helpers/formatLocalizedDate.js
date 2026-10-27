import { activeIntlLocale } from '../../i18n';

export default function formatLocalizedDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const locale = activeIntlLocale();
  const formatter = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: locale === 'zh-CN' ? 'numeric' : 'short',
    day: 'numeric',
  });

  if (locale !== 'zh-CN') return formatter.format(date);

  const parts = Object.fromEntries(formatter.formatToParts(date).map(({ type, value }) => [type, value]));
  return `${parts.year}年${parts.month}月${parts.day}日`;
}
