// apps/web/app/dashboard/page.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import Loader from '@/app/components/Loader';
import { Onboarding } from '@/app/components/Onboarding';
import { Sidebar } from '@/app/components/Sidebar';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useTasks } from '../hooks/useTasks';
import { useHabits } from '../hooks/useHabits';
import { NotificationCenter } from './components/NotificationCenter';
import { TaskList } from './components/TaskList';
import { HabitList } from './components/HabitList';
import { ProgressCard } from './components/ProgressCard';
import { CalendarWidget } from './components/CalendarWidget';

export default function DashboardPage() {
  const { user, authChecked, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const { tasks, createTask, toggleTask, deleteTask } = useTasks(user?.id || null);
  const { habits, habitLogs, createHabit, toggleHabit, deleteHabit, getHabitStats } = useHabits(user?.id || null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Проверяем онбординг
  useEffect(() => {
    if (user) {
      const completed = localStorage.getItem('onboarding_completed');
      if (!completed) setShowOnboarding(true);
    }
  }, [user]);

  // Загружаем уведомления
  useEffect(() => {
    const cached = localStorage.getItem('notifications_cache');
    if (cached) setNotifications(JSON.parse(cached));
  }, []);

  // Обработчик уведомлений
  const completeNotification = async (notification: any) => {
    const updated = notifications.map((n: any) =>
      n.id === notification.id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem('notifications_cache', JSON.stringify(updated));

    if (notification.type === 'task' && notification.taskId) {
      await toggleTask(notification.taskId, true);
    }
    if (notification.type === 'habit' && notification.habitId) {
      await toggleHabit(notification.habitId);
    }
  };

  // Боковая панель
  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!isSidebarPinned) setIsSidebarOpen(true);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!isSidebarPinned) {
      timeoutRef.current = setTimeout(() => setIsSidebarOpen(false), 300);
    }
  };

  const togglePin = () => {
    setIsSidebarPinned(!isSidebarPinned);
    if (!isSidebarPinned) setIsSidebarOpen(true);
  };

  const handleNavigate = (view: string) => {
    setActiveView(view);
  };

  if (!authChecked) {
    return (
      <div style={{
        minHeight: '100vh',
        background: isDarkMode ? '#0a0a0a' : '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Loader text="Проверка авторизации..." size="large" />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: isDarkMode ? '#0a0a0a' : '#f5f5f5',
      display: 'flex',
      position: 'relative',
      transition: 'background 0.3s ease',
    }}>
      {/* Онбординг */}
      {showOnboarding && user && (
        <Onboarding userId={user.id} onComplete={() => setShowOnboarding(false)} />
      )}

      {/* Боковая панель */}
      <div
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          zIndex: 1000,
        }}
      >
        <Sidebar
          isOpen={isSidebarOpen}
          isPinned={isSidebarPinned}
          onTogglePin={togglePin}
          onClose={() => setIsSidebarOpen(false)}
          isDarkMode={isDarkMode}
          activeView={activeView}
          onNavigate={handleNavigate}
          onLogout={logout}
        />
      </div>

      {/* Основной контент */}
      <div style={{
        flex: 1,
        padding: '24px',
        marginLeft: isSidebarOpen ? '240px' : '0px',
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        maxWidth: isSidebarOpen ? 'calc(100% - 240px)' : '100%',
      }}>
        {/* Кнопка открытия меню */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            style={{
              position: 'fixed',
              top: '20px',
              left: '20px',
              padding: '8px',
              background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
              borderRadius: '8px',
              color: '#6b7280',
              cursor: 'pointer',
              zIndex: 100,
              transition: 'all 0.2s',
            }}
          >
            <Menu size={20} />
          </button>
        )}

        {/* Верхняя панель */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px',
          marginTop: isSidebarOpen ? '0' : '48px',
        }}>
          <NotificationCenter
            notifications={notifications}
            setNotifications={setNotifications}
            onComplete={completeNotification}
            isDarkMode={isDarkMode}
          />
          <span style={{
            fontSize: '11px',
            color: '#4b5563',
            fontFamily: 'monospace',
          }}>
            v0.6 · ALPHA
          </span>
        </div>

        {/* Дашборд */}
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Прогресс */}
          <ProgressCard tasks={tasks} isDarkMode={isDarkMode} />

          {/* Задачи и привычки */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginTop: '24px',
          }}>
            <TaskList
              tasks={tasks}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onCreate={createTask}
              isDarkMode={isDarkMode}
            />
            <HabitList
              habits={habits}
              onToggle={toggleHabit}
              onDelete={deleteHabit}
              onCreate={createHabit}
              getStats={getHabitStats}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Календарь */}
          <CalendarWidget
            tasks={tasks}
            habits={habits}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    </div>
  );
}