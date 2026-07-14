// apps/web/app/admin/components/FeedbackModal.tsx

'use client';

import { X, Send } from 'lucide-react';
import { Feedback } from '../types';

interface FeedbackModalProps {
  feedback: Feedback | null;
  isDarkMode: boolean;
  adminResponse: string;
  feedbackStatus: string;
  loading: boolean;
  onClose: () => void;
  onResponseChange: (value: string) => void;
  onStatusChange: (status: string) => void;
  onSend: () => void;
}

export function FeedbackModal({
  feedback,
  isDarkMode,
  adminResponse,
  feedbackStatus,
  loading,
  onClose,
  onResponseChange,
  onStatusChange,
  onSend,
}: FeedbackModalProps) {
  if (!feedback) return null;

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
        zIndex: 10000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          maxWidth: '500px',
          width: '100%',
          background: isDarkMode ? '#141414' : '#ffffff',
          borderRadius: '24px',
          padding: '32px',
          border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
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
            fontSize: '20px',
            fontWeight: '600',
            color: isDarkMode ? 'white' : '#1a1a1a',
            margin: 0,
          }}>
            Ответ на обращение
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
            color: isDarkMode ? '#6b7280' : '#6b7280',
          }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{
            padding: '12px 16px',
            background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            borderRadius: '8px',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
          }}>
            <div style={{ fontSize: '12px', color: isDarkMode ? '#6b7280' : '#6b7280' }}>От пользователя</div>
            <div style={{ fontSize: '14px', color: isDarkMode ? 'white' : '#1a1a1a' }}>
              {feedback.nickname || feedback.email}
            </div>
            <div style={{ fontSize: '12px', color: isDarkMode ? '#6b7280' : '#6b7280', marginTop: '4px' }}>
              {feedback.title}
            </div>
            <div style={{ fontSize: '13px', color: isDarkMode ? '#9ca3af' : '#6b7280', marginTop: '4px' }}>
              {feedback.description}
            </div>
            {feedback.screenshot_url && (
              <a
                href={feedback.screenshot_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '12px',
                  color: '#3b82f6',
                  textDecoration: 'none',
                  display: 'inline-block',
                  marginTop: '4px',
                }}
              >
                🖼️ Посмотреть скриншот
              </a>
            )}
          </div>

          <div>
            <label style={{
              fontSize: '12px',
              color: isDarkMode ? '#6b7280' : '#6b7280',
              display: 'block',
              marginBottom: '4px',
            }}>
              Ответ пользователю
            </label>
            <textarea
              placeholder="Напишите ответ..."
              value={adminResponse}
              onChange={(e) => onResponseChange(e.target.value)}
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
                minHeight: '80px',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div>
            <label style={{
              fontSize: '12px',
              color: isDarkMode ? '#6b7280' : '#6b7280',
              display: 'block',
              marginBottom: '4px',
            }}>
              Статус
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '6px',
            }}>
              {[
                { id: 'new', label: '🆕 Новое' },
                { id: 'in_progress', label: '⏳ В работе' },
                { id: 'resolved', label: '✅ Решено' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onStatusChange(s.id)}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: `2px solid ${feedbackStatus === s.id ? '#3b82f6' : isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                    background: feedbackStatus === s.id ? 'rgba(59,130,246,0.1)' : 'transparent',
                    cursor: 'pointer',
                    fontSize: '11px',
                    color: feedbackStatus === s.id ? '#3b82f6' : '#6b7280',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '10px',
                background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                borderRadius: '10px',
                color: isDarkMode ? '#6b7280' : '#6b7280',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Отмена
            </button>
            <button
              onClick={onSend}
              disabled={loading}
              style={{
                flex: 1,
                padding: '10px',
                background: loading
                  ? '#374151'
                  : 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              {loading ? 'Отправка...' : <><Send size={16} /> Отправить ответ</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}