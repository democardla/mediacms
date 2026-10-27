import { format, register } from 'timeago.js';
import zhCN from 'timeago.js/lib/lang/zh_CN';
import i18n from '../../i18n';

register('zh_CN', zhCN);

export default function formatRelativeDate(date) {
  return format(date, i18n.language === 'zh-Hans' ? 'zh_CN' : 'en_US');
}
