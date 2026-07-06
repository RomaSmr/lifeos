// apps/web/lib/utils/storage.ts

export const getCache = <T>(key: string): T | null => {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const setCache = (key: string, data: any) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Ошибка кеширования:', error);
  }
};

export const removeCache = (key: string) => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
};

export const clearAllCache = () => {
  if (typeof window === 'undefined') return;
  const keys = Object.keys(localStorage);
  keys.filter(k => k.endsWith('_cache')).forEach(k => localStorage.removeItem(k));
};