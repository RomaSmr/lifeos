// apps/web/app/analytics/page.tsx

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, Menu, CalendarDays, 
  ChevronRight, Home, Target, User, Timer,
  Pin, PinOff, LogOut, FileText
} from 'lucide-react';
import Loader from '@/app/components/Loader';
import { Sidebar } from '@/app/components/Sidebar';
import { useAuth } from '@/app/hooks/useAuth';
import { useTheme } from '@/app/hooks/useTheme';
import { useTasks } from '@/app/hooks/useTasks';
import { useHabits } from '@/app/hooks/useHabits';

export default function AnalyticsPage() {
  const { user, authChecked, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const { tasks } = useTasks(user?.id || null);
  const { habits, habitLogs, getHabitStats } = useHabits(user?.id || null);
  
  const [loading, setLoading] = useState(true);
  
  // Боковая панель
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (authChecked && !user) {
      router.push('/login');
      return;
    }
    if (authChecked && user) {
      setLoading(false);
    }
  }, [authChecked, user, router]);

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
    if (view === 'profile') router.push('/profile');
    else if (view === 'goals') router.push('/goals');
    else if (view === 'focus') router.push('/focus');
    else if (view === 'notes') router.push('/notes');
    else if (view === 'calendar') router.push('/calendar');
    else if (view === 'analytics') router.push('/analytics');
    else router.push('/dashboard');
  };

  // Статистика
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const totalHabits = habits.length;
  const totalStreak = habits.reduce((acc, h) => acc + (h.streak || 0), 0);
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getTasksByDay = (days: number = 30) => {
    const result: { date: string; completed: number; total: number }[] = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayTasks = tasks.filter(t => {
        if (!t.due_date) return false;
        return t.due_date.split('T')[0] === dateStr;
      });
      
      result.push({
        date: dateStr,
        completed: dayTasks.filter(t => t.status === 'completed').length,
        total: dayTasks.length,
      });
    }
    
    return result;
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: isDarkMode ? '#0a0a0a' : '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Loader text="Загрузка аналитики..." size="large" />
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
          activeView="analytics"
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

        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          marginTop: isSidebarOpen ? '0' : '48px',
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: isDarkMode ? 'white' : '#1a1a1a',
            margin: '0 0 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <BarChart3 style={{ width: '24px', height: '24px', color: '#3b82f6' }} />
            Аналитика
          </h1>

          {/* График */}
          <div style={{
            background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.8)',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '16px',
            boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#9ca3af',
              margin: '0 0 12px',
            }}>
              📊 Динамика выполнения задач
            </h3>
            <div style={{
              display: 'flex',
              gap: '3px',
              alignItems: 'flex-end',
              height: '100px',
            }}>
              {getTasksByDay(14).map((day, i) => {
                const max = Math.max(1, ...getTasksByDay(14).map(d => d.total));
                const height = Math.max(2, (day.total / max) * 80);
                const completedHeight = Math.max(2, (day.completed / max) * 80);
                
                return (
                  <div key={i} style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                  }}>
                    <div style={{
                      width: '100%',
                      height: `${height}px`,
                      background: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                      borderRadius: '3px',
                      position: 'relative',
                    }}>
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: `${completedHeight}px`,
                        background: 'linear-gradient(180deg, #3b82f6, #8b5cf6)',
                        borderRadius: '3px',
                        transition: 'height 0.5s ease',
                      }} />
                    </div>
                    <span style={{
                      fontSize: '7px',
                      color: '#4b5563',
                      transform: 'rotate(-45deg)',
                      width: '20px',
                      textAlign: 'center',
                    }}>
                      {new Date(day.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                );
              })}
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '16px',
              marginTop: '8px',
              fontSize: '10px',
              color: '#6b7280',
            }}>
              <span>📋 Всего задач</span>
              <span>✅ Выполнено</span>
            </div>
          </div>

          {/* Статистика */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            marginBottom: '16px',
          }}>
            <div style={{
              background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.8)',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#3b82f6' }}>
                {totalTasks}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Всего задач</div>
              <div style={{ fontSize: '11px', color: '#22c55e' }}>
                ✅ {completedTasks} выполнено
              </div>
            </div>
            <div style={{
              background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.8)',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#f97316' }}>
                {totalHabits}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Всего привычек</div>
              <div style={{ fontSize: '11px', color: '#f97316' }}>
                🔥 {totalStreak} дней серии
              </div>
            </div>
            <div style={{
              background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.8)',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#3b82f6' }}>
                {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Общий прогресс</div>
            </div>
          </div>

        {/* Версия */}
        <div style={{
        marginTop: '40px',
        textAlign: 'center',
        fontSize: '10px',
        color: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
        fontFamily: 'monospace',
        letterSpacing: '2px',
        }}>
        v1.0
        </div>

          {/* Статистика привычек */}
          <div style={{
            background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.8)',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
            borderRadius: '12px',
            padding: '20px',
            boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#9ca3af',
              margin: '0 0 16px',
            }}>
              Статистика привычек
            </h3>
            {habits.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '13px', textAlign: 'center' }}>
                Создай привычку, чтобы видеть статистику
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {habits.map((habit) => {
                  const stats = getHabitStats(habit.id);
                  return (
                    <div key={habit.id} style={{
                      background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.8)',
                      borderRadius: '8px',
                      padding: '12px',
                      border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '6px',
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}>
                          <span style={{ fontSize: '20px' }}>{habit.emoji || '🔥'}</span>
                          <span style={{ color: isDarkMode ? 'white' : '#1a1a1a', fontSize: '14px', fontWeight: '500' }}>
                            {habit.title}
                          </span>
                          {habit.goal && (
                            <span style={{
                              fontSize: '10px',
                              color: '#4b5563',
                              background: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                              padding: '2px 8px',
                              borderRadius: '4px',
                            }}>
                              🎯 {habit.goal}
                            </span>
                          )}
                        </div>
                        <span style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          color: stats.percent >= 80 ? '#22c55e' : stats.percent >= 50 ? '#eab308' : '#ef4444',
                        }}>
                          {stats.percent}%
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        gap: '6px',
                        marginTop: '6px',
                      }}>
                        <div style={{
                          flex: 1,
                          height: '6px',
                          background: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                          borderRadius: '100px',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            width: `${stats.percent}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #f97316, #ef4444)',
                            borderRadius: '100px',
                            transition: 'width 0.5s ease',
                          }} />
                        </div>
                      </div>
                      <div style={{
                        display: 'flex',
                        gap: '16px',
                        marginTop: '6px',
                        fontSize: '10px',
                        color: '#6b7280',
                      }}>
                        <span>✅ Выполнено: {stats.completedDays} дней</span>
                        <span>❌ Пропущено: {stats.skippedDays} дней</span>
                        <span>🔥 Серия: {habit.streak || 0}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}