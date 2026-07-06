// apps/web/app/profile/page.tsx

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User as UserIcon, Mail, Calendar, CheckCircle, Flame, 
  LogOut, Settings, Moon, Sun, Bell, BellOff,
  Download, ChevronRight, Sparkles, Camera, X,
  Home, CalendarDays, BarChart3, Target, Timer,
  Pin, PinOff, Menu, Globe, MapPin, Link2, Clock,
  Shield, Info, Award, Users, Zap, Edit2, FileText
} from 'lucide-react';
import Loader from '@/app/components/Loader';
import { Sidebar } from '@/app/components/Sidebar';
import { UserAvatar } from '@/app/components/UserAvatar';
import { useAuth } from '@/app/hooks/useAuth';
import { useTheme } from '@/app/hooks/useTheme';
import { useTasks } from '@/app/hooks/useTasks';
import { useHabits } from '@/app/hooks/useHabits';
import { User as UserType } from '@/types';

// ========== МОДАЛЬНОЕ ОКНО ==========
function Modal({ isOpen, onClose, title, children }: any) {
  if (!isOpen) return null;

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
        zIndex: 9999,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          maxWidth: '560px',
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto',
          background: '#141414',
          borderRadius: '24px',
          padding: '32px',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.9)',
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
            color: 'white',
            margin: 0,
          }}>
            {title}
          </h2>
          <button
            onClick={onClose}
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
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, authChecked, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const { tasks } = useTasks(user?.id || null);
  const { habits } = useHabits(user?.id || null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserType | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editNickname, setEditNickname] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Модалки
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  
  // Подтверждение почты
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Загружаем профиль
  useEffect(() => {
    if (authChecked && user) {
      setProfile(user);
      setEditNickname(user.nickname || user.name || '');
      setEditBio(user.bio || '');
      setEditLocation(user.location || '');
      setEditWebsite(user.website || '');
      setLoading(false);
    }
  }, [authChecked, user]);

  // Уведомления
  useEffect(() => {
    const saved = localStorage.getItem('notifications_enabled');
    if (saved !== null) {
      setNotificationsEnabled(saved === 'true');
    }
  }, []);

  // Боковая панель
  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!isSidebarPinned) setIsSidebarOpen(true);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!isSidebarPinned) {
      timeoutRef.current = setTimeout(() => setIsSidebarOpen(false), 300);
    }
  };

  const togglePin = () => {
    setIsSidebarPinned(!isSidebarPinned);
    if (!isSidebarPinned) setIsSidebarOpen(true);
  };

  const handleNavigate = (view: string) => {
    if (view === 'profile') router.push('/profile');
    else if (view === 'goals') router.push('/goals');
    else if (view === 'focus') router.push('/focus');
    else if (view === 'calendar') router.push('/dashboard?view=calendar');
    else if (view === 'analytics') router.push('/dashboard?view=analytics');
    else router.push('/dashboard');
  };

  // Обновление профиля
  const updateProfile = async () => {
    try {
      const res = await fetch('/api/user/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: editNickname,
          bio: editBio,
          location: editLocation,
          website: editWebsite,
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setIsEditing(false);
      }
    } catch (error) {
      alert('Ошибка обновления профиля');
    }
  };

  // Загрузка аватара
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setProfile((prev: UserType | null) => prev ? { ...prev, avatar_url: data.avatar_url } : null);
      } else {
        const error = await res.json();
        alert(error.error || 'Ошибка загрузки аватара');
      }
    } catch (error) {
      alert('Ошибка загрузки аватара');
    }
    setIsUploading(false);
  };

  // ========== ФУНКЦИИ ПОДТВЕРЖДЕНИЯ ПОЧТЫ ==========
  
  // Отправка кода
  const sendVerificationCode = async (email?: string) => {
    setIsSendingCode(true);
    setVerificationStatus({ type: null, message: '' });
    
    try {
      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email || profile?.email }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setVerificationStatus({ type: 'success', message: '✅ Код отправлен на почту!' });
      } else {
        setVerificationStatus({ type: 'error', message: data.error || 'Ошибка отправки' });
      }
    } catch (error) {
      setVerificationStatus({ type: 'error', message: 'Ошибка соединения' });
    }
    setIsSendingCode(false);
  };

  // Подтверждение кода
  const verifyEmail = async () => {
    if (verificationCode.length !== 5) {
      setVerificationStatus({ type: 'error', message: 'Введите 5-значный код' });
      return;
    }
    
    setIsVerifying(true);
    setVerificationStatus({ type: null, message: '' });
    
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setVerificationStatus({ type: 'success', message: '✅ Email подтверждён!' });
        setProfile(data.user);
        setTimeout(() => {
          setShowVerificationModal(false);
          setVerificationCode('');
          setVerificationStatus({ type: null, message: '' });
        }, 1500);
      } else {
        setVerificationStatus({ type: 'error', message: data.error || 'Неверный код' });
      }
    } catch (error) {
      setVerificationStatus({ type: 'error', message: 'Ошибка соединения' });
    }
    setIsVerifying(false);
  };

  // Смена почты
  const changeEmail = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      setVerificationStatus({ type: 'error', message: 'Введите корректный email' });
      return;
    }
    
    setShowChangeEmailModal(false);
    setShowVerificationModal(true);
    await sendVerificationCode(newEmail);
  };

  // Статистика
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const totalHabits = habits.length;
  const totalStreak = habits.reduce((acc, h) => acc + (h.streak || 0), 0);
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    document.documentElement.style.background = newMode ? '#0a0a0a' : '#f5f5f5';
    document.body.style.background = newMode ? '#0a0a0a' : '#f5f5f5';
    window.location.reload();
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
        <Loader text="Загрузка профиля..." size="large" />
      </div>
    );
  }

  const displayName = profile?.nickname || profile?.name || profile?.email || 'Пользователь';
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div style={{
      minHeight: '100vh',
      background: isDarkMode ? '#0a0a0a' : '#f5f5f5',
      display: 'flex',
      position: 'relative',
      transition: 'background 0.3s ease',
    }}>
      {/* Боковая панель */}
      <div
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          zIndex: 1000,
        }}
      >
        <Sidebar
          isOpen={isSidebarOpen}
          isPinned={isSidebarPinned}
          onTogglePin={togglePin}
          onClose={() => setIsSidebarOpen(false)}
          isDarkMode={isDarkMode}
          activeView="profile"
          onNavigate={handleNavigate}
          onLogout={logout}
        />
      </div>

      {/* Основной контент */}
      <div style={{
        flex: 1,
        padding: '24px',
        marginLeft: isSidebarOpen ? '240px' : '0px',
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        maxWidth: isSidebarOpen ? 'calc(100% - 240px)' : '100%',
      }}>
        {/* Верхняя панель */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          marginTop: isSidebarOpen ? '0' : '48px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                style={{
                  padding: '8px',
                  background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                  borderRadius: '8px',
                  color: '#6b7280',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Menu size={20} />
              </button>
            )}
          </div>

          {/* UserAvatar НЕ показываем на странице профиля */}
          <span style={{
            fontSize: '13px',
            color: isDarkMode ? '#6b7280' : '#6b7280',
            fontFamily: 'monospace',
          }}>
            v0.6 · ALPHA
          </span>
        </div>

        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          {/* Аватар и имя */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '32px',
            padding: '24px',
            background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.8)',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
            borderRadius: '16px',
            position: 'relative',
            boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            {/* Аватар с возможностью загрузки */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={displayName}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: `2px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  }}
                />
              ) : (
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  fontWeight: '600',
                  color: 'white',
                  border: `2px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                }}>
                  {initials}
                </div>
              )}
              
              {/* Кнопка загрузки аватара */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  padding: '6px',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  border: 'none',
                  borderRadius: '50%',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isUploading ? (
                  <Loader size="small" text="" />
                ) : (
                  <Camera size={16} />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                style={{ display: 'none' }}
              />
            </div>

            <div style={{ flex: 1 }}>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="text"
                    value={editNickname}
                    onChange={(e) => setEditNickname(e.target.value)}
                    placeholder="Ваш никнейм"
                    style={{
                      padding: '6px 12px',
                      background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                      borderRadius: '8px',
                      color: isDarkMode ? 'white' : '#1a1a1a',
                      fontSize: '16px',
                      outline: 'none',
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={updateProfile}
                      style={{
                        padding: '6px 16px',
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        border: 'none',
                        borderRadius: '6px',
                        color: 'white',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      Сохранить
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditNickname(profile?.nickname || profile?.name || '');
                      }}
                      style={{
                        padding: '6px 16px',
                        background: 'transparent',
                        border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                        borderRadius: '6px',
                        color: '#6b7280',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: isDarkMode ? 'white' : '#1a1a1a',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    {displayName}
                    <button
                      onClick={() => setIsEditing(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#6b7280',
                        padding: '2px',
                      }}
                    >
                      <Edit2 size={14} />
                    </button>
                  </h1>
                  <p style={{
                    fontSize: '14px',
                    color: isDarkMode ? '#6b7280' : '#6b7280',
                    margin: '2px 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    <Mail size={14} />
                    {profile?.email}
                    {profile?.email_verified ? (
                      <span style={{ color: '#22c55e', fontSize: '12px' }}>✅</span>
                    ) : (
                      <span style={{ color: '#eab308', fontSize: '12px' }}>⏳</span>
                    )}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Кнопка "Информация обо мне" */}
          <button
            onClick={() => setShowInfoModal(true)}
            style={{
              width: '100%',
              padding: '12px 16px',
              marginBottom: '24px',
              background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.8)',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
              borderRadius: '12px',
              color: isDarkMode ? '#d1d5db' : '#4b5563',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.8)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Info size={18} style={{ color: '#3b82f6' }} />
              <span>Информация обо мне</span>
            </div>
            <ChevronRight size={16} style={{ color: '#6b7280' }} />
          </button>

          {/* Статистика */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            marginBottom: '24px',
          }}>
            <div style={{
              background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.8)',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>
                {totalTasks}
              </div>
              <div style={{ fontSize: '11px', color: isDarkMode ? '#6b7280' : '#6b7280' }}>Задач</div>
            </div>
            <div style={{
              background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.8)',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#22c55e' }}>
                {completedTasks}
              </div>
              <div style={{ fontSize: '11px', color: isDarkMode ? '#6b7280' : '#6b7280' }}>Выполнено</div>
            </div>
            <div style={{
              background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.8)',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#f97316' }}>
                {totalHabits}
              </div>
              <div style={{ fontSize: '11px', color: isDarkMode ? '#6b7280' : '#6b7280' }}>Привычек</div>
            </div>
            <div style={{
              background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.8)',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#eab308' }}>
                {totalStreak}
              </div>
              <div style={{ fontSize: '11px', color: isDarkMode ? '#6b7280' : '#6b7280' }}>Серия 🔥</div>
            </div>
          </div>

          {/* Прогресс */}
          <div style={{
            background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.8)',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
            boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
            }}>
              <span style={{ fontSize: '14px', color: isDarkMode ? '#d1d5db' : '#4b5563' }}>Общий прогресс</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: isDarkMode ? 'white' : '#1a1a1a' }}>
                {progress}%
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '6px',
              background: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
              borderRadius: '100px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                borderRadius: '100px',
                transition: 'width 0.5s ease',
              }} />
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '4px',
              fontSize: '10px',
              color: isDarkMode ? '#4b5563' : '#9ca3af',
            }}>
              <span>✅ {completedTasks} выполнено</span>
              <span>📋 {totalTasks - completedTasks} осталось</span>
            </div>
          </div>

          {/* Настройки */}
          <div style={{
            background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.8)',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
            borderRadius: '12px',
            padding: '4px',
            boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <div style={{
              padding: '12px 16px',
              borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
              fontSize: '13px',
              fontWeight: '500',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              Настройки
            </div>

            {/* Тема */}
            <div style={{
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                {isDarkMode ? (
                  <Moon size={18} style={{ color: '#3b82f6' }} />
                ) : (
                  <Sun size={18} style={{ color: '#eab308' }} />
                )}
                <span style={{ color: isDarkMode ? '#d1d5db' : '#4b5563', fontSize: '14px' }}>Тёмная тема</span>
              </div>
              <button
                onClick={toggleTheme}
                style={{
                  padding: '4px 12px',
                  borderRadius: '100px',
                  border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                  background: isDarkMode ? 'rgba(59,130,246,0.15)' : 'rgba(0,0,0,0.05)',
                  color: isDarkMode ? '#3b82f6' : '#6b7280',
                  fontSize: '11px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {isDarkMode ? 'Вкл' : 'Выкл'}
              </button>
            </div>

            {/* Уведомления */}
            <div style={{
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                {notificationsEnabled ? (
                  <Bell size={18} style={{ color: '#3b82f6' }} />
                ) : (
                  <BellOff size={18} style={{ color: '#6b7280' }} />
                )}
                <span style={{ color: isDarkMode ? '#d1d5db' : '#4b5563', fontSize: '14px' }}>Уведомления</span>
              </div>
              <button
                onClick={() => {
                  const newState = !notificationsEnabled;
                  setNotificationsEnabled(newState);
                  localStorage.setItem('notifications_enabled', String(newState));
                }}
                style={{
                  padding: '4px 12px',
                  borderRadius: '100px',
                  border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                  background: notificationsEnabled ? 'rgba(59,130,246,0.15)' : 'rgba(0,0,0,0.05)',
                  color: notificationsEnabled ? '#3b82f6' : '#6b7280',
                  fontSize: '11px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {notificationsEnabled ? 'Вкл' : 'Выкл'}
              </button>
            </div>

            {/* Экспорт данных */}
            <div style={{
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            onClick={() => {
              const data = { tasks, habits, profile, exportedAt: new Date().toISOString() };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `lifeos_export_${new Date().toISOString().split('T')[0]}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <Download size={18} style={{ color: '#6b7280' }} />
                <span style={{ color: isDarkMode ? '#d1d5db' : '#4b5563', fontSize: '14px' }}>Экспорт данных</span>
              </div>
              <ChevronRight size={16} style={{ color: '#6b7280' }} />
            </div>

            {/* Политика конфиденциальности */}
            <div style={{
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            onClick={() => setShowPrivacyModal(true)}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <Shield size={18} style={{ color: '#6b7280' }} />
                <span style={{ color: isDarkMode ? '#d1d5db' : '#4b5563', fontSize: '14px' }}>Политика конфиденциальности</span>
              </div>
              <ChevronRight size={16} style={{ color: '#6b7280' }} />
            </div>

            {/* Пользовательское соглашение */}
            <div style={{
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            onClick={() => setShowTermsModal(true)}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <FileText size={18} style={{ color: '#6b7280' }} />
                <span style={{ color: isDarkMode ? '#d1d5db' : '#4b5563', fontSize: '14px' }}>Пользовательское соглашение</span>
              </div>
              <ChevronRight size={16} style={{ color: '#6b7280' }} />
            </div>

            {/* Выйти */}
            <div
              style={{
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s',
                borderRadius: '0 0 12px 12px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              onClick={logout}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <LogOut size={18} style={{ color: '#ef4444' }} />
                <span style={{ color: '#ef4444', fontSize: '14px' }}>Выйти из аккаунта</span>
              </div>
              <ChevronRight size={16} style={{ color: '#ef4444' }} />
            </div>
          </div>

          {/* Версия */}
          <div style={{
            marginTop: '32px',
            textAlign: 'center',
            fontSize: '10px',
            color: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
            fontFamily: 'monospace',
            letterSpacing: '2px',
          }}>
            v0.6 · ALPHA
          </div>
        </div>
      </div>

      {/* ========== МОДАЛКИ ========== */}

      {/* Информация обо мне */}
      <Modal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} title="Информация обо мне">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.04)',
          }}>
            <Calendar size={18} style={{ color: '#3b82f6' }} />
            <div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Дата регистрации</div>
              <div style={{ fontSize: '14px', color: 'white' }}>
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }) : 'Неизвестно'}
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.04)',
          }}>
            <Clock size={18} style={{ color: '#f97316' }} />
            <div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Последний визит</div>
              <div style={{ fontSize: '14px', color: 'white' }}>
                {profile?.last_seen ? new Date(profile.last_seen).toLocaleString('ru-RU') : 'Только что'}
              </div>
            </div>
          </div>

          {profile?.old_nicknames && profile.old_nicknames.filter((n: string) => n).length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.04)',
            }}>
              <Users size={18} style={{ color: '#8b5cf6' }} />
              <div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>Старые ники</div>
                <div style={{ fontSize: '14px', color: 'white' }}>
                  {profile.old_nicknames.filter((n: string) => n).join(' → ')}
                </div>
              </div>
            </div>
          )}

          {profile?.bio && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.04)',
            }}>
              <Zap size={18} style={{ color: '#eab308' }} />
              <div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>О себе</div>
                <div style={{ fontSize: '14px', color: 'white' }}>{profile.bio}</div>
              </div>
            </div>
          )}

          {profile?.location && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.04)',
            }}>
              <MapPin size={18} style={{ color: '#22c55e' }} />
              <div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>Местоположение</div>
                <div style={{ fontSize: '14px', color: 'white' }}>{profile.location}</div>
              </div>
            </div>
          )}

          {profile?.website && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.04)',
            }}>
              <Link2 size={18} style={{ color: '#3b82f6' }} />
              <div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>Веб-сайт</div>
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '14px', color: '#3b82f6', textDecoration: 'none' }}
                >
                  {profile.website}
                </a>
              </div>
            </div>
          )}

          {/* СТАТУС EMAIL С КНОПКОЙ ПОДТВЕРЖДЕНИЯ */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '12px 16px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle size={18} style={{ color: profile?.email_verified ? '#22c55e' : '#eab308' }} />
              <div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>Статус email</div>
                <div style={{ fontSize: '14px', color: profile?.email_verified ? '#22c55e' : '#eab308' }}>
                  {profile?.email_verified ? 'Подтверждён ✅' : 'Не подтверждён ⚠️'}
                </div>
              </div>
            </div>
            
            {!profile?.email_verified && (
              <button
                onClick={() => {
                  setShowVerificationModal(true);
                  setVerificationStatus({ type: null, message: '' });
                  setVerificationCode('');
                  setTimeout(() => sendVerificationCode(), 500);
                }}
                style={{
                  padding: '6px 14px',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Подтвердить
              </button>
            )}
          </div>
        </div>
      </Modal>

      {/* Политика конфиденциальности */}
      <Modal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} title="Политика конфиденциальности">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: '#d1d5db', fontSize: '14px', lineHeight: '1.6' }}>
          <p><strong style={{ color: 'white' }}>1. Общие положения</strong></p>
          <p>Настоящая Политика конфиденциальности (далее — Политика) действует в отношении всей информации, которую LifeOS (далее — Сервис) может получить о пользователе во время использования Сервиса.</p>
          
          <p><strong style={{ color: 'white' }}>2. Какие данные мы собираем</strong></p>
          <p>2.1. Данные, которые вы предоставляете добровольно:<br/>
          — Email адрес<br/>
          — Имя и никнейм<br/>
          — Биография и информация о себе<br/>
          — Задачи, привычки, цели и другие данные, создаваемые вами</p>
          <p>2.2. Данные, собираемые автоматически:<br/>
          — Дата и время посещения<br/>
          — IP-адрес (анонимно)<br/>
          — Тип устройства и браузера</p>

          <p><strong style={{ color: 'white' }}>3. Как мы используем данные</strong></p>
          <p>3.1. Для предоставления функциональности Сервиса<br/>
          3.2. Для улучшения пользовательского опыта<br/>
          3.3. Для аналитики и статистики (в обезличенном виде)</p>

          <p><strong style={{ color: 'white' }}>4. Защита данных</strong></p>
          <p>4.1. Все данные хранятся в зашифрованном виде<br/>
          4.2. Доступ к данным ограничен<br/>
          4.3. Регулярное обновление систем безопасности</p>

          <p><strong style={{ color: 'white' }}>5. Права пользователя</strong></p>
          <p>5.1. Вы можете экспортировать все свои данные<br/>
          5.2. Вы можете удалить все свои данные<br/>
          5.3. Вы можете отозвать согласие на обработку данных</p>

          <p><strong style={{ color: 'white' }}>6. Контакты</strong></p>
          <p>По вопросам конфиденциальности: privacy@lifeos.app</p>

          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>Версия 1.0 · Актуально с 1 января 2024</p>
        </div>
      </Modal>

      {/* Пользовательское соглашение */}
      <Modal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} title="Пользовательское соглашение">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: '#d1d5db', fontSize: '14px', lineHeight: '1.6' }}>
          <p><strong style={{ color: 'white' }}>1. Термины и определения</strong></p>
          <p>1.1. LifeOS (Сервис) — цифровая операционная система для управления жизнью.<br/>
          1.2. Пользователь — любое лицо, использующее Сервис.</p>

          <p><strong style={{ color: 'white' }}>2. Предмет соглашения</strong></p>
          <p>2.1. Использование функциональности LifeOS<br/>
          2.2. Предоставление доступа к данным пользователя<br/>
          2.3. Обеспечение безопасности и конфиденциальности</p>

          <p><strong style={{ color: 'white' }}>3. Права и обязанности пользователя</strong></p>
          <p>3.1. Использовать Сервис только в законных целях<br/>
          3.2. Не нарушать работу Сервиса<br/>
          3.3. Не передавать доступ третьим лицам<br/>
          3.4. Соблюдать авторские права</p>

          <p><strong style={{ color: 'white' }}>4. Ответственность</strong></p>
          <p>4.1. Сервис предоставляется "как есть"<br/>
          4.2. Мы не несём ответственности за потерю данных<br/>
          4.3. Мы не несём ответственности за действия пользователей</p>

          <p><strong style={{ color: 'white' }}>5. Изменения</strong></p>
          <p>5.1. Мы оставляем право изменять условия Соглашения<br/>
          5.2. Уведомление об изменениях публикуется в Сервисе</p>

          <p><strong style={{ color: 'white' }}>6. Применимое право</strong></p>
          <p>Настоящее Соглашение регулируется законодательством страны регистрации Сервиса.</p>

          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>Версия 1.0 · Актуально с 1 января 2024</p>
        </div>
      </Modal>

      {/* ========== МОДАЛКА ПОДТВЕРЖДЕНИЯ ПОЧТЫ ========== */}
      <Modal isOpen={showVerificationModal} onClose={() => {
        setShowVerificationModal(false);
        setVerificationCode('');
        setVerificationStatus({ type: null, message: '' });
      }} title="Подтверждение почты">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>
            Введите 5-значный код, который был отправлен на <strong style={{ color: 'white' }}>{profile?.email}</strong>
          </p>
          
          <input
            type="text"
            maxLength={5}
            placeholder="Введите код"
            value={verificationCode}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              if (val.length <= 5) setVerificationCode(val);
            }}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${verificationStatus.type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: '10px',
              color: 'white',
              fontSize: '20px',
              textAlign: 'center',
              letterSpacing: '8px',
              outline: 'none',
              fontFamily: 'monospace',
            }}
            autoFocus
          />
          
          {verificationStatus.message && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: verificationStatus.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${verificationStatus.type === 'success' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
              color: verificationStatus.type === 'success' ? '#22c55e' : '#ef4444',
              fontSize: '13px',
              textAlign: 'center',
            }}>
              {verificationStatus.message}
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => {
                setShowVerificationModal(false);
                setShowChangeEmailModal(true);
                setVerificationStatus({ type: null, message: '' });
              }}
              style={{
                flex: 1,
                padding: '10px',
                background: 'transparent',
                border: `1px solid rgba(255,255,255,0.06)`,
                borderRadius: '10px',
                color: '#6b7280',
                fontSize: '14px',
                cursor: 'pointer',
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
              Сменить почту
            </button>
            
            <button
              onClick={verifyEmail}
              disabled={isVerifying || verificationCode.length !== 5}
              style={{
                flex: 1,
                padding: '10px',
                background: isVerifying || verificationCode.length !== 5
                  ? '#374151'
                  : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isVerifying || verificationCode.length !== 5 ? 'not-allowed' : 'pointer',
                opacity: isVerifying || verificationCode.length !== 5 ? 0.5 : 1,
                transition: 'all 0.2s',
              }}
            >
              {isVerifying ? 'Проверка...' : 'Подтвердить'}
            </button>
          </div>
          
          <button
            onClick={() => {
              sendVerificationCode();
              setVerificationStatus({ type: 'success', message: 'Новый код отправлен!' });
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#3b82f6',
              fontSize: '12px',
              cursor: 'pointer',
              textDecoration: 'underline',
              transition: 'all 0.2s',
            }}
          >
            Отправить код повторно
          </button>
        </div>
      </Modal>

      {/* ========== МОДАЛКА СМЕНЫ ПОЧТЫ ========== */}
      <Modal isOpen={showChangeEmailModal} onClose={() => {
        setShowChangeEmailModal(false);
        setNewEmail('');
        setVerificationStatus({ type: null, message: '' });
      }} title="Смена почты">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>
            Введите новый email. На него будет отправлен код подтверждения.
          </p>
          
          <input
            type="email"
            placeholder="Новый email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              color: 'white',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
            }}
            autoFocus
          />
          
          {verificationStatus.message && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: verificationStatus.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${verificationStatus.type === 'success' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
              color: verificationStatus.type === 'success' ? '#22c55e' : '#ef4444',
              fontSize: '13px',
              textAlign: 'center',
            }}>
              {verificationStatus.message}
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => {
                setShowChangeEmailModal(false);
                setNewEmail('');
                setVerificationStatus({ type: null, message: '' });
              }}
              style={{
                flex: 1,
                padding: '10px',
                background: 'transparent',
                border: `1px solid rgba(255,255,255,0.06)`,
                borderRadius: '10px',
                color: '#6b7280',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Отмена
            </button>
            
            <button
              onClick={changeEmail}
              disabled={!newEmail || !newEmail.includes('@') || isSendingCode}
              style={{
                flex: 1,
                padding: '10px',
                background: !newEmail || !newEmail.includes('@') || isSendingCode
                  ? '#374151'
                  : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: !newEmail || !newEmail.includes('@') || isSendingCode ? 'not-allowed' : 'pointer',
                opacity: !newEmail || !newEmail.includes('@') || isSendingCode ? 0.5 : 1,
                transition: 'all 0.2s',
              }}
            >
              {isSendingCode ? 'Отправка...' : 'Отправить код'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}