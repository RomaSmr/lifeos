// apps/web/app/admin/components/FeedbackList.tsx

'use client';

import { MessageSquare, ChevronRight } from 'lucide-react';
import { Feedback } from '../types';

interface FeedbackListProps {
  feedbackList: Feedback[];
  isDarkMode: boolean;
  onSelect: (item: Feedback) => void;
  onRefresh: () => void;
}

export function FeedbackList({ feedbackList, isDarkMode, onSelect, onRefresh }: FeedbackListProps) {
  return (
    <div style={{
      background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
      border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
      borderRadius: '12px',
      padding: '20px',
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
          color: isDarkMode ? '#9ca3af' : '#6b7280',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <MessageSquare size={18} style={{ color: '#8b5cf6' }} />
          Все обращения ({feedbackList.length})
        </h3>
        <button
          onClick={onRefresh}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
            background: 'transparent',
            color: isDarkMode ? '#6b7280' : '#6b7280',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
            e.currentTarget.style.color = isDarkMode ? 'white' : '#1a1a1a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = isDarkMode ? '#6b7280' : '#6b7280';
          }}
        >
          🔄 Обновить
        </button>
      </div>

      {feedbackList.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: isDarkMode ? '#6b7280' : '#6b7280',
        }}>
          <MessageSquare size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <p style={{ fontSize: '16px', fontWeight: '500' }}>Нет обращений</p>
          <p style={{ fontSize: '13px' }}>Пользователи пока не отправляли сообщения</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {feedbackList.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              style={{
                background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                borderRadius: '10px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)';
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '12px',
                flexWrap: 'wrap',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '4px',
                    flexWrap: 'wrap',
                  }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: isDarkMode ? 'white' : '#1a1a1a',
                    }}>
                      {item.title}
                    </span>
                    <span style={{
                      padding: '2px 10px',
                      borderRadius: '100px',
                      fontSize: '10px',
                      background: item.severity === 'high' ? 'rgba(239,68,68,0.15)' :
                                 item.severity === 'medium' ? 'rgba(234,179,8,0.15)' :
                                 'rgba(34,197,94,0.15)',
                      color: item.severity === 'high' ? '#ef4444' :
                             item.severity === 'medium' ? '#eab308' :
                             '#22c55e',
                    }}>
                      {item.severity === 'high' ? '🔴 Высокая' :
                       item.severity === 'medium' ? '🟡 Средняя' :
                       '🟢 Низкая'}
                    </span>
                    <span style={{
                      padding: '2px 10px',
                      borderRadius: '100px',
                      fontSize: '10px',
                      background: item.status === 'new' ? 'rgba(59,130,246,0.15)' :
                                 item.status === 'resolved' ? 'rgba(34,197,94,0.15)' :
                                 'rgba(234,179,8,0.15)',
                      color: item.status === 'new' ? '#3b82f6' :
                             item.status === 'resolved' ? '#22c55e' :
                             '#eab308',
                    }}>
                      {item.status === 'new' ? '🆕 Новое' :
                       item.status === 'resolved' ? '✅ Решено' :
                       '⏳ В работе'}
                    </span>
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: isDarkMode ? '#9ca3af' : '#6b7280',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {item.description}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginTop: '6px',
                    fontSize: '11px',
                    color: isDarkMode ? '#6b7280' : '#6b7280',
                    flexWrap: 'wrap',
                  }}>
                    <span>👤 {item.nickname || item.email}</span>
                    <span>📅 {new Date(item.created_at).toLocaleString('ru-RU')}</span>
                    {item.screenshot_url && <span>🖼️ Есть скриншот</span>}
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: '#6b7280', flexShrink: 0 }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}