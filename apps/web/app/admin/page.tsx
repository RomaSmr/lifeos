// apps/web/app/admin/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Loader from '@/app/components/Loader';
import { useAdminData } from './hooks/useAdminData';
import { useAdminActions } from './hooks/useAdminActions';
import { AdminHeader } from './components/AdminHeader';
import { StatCards } from './components/StatCards';
import { UsersTable } from './components/UsersTable';
import { FeedbackList } from './components/FeedbackList';
import { UserModal } from './components/UserModal';
import { FeedbackModal } from './components/FeedbackModal';
import { User, Feedback } from './types';

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'feedback' | 'settings'>('overview');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [serverStatus, setServerStatus] = useState<'online' | 'offline'>('online');

  // Данные
  const { stats, users, feedbackList, loading, fetchAllData, fetchFeedback, setUsers, setFeedbackList } = useAdminData();
  
  // Действия
  const {
    actionLoading,
    toggleUserBlock,
    toggleEmailVerification,
    resetUserPassword,
    deleteUser,
    handleFeedbackResponse,
  } = useAdminActions(setUsers, setFeedbackList);

  // Модалки
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [adminResponse, setAdminResponse] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState('resolved');

  const router = useRouter();

  // Auth
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          if (data.email !== 'romagronki@gmail.com' && data.email !== 'admin@lifeos.app') {
            router.push('/dashboard');
            return;
          }
        } else {
          router.push('/login');
          return;
        }
      } catch {
        router.push('/login');
        return;
      } finally {
        setAuthChecked(true);
      }
    };
    checkAuth();
  }, []);

  // Тема
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
      document.documentElement.style.background = savedTheme === 'dark' ? '#0a0a0a' : '#f5f5f5';
      document.body.style.background = savedTheme === 'dark' ? '#0a0a0a' : '#f5f5f5';
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    document.documentElement.style.background = newMode ? '#0a0a0a' : '#f5f5f5';
    document.body.style.background = newMode ? '#0a0a0a' : '#f5f5f5';
  };

  const toggleServer = async () => {
    if (serverStatus === 'online') {
      if (confirm('❌ Остановить сервер? Это закроет доступ для всех пользователей.')) {
        setServerStatus('offline');
      }
    } else {
      setServerStatus('online');
    }
  };

  if (!authChecked || loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: isDarkMode ? '#0a0a0a' : '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Loader text="Загрузка админ-панели..." size="large" />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: isDarkMode ? '#0a0a0a' : '#f5f5f5',
      padding: '20px',
      transition: 'background 0.3s ease',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <AdminHeader
          user={user}
          serverStatus={serverStatus}
          isDarkMode={isDarkMode}
          onToggleServer={toggleServer}
          onToggleTheme={toggleTheme}
        />

        {/* Статистика */}
        <StatCards stats={stats} isDarkMode={isDarkMode} />

        {/* Вкладки */}
        <div style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '20px',
          background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
          borderRadius: '10px',
          padding: '4px',
          flexWrap: 'wrap',
        }}>
          {[
            { id: 'overview', label: 'Обзор', icon: '📊' },
            { id: 'users', label: 'Пользователи', icon: '👥' },
            { id: 'feedback', label: '💬 Обратная связь', icon: '💬' },
            { id: 'settings', label: 'Настройки', icon: '⚙️' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                background: activeTab === tab.id ? 'rgba(139,92,246,0.2)' : 'transparent',
                border: 'none',
                color: activeTab === tab.id ? (isDarkMode ? 'white' : '#1a1a1a') : (isDarkMode ? '#6b7280' : '#6b7280'),
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Обзор */}
        {activeTab === 'overview' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
          }}>
            <div style={{
              background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
              borderRadius: '12px',
              padding: '20px',
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: '500', color: isDarkMode ? '#9ca3af' : '#6b7280', marginBottom: '16px' }}>
                📊 Статистика
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: isDarkMode ? '#6b7280' : '#6b7280' }}>Активных задач</span>
                  <span style={{ color: isDarkMode ? 'white' : '#1a1a1a' }}>{stats?.activeTasks || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: isDarkMode ? '#6b7280' : '#6b7280' }}>Выполненных задач</span>
                  <span style={{ color: '#22c55e' }}>{stats?.completedTasks || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: isDarkMode ? '#6b7280' : '#6b7280' }}>Подтверждённых email</span>
                  <span style={{ color: '#22c55e' }}>{stats?.verifiedEmails || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: isDarkMode ? '#6b7280' : '#6b7280' }}>Фокус-сессий</span>
                  <span style={{ color: isDarkMode ? 'white' : '#1a1a1a' }}>{stats?.totalFocusSessions || 0}</span>
                </div>
              </div>
            </div>
            <div style={{
              background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
              borderRadius: '12px',
              padding: '20px',
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: '500', color: isDarkMode ? '#9ca3af' : '#6b7280', marginBottom: '16px' }}>
                🖥️ Система
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: isDarkMode ? '#6b7280' : '#6b7280' }}>База данных</span>
                  <span style={{ color: '#22c55e' }}>✅ Подключена</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: isDarkMode ? '#6b7280' : '#6b7280' }}>Статус</span>
                  <span style={{ color: serverStatus === 'online' ? '#22c55e' : '#ef4444' }}>
                    {serverStatus === 'online' ? '🟢 Работает' : '🔴 Остановлен'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: isDarkMode ? '#6b7280' : '#6b7280' }}>Пользователей всего</span>
                  <span style={{ color: isDarkMode ? 'white' : '#1a1a1a' }}>{stats?.totalUsers || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: isDarkMode ? '#6b7280' : '#6b7280' }}>Заблокировано</span>
                  <span style={{ color: '#ef4444' }}>{stats?.blockedUsers || 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Пользователи */}
        {activeTab === 'users' && (
          <UsersTable
            users={users}
            isDarkMode={isDarkMode}
            onSelectUser={(user) => {
              setSelectedUser(user);
              setShowUserModal(true);
            }}
            onToggleBlock={(id, block) => toggleUserBlock(id, block, users)}
            onToggleVerify={(id, verify) => toggleEmailVerification(id, verify, users)}
            onResetPassword={resetUserPassword}
            onDeleteUser={(id) => deleteUser(id, users)}
          />
        )}

        {/* Обратная связь */}
        {activeTab === 'feedback' && (
          <FeedbackList
            feedbackList={feedbackList}
            isDarkMode={isDarkMode}
            onSelect={(item) => {
              setSelectedFeedback(item);
              setAdminResponse(item.admin_response || '');
              setFeedbackStatus(item.status || 'resolved');
              setShowFeedbackModal(true);
            }}
            onRefresh={fetchFeedback}
          />
        )}

        {/* Настройки */}
        {activeTab === 'settings' && (
          <div style={{
            background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
            borderRadius: '12px',
            padding: '20px',
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: isDarkMode ? '#9ca3af' : '#6b7280', marginBottom: '16px' }}>
              ⚙️ Системные настройки
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                borderRadius: '8px',
              }}>
                <div>
                  <div style={{ color: isDarkMode ? 'white' : '#1a1a1a', fontSize: '14px' }}>Режим обслуживания</div>
                  <div style={{ color: isDarkMode ? '#6b7280' : '#6b7280', fontSize: '12px' }}>Закрыть сайт для всех пользователей</div>
                </div>
                <button onClick={() => alert('Функция в разработке')} style={{
                  padding: '6px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'rgba(239,68,68,0.15)',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}>
                  ❌ Включить
                </button>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                borderRadius: '8px',
              }}>
                <div>
                  <div style={{ color: isDarkMode ? 'white' : '#1a1a1a', fontSize: '14px' }}>Экспорт данных</div>
                  <div style={{ color: isDarkMode ? '#6b7280' : '#6b7280', fontSize: '12px' }}>Экспортировать всю БД в JSON</div>
                </div>
                <button onClick={() => alert('Функция в разработке')} style={{
                  padding: '6px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'rgba(34,197,94,0.15)',
                  color: '#22c55e',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}>
                  📥 Экспорт
                </button>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                borderRadius: '8px',
              }}>
                <div>
                  <div style={{ color: isDarkMode ? 'white' : '#1a1a1a', fontSize: '14px' }}>Очистить кэш</div>
                  <div style={{ color: isDarkMode ? '#6b7280' : '#6b7280', fontSize: '12px' }}>Сбросить весь кэш приложения</div>
                </div>
                <button onClick={() => {
                  localStorage.clear();
                  alert('✅ Кэш очищен');
                }} style={{
                  padding: '6px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'rgba(234,179,8,0.15)',
                  color: '#eab308',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}>
                  🔄 Очистить
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Модалка пользователя */}
      <UserModal
        user={selectedUser}
        isDarkMode={isDarkMode}
        onClose={() => {
          setShowUserModal(false);
          setSelectedUser(null);
        }}
        onToggleBlock={(id, block) => toggleUserBlock(id, block, users)}
        onToggleVerify={(id, verify) => toggleEmailVerification(id, verify, users)}
        onResetPassword={resetUserPassword}
        onDeleteUser={(id) => deleteUser(id, users)}
      />

      {/* Модалка обратной связи */}
      <FeedbackModal
        feedback={selectedFeedback}
        isDarkMode={isDarkMode}
        adminResponse={adminResponse}
        feedbackStatus={feedbackStatus}
        loading={actionLoading}
        onClose={() => {
          setShowFeedbackModal(false);
          setSelectedFeedback(null);
        }}
        onResponseChange={setAdminResponse}
        onStatusChange={setFeedbackStatus}
        onSend={() => handleFeedbackResponse(
          selectedFeedback,
          adminResponse,
          feedbackStatus,
          setFeedbackList,
          feedbackList,
          setShowFeedbackModal,
          setAdminResponse
        )}
      />
    </div>
  );
}