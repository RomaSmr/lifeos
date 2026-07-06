'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Target, Plus, Check, X, Trash2, 
  Calendar, Flag, ChevronRight, Sparkles,
  ArrowLeft, Link2, Unlink,
  Home, CalendarDays, BarChart3, User,
  Timer, Pin, PinOff, LogOut, Menu
} from 'lucide-react';
import Loader from '@/app/components/Loader';

export default function GoalsPage() {
  const [user, setUser] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [newGoalTargetDate, setNewGoalTargetDate] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [isGoalDetailOpen, setIsGoalDetailOpen] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkType, setLinkType] = useState<'task' | 'habit'>('task');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const router = useRouter();

  // ===== АВТОРИЗАЦИЯ =====
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          router.push('/login');
          return;
        }
      } catch {
        router.push('/login');
        return;
      } finally {
        setAuthChecked(true);
      }
    };
    checkAuth();
  }, []);

  // ===== ТЕМА =====
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setIsDarkMode(savedTheme !== 'light');
  }, []);

  // ===== БОКОВАЯ ПАНЕЛЬ =====
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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (_) {}
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  };

  // ===== ЗАГРУЗКА ДАННЫХ =====
  useEffect(() => {
    if (!authChecked || !user) return;

    const fetchData = async () => {
      try {
        const goalsRes = await fetch('/api/goals');
        if (goalsRes.ok) {
          const data = await goalsRes.json();
          setGoals(data);
        }

        const tasksRes = await fetch('/api/tasks');
        if (tasksRes.ok) {
          const data = await tasksRes.json();
          setTasks(data);
        }

        const habitsRes = await fetch('/api/habits');
        if (habitsRes.ok) {
          const data = await habitsRes.json();
          setHabits(data);
        }

      } catch (err) {
        console.error('Ошибка загрузки:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authChecked, user]);

  const navItems = [
    { id: 'dashboard', label: 'Главная', icon: Home, path: '/dashboard' },
    { id: 'calendar', label: 'Календарь', icon: CalendarDays, path: '/dashboard' },
    { id: 'focus', label: 'Фокус', icon: Timer, path: '/focus' },
    { id: 'analytics', label: 'Аналитика', icon: BarChart3, path: '/dashboard' },
    { id: 'goals', label: 'Цели', icon: Target, path: '/goals' },
    { id: 'profile', label: 'Профиль', icon: User, path: '/profile' },
  ];

  // ===== ФУНКЦИИ ЦЕЛЕЙ =====
  const createGoal = async () => {
    if (!newGoalTitle.trim()) {
      alert('Введите название цели');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newGoalTitle.trim(),
          description: newGoalDescription.trim() || null,
          target_date: newGoalTargetDate || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGoals([data, ...goals]);
        setIsModalOpen(false);
        setNewGoalTitle('');
        setNewGoalDescription('');
        setNewGoalTargetDate('');
      } else {
        const error = await res.json();
        alert('Ошибка: ' + (error.error || 'Неизвестная ошибка'));
      }
    } catch (err) {
      alert('Ошибка создания цели');
    }

    setIsSubmitting(false);
  };

  const deleteGoal = async (goalId: string) => {
    if (!confirm('Удалить эту цель?')) return;

    try {
      const res = await fetch(`/api/goals?id=${goalId}`, { method: 'DELETE' });
      if (res.ok) {
        setGoals(goals.filter(g => g.id !== goalId));
      }
    } catch (err) {
      alert('Ошибка удаления');
    }
  };

  const updateGoalProgress = async (goalId: string) => {
    const goalTasks = tasks.filter(t => t.goal_id === goalId);
    const completedTasks = goalTasks.filter(t => t.status === 'completed');
    const progress = goalTasks.length > 0 
      ? Math.round((completedTasks.length / goalTasks.length) * 100)
      : 0;

    try {
      const res = await fetch('/api/goals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: goalId, progress }),
      });

      if (res.ok) {
        const data = await res.json();
        setGoals(goals.map(g => g.id === goalId ? data : g));
      }
    } catch (err) {
      console.error('Ошибка обновления прогресса:', err);
    }
  };

  const linkTaskToGoal = async (taskId: string, goalId: string) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, goal_id: goalId }),
      });

      if (res.ok) {
        const data = await res.json();
        setTasks(tasks.map(t => t.id === taskId ? data : t));
        updateGoalProgress(goalId);
        setShowLinkModal(false);
        setSelectedItemId(null);
      }
    } catch (err) {
      alert('Ошибка связывания задачи');
    }
  };

  const unlinkTaskFromGoal = async (taskId: string, goalId: string) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, goal_id: null }),
      });

      if (res.ok) {
        const data = await res.json();
        setTasks(tasks.map(t => t.id === taskId ? data : t));
        updateGoalProgress(goalId);
      }
    } catch (err) {
      alert('Ошибка отвязывания задачи');
    }
  };

  const linkHabitToGoal = async (habitId: string, goalId: string) => {
    try {
      const res = await fetch('/api/habits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: habitId, goal_id: goalId }),
      });

      if (res.ok) {
        const data = await res.json();
        setHabits(habits.map(h => h.id === habitId ? data : h));
        setShowLinkModal(false);
        setSelectedItemId(null);
      }
    } catch (err) {
      alert('Ошибка связывания привычки');
    }
  };

  const unlinkHabitFromGoal = async (habitId: string, goalId: string) => {
    try {
      const res = await fetch('/api/habits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: habitId, goal_id: null }),
      });

      if (res.ok) {
        const data = await res.json();
        setHabits(habits.map(h => h.id === habitId ? data : h));
      }
    } catch (err) {
      alert('Ошибка отвязывания привычки');
    }
  };

  const getGoalTasks = (goalId: string) => {
    return tasks.filter(t => t.goal_id === goalId);
  };

  const getGoalHabits = (goalId: string) => {
    return habits.filter(h => h.goal_id === goalId);
  };

  const getUnlinkedTasks = () => {
    return tasks.filter(t => !t.goal_id && t.status === 'active');
  };

  const getUnlinkedHabits = () => {
    return habits.filter(h => !h.goal_id);
  };

  if (!authChecked || loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: isDarkMode ? '#0a0a0a' : '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Loader text="Загрузка целей..." size="large" />
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
      {/* ===== БОКОВАЯ ПАНЕЛЬ ===== */}
      <div
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: isSidebarOpen ? '240px' : '0px',
          background: isDarkMode ? '#111111' : '#ffffff',
          borderRight: isSidebarOpen ? `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` : 'none',
          zIndex: 1000,
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          padding: isSidebarOpen ? '20px 16px' : '0px',
          boxSizing: 'border-box',
        }}
      >
        {isSidebarOpen && (
          <>
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
                color: isDarkMode ? 'white' : '#1a1a1a',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                LifeOS
              </span>
              <button
                onClick={togglePin}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: isSidebarPinned ? '#3b82f6' : '#6b7280',
                  padding: '4px',
                  borderRadius: '6px',
                  transition: 'all 0.2s',
                }}
              >
                {isSidebarPinned ? (
                  <Pin style={{ width: '18px', height: '18px' }} />
                ) : (
                  <PinOff style={{ width: '18px', height: '18px' }} />
                )}
              </button>
            </div>

            <nav style={{ flex: 1 }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === 'goals';
                
                const handleClick = () => {
                  router.push(item.path);
                };
                
                return (
                  <button
                    key={item.id}
                    onClick={handleClick}
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
                    <Icon style={{ width: '20px', height: '20px' }} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <button
              onClick={handleLogout}
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
              <LogOut style={{ width: '20px', height: '20px' }} />
              Выйти
            </button>
          </>
        )}
      </div>

      {/* ===== ОСНОВНОЙ КОНТЕНТ ===== */}
      <div style={{
        flex: 1,
        padding: '24px',
        marginLeft: isSidebarOpen ? '240px' : '0px',
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        maxWidth: isSidebarOpen ? 'calc(100% - 240px)' : '100%',
      }}>
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
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
              e.currentTarget.style.color = isDarkMode ? 'white' : '#1a1a1a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            <Menu style={{ width: '20px', height: '20px' }} />
          </button>
        )}

        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          marginTop: isSidebarOpen ? '0' : '48px',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <h1 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: isDarkMode ? 'white' : '#1a1a1a',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <Target style={{ width: '24px', height: '24px', color: '#8b5cf6' }} />
                Цели
              </h1>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              style={{
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
                boxShadow: '0 2px 12px rgba(139,92,246,0.25)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <Plus style={{ width: '16px', height: '16px' }} />
              Новая цель
            </button>
          </div>

          {/* Список целей */}
          {goals.length === 0 ? (
            <div style={{
              background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.8)',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
              borderRadius: '16px',
              padding: '60px 20px',
              textAlign: 'center',
              boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <Target style={{
                width: '48px',
                height: '48px',
                color: '#6b7280',
                margin: '0 auto 16px',
                opacity: 0.5,
              }} />
              <h2 style={{
                fontSize: '18px',
                fontWeight: '500',
                color: isDarkMode ? '#9ca3af' : '#4b5563',
                margin: 0,
              }}>
                У тебя пока нет целей
              </h2>
              <p style={{
                fontSize: '14px',
                color: isDarkMode ? '#6b7280' : '#6b7280',
                marginTop: '8px',
              }}>
                Создай первую цель и начни свой путь к успеху 🚀
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                style={{
                  marginTop: '20px',
                  padding: '10px 24px',
                  background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Создать цель
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
            }}>
              {goals.map((goal) => {
                const goalTasks = getGoalTasks(goal.id);
                const goalHabits = getGoalHabits(goal.id);
                const completedTasks = goalTasks.filter(t => t.status === 'completed').length;
                const totalTasks = goalTasks.length;
                const progress = goal.progress || 0;
                
                return (
                  <div
                    key={goal.id}
                    onClick={() => {
                      setSelectedGoal(goal);
                      setIsGoalDetailOpen(true);
                    }}
                    style={{
                      background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.8)',
                      border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                      borderRadius: '16px',
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.8)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '12px',
                    }}>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: isDarkMode ? 'white' : '#1a1a1a',
                        margin: 0,
                        flex: 1,
                      }}>
                        {goal.title}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteGoal(goal.id);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          color: '#6b7280',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#ef4444';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#6b7280';
                        }}
                      >
                        <Trash2 style={{ width: '16px', height: '16px' }} />
                      </button>
                    </div>

                    {goal.description && (
                      <p style={{
                        fontSize: '13px',
                        color: isDarkMode ? '#9ca3af' : '#6b7280',
                        margin: '0 0 12px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {goal.description}
                      </p>
                    )}

                    {goal.target_date && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        color: '#6b7280',
                        marginBottom: '12px',
                      }}>
                        <Calendar style={{ width: '14px', height: '14px' }} />
                        до {new Date(goal.target_date).toLocaleDateString('ru-RU')}
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                    }}>
                      <div style={{
                        position: 'relative',
                        width: '56px',
                        height: '56px',
                        flexShrink: 0,
                      }}>
                        <svg
                          width="56"
                          height="56"
                          viewBox="0 0 56 56"
                          style={{ transform: 'rotate(-90deg)' }}
                        >
                          <circle
                            cx="28"
                            cy="28"
                            r="24"
                            fill="none"
                            stroke={isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
                            strokeWidth="4"
                          />
                          <circle
                            cx="28"
                            cy="28"
                            r="24"
                            fill="none"
                            stroke="url(#goalProgressGradient)"
                            strokeWidth="4"
                            strokeDasharray={2 * Math.PI * 24}
                            strokeDashoffset={2 * Math.PI * 24 * (1 - progress / 100)}
                            strokeLinecap="round"
                            style={{
                              transition: 'stroke-dashoffset 0.8s ease',
                            }}
                          />
                          <defs>
                            <linearGradient id="goalProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#8b5cf6" />
                              <stop offset="100%" stopColor="#3b82f6" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          fontSize: '14px',
                          fontWeight: '700',
                          color: isDarkMode ? 'white' : '#1a1a1a',
                        }}>
                          {progress}%
                        </div>
                      </div>
                      <div style={{
                        flex: 1,
                      }}>
                        <div style={{
                          display: 'flex',
                          gap: '12px',
                          fontSize: '12px',
                          color: '#6b7280',
                        }}>
                          <span>✅ {completedTasks} задач</span>
                          <span>📋 {totalTasks - completedTasks} осталось</span>
                        </div>
                        {goalHabits.length > 0 && (
                          <div style={{
                            fontSize: '11px',
                            color: '#6b7280',
                            marginTop: '2px',
                          }}>
                            🔥 {goalHabits.length} привычек
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ===== МОДАЛКА СОЗДАНИЯ ЦЕЛИ ===== */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '20px',
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              maxWidth: '480px',
              width: '100%',
              background: isDarkMode ? '#141414' : '#ffffff',
              borderRadius: '24px',
              padding: '32px',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
              boxShadow: isDarkMode ? '0 40px 100px rgba(0,0,0,0.9)' : '0 40px 100px rgba(0,0,0,0.15)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: isDarkMode ? 'white' : '#1a1a1a',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <Target style={{ width: '20px', height: '20px', color: '#8b5cf6' }} />
                Новая цель
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  border: 'none',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#6b7280',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
                  e.currentTarget.style.color = isDarkMode ? 'white' : '#1a1a1a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
                  e.currentTarget.style.color = '#6b7280';
                }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  display: 'block',
                  marginBottom: '6px',
                }}>
                  Название <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Например: Выучить английский"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                    borderRadius: '10px',
                    color: isDarkMode ? 'white' : '#1a1a1a',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
                  }}
                  autoFocus
                />
              </div>

              <div>
                <label style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  display: 'block',
                  marginBottom: '6px',
                }}>
                  Описание
                </label>
                <textarea
                  placeholder="Опиши свою цель..."
                  value={newGoalDescription}
                  onChange={(e) => setNewGoalDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                    borderRadius: '10px',
                    color: isDarkMode ? 'white' : '#1a1a1a',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    minHeight: '60px',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
                  }}
                />
              </div>

              <div>
                <label style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  display: 'block',
                  marginBottom: '6px',
                }}>
                  <Calendar style={{ width: '14px', height: '14px', display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  Дедлайн
                </label>
                <input
                  type="date"
                  value={newGoalTargetDate}
                  onChange={(e) => setNewGoalTargetDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                    borderRadius: '10px',
                    color: isDarkMode ? 'white' : '#1a1a1a',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                    borderRadius: '10px',
                    color: '#6b7280',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
                  }}
                >
                  Отмена
                </button>
                <button
                  onClick={createGoal}
                  disabled={isSubmitting || !newGoalTitle.trim()}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: isSubmitting || !newGoalTitle.trim()
                      ? '#374151'
                      : 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                    border: 'none',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: isSubmitting || !newGoalTitle.trim() ? 'not-allowed' : 'pointer',
                    boxShadow: isSubmitting || !newGoalTitle.trim()
                      ? 'none'
                      : '0 2px 12px rgba(139,92,246,0.25)',
                    transition: 'all 0.2s',
                    opacity: isSubmitting || !newGoalTitle.trim() ? 0.5 : 1,
                  }}
                >
                  {isSubmitting ? 'Сохранение...' : 'Создать цель'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== ДЕТАЛЬНЫЙ ПРОСМОТР ЦЕЛИ ===== */}
      {isGoalDetailOpen && selectedGoal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px',
          }}
          onClick={() => setIsGoalDetailOpen(false)}
        >
          <div
            style={{
              maxWidth: '500px',
              width: '100%',
              background: isDarkMode ? '#141414' : '#ffffff',
              borderRadius: '24px',
              padding: '32px',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
              boxShadow: isDarkMode ? '0 40px 100px rgba(0,0,0,0.9)' : '0 40px 100px rgba(0,0,0,0.15)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <Target style={{ width: '24px', height: '24px', color: '#8b5cf6' }} />
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: isDarkMode ? 'white' : '#1a1a1a',
                  margin: 0,
                }}>
                  {selectedGoal.title}
                </h2>
              </div>
              <button
                onClick={() => setIsGoalDetailOpen(false)}
                style={{
                  background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  border: 'none',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#6b7280',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
                  e.currentTarget.style.color = isDarkMode ? 'white' : '#1a1a1a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
                  e.currentTarget.style.color = '#6b7280';
                }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {selectedGoal.description && (
              <p style={{
                fontSize: '14px',
                color: isDarkMode ? '#9ca3af' : '#6b7280',
                marginBottom: '16px',
                lineHeight: '1.5',
              }}>
                {selectedGoal.description}
              </p>
            )}

            {selectedGoal.target_date && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                color: '#6b7280',
                marginBottom: '16px',
              }}>
                <Calendar style={{ width: '16px', height: '16px' }} />
                Дедлайн: {new Date(selectedGoal.target_date).toLocaleDateString('ru-RU')}
              </div>
            )}

            <div style={{
              marginBottom: '20px',
              padding: '16px',
              background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
              borderRadius: '12px',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Прогресс</span>
                <span style={{ fontSize: '20px', fontWeight: '700', color: isDarkMode ? 'white' : '#1a1a1a' }}>
                  {selectedGoal.progress || 0}%
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                background: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                borderRadius: '100px',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${selectedGoal.progress || 0}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)',
                  borderRadius: '100px',
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#6b7280',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                📋 Связанные задачи ({getGoalTasks(selectedGoal.id).length})
              </h3>
              {getGoalTasks(selectedGoal.id).length === 0 ? (
                <p style={{ fontSize: '13px', color: '#6b7280' }}>Нет связанных задач</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {getGoalTasks(selectedGoal.id).map((task) => (
                    <div
                      key={task.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                        borderRadius: '6px',
                        fontSize: '13px',
                        color: isDarkMode ? '#d1d5db' : '#4b5563',
                      }}
                    >
                      <span style={{ textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>
                        {task.title}
                      </span>
                      <button
                        onClick={() => {
                          unlinkTaskFromGoal(task.id, selectedGoal.id);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#6b7280',
                          padding: '2px',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#ef4444';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#6b7280';
                        }}
                      >
                        <Unlink style={{ width: '14px', height: '14px' }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#6b7280',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                🔥 Связанные привычки ({getGoalHabits(selectedGoal.id).length})
              </h3>
              {getGoalHabits(selectedGoal.id).length === 0 ? (
                <p style={{ fontSize: '13px', color: '#6b7280' }}>Нет связанных привычек</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {getGoalHabits(selectedGoal.id).map((habit) => (
                    <div
                      key={habit.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                        borderRadius: '6px',
                        fontSize: '13px',
                        color: isDarkMode ? '#d1d5db' : '#4b5563',
                      }}
                    >
                      <span>{habit.emoji} {habit.title}</span>
                      <button
                        onClick={() => {
                          unlinkHabitFromGoal(habit.id, selectedGoal.id);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#6b7280',
                          padding: '2px',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#ef4444';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#6b7280';
                        }}
                      >
                        <Unlink style={{ width: '14px', height: '14px' }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setShowLinkModal(true);
                setLinkType('task');
                setSelectedItemId(null);
              }}
              style={{
                width: '100%',
                padding: '10px',
                background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                border: `1px dashed ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                borderRadius: '10px',
                color: '#6b7280',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
                e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)';
                e.currentTarget.style.color = '#8b5cf6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
                e.currentTarget.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
                e.currentTarget.style.color = '#6b7280';
              }}
            >
              <Link2 style={{ width: '16px', height: '16px', display: 'inline', marginRight: '6px' }} />
              Связать задачу или привычку
            </button>

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button
                onClick={() => setIsGoalDetailOpen(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                  borderRadius: '10px',
                  color: '#6b7280',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== МОДАЛКА СВЯЗЫВАНИЯ ===== */}
      {showLinkModal && selectedGoal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
            padding: '20px',
          }}
          onClick={() => setShowLinkModal(false)}
        >
          <div
            style={{
              maxWidth: '480px',
              width: '100%',
              background: isDarkMode ? '#141414' : '#ffffff',
              borderRadius: '24px',
              padding: '32px',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
              boxShadow: isDarkMode ? '0 40px 100px rgba(0,0,0,0.9)' : '0 40px 100px rgba(0,0,0,0.15)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: isDarkMode ? 'white' : '#1a1a1a',
                margin: 0,
              }}>
                Связать с целью
              </h2>
              <button
                onClick={() => setShowLinkModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b7280',
                }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '16px',
            }}>
              <button
                onClick={() => setLinkType('task')}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '8px',
                  border: `1px solid ${linkType === 'task' ? '#8b5cf6' : isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                  background: linkType === 'task' ? 'rgba(139,92,246,0.15)' : 'transparent',
                  color: linkType === 'task' ? '#8b5cf6' : '#6b7280',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                📋 Задачи
              </button>
              <button
                onClick={() => setLinkType('habit')}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '8px',
                  border: `1px solid ${linkType === 'habit' ? '#8b5cf6' : isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                  background: linkType === 'habit' ? 'rgba(139,92,246,0.15)' : 'transparent',
                  color: linkType === 'habit' ? '#8b5cf6' : '#6b7280',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                🔥 Привычки
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '300px', overflowY: 'auto' }}>
              {linkType === 'task' ? (
                getUnlinkedTasks().length === 0 ? (
                  <p style={{ color: '#6b7280', fontSize: '13px', textAlign: 'center' }}>
                    Нет доступных задач
                  </p>
                ) : (
                  getUnlinkedTasks().map((task) => (
                    <button
                      key={task.id}
                      onClick={() => {
                        linkTaskToGoal(task.id, selectedGoal.id);
                      }}
                      style={{
                        padding: '8px 12px',
                        background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                        border: `1px solid ${selectedItemId === task.id ? '#8b5cf6' : 'transparent'}`,
                        borderRadius: '8px',
                        textAlign: 'left',
                        color: isDarkMode ? '#d1d5db' : '#4b5563',
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)';
                      }}
                    >
                      {task.title}
                    </button>
                  ))
                )
              ) : (
                getUnlinkedHabits().length === 0 ? (
                  <p style={{ color: '#6b7280', fontSize: '13px', textAlign: 'center' }}>
                    Нет доступных привычек
                  </p>
                ) : (
                  getUnlinkedHabits().map((habit) => (
                    <button
                      key={habit.id}
                      onClick={() => {
                        linkHabitToGoal(habit.id, selectedGoal.id);
                      }}
                      style={{
                        padding: '8px 12px',
                        background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                        border: `1px solid ${selectedItemId === habit.id ? '#8b5cf6' : 'transparent'}`,
                        borderRadius: '8px',
                        textAlign: 'left',
                        color: isDarkMode ? '#d1d5db' : '#4b5563',
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)';
                      }}
                    >
                      {habit.emoji} {habit.title}
                    </button>
                  ))
                )
              )}
            </div>

            <button
              onClick={() => setShowLinkModal(false)}
              style={{
                width: '100%',
                marginTop: '16px',
                padding: '10px',
                background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                borderRadius: '10px',
                color: '#6b7280',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
}