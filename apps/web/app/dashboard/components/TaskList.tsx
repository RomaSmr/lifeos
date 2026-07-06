// apps/web/app/dashboard/components/TaskList.tsx

'use client';

import { useState } from 'react';
import { Check, Calendar, Trash2, Plus } from 'lucide-react';
import { Task } from '@/types';
import { EmptyState } from '@/app/components/EmptyState';
import { TaskModal } from '@/app/components/Modals/TaskModal';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string, forceComplete?: boolean) => void;
  onDelete: (id: string) => void;
  onCreate: (data: any) => void;
  isDarkMode: boolean;
}

export function TaskList({ tasks, onToggle, onDelete, onCreate, isDarkMode }: TaskListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const completedCount = tasks.filter(t => t.status === 'completed').length;

  const handleCreate = async (data: any) => {
    setIsSubmitting(true);
    try {
      await onCreate(data);
      setIsModalOpen(false);
    } catch (error) {
      alert('Ошибка создания задачи');
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
          <Check size={16} style={{ color: '#3b82f6' }} />
          Задачи
          <span style={{
            fontSize: '11px',
            color: '#6b7280',
            fontWeight: '400',
          }}>
            ({completedCount}/{tasks.length})
          </span>
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            padding: '4px 10px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
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

      {tasks.length === 0 ? (
        <EmptyState
          icon={Check}
          title="У тебя пока нет задач"
          description="Создай первую задачу, чтобы начать путь"
          action={{
            label: 'Создать задачу',
            onClick: () => setIsModalOpen(true),
          }}
          isDarkMode={isDarkMode}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '400px', overflowY: 'auto' }}>
          {tasks.map((task) => (
            <div
              key={task.id}
              style={{
                background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                border: `1px solid ${task.status === 'completed' ? isDarkMode ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.2)' : isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                borderRadius: '8px',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.2s',
                opacity: task.status === 'completed' ? 0.5 : 1,
              }}
            >
              <button
                onClick={() => onToggle(task.id)}
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '4px',
                  border: `2px solid ${task.status === 'completed' ? '#22c55e' : '#374151'}`,
                  background: task.status === 'completed' ? '#22c55e' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {task.status === 'completed' && (
                  <Check size={10} style={{ color: 'white' }} />
                )}
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  color: task.status === 'completed' ? '#6b7280' : (isDarkMode ? '#d1d5db' : '#4b5563'),
                  fontSize: '13px',
                  textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {task.title}
                </div>
                {task.due_date && (
                  <div style={{
                    fontSize: '9px',
                    color: '#6b7280',
                    marginTop: '1px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    <Calendar size={10} />
                    {new Date(task.due_date).toLocaleDateString('ru-RU')}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {task.priority && (
                  <span style={{
                    fontSize: '8px',
                    padding: '1px 6px',
                    borderRadius: '100px',
                    background: task.priority === 'urgent' ? 'rgba(239,68,68,0.15)' :
                               task.priority === 'high' ? 'rgba(251,146,60,0.15)' :
                               task.priority === 'medium' ? 'rgba(234,179,8,0.15)' :
                               'rgba(107,114,128,0.15)',
                    color: task.priority === 'urgent' ? '#ef4444' :
                           task.priority === 'high' ? '#fb923c' :
                           task.priority === 'medium' ? '#eab308' :
                           '#6b7280',
                  }}>
                    {task.priority === 'urgent' ? '❗' :
                     task.priority === 'high' ? '🔺' :
                     task.priority === 'medium' ? '▪️' :
                     '▫️'}
                  </span>
                )}
                <button
                  onClick={() => onDelete(task.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px',
                    color: '#6b7280',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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
            </div>
          ))}
        </div>
      )}

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreate}
        isDarkMode={isDarkMode}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}