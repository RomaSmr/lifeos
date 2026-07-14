// apps/web/app/admin/components/AdminHeader.tsx

'use client';

import { useRouter } from 'next/navigation';
import { Settings, Power, Moon, Sun } from 'lucide-react';

interface AdminHeaderProps {
  user: any;
  serverStatus: 'online' | 'offline';
  isDarkMode: boolean;
  onToggleServer: () => void;
  onToggleTheme: () => void;
}

export function AdminHeader({ user, serverStatus, isDarkMode, onToggleServer, onToggleTheme }: AdminHeaderProps) {
  const router = useRouter();

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      flexWrap: 'wrap',
      gap: '12px',
    }}>
      <div>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: isDarkMode ? 'white' : '#1a1a1a',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <Settings size={28} style={{ color: '#8b5cf6' }} />
          Админ-панель
        </h1>
        <p style={{
          fontSize: '14px',
          color: isDarkMode ? '#6b7280' : '#6b7280',
          marginTop: '4px',
        }}>
          Добро пожаловать, {user?.email}
        </p>
      </div>
      
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '8px',
          background: serverStatus === 'online' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${serverStatus === 'online' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: serverStatus === 'online' ? '#22c55e' : '#ef4444',
            animation: serverStatus === 'online' ? 'pulse 1.5s ease-in-out infinite' : 'none',
          }} />
          <span style={{
            fontSize: '12px',
            color: serverStatus === 'online' ? '#22c55e' : '#ef4444',
            fontWeight: '500',
          }}>
            {serverStatus === 'online' ? 'Сервер работает' : 'Сервер остановлен'}
          </span>
        </div>

        <button
          onClick={onToggleTheme}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
            background: 'transparent',
            color: isDarkMode ? '#6b7280' : '#6b7280',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <button
          onClick={onToggleServer}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: serverStatus === 'online' ? '#ef4444' : '#22c55e',
            color: 'white',
            fontSize: '12px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          <Power size={14} />
          {serverStatus === 'online' ? 'Остановить' : 'Запустить'}
        </button>

        <button
          onClick={() => router.push('/dashboard')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
            background: 'transparent',
            color: isDarkMode ? '#6b7280' : '#6b7280',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          На сайт
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}