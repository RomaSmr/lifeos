// apps/web/app/dashboard/components/NotificationCenter.tsx

'use client';

import { useState } from 'react';
import { Bell, BellOff } from 'lucide-react';

interface NotificationCenterProps {
  notifications: any[];
  setNotifications: (notifications: any[]) => void;
  onComplete: (notification: any) => void;
  isDarkMode: boolean;
}

export function NotificationCenter({
  notifications,
  setNotifications,
  onComplete,
  isDarkMode,
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter((n: any) => !n.read).length;

  const markAllRead = () => {
    const updated = notifications.map((n: any) => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('notifications_cache', JSON.stringify(updated));
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '8px',
          background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
          border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          borderRadius: '8px',
          color: '#6b7280',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
        }}
      >
        {unreadCount > 0 ? (
          <>
            <Bell size={20} style={{ color: '#3b82f6' }} />
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#ef4444',
              color: 'white',
              fontSize: '9px',
              fontWeight: '600',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {unreadCount}
            </span>
          </>
        ) : (
          <BellOff size={20} />
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: '320px',
          maxHeight: '400px',
          overflowY: 'auto',
          background: isDarkMode ? '#141414' : '#ffffff',
          border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          borderRadius: '12px',
          boxShadow: isDarkMode ? '0 20px 60px rgba(0,0,0,0.8)' : '0 20px 60px rgba(0,0,0,0.15)',
          padding: '8px',
          zIndex: 100,
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
          }}>
            <span style={{
              fontWeight: '600',
              color: isDarkMode ? 'white' : '#1a1a1a',
              fontSize: '14px',
            }}>
              Уведомления
            </span>
            {notifications.length > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  fontSize: '10px',
                  color: '#3b82f6',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDarkMode ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Прочитано всё
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div style={{
              padding: '24px',
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '13px',
            }}>
              Нет уведомлений 🎉
            </div>
          ) : (
            notifications.map((notification: any) => (
              <div
                key={notification.id}
                style={{
                  padding: '10px 14px',
                  background: notification.read ? 'transparent' : isDarkMode ? 'rgba(59,130,246,0.05)' : 'rgba(59,130,246,0.08)',
                  borderRadius: '8px',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: notification.type === 'task' 
                    ? isDarkMode ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.1)' 
                    : isDarkMode ? 'rgba(249,115,22,0.15)' : 'rgba(249,115,22,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                }}>
                  {notification.type === 'task' ? '📋' : '🔥'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '13px',
                    color: isDarkMode ? 'white' : '#1a1a1a',
                  }}>
                    {notification.title}
                  </div>
                  <div style={{
                    fontSize: '10px',
                    color: '#6b7280',
                    marginTop: '2px',
                  }}>
                    {notification.message}
                  </div>
                </div>
                <button
                  onClick={() => onComplete(notification)}
                  style={{
                    padding: '4px 10px',
                    background: 'rgba(34,197,94,0.15)',
                    border: '1px solid rgba(34,197,94,0.2)',
                    borderRadius: '6px',
                    color: '#22c55e',
                    fontSize: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(34,197,94,0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(34,197,94,0.15)';
                  }}
                >
                  ✅ Выполнить
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}