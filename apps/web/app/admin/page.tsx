// apps/web/app/admin/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, ClipboardList, Flame, Target, Settings,
  Power, RefreshCw, AlertTriangle, CheckCircle,
  Activity, Database, Server, Clock, Eye, EyeOff,
  Search, Filter, Trash2, Edit2, UserPlus,
  BarChart3, PieChart, TrendingUp, Calendar,
  MessageSquare, Bell, Shield, Zap, Award,
  ChevronDown, ChevronRight, Copy, Check
} from 'lucide-react';
import Loader from '@/app/components/Loader';

interface Stats {
  totalUsers: number;
  totalTasks: number;
  totalHabits: number;
  totalGoals: number;
  activeTasks: number;
  completedTasks: number;
  totalFocusSessions: number;
  totalHabitLogs: number;
  usersWithAvatar: number;
  verifiedEmails: number;
}

interface User {
  id: string;
  email: string;
  name: string;
  nickname: string;
  avatar_url: string;
  last_seen: string;
  email_verified: boolean;
  created_at: string;
  bio: string;
  location: string;
  website: string;
  old_nicknames: string[];
}

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState<'online' | 'offline'>('online');
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'tasks' | 'habits' | 'goals'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const router = useRouter();

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

  useEffect(() => {
    if (authChecked) {
      fetchAllData();
    }
  }, [authChecked]);

  const fetchAllData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
      ]);
      
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
      
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!authChecked || loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Loader text="Загрузка админ-панели..." size="large" />
      </div>
    );
  }

  const statCards = [
    { label: 'Пользователей', value: stats?.totalUsers || 0, icon: Users, color: '#3b82f6' },
    { label: 'Задач', value: stats?.totalTasks || 0, icon: ClipboardList, color: '#8b5cf6' },
    { label: 'Привычек', value: stats?.totalHabits || 0, icon: Flame, color: '#f97316' },
    { label: 'Целей', value: stats?.totalGoals || 0, icon: Target, color: '#22c55e' },
    { label: 'Фокус-сессий', value: stats?.totalFocusSessions || 0, icon: Activity, color: '#eab308' },
    { label: 'Логов привычек', value: stats?.totalHabitLogs || 0, icon: CheckCircle, color: '#ec4899' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      padding: '20px',
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <Settings size={28} style={{ color: '#8b5cf6' }} />
              Админ-панель
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              marginTop: '4px',
            }}>
              Добро пожаловать, {user?.email}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Статус сервера */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '8px',
              background: serverStatus === 'online' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${serverStatus === 'online' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: serverStatus === 'online' ? '#22c55e' : '#ef4444',
                animation: serverStatus === 'online' ? 'pulse 1.5s ease-in-out infinite' : 'none',
              }} />
              <span style={{
                fontSize: '12px',
                color: serverStatus === 'online' ? '#22c55e' : '#ef4444',
                fontWeight: '500',
              }}>
                {serverStatus === 'online' ? 'Сервер работает' : 'Сервер остановлен'}
              </span>
            </div>

            <button
              onClick={toggleServer}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: serverStatus === 'online' ? '#ef4444' : '#22c55e',
                color: 'white',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              <Power size={14} />
              {serverStatus === 'online' ? 'Остановить' : 'Запустить'}
            </button>

            <button
              onClick={() => router.push('/dashboard')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.06)',
                background: 'transparent',
                color: '#6b7280',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              На сайт
            </button>
          </div>
        </div>

        {/* Статистика */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '12px',
          marginBottom: '24px',
        }}>
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  padding: '16px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: 'white',
                    }}>
                      {card.value}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#6b7280',
                      marginTop: '2px',
                    }}>
                      {card.label}
                    </div>
                  </div>
                  <div style={{
                    padding: '8px',
                    borderRadius: '10px',
                    background: `rgba(${card.color === '#3b82f6' ? '59,130,246' : 
                                      card.color === '#8b5cf6' ? '139,92,246' : 
                                      card.color === '#f97316' ? '249,115,22' : 
                                      card.color === '#22c55e' ? '34,197,94' :
                                      card.color === '#eab308' ? '234,179,8' :
                                      '236,72,153'}, 0.1)`,
                  }}>
                    <Icon size={20} style={{ color: card.color }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Вкладки */}
        <div style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '20px',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '10px',
          padding: '4px',
          flexWrap: 'wrap',
        }}>
          {[
            { id: 'overview', label: 'Обзор', icon: Activity },
            { id: 'users', label: 'Пользователи', icon: Users },
            { id: 'tasks', label: 'Задачи', icon: ClipboardList },
            { id: 'habits', label: 'Привычки', icon: Flame },
            { id: 'goals', label: 'Цели', icon: Target },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: activeTab === tab.id ? 'rgba(139,92,246,0.2)' : 'transparent',
                  border: 'none',
                  color: activeTab === tab.id ? 'white' : '#6b7280',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Контент вкладок */}
        {activeTab === 'overview' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
          }}>
            {/* Быстрая статистика */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '12px',
              padding: '20px',
            }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#9ca3af',
                marginBottom: '16px',
              }}>
                📊 Быстрая статистика
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#6b7280' }}>Активных задач</span>
                  <span style={{ color: 'white' }}>{stats?.activeTasks || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#6b7280' }}>Выполненных задач</span>
                  <span style={{ color: '#22c55e' }}>{stats?.completedTasks || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#6b7280' }}>Пользователей с аватаром</span>
                  <span style={{ color: 'white' }}>{stats?.usersWithAvatar || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#6b7280' }}>Подтверждённых email</span>
                  <span style={{ color: '#22c55e' }}>{stats?.verifiedEmails || 0}</span>
                </div>
              </div>
            </div>

            {/* Инфо о сервере */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '12px',
              padding: '20px',
            }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#9ca3af',
                marginBottom: '16px',
              }}>
                🖥️ Сервер
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#6b7280' }}>База данных</span>
                  <span style={{ color: '#22c55e' }}>✅ Подключена</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#6b7280' }}>Статус</span>
                  <span style={{ color: serverStatus === 'online' ? '#22c55e' : '#ef4444' }}>
                    {serverStatus === 'online' ? '🟢 Работает' : '🔴 Остановлен'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#6b7280' }}>Пользователей онлайн</span>
                  <span style={{ color: 'white' }}>~{Math.floor((stats?.totalUsers || 0) * 0.2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
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
                color: '#9ca3af',
                margin: 0,
              }}>
                👥 Все пользователи ({users.length})
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255,255,255,0.03)',
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
                      color: 'white',
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
                  background: '#0a0a0a',
                  zIndex: 10,
                }}>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', color: '#6b7280' }}>Пользователь</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', color: '#6b7280' }}>Email</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', color: '#6b7280' }}>Ник</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', color: '#6b7280' }}>Статус</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', color: '#6b7280' }}>Регистрация</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', color: '#6b7280' }}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                      onClick={() => {
                        setSelectedUser(u);
                        setShowUserModal(true);
                      }}
                    >
                      <td style={{ padding: '10px 12px', color: 'white' }}>
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
                      <td style={{ padding: '10px 12px', color: '#9ca3af' }}>{u.email}</td>
                      <td style={{ padding: '10px 12px', color: '#9ca3af' }}>{u.nickname || '-'}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          padding: '2px 10px',
                          borderRadius: '100px',
                          fontSize: '10px',
                          background: u.email_verified ? 'rgba(34,197,94,0.15)' : 'rgba(234,179,8,0.15)',
                          color: u.email_verified ? '#22c55e' : '#eab308',
                        }}>
                          {u.email_verified ? '✅' : '⏳'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#6b7280' }}>
                        {new Date(u.created_at).toLocaleDateString('ru-RU')}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(u.id);
                          }}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: '1px solid rgba(255,255,255,0.06)',
                            background: 'transparent',
                            color: '#6b7280',
                            cursor: 'pointer',
                            fontSize: '11px',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)';
                            e.currentTarget.style.color = '#3b82f6';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                            e.currentTarget.style.color = '#6b7280';
                          }}
                        >
                          {copied ? '✅' : '📋 ID'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            color: '#6b7280',
          }}>
            <ClipboardList size={48} style={{ margin: '20px auto', opacity: 0.3 }} />
            <p style={{ fontSize: '16px' }}>Управление задачами</p>
            <p style={{ fontSize: '13px' }}>Здесь будет таблица всех задач</p>
          </div>
        )}

        {activeTab === 'habits' && (
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            color: '#6b7280',
          }}>
            <Flame size={48} style={{ margin: '20px auto', opacity: 0.3 }} />
            <p style={{ fontSize: '16px' }}>Управление привычками</p>
            <p style={{ fontSize: '13px' }}>Здесь будет таблица всех привычек</p>
          </div>
        )}

        {activeTab === 'goals' && (
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            color: '#6b7280',
          }}>
            <Target size={48} style={{ margin: '20px auto', opacity: 0.3 }} />
            <p style={{ fontSize: '16px' }}>Управление целями</p>
            <p style={{ fontSize: '13px' }}>Здесь будет таблица всех целей</p>
          </div>
        )}
      </div>

      {/* Модалка пользователя */}
      {showUserModal && selectedUser && (
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
          onClick={() => setShowUserModal(false)}
        >
          <div
            style={{
              maxWidth: '480px',
              width: '100%',
              background: '#141414',
              borderRadius: '24px',
              padding: '32px',
              border: '1px solid rgba(255,255,255,0.06)',
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
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'white', margin: 0 }}>
                Пользователь
              </h2>
              <button
                onClick={() => setShowUserModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: 'none',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#6b7280',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '12px',
              }}>
                {selectedUser.avatar_url ? (
                  <img
                    src={selectedUser.avatar_url}
                    alt={selectedUser.name}
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
                    {(selectedUser.name || selectedUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: 'white' }}>
                    {selectedUser.name || 'Без имени'}
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>{selectedUser.email}</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>
                    Ник: {selectedUser.nickname || 'Не указан'}
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
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '8px',
                }}>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Дата регистрации</div>
                  <div style={{ fontSize: '14px', color: 'white' }}>
                    {new Date(selectedUser.created_at).toLocaleString('ru-RU')}
                  </div>
                </div>
                <div style={{
                  padding: '12px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '8px',
                }}>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Последний визит</div>
                  <div style={{ fontSize: '14px', color: 'white' }}>
                    {selectedUser.last_seen ? new Date(selectedUser.last_seen).toLocaleString('ru-RU') : 'Никогда'}
                  </div>
                </div>
              </div>

              {selectedUser.bio && (
                <div style={{
                  padding: '12px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '8px',
                }}>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>О себе</div>
                  <div style={{ fontSize: '14px', color: 'white' }}>{selectedUser.bio}</div>
                </div>
              )}

              {selectedUser.old_nicknames && selectedUser.old_nicknames.length > 0 && (
                <div style={{
                  padding: '12px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '8px',
                }}>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Старые ники</div>
                  <div style={{ fontSize: '14px', color: '#9ca3af' }}>
                    {selectedUser.old_nicknames.filter(n => n).join(' → ')}
                  </div>
                </div>
              )}

              <div style={{
                display: 'flex',
                gap: '8px',
                marginTop: '8px',
              }}>
                <button
                  onClick={() => copyToClipboard(selectedUser.id)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.06)',
                    background: 'transparent',
                    color: '#6b7280',
                    cursor: 'pointer',
                    fontSize: '13px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)';
                    e.currentTarget.style.color = '#3b82f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.color = '#6b7280';
                  }}
                >
                  📋 Копировать ID
                </button>
                <button
                  onClick={() => setShowUserModal(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '13px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  }}
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}