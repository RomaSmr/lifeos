// apps/web/app/admin/components/UsersTable.tsx

'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Tooltip } from '@/app/components/Tooltip';
import { User } from '../types';

interface UsersTableProps {
  users: User[];
  isDarkMode: boolean;
  onSelectUser: (user: User) => void;
  onToggleBlock: (id: string, block: boolean) => void;
  onToggleVerify: (id: string, verify: boolean) => void;
  onResetPassword: (id: string) => void;
  onDeleteUser: (id: string) => void;
}

export function UsersTable({
  users,
  isDarkMode,
  onSelectUser,
  onToggleBlock,
  onToggleVerify,
  onResetPassword,
  onDeleteUser,
}: UsersTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <h3 style={{
          fontSize: '14px',
          fontWeight: '500',
          color: isDarkMode ? '#9ca3af' : '#6b7280',
          margin: 0,
        }}>
          👥 Все пользователи ({users.length})
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
            borderRadius: '8px',
            padding: '4px 12px',
          }}>
            <Search size={16} style={{ color: '#6b7280' }} />
            <input
              type="text"
              placeholder="Поиск..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: isDarkMode ? 'white' : '#1a1a1a',
                fontSize: '13px',
                outline: 'none',
                padding: '6px 0',
              }}
            />
          </div>
        </div>
      </div>

      <div style={{
        overflowX: 'auto',
        maxHeight: '500px',
        overflowY: 'auto',
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '13px',
        }}>
          <thead style={{
            position: 'sticky',
            top: 0,
            background: isDarkMode ? '#0a0a0a' : '#f5f5f5',
            zIndex: 10,
          }}>
            <tr style={{ borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', color: '#6b7280' }}>Пользователь</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', color: '#6b7280' }}>Email</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', color: '#6b7280' }}>Статус</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', color: '#6b7280' }}>Роль</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', color: '#6b7280' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr
                key={u.id}
                style={{
                  borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'}`,
                  opacity: u.is_blocked ? 0.5 : 1,
                  transition: 'all 0.2s',
                }}
              >
                <td style={{ padding: '10px 12px', color: isDarkMode ? 'white' : '#1a1a1a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {u.avatar_url ? (
                      <img
                        src={u.avatar_url}
                        alt={u.name}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        color: 'white',
                      }}>
                        {(u.name || u.email || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    {u.name || 'Без имени'}
                  </div>
                </td>
                <td style={{ padding: '10px 12px', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>{u.email}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{
                    padding: '2px 10px',
                    borderRadius: '100px',
                    fontSize: '10px',
                    background: u.is_blocked ? 'rgba(239,68,68,0.15)' : u.email_verified ? 'rgba(34,197,94,0.15)' : 'rgba(234,179,8,0.15)',
                    color: u.is_blocked ? '#ef4444' : u.email_verified ? '#22c55e' : '#eab308',
                  }}>
                    {u.is_blocked ? '🔒 Заблокирован' : u.email_verified ? '✅ Подтверждён' : '⏳ Ожидает'}
                  </span>
                </td>
                <td style={{ padding: '10px 12px', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                  {u.role === 'admin' ? '👑 Админ' : '👤 Пользователь'}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    <Tooltip text="Просмотреть" position="top">
                      <button onClick={() => onSelectUser(u)} style={buttonStyle(isDarkMode)}>👁️</button>
                    </Tooltip>
                    <Tooltip text={u.is_blocked ? 'Разблокировать' : 'Заблокировать'} position="top">
                      <button onClick={() => onToggleBlock(u.id, !u.is_blocked)} style={buttonStyle(isDarkMode)}>
                        {u.is_blocked ? '🔓' : '🔒'}
                      </button>
                    </Tooltip>
                    <Tooltip text={u.email_verified ? 'Отменить подтверждение' : 'Подтвердить email'} position="top">
                      <button onClick={() => onToggleVerify(u.id, !u.email_verified)} style={buttonStyle(isDarkMode)}>
                        {u.email_verified ? '❌' : '✅'}
                      </button>
                    </Tooltip>
                    <Tooltip text="Сбросить пароль" position="top">
                      <button onClick={() => onResetPassword(u.id)} style={buttonStyle(isDarkMode)}>🔑</button>
                    </Tooltip>
                    <Tooltip text="Удалить" position="top">
                      <button onClick={() => onDeleteUser(u.id)} style={buttonStyle(isDarkMode)}>🗑️</button>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const buttonStyle = (isDarkMode: boolean) => ({
  padding: '4px 8px',
  borderRadius: '4px',
  border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
  background: 'transparent',
  color: '#6b7280',
  cursor: 'pointer',
  fontSize: '10px',
  transition: 'all 0.2s',
});