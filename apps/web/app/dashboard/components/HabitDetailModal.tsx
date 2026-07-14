// apps/web/app/dashboard/components/HabitDetailModal.tsx

'use client';

import { X, Target, Clock, Calendar, Flame, CheckCircle, XCircle, Bell } from 'lucide-react';
import { Habit } from '@/types';
import { useState, useEffect } from 'react';

interface HabitDetailModalProps {
  habit: Habit | null;
  stats: {
    totalDays: number;
    completedDays: number;
    skippedDays: number;
    percent: number;
  };
  onClose: () => void;
  onToggle: () => void;
  isDarkMode: boolean;
  onUpdate: (habit: Habit) => void;
}

export function HabitDetailModal({
  habit,
  stats,
  onClose,
  onToggle,
  isDarkMode,
  onUpdate,
}: HabitDetailModalProps) {
  const [showReminder, setShowReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (habit) {
      setShowReminder(habit.reminder_enabled || false);
      setReminderTime(habit.reminder_time || '09:00');
    }
  }, [habit]);

  const saveReminderSettings = async () => {
    if (!habit) return;
    
    setIsSaving(true);
    try {
      const res = await fetch('/api/habits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: habit.id,
          reminder_enabled: showReminder,
          reminder_time: showReminder ? reminderTime : null,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        onUpdate(updated);
      }
    } catch (error) {
      console.error('Error saving reminder:', error);
    }
    setIsSaving(false);
  };

  if (!habit) return null;

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (stats.percent / 100) * circumference;

  // 🔥 ПРАВИЛЬНЫЙ РАСЧЁТ ОСТАВШИХСЯ ДНЕЙ
  const getRemainingDays = () => {
    if (!habit.target_date) return 0;
    
    const targetDate = new Date(habit.target_date);
    targetDate.setHours(23, 59, 59, 999);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  const remainingDays = getRemainingDays();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
      onClick={onClose}
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
        {/* Header */}
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
            <span style={{ fontSize: '32px' }}>{habit.emoji || '🔥'}</span>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: isDarkMode ? 'white' : '#1a1a1a',
              margin: 0,
            }}>
              {habit.title}
            </h2>
          </div>
          <button
            onClick={onClose}
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
            <X size={18} />
          </button>
        </div>

        {/* Тэги */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          flexWrap: 'wrap',
        }}>
          {habit.goal && (
            <span style={{
              fontSize: '11px',
              color: '#9ca3af',
              background: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
              padding: '4px 12px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <Target size={14} style={{ color: '#3b82f6' }} />
              {habit.goal}
            </span>
          )}
          {habit.target_date && (
            <span style={{
              fontSize: '11px',
              color: '#9ca3af',
              background: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
              padding: '4px 12px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <Clock size={14} style={{ color: '#f97316' }} />
              до {new Date(habit.target_date).toLocaleDateString('ru-RU')}
            </span>
          )}
          <span style={{
            fontSize: '11px',
            color: '#9ca3af',
            background: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
            padding: '4px 12px',
            borderRadius: '6px',
          }}>
            {habit.frequency === 'daily' ? 'Ежедневно' : 
             habit.frequency === 'weekly' ? 'Еженедельно' : 
             'Ежемесячно'}
          </span>
        </div>

        {/* Круговая диаграмма */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '20px',
        }}>
          <div style={{
            position: 'relative',
            width: '180px',
            height: '180px',
          }}>
            <svg
              width="180"
              height="180"
              viewBox="0 0 180 180"
              style={{ transform: 'rotate(-90deg)' }}
            >
              <circle
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                stroke={isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
                strokeWidth="12"
              />
              <circle
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                stroke="url(#habitDetailGradient)"
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dashoffset 0.8s ease',
                }}
              />
              <defs>
                <linearGradient id="habitDetailGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: '28px',
                fontWeight: '700',
                color: isDarkMode ? 'white' : '#1a1a1a',
              }}>
                {stats.percent}%
              </div>
              <div style={{
                fontSize: '11px',
                color: '#6b7280',
              }}>
                за {stats.totalDays} дней
              </div>
            </div>
          </div>

          {/* Статистика */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            width: '100%',
            marginTop: '16px',
          }}>
            <div style={{
              textAlign: 'center',
              padding: '12px',
              background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
              borderRadius: '10px',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
            }}>
              <CheckCircle size={20} style={{ color: '#22c55e', margin: '0 auto 4px' }} />
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#22c55e' }}>
                {stats.completedDays}
              </div>
              <div style={{ fontSize: '10px', color: '#6b7280' }}>Выполнено</div>
            </div>
            <div style={{
              textAlign: 'center',
              padding: '12px',
              background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
              borderRadius: '10px',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
            }}>
              <XCircle size={20} style={{ color: '#ef4444', margin: '0 auto 4px' }} />
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#ef4444' }}>
                {stats.skippedDays}
              </div>
              <div style={{ fontSize: '10px', color: '#6b7280' }}>Пропущено</div>
            </div>
            <div style={{
              textAlign: 'center',
              padding: '12px',
              background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
              borderRadius: '10px',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
            }}>
              <Calendar size={20} style={{ color: '#3b82f6', margin: '0 auto 4px' }} />
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#3b82f6' }}>
                {remainingDays}
              </div>
              <div style={{ fontSize: '10px', color: '#6b7280' }}>Осталось</div>
            </div>
          </div>
        </div>

        {/* Настройка уведомлений */}
        <div style={{
          marginTop: '8px',
          padding: '12px 16px',
          background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
          borderRadius: '10px',
          border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={16} style={{ color: '#6b7280' }} />
              <span style={{
                fontSize: '13px',
                color: isDarkMode ? '#d1d5db' : '#4b5563',
              }}>
                Напоминание
              </span>
            </div>
            <button
              onClick={() => setShowReminder(!showReminder)}
              style={{
                padding: '4px 12px',
                borderRadius: '6px',
                border: `1px solid ${showReminder ? '#3b82f6' : isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                background: showReminder ? 'rgba(59,130,246,0.15)' : 'transparent',
                color: showReminder ? '#3b82f6' : '#6b7280',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              {showReminder ? 'Выключить' : 'Включить'}
            </button>
          </div>
          {showReminder && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginTop: '8px',
            }}>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                style={{
                  padding: '6px 12px',
                  background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                  borderRadius: '8px',
                  color: isDarkMode ? 'white' : '#1a1a1a',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
              <button
                onClick={saveReminderSettings}
                disabled={isSaving}
                style={{
                  padding: '6px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  color: 'white',
                  fontSize: '12px',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  opacity: isSaving ? 0.5 : 1,
                }}
              >
                {isSaving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          )}
        </div>

        {/* Кнопки */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
          <button
            onClick={onToggle}
            style={{
              flex: 1,
              padding: '10px',
              background: 'linear-gradient(135deg, #f97316, #ef4444)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 12px rgba(249,115,22,0.25)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.01)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            ✅ Отметить сегодня
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '10px 16px',
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
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}