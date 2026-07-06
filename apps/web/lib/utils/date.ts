// apps/web/lib/utils/date.ts

export const formatDate = (date: string | Date) => {
  const d = new Date(date);
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const formatTime = (date: string | Date) => {
  const d = new Date(date);
  return d.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatRelativeDate = (date: string | Date) => {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'сегодня';
  if (days === 1) return 'вчера';
  if (days < 7) return `${days} дня назад`;
  return formatDate(d);
};

export const getToday = () => {
  return new Date().toISOString().split('T')[0];
};

export const getDaysBetween = (start: Date, end: Date) => {
  const diff = end.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

export const isToday = (date: Date) => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};