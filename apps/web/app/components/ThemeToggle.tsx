// apps/web/app/components/ThemeToggle.tsx

'use client';

import { useTheme } from '@/app/hooks/useTheme';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: '4px 12px',
        borderRadius: '100px',
        border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        background: isDarkMode ? 'rgba(59,130,246,0.15)' : 'rgba(0,0,0,0.05)',
        color: isDarkMode ? '#3b82f6' : '#6b7280',
        fontSize: '11px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '0.8';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '1';
      }}
    >
      {isDarkMode ? (
        <>
          <Moon size={14} />
          Вкл
        </>
      ) : (
        <>
          <Sun size={14} />
          Выкл
        </>
      )}
    </button>
  );
}