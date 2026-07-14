// apps/web/app/dashboard/components/ActivityGraph.tsx

'use client';

import { Task, Habit } from '@/types';

interface ActivityGraphProps {
  tasks: Task[];
  habits: Habit[];
  habitLogs: any[];
  isDarkMode: boolean;
}

export function ActivityGraph({ tasks, habits, habitLogs, isDarkMode }: ActivityGraphProps) {
  // Получаем данные за последние 7 дней
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      days.push(date);
    }
    return days;
  };

  const days = getLast7Days();

  // Считаем выполненное за каждый день
  const getDayProgress = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    // Считаем выполненные задачи за день
    const completedTasks = tasks.filter(t => {
      if (!t.completed_at) return false;
      const taskDate = new Date(t.completed_at).toISOString().split('T')[0];
      return taskDate === dateStr && t.status === 'completed';
    }).length;

    // Считаем отмеченные привычки за день
    const completedHabits = habitLogs.filter(log => {
      const logDate = new Date(log.completed_at).toISOString().split('T')[0];
      return logDate === dateStr;
    }).length;

    // Общее количество активностей за день
    const total = completedTasks + completedHabits;
    
    // Максимальное количество за день (для масштабирования)
    const maxTotal = 10; // Максимум 10 активностей в день

    return {
      total,
      percentage: Math.min((total / maxTotal) * 100, 100),
      completedTasks,
      completedHabits,
    };
  };

  // Находим максимальное значение для масштабирования
  const maxValue = Math.max(...days.map(d => getDayProgress(d).total), 1);

  return (
    <div style={{
      background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.8)',
      border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '24px',
      boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
      }}>
        <h3 style={{
          fontSize: '14px',
          fontWeight: '500',
          color: '#9ca3af',
          margin: 0,
        }}>
          📊 Активность за неделю
        </h3>
        <span style={{
          fontSize: '11px',
          color: '#6b7280',
        }}>
          {tasks.filter(t => t.status === 'completed').length + habitLogs.length} всего
        </span>
      </div>

      {/* График */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '8px',
        height: '100px',
        paddingBottom: '4px',
      }}>
        {days.map((day, index) => {
          const progress = getDayProgress(day);
          const height = maxValue > 0 ? (progress.total / maxValue) * 80 : 0;
          const isToday = day.toDateString() === new Date().toDateString();

          return (
            <div
              key={index}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <div style={{
                width: '100%',
                height: `${Math.max(height, 4)}px`,
                background: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                borderRadius: '4px',
                position: 'relative',
                transition: 'height 0.5s ease',
              }}>
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: `${height}%`,
                  background: progress.total > 0 
                    ? 'linear-gradient(180deg, #8b5cf6, #3b82f6)'
                    : 'transparent',
                  borderRadius: '4px',
                  transition: 'height 0.5s ease',
                  opacity: progress.total > 0 ? 1 : 0.1,
                }}>
                  {progress.total > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '-18px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '8px',
                      color: '#6b7280',
                      fontWeight: '500',
                    }}>
                      {progress.total}
                    </div>
                  )}
                </div>
              </div>
              <span style={{
                fontSize: '8px',
                color: isToday ? '#3b82f6' : '#6b7280',
                fontWeight: isToday ? '600' : '400',
                textTransform: 'uppercase',
              }}>
                {day.toLocaleDateString('ru-RU', { weekday: 'short' })}
              </span>
            </div>
          );
        })}
      </div>

      {/* Легенда */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        marginTop: '12px',
        fontSize: '10px',
        color: '#6b7280',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '2px',
            background: 'linear-gradient(180deg, #8b5cf6, #3b82f6)',
          }} />
          Выполнено
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '2px',
            background: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
          }} />
          Нет активности
        </span>
      </div>
    </div>
  );
}