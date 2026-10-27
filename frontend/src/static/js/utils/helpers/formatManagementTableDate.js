import { months as monthList } from '../constants/';
import { activeIntlLocale } from '../../i18n';

export function formatManagementTableDate(date) {
  if (activeIntlLocale() === 'zh-CN') {
    const dateLabel = new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    })
      .formatToParts(date)
      .reduce((parts, item) => ({ ...parts, [item.type]: item.value }), {});
    const time = new Intl.DateTimeFormat('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    }).format(date);
    return `${dateLabel.year}年${dateLabel.month}月${dateLabel.day}日 ${time}`;
  }

  const day = date.getDate();
  const month = monthList[date.getMonth()].substring(0, 3);
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  let ret = month + ' ' + day + ', ' + year;
  ret += ' ' + (hours < 10 ? '0' : '') + hours;
  ret += ':' + (minutes < 10 ? '0' : '') + minutes;
  ret += ':' + (seconds < 10 ? '0' : '') + seconds;
  return ret;
}
