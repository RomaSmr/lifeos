// apps/web/app/admin/components/UserModal.tsx

'use client';

import { X } from 'lucide-react';
import { User } from '../types';

interface UserModalProps {
  user: User | null;
  isDarkMode: boolean;
  onClose: () => void;
  onToggleBlock: (id: string, block: boolean) => void;
  onToggleVerify: (id: string, verify: boolean) => void;
  onResetPassword: (id: string) => void;
  onDeleteUser: (id: string) => void;
}

export function UserModal({
  user,
  isDarkMode,
  onClose,
  onToggleBlock,
  onToggleVerify,
  onResetPassword,
  onDeleteUser,
}: UserModalProps) {
  if (!user) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
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
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: isDarkMode ? 'white' : '#1a1a1a', margin: 0 }}>
            👤 {user.name || 'Пользователь'}
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
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '16px',
            background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            borderRadius: '12px',
          }}>
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                color: 'white',
              }}>
                {(user.name || user.email || 'U')[0].toUpperCase()}
              </div>
            )}
            <div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: isDarkMode ? 'white' : '#1a1a1a' }}>
                {user.name || 'Без имени'}
                {user.is_blocked && (
                  <span style={{ marginLeft: '8px', fontSize: '14px', color: '#ef4444' }}>🔒</span>
                )}
              </div>
              <div style={{ fontSize: '13px', color: isDarkMode ? '#6b7280' : '#6b7280' }}>{user.email}</div>
              <div style={{ fontSize: '13px', color: isDarkMode ? '#6b7280' : '#6b7280' }}>
                Ник: {user.nickname || 'Не указан'}
              </div>
              <div style={{ fontSize: '13px', color: isDarkMode ? '#6b7280' : '#6b7280' }}>
                Роль: {user.role === 'admin' ? '👑 Админ' : '👤 Пользователь'}
              </div>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
          }}>
            <div style={{
              padding: '12px',
              background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
              borderRadius: '8px',
            }}>
              <div style={{ fontSize: '11px', color: isDarkMode ? '#6b7280' : '#6b7280' }}>Дата регистрации</div>
              <div style={{ fontSize: '14px', color: isDarkMode ? 'white' : '#1a1a1a' }}>
                {new Date(user.created_at).toLocaleString('ru-RU')}
              </div>
            </div>
            <div style={{
              padding: '12px',
              background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
              borderRadius: '8px',
            }}>
              <div style={{ fontSize: '11px', color: isDarkMode ? '#6b7280' : '#6b7280' }}>Последний визит</div>
              <div style={{ fontSize: '14px', color: isDarkMode ? 'white' : '#1a1a1a' }}>
                {user.last_seen ? new Date(user.last_seen).toLocaleString('ru-RU') : 'Никогда'}
              </div>
            </div>
          </div>

          {user.bio && (
            <div style={{
              padding: '12px',
              background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
              borderRadius: '8px',
            }}>
              <div style={{ fontSize: '11px', color: isDarkMode ? '#6b7280' : '#6b7280' }}>О себе</div>
              <div style={{ fontSize: '14px', color: isDarkMode ? 'white' : '#1a1a1a' }}>{user.bio}</div>
            </div>
          )}

          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            marginTop: '8px',
          }}>
            <button
              onClick={() => onToggleBlock(user.id, !user.is_blocked)}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: user.is_blocked ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                color: user.is_blocked ? '#22c55e' : '#ef4444',
                cursor: 'pointer',
                fontSize: '13px',
                transition: 'all 0.2s',
              }}
            >
              {user.is_blocked ? '🔓 Разблокировать' : '🔒 Заблокировать'}
            </button>
            <button
              onClick={() => onToggleVerify(user.id, !user.email_verified)}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: user.email_verified ? 'rgba(234,179,8,0.15)' : 'rgba(34,197,94,0.15)',
                color: user.email_verified ? '#eab308' : '#22c55e',
                cursor: 'pointer',
                fontSize: '13px',
                transition: 'all 0.2s',
              }}
            >
              {user.email_verified ? '❌ Отменить подтверждение' : '✅ Подтвердить email'}
            </button>
            <button
              onClick={() => onResetPassword(user.id)}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: 'rgba(139,92,246,0.15)',
                color: '#8b5cf6',
                cursor: 'pointer',
                fontSize: '13px',
                transition: 'all 0.2s',
              }}
            >
              🔑 Сбросить пароль
            </button>
          </div>

          <button
            onClick={() => onDeleteUser(user.id)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: `1px solid ${isDarkMode ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.2)'}`,
              background: 'transparent',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: '13px',
              transition: 'all 0.2s',
              marginTop: '4px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            🗑️ Удалить пользователя навсегда
          </button>
        </div>
      </div>
    </div>
  );
}