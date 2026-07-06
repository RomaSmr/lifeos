// apps/web/app/dashboard/components/CalendarWidget.tsx

'use client';

import { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { Task, Habit } from '@/types';

interface CalendarWidgetProps {
  tasks: Task[];
  habits: Habit[];
  isDarkMode: boolean;
}

export function CalendarWidget({ tasks, habits, isDarkMode }: CalendarWidgetProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarView, setCalendarView] = useState<'week' | 'month'>('week');

  const getWeekDays = () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - start.getDay());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];
    
    const startPadding = firstDay.getDay();
    for (let i = startPadding - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push(d);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    const endPadding = 42 - days.length;
    for (let i = 1; i <= endPadding; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  };

  const getDayTasks = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date).toISOString().split('T')[0];
      return taskDate === dateStr;
    });
  };

  const getDayHabits = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return habits.filter(habit => {
      if (!habit.target_date) return false;
      const habitDate = new Date(habit.target_date).toISOString().split('T')[0];
      return habitDate === dateStr;
    });
  };

  const prevMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  const weekDays = getWeekDays();
  const monthDays = getMonthDays(currentMonth);

  return (
    <div style={{
      marginTop: '24px',
      background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.7)',
      border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
      borderRadius: '12px',
      padding: '16px',
      boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
      }}>
        <h3 style={{
          fontSize: '14px',
          fontWeight: '500',
          color: '#9ca3af',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <CalendarDays size={16} />
          Календарь
        </h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setCalendarView('week')}
            style={{
              padding: '4px 12px',
              borderRadius: '6px',
              border: `1px solid ${calendarView === 'week' ? '#3b82f6' : isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
              background: calendarView === 'week' ? 'rgba(59,130,246,0.15)' : 'transparent',
              color: calendarView === 'week' ? '#3b82f6' : '#6b7280',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            Неделя
          </button>
          <button
            onClick={() => setCalendarView('month')}
            style={{
              padding: '4px 12px',
              borderRadius: '6px',
              border: `1px solid ${calendarView === 'month' ? '#3b82f6' : isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
              background: calendarView === 'month' ? 'rgba(59,130,246,0.15)' : 'transparent',
              color: calendarView === 'month' ? '#3b82f6' : '#6b7280',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            Месяц
          </button>
        </div>
      </div>

      {calendarView === 'week' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '4px',
        }}>
          {weekDays.map((day, index) => {
            const dayTasks = getDayTasks(day);
            const dayHabits = getDayHabits(day);
            const isToday = day.toDateString() === new Date().toDateString();
            const isWeekend = index === 0 || index === 6;
            const totalItems = [...dayTasks, ...dayHabits];
            
            return (
              <div
                key={index}
                onClick={() => {
                  const dateStr = day.toLocaleDateString('ru-RU', { 
                    day: 'numeric', 
                    month: 'long' 
                  });
                  if (totalItems.length > 0) {
                    const taskList = dayTasks.map(t => `• 📋 ${t.title}`).join('\n');
                    const habitList = dayHabits.map(h => `• 🔥 ${h.title} (до ${h.target_date ? new Date(h.target_date).toLocaleDateString('ru-RU') : '...'})`).join('\n');
                    alert(`📅 ${dateStr}\n\n${taskList ? `ЗАДАЧИ:\n${taskList}\n\n` : ''}${habitList ? `ПРИВЫЧКИ:\n${habitList}` : 'Нет задач и привычек на этот день ✅'}`);
                  } else {
                    alert(`📅 ${dateStr}\n\nНет задач и привычек на этот день ✅`);
                  }
                }}
                style={{
                  textAlign: 'center',
                  padding: '8px 4px',
                  borderRadius: '8px',
                  background: isToday ? isDarkMode ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)' : 'transparent',
                  border: isToday ? `1px solid ${isDarkMode ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.3)'}` : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  fontSize: '9px',
                  color: isWeekend ? '#ef4444' : '#6b7280',
                  textTransform: 'uppercase',
                }}>
                  {day.toLocaleDateString('ru-RU', { weekday: 'short' })}
                </div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: isToday ? '#3b82f6' : (isDarkMode ? 'white' : '#1a1a1a'),
                  marginTop: '2px',
                }}>
                  {day.getDate()}
                </div>
                <div style={{
                  marginTop: '4px',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '2px',
                  flexWrap: 'wrap',
                }}>
                  {totalItems.slice(0, 4).map((item: any) => {
                    const isHabit = item.target_date !== undefined;
                    return (
                      <div
                        key={item.id}
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: isHabit ? '#f97316' : 
                                    item.priority === 'urgent' ? '#ef4444' :
                                    item.priority === 'high' ? '#fb923c' :
                                    item.priority === 'medium' ? '#eab308' :
                                    '#3b82f6',
                        }}
                        title={item.title}
                      />
                    );
                  })}
                  {totalItems.length > 4 && (
                    <span style={{
                      fontSize: '7px',
                      color: '#6b7280',
                    }}>
                      +{totalItems.length - 4}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}>
            <button
              onClick={prevMonth}
              style={{
                padding: '4px 8px',
                background: 'none',
                border: 'none',
                color: '#6b7280',
                cursor: 'pointer',
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: isDarkMode ? 'white' : '#1a1a1a',
            }}>
              {currentMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={nextMonth}
              style={{
                padding: '4px 8px',
                background: 'none',
                border: 'none',
                color: '#6b7280',
                cursor: 'pointer',
              }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '2px',
          }}>
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
              <div
                key={day}
                style={{
                  textAlign: 'center',
                  fontSize: '10px',
                  color: '#6b7280',
                  padding: '4px 0',
                  fontWeight: '600',
                }}
              >
                {day}
              </div>
            ))}
            {monthDays.map((day, index) => {
              const dayTasks = getDayTasks(day);
              const dayHabits = getDayHabits(day);
              const totalItems = [...dayTasks, ...dayHabits];
              const isToday = day.toDateString() === new Date().toDateString();
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
              
              return (
                <div
                  key={index}
                  onClick={() => {
                    const dateStr = day.toLocaleDateString('ru-RU', { 
                      day: 'numeric', 
                      month: 'long' 
                    });
                    if (totalItems.length > 0) {
                      const taskList = dayTasks.map(t => `• 📋 ${t.title}`).join('\n');
                      const habitList = dayHabits.map(h => `• 🔥 ${h.title} (до ${h.target_date ? new Date(h.target_date).toLocaleDateString('ru-RU') : '...'})`).join('\n');
                      alert(`📅 ${dateStr}\n\n${taskList ? `ЗАДАЧИ:\n${taskList}\n\n` : ''}${habitList ? `ПРИВЫЧКИ:\n${habitList}` : 'Нет задач и привычек на этот день ✅'}`);
                    } else {
                      alert(`📅 ${dateStr}\n\nНет задач и привычек на этот день ✅`);
                    }
                  }}
                  style={{
                    textAlign: 'center',
                    padding: '6px 2px',
                    borderRadius: '6px',
                    background: isToday ? isDarkMode ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.1)' : 'transparent',
                    border: isToday ? `1px solid ${isDarkMode ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.4)'}` : 'none',
                    opacity: isCurrentMonth ? 1 : 0.3,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    fontSize: '13px',
                    fontWeight: isToday ? '700' : '400',
                    color: isToday ? '#3b82f6' : (isDarkMode ? 'white' : '#1a1a1a'),
                  }}>
                    {day.getDate()}
                  </div>
                  {totalItems.length > 0 && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '1px',
                      marginTop: '2px',
                    }}>
                      {totalItems.slice(0, 3).map((item: any) => {
                        const isHabit = item.target_date !== undefined;
                        return (
                          <div
                            key={item.id}
                            style={{
                              width: '4px',
                              height: '4px',
                              borderRadius: '50%',
                              background: isHabit ? '#f97316' : '#3b82f6',
                            }}
                            title={item.title}
                          />
                        );
                      })}
                      {totalItems.length > 3 && (
                        <span style={{
                          fontSize: '6px',
                          color: '#6b7280',
                        }}>
                          +{totalItems.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
      <div style={{
        marginTop: '8px',
        textAlign: 'center',
        fontSize: '10px',
        color: '#4b5563',
      }}>
        💡 Нажми на день, чтобы увидеть список задач и привычек
      </div>
    </div>
  );
}