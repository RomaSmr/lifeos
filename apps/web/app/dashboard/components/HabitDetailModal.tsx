// apps/web/app/dashboard/components/HabitDetailModal.tsx

'use client';

import { X, Target, Clock } from 'lucide-react';
import { Habit } from '@/types';

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
}

export function HabitDetailModal({
  habit,
  stats,
  onClose,
  onToggle,
  isDarkMode,
}: HabitDetailModalProps) {
  if (!habit) return null;

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (stats.percent / 100) * circumference;

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
        zIndex: 2000,
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

        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '16px',
          flexWrap: 'wrap',
        }}>
          {habit.goal && (
            <span style={{
              fontSize: '12px',
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
              fontSize: '12px',
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
            fontSize: '12px',
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

        {habit.description && (
          <div style={{
            background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '16px',
            fontSize: '13px',
            color: isDarkMode ? '#9ca3af' : '#6b7280',
            lineHeight: '1.5',
          }}>
            {habit.description}
          </div>
        )}

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '20px',
        }}>
          <div style={{
            position: 'relative',
            width: '200px',
            height: '200px',
          }}>
            <svg
              width="200"
              height="200"
              viewBox="0 0 200 200"
              style={{ transform: 'rotate(-90deg)' }}
            >
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke={isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
                strokeWidth="14"
              />
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="url(#habitDetailGradient)"
                strokeWidth="14"
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
                fontSize: '32px',
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

          <div style={{
            display: 'flex',
            gap: '20px',
            marginTop: '12px',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#22c55e' }}>
                {stats.completedDays}
              </div>
              <div style={{ fontSize: '10px', color: '#6b7280' }}>✅ Выполнено</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#ef4444' }}>
                {stats.skippedDays}
              </div>
              <div style={{ fontSize: '10px', color: '#6b7280' }}>❌ Пропущено</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#f97316' }}>
                {habit.streak || 0}
              </div>
              <div style={{ fontSize: '10px', color: '#6b7280' }}>🔥 Серия</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
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