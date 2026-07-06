// apps/web/app/dashboard/components/HabitList.tsx

'use client';

import { useState } from 'react';
import { Flame, Plus, Trash2 } from 'lucide-react';
import { Habit } from '@/types';
import { EmptyState } from '@/app/components/EmptyState';
import { HabitModal } from '@/app/components/Modals/HabitModal';

interface HabitListProps {
  habits: Habit[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: (data: any) => void;
  getStats: (id: string) => { totalDays: number; completedDays: number; skippedDays: number; percent: number };
  isDarkMode: boolean;
}

export function HabitList({ habits, onToggle, onDelete, onCreate, getStats, isDarkMode }: HabitListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (data: any) => {
    setIsSubmitting(true);
    try {
      await onCreate(data);
      setIsModalOpen(false);
    } catch (error) {
      alert('Ошибка создания привычки');
    }
    setIsSubmitting(false);
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
      }}>
        <h2 style={{
          fontSize: '14px',
          fontWeight: '600',
          color: isDarkMode ? 'white' : '#1a1a1a',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <Flame size={16} style={{ color: '#f97316' }} />
          Привычки
          <span style={{
            fontSize: '11px',
            color: '#6b7280',
            fontWeight: '400',
          }}>
            ({habits.length})
          </span>
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            padding: '4px 10px',
            background: 'linear-gradient(135deg, #f97316, #ef4444)',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            fontSize: '11px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <Plus size={12} />
          Добавить
        </button>
      </div>

      {habits.length === 0 ? (
        <EmptyState
          icon={Flame}
          title="Нет привычек"
          description="Начни с малого — создай свою первую привычку"
          action={{
            label: 'Создать привычку',
            onClick: () => setIsModalOpen(true),
          }}
          isDarkMode={isDarkMode}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '400px', overflowY: 'auto' }}>
          {habits.map((habit) => {
            const stats = getStats(habit.id);
            return (
              <div
                key={habit.id}
                style={{
                  background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                  borderRadius: '8px',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: '20px' }}>{habit.emoji || '🔥'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: '500',
                    color: isDarkMode ? 'white' : '#1a1a1a',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {habit.title}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '2px',
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      background: 'rgba(249,115,22,0.1)',
                      padding: '1px 8px',
                      borderRadius: '100px',
                    }}>
                      <Flame size={10} style={{ color: '#f97316' }} />
                      <span style={{
                        fontSize: '10px',
                        fontWeight: '600',
                        color: '#f97316',
                      }}>
                        {habit.streak || 0}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '9px',
                      color: '#6b7280',
                    }}>
                      {stats.percent}%
                    </span>
                    {habit.goal && (
                      <span style={{
                        fontSize: '8px',
                        color: '#4b5563',
                        background: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                        padding: '1px 6px',
                        borderRadius: '4px',
                      }}>
                        🎯 {habit.goal}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onToggle(habit.id)}
                  style={{
                    padding: '4px 8px',
                    background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                    borderRadius: '4px',
                    color: '#6b7280',
                    fontSize: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(34,197,94,0.15)';
                    e.currentTarget.style.borderColor = 'rgba(34,197,94,0.2)';
                    e.currentTarget.style.color = '#22c55e';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
                    e.currentTarget.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
                    e.currentTarget.style.color = '#6b7280';
                  }}
                >
                  ✅
                </button>
                <button
                  onClick={() => onDelete(habit.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px',
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
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <HabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreate}
        isDarkMode={isDarkMode}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}