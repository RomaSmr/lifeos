// apps/web/app/calendar/page.tsx

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, ChevronRight,
  Plus, X, Clock, ListTodo, Menu
} from 'lucide-react';
import Loader from '@/app/components/Loader';
import { Sidebar } from '@/app/components/Sidebar';
import { useAuth } from '@/app/hooks/useAuth';
import { useTasks } from '@/app/hooks/useTasks';
import { useTheme } from '@/app/hooks/useTheme';
import { Task } from '@/types';

export default function CalendarPage() {
  const { user, authChecked, logout } = useAuth();
  const { tasks, createTask } = useTasks(user?.id || null);
  const { isDarkMode } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week'>('day');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventTime, setNewEventTime] = useState('12:00');
  
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
    else if (view === 'analytics') router.push('/dashboard?view=analytics');
    else router.push('/dashboard');
  };

  // Навигация календаря
  const goToPrev = () => {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getDayTasks = (date: Date): Task[] => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter((task: Task) => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date).toISOString().split('T')[0];
      return taskDate === dateStr;
    });
  };

  const getWeekDays = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getHours = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push(i);
    }
    return hours;
  };

  const openModal = () => {
    setNewEventTitle('');
    setNewEventDate(currentDate.toISOString().split('T')[0]);
    setNewEventTime('12:00');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const createEvent = async () => {
    if (!newEventTitle.trim()) {
      alert('Введите название события');
      return;
    }

    const dueDate = newEventDate 
      ? `${newEventDate}T${newEventTime || '12:00'}:00`
      : undefined;

    try {
      await createTask({
        title: newEventTitle.trim(),
        due_date: dueDate,
        priority: 'medium',
      });
      closeModal();
    } catch (error) {
      alert('Ошибка создания события');
    }
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
        <Loader text="Загрузка календаря..." size="large" />
      </div>
    );
  }

  const todayTasks = getDayTasks(currentDate);
  const weekDays = getWeekDays();

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
          activeView="calendar"
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
          maxWidth: '800px',
          margin: '0 auto',
          marginTop: isSidebarOpen ? '0' : '48px',
        }}>
          {/* HEADER */}
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
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <CalendarIcon style={{ width: '28px', height: '28px', color: '#3b82f6' }} />
                Календарь
              </h1>
              <p style={{
                fontSize: '13px',
                color: '#6b7280',
                margin: '2px 0 0',
              }}>
                {formatDate(currentDate)}
              </p>
            </div>
            <div style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
            }}>
              <button
                onClick={goToToday}
                style={{
                  padding: '6px 14px',
                  background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                  borderRadius: '8px',
                  color: '#9ca3af',
                  fontSize: '12px',
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
                Сегодня
              </button>
              <button
                onClick={goToPrev}
                style={{
                  padding: '6px 10px',
                  background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                  borderRadius: '8px',
                  color: '#6b7280',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={goToNext}
                style={{
                  padding: '6px 10px',
                  background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                  borderRadius: '8px',
                  color: '#6b7280',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <ChevronRight size={18} />
              </button>
              <button
                onClick={openModal}
                style={{
                  padding: '6px 14px',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 12px rgba(59,130,246,0.25)',
                }}
              >
                <Plus size={14} />
                Событие
              </button>
            </div>
          </div>

          {/* VIEW SWITCHER */}
          <div style={{
            display: 'flex',
            gap: '4px',
            marginBottom: '20px',
            background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
            borderRadius: '10px',
            padding: '4px',
            width: 'fit-content',
          }}>
            {['day', 'week'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v as 'day' | 'week')}
                style={{
                  padding: '6px 16px',
                  background: view === v ? isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: view === v ? (isDarkMode ? 'white' : '#1a1a1a') : '#6b7280',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontWeight: view === v ? '500' : '400',
                }}
              >
                {v === 'day' ? 'День' : 'Неделя'}
              </button>
            ))}
          </div>

          {/* DAY VIEW */}
          {view === 'day' && (
            <div>
              <div style={{
                background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.7)',
                border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                borderRadius: '12px',
                padding: '16px',
                boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
              }}>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#9ca3af',
                  margin: '0 0 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <ListTodo size={16} />
                  Задачи на сегодня ({todayTasks.length})
                </h3>

                {todayTasks.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '20px',
                    color: '#6b7280',
                    fontSize: '14px',
                  }}>
                    Нет задач на сегодня
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {todayTasks.map((task: Task) => (
                      <div
                        key={task.id}
                        style={{
                          background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                          border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                          borderRadius: '8px',
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                        }}
                      >
                        <div style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: task.priority === 'urgent' ? '#ef4444' :
                                     task.priority === 'high' ? '#fb923c' :
                                     task.priority === 'medium' ? '#eab308' :
                                     '#6b7280',
                        }} />
                        <span style={{
                          color: isDarkMode ? 'white' : '#1a1a1a',
                          fontSize: '14px',
                        }}>
                          {task.title}
                        </span>
                        {task.due_date && (
                          <span style={{
                            fontSize: '11px',
                            color: '#6b7280',
                            marginLeft: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}>
                            <Clock size={12} />
                            {new Date(task.due_date).toLocaleTimeString('ru-RU', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{
                marginTop: '16px',
                background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.7)',
                border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                borderRadius: '12px',
                padding: '16px',
                maxHeight: '500px',
                overflowY: 'auto',
                boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
              }}>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#9ca3af',
                  margin: '0 0 12px',
                }}>
                  Расписание
                </h3>
                {getHours().map((hour) => (
                  <div
                    key={hour}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '6px 0',
                      borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'}`,
                      gap: '12px',
                    }}
                  >
                    <span style={{
                      fontSize: '11px',
                      color: '#4b5563',
                      width: '40px',
                      textAlign: 'right',
                    }}>
                      {String(hour).padStart(2, '0')}:00
                    </span>
                    <div style={{
                      flex: 1,
                      height: '24px',
                      borderRadius: '4px',
                      background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                      position: 'relative',
                    }}>
                      {todayTasks
                        .filter((task: Task) => {
                          if (!task.due_date) return false;
                          const taskHour = new Date(task.due_date).getHours();
                          return taskHour === hour;
                        })
                        .map((task: Task) => (
                          <div
                            key={task.id}
                            style={{
                              position: 'absolute',
                              left: 0,
                              right: 0,
                              top: 0,
                              bottom: 0,
                              background: 'rgba(59,130,246,0.15)',
                              border: '1px solid rgba(59,130,246,0.2)',
                              borderRadius: '4px',
                              padding: '0 8px',
                              display: 'flex',
                              alignItems: 'center',
                              fontSize: '11px',
                              color: '#93c5fd',
                            }}
                          >
                            {task.title}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* WEEK VIEW */}
          {view === 'week' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '8px',
            }}>
              {weekDays.map((day, index) => {
                const dayTasks = getDayTasks(day);
                const isToday = day.toDateString() === new Date().toDateString();
                const isWeekend = index === 0 || index === 6;

                return (
                  <div
                    key={index}
                    style={{
                      background: isToday ? isDarkMode ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.06)' : isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.7)',
                      border: isToday ? `1px solid ${isDarkMode ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.3)'}` : `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                      borderRadius: '10px',
                      padding: '12px',
                      minHeight: '120px',
                      boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.02)',
                    }}
                  >
                    <div style={{
                      textAlign: 'center',
                      marginBottom: '8px',
                    }}>
                      <div style={{
                        fontSize: '11px',
                        color: isWeekend ? '#ef4444' : '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        {day.toLocaleDateString('ru-RU', { weekday: 'short' })}
                      </div>
                      <div style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        color: isToday ? '#3b82f6' : (isDarkMode ? 'white' : '#1a1a1a'),
                        marginTop: '2px',
                      }}>
                        {day.getDate()}
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      marginTop: '4px',
                    }}>
                      {dayTasks.slice(0, 3).map((task: Task) => (
                        <div
                          key={task.id}
                          style={{
                            background: 'rgba(59,130,246,0.1)',
                            borderRadius: '4px',
                            padding: '3px 6px',
                            fontSize: '10px',
                            color: '#93c5fd',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={task.title}
                        >
                          {task.title}
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <div style={{
                          fontSize: '9px',
                          color: '#6b7280',
                          textAlign: 'center',
                        }}>
                          +{dayTasks.length - 3} ещё
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* FOOTER */}
          <div style={{
            marginTop: '40px',
            paddingTop: '16px',
            borderTop: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
            textAlign: 'center',
          }}>
            <p style={{
              fontSize: '10px',
              color: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
              fontFamily: 'monospace',
              letterSpacing: '2px',
            }}>
              v1.0 · ALPHA
            </p>
          </div>
        </div>
      </div>

      {/* МОДАЛКА СОЗДАНИЯ СОБЫТИЯ */}
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
          onClick={closeModal}
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
                <CalendarIcon size={20} style={{ color: '#3b82f6' }} />
                Новое событие
              </h2>
              <button
                onClick={closeModal}
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
              >
                <X size={18} />
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
                  placeholder="Введите название события..."
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
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
                  Дата
                </label>
                <input
                  type="date"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
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
                  Время
                </label>
                <input
                  type="time"
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
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
                  }}
                />
              </div>

              <div style={{
                display: 'flex',
                gap: '10px',
                marginTop: '8px',
              }}>
                <button
                  onClick={closeModal}
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
                >
                  Отмена
                </button>
                <button
                  onClick={createEvent}
                  disabled={!newEventTitle.trim()}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: !newEventTitle.trim()
                      ? '#374151'
                      : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    border: 'none',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: !newEventTitle.trim() ? 'not-allowed' : 'pointer',
                    boxShadow: !newEventTitle.trim()
                      ? 'none'
                      : '0 2px 12px rgba(59,130,246,0.25)',
                    transition: 'all 0.2s',
                    opacity: !newEventTitle.trim() ? 0.5 : 1,
                  }}
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}