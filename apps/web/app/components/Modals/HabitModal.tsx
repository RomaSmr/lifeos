// apps/web/app/components/Modals/HabitModal.tsx

'use client';

import { useState } from 'react';
import { X, Target, Clock } from 'lucide-react';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  isDarkMode: boolean;
  isSubmitting?: boolean;
}

const EMOJIS = ['📝', '💼', '📚', '🏋️', '🎯', '💡', '🏠', '🚀', '❤️', '⭐', '🔥', '💪', '🧠', '🎨', '📈'];
const GOALS = ['Здоровье', 'Работа', 'Обучение', 'Финансы', 'Отношения', 'Саморазвитие', 'Спорт', 'Творчество'];

export function HabitModal({ isOpen, onClose, onSave, isDarkMode, isSubmitting = false }: HabitModalProps) {
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('🔥');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [frequency, setFrequency] = useState('daily');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!title.trim()) {
      alert('Введите название привычки');
      return;
    }
    onSave({
      title: title.trim(),
      emoji,
      description: description.trim() || null,
      goal: goal || null,
      target_date: targetDate || null,
      frequency,
    });
    setTitle('');
    setEmoji('🔥');
    setDescription('');
    setGoal('');
    setTargetDate('');
    setFrequency('daily');
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
            Новая привычка
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
          {/* Иконка */}
          <div>
            <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px', display: 'block' }}>
              Иконка
            </label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    border: `2px solid ${emoji === e ? '#f97316' : isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                    background: emoji === e ? 'rgba(249,115,22,0.15)' : 'transparent',
                    cursor: 'pointer',
                    fontSize: '16px',
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Название */}
          <div>
            <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px', display: 'block' }}>
              Название <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="Например: Утренняя зарядка"
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
          </div>

          {/* Описание */}
          <div>
            <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px', display: 'block' }}>
              Описание
            </label>
            <textarea
              placeholder="Дополнительные детали о привычке..."
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
          </div>

          {/* Цель */}
          <div>
            <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px', display: 'block' }}>
              <Target size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
              Цель
            </label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {GOALS.map((g) => (
                <button
                  key={g}
                  onClick={() => setGoal(g)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${goal === g ? '#f97316' : isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                    background: goal === g ? 'rgba(249,115,22,0.15)' : 'transparent',
                    cursor: 'pointer',
                    fontSize: '11px',
                    color: goal === g ? '#f97316' : '#6b7280',
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Дата окончания */}
          <div>
            <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px', display: 'block' }}>
              <Clock size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
              Дата окончания
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
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
          </div>

          {/* Частота */}
          <div>
            <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px', display: 'block' }}>
              Частота
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '6px',
            }}>
              {['daily', 'weekly', 'monthly'].map((freq) => (
                <button
                  key={freq}
                  onClick={() => setFrequency(freq)}
                  style={{
                    padding: '6px',
                    borderRadius: '8px',
                    border: `2px solid ${frequency === freq ? '#f97316' : isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                    background: frequency === freq ? 'rgba(249,115,22,0.15)' : 'transparent',
                    cursor: 'pointer',
                    fontSize: '11px',
                    color: frequency === freq ? (isDarkMode ? 'white' : '#1a1a1a') : '#6b7280',
                    fontWeight: frequency === freq ? '500' : '400',
                  }}
                >
                  {freq === 'daily' ? 'Ежедневно' : freq === 'weekly' ? 'Еженедельно' : 'Ежемесячно'}
                </button>
              ))}
            </div>
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
                  : 'linear-gradient(135deg, #f97316, #ef4444)',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isSubmitting || !title.trim() ? 'not-allowed' : 'pointer',
                opacity: isSubmitting || !title.trim() ? 0.5 : 1,
              }}
            >
              {isSubmitting ? 'Сохранение...' : 'Создать привычку'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}