'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Play, Pause, RotateCcw, X,
  ChevronUp, ChevronDown,
  Home, CalendarDays, BarChart3, Target, User,
  Timer, Pin, PinOff, LogOut, Menu
} from 'lucide-react';
import Loader from '@/app/components/Loader';

type SessionType = 'pomodoro' | 'deep_work' | 'free' | 'custom';
type SessionStatus = 'idle' | 'active' | 'paused' | 'completed';

const EMOJI_LIST = [
  '🚀', '💪', '🎯', '📚', '🎨', '💡', '🏃', '🧘', '🎵', '📝',
  '🔥', '⭐', '🌟', '💎', '🌈', '🦋', '🌊', '🌅', '🎭', '🎪',
  '🏆', '🥇', '💻', '📱', '🎮', '🎸', '🎹', '📷', '🎬', '✍️',
  '🧪', '🔬', '🛠️', '⚙️', '📊', '📈', '💼', '🏢', '🌱', '🌿'
];

export default function FocusPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data);
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
  }, [router]);

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setIsDarkMode(savedTheme !== 'light');
  }, []);

  const [sessionType, setSessionType] = useState<SessionType>('pomodoro');
  const [status, setStatus] = useState<SessionStatus>('idle');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('⏱️');
  const [sessions, setSessions] = useState<any[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(30);
  const [customSeconds, setCustomSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const presets = {
    pomodoro: { label: 'FOCUS', duration: 25 * 60, icon: '👁️', color: '#ef4444' },
    deep_work: { label: 'WORK', duration: 50 * 60, icon: '💼', color: '#8b5cf6' },
    free: { label: 'LIFE', duration: 60 * 60, icon: '🧠', color: '#3b82f6' },
    custom: { label: 'Свой', duration: customMinutes * 60 + customSeconds, icon: '⚡', color: '#22c55e' },
  };

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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (_) {}
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  };

  const loadSessions = async () => {
    try {
      const res = await fetch('/api/focus-sessions');
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки сессий:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authChecked || !user) return;
    loadSessions();
  }, [authChecked, user]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (status === 'active') {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval!);
            setStatus('completed');
            try {
              const audio = new Audio('/notification.mp3');
              audio.play();
            } catch {}
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (totalSeconds === 0) return 0;
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  };

  const getCurrentPreset = () => {
    if (sessionType === 'custom') {
      const total = customMinutes * 60 + customSeconds;
      return { ...presets.custom, duration: total > 0 ? total : 60 };
    }
    return presets[sessionType];
  };

  const handleStart = async () => {
    const preset = getCurrentPreset();
    if (timeLeft <= 0) {
      setTimeLeft(preset.duration);
      setTotalSeconds(preset.duration);
      return;
    }

    setIsSubmitting(true);
    setStatus('active');

    try {
      const res = await fetch('/api/focus-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || `${emoji} ${preset.label}`,
          duration: timeLeft,
          type: sessionType === 'custom' ? 'free' : sessionType,
          emoji: emoji,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSessions([data, ...sessions]);
      }
    } catch (error) {
      console.error('Ошибка создания сессии:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePause = () => {
    setStatus('paused');
  };

  const handleResume = () => {
    setStatus('active');
  };

  const handleComplete = async () => {
    setStatus('completed');
    
    const sessionDuration = timeLeft;
    
    try {
      const activeSession = sessions.find(s => s.status === 'active');
      if (activeSession) {
        await fetch(`/api/focus-sessions/${activeSession.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            status: 'completed',
            completed_at: new Date().toISOString(),
            duration: sessionDuration,
          }),
        });
        await loadSessions();
      }
    } catch (error) {
      console.error('Ошибка завершения сессии:', error);
    }

    try {
      const audio = new Audio('/notification.mp3');
      await audio.play();
    } catch {}
  };

  const handleReset = () => {
    setStatus('idle');
    const preset = getCurrentPreset();
    setTimeLeft(preset.duration);
    setTotalSeconds(preset.duration);
    setTitle('');
  };

  const handleChangeType = (type: SessionType) => {
    if (status !== 'idle' && status !== 'completed') {
      if (!confirm('Сбросить текущую сессию?')) return;
    }
    setSessionType(type);
    if (type !== 'custom') {
      const preset = presets[type];
      setTimeLeft(preset.duration);
      setTotalSeconds(preset.duration);
      setEmoji(preset.icon);
    } else {
      const total = customMinutes * 60 + customSeconds;
      setTimeLeft(total > 0 ? total : 60);
      setTotalSeconds(total > 0 ? total : 60);
      setEmoji('⚡');
    }
    setStatus('idle');
    setTitle('');
  };

  const handleEmojiSelect = (e: string) => {
    setEmoji(e);
    setShowEmojiPicker(false);
  };

  const updateCustomTime = (mins: number, secs: number) => {
    setCustomMinutes(mins);
    setCustomSeconds(secs);
    const total = mins * 60 + secs;
    if (total > 0 && sessionType === 'custom') {
      setTimeLeft(total);
      setTotalSeconds(total);
    }
  };

  if (!authChecked) {
    return (
      <div style={{
        minHeight: '100vh',
        background: isDarkMode ? '#0a0a0a' : '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Loader text="Проверка авторизации..." size="large" />
      </div>
    );
  }

  const progress = getProgress();
  const isComplete = status === 'completed';
  const isActive = status === 'active';
  const isPaused = status === 'paused';
  const isIdle = status === 'idle';
  const isCustom = sessionType === 'custom';
  const color = isCustom ? '#22c55e' : presets[sessionType]?.color || '#8b5cf6';

  const displayMinutes = isCustom ? customMinutes : Math.floor(timeLeft / 60);
  const displaySeconds = isCustom ? customSeconds : timeLeft % 60;

  const navItems = [
    { id: 'dashboard', label: 'Главная', icon: Home, path: '/dashboard', view: 'dashboard' },
    { id: 'calendar', label: 'Календарь', icon: CalendarDays, path: '/dashboard', view: 'calendar' },
    { id: 'focus', label: 'Фокус', icon: Timer, path: '/focus', view: 'focus' },
    { id: 'analytics', label: 'Аналитика', icon: BarChart3, path: '/dashboard', view: 'analytics' },
    { id: 'goals', label: 'Цели', icon: Target, path: '/goals', view: 'goals' },
    { id: 'profile', label: 'Профиль', icon: User, path: '/profile', view: 'profile' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: isDarkMode ? '#0a0a0a' : '#f5f5f5',
      display: 'flex',
      position: 'relative',
      transition: 'background 0.3s ease',
    }}>
      {/* ===== БОКОВАЯ ПАНЕЛЬ ===== */}
      <div
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: isSidebarOpen ? '240px' : '0px',
          background: isDarkMode ? '#111111' : '#ffffff',
          borderRight: isSidebarOpen ? `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` : 'none',
          zIndex: 1000,
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          padding: isSidebarOpen ? '20px 16px' : '0px',
          boxSizing: 'border-box',
        }}
      >
        {isSidebarOpen && (
          <>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '32px',
              paddingBottom: '16px',
              borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
            }}>
              <span style={{
                fontSize: '20px',
                fontWeight: '700',
                color: isDarkMode ? 'white' : '#1a1a1a',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                LifeOS
              </span>
              <button
                onClick={togglePin}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: isSidebarPinned ? '#3b82f6' : '#6b7280',
                  padding: '4px',
                  borderRadius: '6px',
                  transition: 'all 0.2s',
                }}
              >
                {isSidebarPinned ? (
                  <Pin style={{ width: '18px', height: '18px' }} />
                ) : (
                  <PinOff style={{ width: '18px', height: '18px' }} />
                )}
              </button>
            </div>

            <nav style={{ flex: 1 }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === 'focus';
                
                const handleClick = () => {
                  if (item.id === 'focus') {
                    router.push('/focus');
                  } else if (item.id === 'goals') {
                    router.push('/goals');
                  } else if (item.id === 'profile') {
                    router.push('/profile');
                  } else {
                    // Для dashboard, calendar, analytics — передаём view через query параметр
                    router.push(`/dashboard?view=${item.view}`);
                  }
                };
                
                return (
                  <button
                    key={item.id}
                    onClick={handleClick}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: isActive ? isDarkMode ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)' : 'transparent',
                      border: 'none',
                      borderRadius: '10px',
                      color: isActive ? (isDarkMode ? 'white' : '#1a1a1a') : '#6b7280',
                      fontSize: '14px',
                      fontWeight: isActive ? '500' : '400',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.2s',
                      marginBottom: '4px',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <Icon style={{ width: '20px', height: '20px' }} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <button
              onClick={handleLogout}
              style={{
                padding: '10px 14px',
                background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
                borderRadius: '10px',
                color: '#6b7280',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s',
                marginTop: 'auto',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
                e.currentTarget.style.color = '#ef4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
                e.currentTarget.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
                e.currentTarget.style.color = '#6b7280';
              }}
            >
              <LogOut style={{ width: '20px', height: '20px' }} />
              Выйти
            </button>
          </>
        )}
      </div>

      {/* ===== ОСНОВНОЙ КОНТЕНТ ===== */}
      <div style={{
        flex: 1,
        padding: '24px',
        marginLeft: isSidebarOpen ? '240px' : '0px',
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        maxWidth: isSidebarOpen ? 'calc(100% - 240px)' : '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}>
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            style={{
              position: 'fixed',
              top: '20px',
              left: '20px',
              padding: '8px',
              background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
              borderRadius: '8px',
              color: '#6b7280',
              cursor: 'pointer',
              zIndex: 100,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
              e.currentTarget.style.color = isDarkMode ? 'white' : '#1a1a1a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            <Menu style={{ width: '20px', height: '20px' }} />
          </button>
        )}

        <div style={{
          maxWidth: '500px',
          width: '100%',
          background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.8)',
          border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
          borderRadius: '32px',
          padding: '32px 24px',
          boxShadow: isDarkMode ? '0 20px 60px rgba(0,0,0,0.5)' : '0 20px 60px rgba(0,0,0,0.1)',
          textAlign: 'center',
          marginTop: isSidebarOpen ? '0' : '40px',
        }}>
          {/* Заголовок */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '4px',
          }}>
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              style={{
                fontSize: '32px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0',
                position: 'relative',
              }}
            >
              {emoji}
              {showEmojiPicker && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: isDarkMode ? '#1a1a1a' : '#ffffff',
                  border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                  borderRadius: '12px',
                  padding: '12px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(8, 1fr)',
                  gap: '4px',
                  width: '280px',
                  boxShadow: isDarkMode ? '0 20px 60px rgba(0,0,0,0.8)' : '0 20px 60px rgba(0,0,0,0.15)',
                  zIndex: 100,
                }}>
                  {EMOJI_LIST.map((e) => (
                    <button
                      key={e}
                      onClick={() => handleEmojiSelect(e)}
                      style={{
                        padding: '4px',
                        fontSize: '20px',
                        borderRadius: '6px',
                        background: emoji === e ? 'rgba(139,92,246,0.2)' : 'transparent',
                        border: emoji === e ? '1px solid #8b5cf6' : '1px solid transparent',
                        cursor: 'pointer',
                      }}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </button>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: isDarkMode ? 'white' : '#1a1a1a',
              margin: 0,
            }}>
              Focus Mode
            </h1>
          </div>
          <p style={{
            fontSize: '13px',
            color: '#6b7280',
            marginBottom: '20px',
          }}>
            Глубокая концентрация без отвлечений
          </p>

          {/* Пресеты */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            {Object.entries(presets).map(([key, value]) => {
              const isActiveType = sessionType === key;
              const col = key === 'custom' ? '#22c55e' : value.color;
              
              return (
                <button
                  key={key}
                  onClick={() => handleChangeType(key as SessionType)}
                  disabled={isActive || isPaused}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '100px',
                    border: `2px solid ${isActiveType ? col : isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                    background: isActiveType ? `${col}20` : 'transparent',
                    color: isActiveType ? col : '#6b7280',
                    fontSize: '12px',
                    fontWeight: isActiveType ? '600' : '400',
                    cursor: (isActive || isPaused) ? 'not-allowed' : 'pointer',
                    opacity: (isActive || isPaused) ? 0.5 : 1,
                  }}
                >
                  {value.icon} {value.label}
                </button>
              );
            })}
          </div>

          {/* Название */}
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Что будешь делать? (необязательно)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isActive || isPaused || isComplete}
              style={{
                width: '100%',
                padding: '10px 16px',
                background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                borderRadius: '12px',
                color: isDarkMode ? 'white' : '#1a1a1a',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                opacity: (isActive || isPaused || isComplete) ? 0.5 : 1,
              }}
            />
          </div>

          {/* Таймер */}
          <div style={{
            position: 'relative',
            width: '200px',
            height: '200px',
            margin: '0 auto 20px',
          }}>
            <svg
              width="200"
              height="200"
              viewBox="0 0 200 200"
              style={{ transform: 'rotate(-90deg)' }}
            >
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke={isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
                strokeWidth="8"
              />
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke={color}
                strokeWidth="8"
                strokeDasharray={2 * Math.PI * 85}
                strokeDashoffset={2 * Math.PI * 85 * (1 - progress / 100)}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dashoffset 0.5s ease',
                }}
              />
            </svg>

            {(isIdle || isCustom) && !isActive && !isPaused && !isComplete ? (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px',
                }}>
                  {/* Минуты */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0px',
                  }}>
                    <button
                      onClick={() => {
                        if (isCustom) {
                          const newVal = Math.min(120, customMinutes + 1);
                          updateCustomTime(newVal, customSeconds);
                        } else {
                          const newTime = Math.min(120 * 60, timeLeft + 60);
                          setTimeLeft(newTime);
                          setTotalSeconds(newTime);
                        }
                      }}
                      disabled={isActive || isPaused || isComplete}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: isDarkMode ? '#6b7280' : '#9ca3af',
                        cursor: isActive || isPaused || isComplete ? 'not-allowed' : 'pointer',
                        padding: '0 4px',
                        transition: 'all 0.2s',
                        opacity: (isActive || isPaused || isComplete) ? 0.3 : 1,
                      }}
                    >
                      <ChevronUp style={{ width: '18px', height: '18px' }} />
                    </button>
                    <span style={{
                      fontSize: '36px',
                      fontWeight: '700',
                      color: isDarkMode ? 'white' : '#1a1a1a',
                      fontVariantNumeric: 'tabular-nums',
                      minWidth: '60px',
                      textAlign: 'center',
                    }}>
                      {String(displayMinutes).padStart(2, '0')}
                    </span>
                    <button
                      onClick={() => {
                        if (isCustom) {
                          const newVal = Math.max(1, customMinutes - 1);
                          updateCustomTime(newVal, customSeconds);
                        } else {
                          const newTime = Math.max(60, timeLeft - 60);
                          setTimeLeft(newTime);
                          setTotalSeconds(newTime);
                        }
                      }}
                      disabled={isActive || isPaused || isComplete}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: isDarkMode ? '#6b7280' : '#9ca3af',
                        cursor: isActive || isPaused || isComplete ? 'not-allowed' : 'pointer',
                        padding: '0 4px',
                        transition: 'all 0.2s',
                        opacity: (isActive || isPaused || isComplete) ? 0.3 : 1,
                      }}
                    >
                      <ChevronDown style={{ width: '18px', height: '18px' }} />
                    </button>
                  </div>

                  <span style={{ fontSize: '30px', color: '#6b7280', paddingBottom: '16px' }}>:</span>

                  {/* Секунды */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0px',
                  }}>
                    <button
                      onClick={() => {
                        if (isCustom) {
                          const newVal = Math.min(59, customSeconds + 1);
                          updateCustomTime(customMinutes, newVal);
                        } else {
                          const newTime = Math.min(120 * 60, timeLeft + 1);
                          setTimeLeft(newTime);
                          setTotalSeconds(newTime);
                        }
                      }}
                      disabled={isActive || isPaused || isComplete}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: isDarkMode ? '#6b7280' : '#9ca3af',
                        cursor: isActive || isPaused || isComplete ? 'not-allowed' : 'pointer',
                        padding: '0 4px',
                        transition: 'all 0.2s',
                        opacity: (isActive || isPaused || isComplete) ? 0.3 : 1,
                      }}
                    >
                      <ChevronUp style={{ width: '18px', height: '18px' }} />
                    </button>
                    <span style={{
                      fontSize: '36px',
                      fontWeight: '700',
                      color: isDarkMode ? 'white' : '#1a1a1a',
                      fontVariantNumeric: 'tabular-nums',
                      minWidth: '50px',
                      textAlign: 'center',
                    }}>
                      {String(displaySeconds).padStart(2, '0')}
                    </span>
                    <button
                      onClick={() => {
                        if (isCustom) {
                          const newVal = Math.max(0, customSeconds - 1);
                          updateCustomTime(customMinutes, newVal);
                        } else {
                          const newTime = Math.max(0, timeLeft - 1);
                          setTimeLeft(newTime);
                          setTotalSeconds(newTime);
                        }
                      }}
                      disabled={isActive || isPaused || isComplete}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: isDarkMode ? '#6b7280' : '#9ca3af',
                        cursor: isActive || isPaused || isComplete ? 'not-allowed' : 'pointer',
                        padding: '0 4px',
                        transition: 'all 0.2s',
                        opacity: (isActive || isPaused || isComplete) ? 0.3 : 1,
                      }}
                    >
                      <ChevronDown style={{ width: '18px', height: '18px' }} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
              }}>
                <div style={{
                  fontSize: '42px',
                  fontWeight: '700',
                  color: isDarkMode ? 'white' : '#1a1a1a',
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '2px',
                }}>
                  {formatTime(timeLeft)}
                </div>
                {isComplete && (
                  <div style={{
                    fontSize: '13px',
                    color: '#22c55e',
                    fontWeight: '500',
                    marginTop: '2px',
                  }}>
                    ✅ Завершено!
                  </div>
                )}
                {isPaused && (
                  <div style={{
                    fontSize: '13px',
                    color: '#eab308',
                    fontWeight: '500',
                    marginTop: '2px',
                  }}>
                    ⏸ На паузе
                  </div>
                )}
                <div style={{
                  fontSize: '10px',
                  color: '#6b7280',
                  marginTop: '2px',
                }}>
                  {Math.round(progress)}%
                </div>
              </div>
            )}
          </div>

          {/* Кнопки */}
          <div style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            {isComplete ? (
              <button
                onClick={handleReset}
                style={{
                  padding: '10px 28px',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 20px rgba(59,130,246,0.25)',
                }}
              >
                <RotateCcw style={{ width: '18px', height: '18px' }} />
                Новая сессия
              </button>
            ) : isIdle ? (
              <button
                onClick={handleStart}
                disabled={isSubmitting}
                style={{
                  padding: '10px 36px',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 20px rgba(34,197,94,0.25)',
                  opacity: isSubmitting ? 0.5 : 1,
                }}
              >
                <Play style={{ width: '18px', height: '18px' }} />
                {isSubmitting ? 'Запуск...' : 'Начать'}
              </button>
            ) : isActive ? (
              <>
                <button
                  onClick={handlePause}
                  style={{
                    padding: '10px 28px',
                    background: 'rgba(234,179,8,0.15)',
                    border: `2px solid #eab308`,
                    borderRadius: '12px',
                    color: '#eab308',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Pause style={{ width: '18px', height: '18px' }} />
                  Пауза
                </button>
                <button
                  onClick={handleReset}
                  style={{
                    padding: '10px 28px',
                    background: 'rgba(239,68,68,0.1)',
                    border: `2px solid rgba(239,68,68,0.2)`,
                    borderRadius: '12px',
                    color: '#ef4444',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <X style={{ width: '18px', height: '18px' }} />
                  Сбросить
                </button>
              </>
            ) : isPaused ? (
              <>
                <button
                  onClick={handleResume}
                  style={{
                    padding: '10px 28px',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 20px rgba(59,130,246,0.25)',
                  }}
                >
                  <Play style={{ width: '18px', height: '18px' }} />
                  Продолжить
                </button>
                <button
                  onClick={handleReset}
                  style={{
                    padding: '10px 28px',
                    background: 'rgba(239,68,68,0.1)',
                    border: `2px solid rgba(239,68,68,0.2)`,
                    borderRadius: '12px',
                    color: '#ef4444',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <X style={{ width: '18px', height: '18px' }} />
                  Сбросить
                </button>
              </>
            ) : null}
          </div>

          {/* История */}
          {sessions.length > 0 && (
            <div style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
              maxHeight: '120px',
              overflowY: 'auto',
            }}>
              <div style={{
                fontSize: '10px',
                color: '#6b7280',
                textAlign: 'left',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontWeight: '500',
              }}>
                📋 Последние сессии
              </div>
              {sessions.slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 8px',
                    borderRadius: '8px',
                    marginBottom: '4px',
                    background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'}`,
                    fontSize: '12px',
                    color: isDarkMode ? '#d1d5db' : '#4b5563',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '16px' }}>{session.emoji || '🎯'}</span>
                    <span>{session.title || session.type}</span>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ 
                      background: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                      padding: '2px 8px',
                      borderRadius: '100px',
                      fontSize: '10px',
                      color: isDarkMode ? '#9ca3af' : '#6b7280',
                    }}>
                      {Math.floor(session.duration / 60)}м
                    </span>
                    {session.status === 'completed' && (
                      <span style={{ color: '#22c55e', fontSize: '12px' }}>✅</span>
                    )}
                    {session.status === 'active' && (
                      <span style={{ color: '#ef4444', fontSize: '12px' }}>🔴</span>
                    )}
                    {session.status === 'paused' && (
                      <span style={{ color: '#eab308', fontSize: '12px' }}>⏸</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}