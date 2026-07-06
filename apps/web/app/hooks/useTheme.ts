// apps/web/app/dashboard/hooks/useTheme.ts

'use client';

import { useState, useEffect } from 'react';

export function useTheme() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setIsDarkMode(savedTheme !== 'light');
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    document.documentElement.style.background = newMode ? '#0a0a0a' : '#f5f5f5';
    document.body.style.background = newMode ? '#0a0a0a' : '#f5f5f5';
  };

  return { isDarkMode, toggleTheme };
}