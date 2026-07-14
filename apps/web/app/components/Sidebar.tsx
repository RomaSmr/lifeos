// apps/web/app/components/Sidebar.tsx

'use client';

import { useRouter } from 'next/navigation';
import { Home, CalendarDays, Timer, BarChart3, Target, User, LogOut, Pin, PinOff, FileText } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface SidebarProps {
  isOpen: boolean;
  isPinned: boolean;
  onTogglePin: () => void;
  onClose: () => void;
  isDarkMode: boolean;
  activeView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Главная', icon: Home, tooltip: 'Главная страница' },
  { id: 'calendar', label: 'Календарь', icon: CalendarDays, tooltip: 'Планирование задач' },
  { id: 'focus', label: 'Фокус', icon: Timer, tooltip: 'Режим концентрации' },
  { id: 'notes', label: 'Заметки', icon: FileText, tooltip: 'Заметки, книги, спорт' },
  { id: 'analytics', label: 'Аналитика', icon: BarChart3, tooltip: 'Статистика и графики' },
  { id: 'goals', label: 'Цели', icon: Target, tooltip: 'Управление целями' },
  { id: 'profile', label: 'Профиль', icon: User, tooltip: 'Настройки аккаунта' },
];

export function Sidebar({
  isOpen,
  isPinned,
  onTogglePin,
  onClose,
  isDarkMode,
  activeView,
  onNavigate,
  onLogout,
}: SidebarProps) {
  const router = useRouter();

    const handleNavigate = (id: string) => {
    if (id === 'profile') {
      router.push('/profile');
    } else if (id === 'goals') {
      router.push('/goals');
    } else if (id === 'focus') {
      router.push('/focus');
    } else if (id === 'notes') {
      router.push('/notes');
    } else if (id === 'calendar') {
      router.push('/calendar');
    } else if (id === 'analytics') {
      router.push('/analytics'); // 🔥 ИСПРАВЛЕНО
    } else {
      onNavigate(id);
    }
    if (!isPinned) onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      width: '240px',
      background: isDarkMode ? '#111111' : '#ffffff',
      borderRight: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 16px',
      boxSizing: 'border-box',
      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '32px',
        paddingBottom: '16px',
        borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
      }}>
        <span style={{
          fontSize: '20px',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          LifeOS
        </span>
        <Tooltip text={isPinned ? 'Открепить панель' : 'Закрепить панель'} position="bottom">
          <button
            onClick={onTogglePin}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isPinned ? '#3b82f6' : '#6b7280',
              padding: '4px',
              borderRadius: '6px',
            }}
          >
            {isPinned ? <Pin size={18} /> : <PinOff size={18} />}
          </button>
        </Tooltip>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <Tooltip key={item.id} text={item.tooltip} position="right">
              <button
                onClick={() => handleNavigate(item.id)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: isActive ? isDarkMode ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)' : 'transparent',
                  border: 'none',
                  borderRadius: '10px',
                  color: isActive ? (isDarkMode ? 'white' : '#1a1a1a') : '#6b7280',
                  fontSize: '14px',
                  fontWeight: isActive ? '500' : '400',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s',
                  marginBottom: '4px',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <Icon size={20} />
                {item.label}
              </button>
            </Tooltip>
          );
        })}
      </nav>

      {/* Logout */}
      <Tooltip text="Выйти из аккаунта" position="right">
        <button
          onClick={onLogout}
          style={{
            padding: '10px 14px',
            background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
            borderRadius: '10px',
            color: '#6b7280',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'all 0.2s',
            marginTop: 'auto',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
            e.currentTarget.style.color = '#ef4444';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
            e.currentTarget.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
            e.currentTarget.style.color = '#6b7280';
          }}
        >
          <LogOut size={20} />
          Выйти
        </button>
      </Tooltip>
    </div>
  );
}