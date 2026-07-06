// apps/web/app/components/Modals/TaskModal.tsx

'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  isDarkMode: boolean;
  isSubmitting?: boolean;
}

export function TaskModal({ isOpen, onClose, onSave, isDarkMode, isSubmitting = false }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!title.trim()) {
      alert('Введите название задачи');
      return;
    }
    onSave({ title: title.trim(), description: description.trim() || null, priority, due_date: dueDate || null });
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
  };

  const priorityLabels: Record<string, string> = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий',
    urgent: 'Срочный',
  };

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
        zIndex: 999,
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
          }}>
            Новая задача
          </h2>
          <button onClick={onClose} style={{
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
          }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="text"
            placeholder="Название задачи..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
              borderRadius: '10px',
              color: isDarkMode ? 'white' : '#1a1a1a',
              fontSize: '14px',
              outline: 'none',
            }}
            autoFocus
          />
          <textarea
            placeholder="Описание..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
              borderRadius: '10px',
              color: isDarkMode ? 'white' : '#1a1a1a',
              fontSize: '14px',
              outline: 'none',
              resize: 'vertical',
              minHeight: '60px',
              fontFamily: 'inherit',
            }}
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
              borderRadius: '10px',
              color: isDarkMode ? 'white' : '#1a1a1a',
              fontSize: '14px',
              outline: 'none',
            }}
          />
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '6px',
          }}>
            {['low', 'medium', 'high', 'urgent'].map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                style={{
                  padding: '6px',
                  borderRadius: '8px',
                  border: `2px solid ${priority === p ? '#3b82f6' : isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                  background: priority === p ? isDarkMode ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.1)' : 'transparent',
                  cursor: 'pointer',
                  fontSize: '11px',
                  color: priority === p ? (isDarkMode ? 'white' : '#1a1a1a') : '#6b7280',
                }}
              >
                {priorityLabels[p]}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={onClose} style={{
              flex: 1,
              padding: '10px',
              background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
              borderRadius: '10px',
              color: '#6b7280',
              fontSize: '14px',
              cursor: 'pointer',
            }}>
              Отмена
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !title.trim()}
              style={{
                flex: 1,
                padding: '10px',
                background: isSubmitting || !title.trim()
                  ? '#374151'
                  : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isSubmitting || !title.trim() ? 'not-allowed' : 'pointer',
                opacity: isSubmitting || !title.trim() ? 0.5 : 1,
              }}
            >
              {isSubmitting ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}