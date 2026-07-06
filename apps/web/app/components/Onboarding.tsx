// apps/web/app/components/Onboarding.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, Target, Flame, CalendarDays, Timer, BarChart3, 
  User, Check, ArrowRight, ArrowLeft, Heart,
  Briefcase, BookOpen, TrendingUp, Users, Brain,
  Rocket
} from 'lucide-react';

interface OnboardingProps {
  userId: string;
  onComplete: () => void;
}

const STEPS = [
  {
    id: 'welcome',
    title: 'Добро пожаловать в LifeOS',
    description: 'Твоя жизнь. Твоя система.',
    icon: Sparkles,
    image: '🚀',
  },
  {
    id: 'goals',
    title: 'Что для тебя важно?',
    description: 'Выбери сферы, в которых хочешь развиваться',
    icon: Target,
    image: '🎯',
    isSelection: true,
    options: [
      { id: 'health', label: 'Здоровье', icon: Heart },
      { id: 'work', label: 'Работа', icon: Briefcase },
      { id: 'learning', label: 'Обучение', icon: BookOpen },
      { id: 'finance', label: 'Финансы', icon: TrendingUp },
      { id: 'relationships', label: 'Отношения', icon: Users },
      { id: 'growth', label: 'Саморазвитие', icon: Brain },
    ],
  },
  {
    id: 'habit',
    title: 'Создай свою первую привычку',
    description: 'Начни с малого — например, с утренней зарядки',
    icon: Flame,
    image: '🔥',
    isHabitCreation: true,
  },
  {
    id: 'task',
    title: 'Добавь первую задачу',
    description: 'Что ты хочешь сделать уже сегодня?',
    icon: Check,
    image: '📋',
    isTaskCreation: true,
  },
  {
    id: 'calendar',
    title: 'Календарь — твой компас времени',
    description: 'Планируй дни, недели и месяцы вперёд',
    icon: CalendarDays,
    image: '📅',
  },
  {
    id: 'focus',
    title: 'Focus Mode — глубокая работа',
    description: 'Отключай уведомления и концентрируйся на главном',
    icon: Timer,
    image: '⏱️',
  },
  {
    id: 'analytics',
    title: 'Аналитика — твой личный КПД',
    description: 'Видишь прогресс — понимаешь, куда двигаться',
    icon: BarChart3,
    image: '📊',
  },
  {
    id: 'profile',
    title: 'Настрой профиль под себя',
    description: 'Тёмная тема, уведомления и твой аватар',
    icon: User,
    image: '👤',
  },
  {
    id: 'sidebar',
    title: 'Боковая панель — твой центр управления',
    description: 'Всё важное всегда под рукой',
    icon: Sparkles,
    image: '🎨',
  },
  {
    id: 'complete',
    title: 'Готово!',
    description: 'Ты готов начать строить свою жизнь',
    icon: Rocket,
    image: '🏆',
  },
];

export function Onboarding({ userId, onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [habitTitle, setHabitTitle] = useState('');
  const [habitEmoji, setHabitEmoji] = useState('💪');
  const [taskTitle, setTaskTitle] = useState('');
  const [isDark, setIsDark] = useState(true);
  const router = useRouter();

  const step = STEPS[currentStep];
  const totalSteps = STEPS.length;

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setIsDark(savedTheme !== 'light');
  }, []);

  const toggleTheme = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    document.documentElement.style.background = newMode ? '#0a0a0a' : '#f5f5f5';
    document.body.style.background = newMode ? '#0a0a0a' : '#f5f5f5';
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('onboarding_completed', 'true');
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleGoal = (goalId: string) => {
    if (selectedGoals.includes(goalId)) {
      setSelectedGoals(selectedGoals.filter(g => g !== goalId));
    } else {
      setSelectedGoals([...selectedGoals, goalId]);
    }
  };

  const createFirstHabit = async () => {
    if (!habitTitle.trim()) {
      alert('Введи название привычки');
      return;
    }
    try {
      await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: habitTitle.trim(),
          emoji: habitEmoji,
          description: 'Моя первая привычка в LifeOS',
          frequency: 'daily',
        }),
      });
      handleNext();
    } catch {
      alert('Ошибка создания привычки');
    }
  };

  const createFirstTask = async () => {
    if (!taskTitle.trim()) {
      alert('Введи название задачи');
      return;
    }
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle.trim(),
          priority: 'medium',
        }),
      });
      handleNext();
    } catch {
      alert('Ошибка создания задачи');
    }
  };

  const isNextDisabled = () => {
    if (step.isSelection) {
      return selectedGoals.length === 0;
    }
    if (step.isHabitCreation) {
      return !habitTitle.trim();
    }
    if (step.isTaskCreation) {
      return !taskTitle.trim();
    }
    return false;
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 10000,
      background: isDark ? '#0a0a0a' : '#f5f5f5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background 0.3s ease',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '520px',
        margin: '20px',
        padding: '32px',
        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        borderRadius: '24px',
        boxShadow: isDark ? '0 40px 100px rgba(0,0,0,0.9)' : '0 40px 100px rgba(0,0,0,0.1)',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        {/* Индикатор прогресса */}
        <div style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '24px',
          justifyContent: 'center',
        }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                height: '3px',
                flex: 1,
                borderRadius: '100px',
                background: i <= currentStep
                  ? `linear-gradient(135deg, #3b82f6, #8b5cf6)`
                  : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Шаг */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '12px',
            animation: 'onboardingIcon 0.6s ease',
          }}>
            {step.image}
          </div>
          
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: isDark ? 'white' : '#1a1a1a',
            margin: '0 0 8px',
          }}>
            {step.title}
          </h2>
          
          <p style={{
            fontSize: '15px',
            color: isDark ? '#9ca3af' : '#6b7280',
            margin: 0,
            lineHeight: '1.5',
          }}>
            {step.description}
          </p>
        </div>

        {/* Контент шага */}
        <div style={{ marginBottom: '24px' }}>
          {step.isSelection && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
            }}>
              {step.options?.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedGoals.includes(option.id);
                return (
                  <button
                    key={option.id}
                    onClick={() => toggleGoal(option.id)}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      border: `2px solid ${isSelected ? '#8b5cf6' : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                      background: isSelected ? 'rgba(139,92,246,0.15)' : 'transparent',
                      color: isDark ? 'white' : '#1a1a1a',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Icon size={24} style={{ color: isSelected ? '#8b5cf6' : '#6b7280' }} />
                    <span style={{ fontSize: '13px' }}>{option.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {step.isHabitCreation && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {['💪', '📚', '🏃', '🧘', '🥗', '💧', '📝', '🎯', '🔥', '⭐'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setHabitEmoji(emoji)}
                    style={{
                      fontSize: '28px',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      border: `2px solid ${habitEmoji === emoji ? '#f97316' : 'transparent'}`,
                      background: habitEmoji === emoji ? 'rgba(249,115,22,0.15)' : 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Например: Утренняя зарядка"
                value={habitTitle}
                onChange={(e) => setHabitTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                  borderRadius: '12px',
                  color: isDark ? 'white' : '#1a1a1a',
                  fontSize: '15px',
                  outline: 'none',
                }}
                autoFocus
              />
            </div>
          )}

          {step.isTaskCreation && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                placeholder="Например: Завершить дизайн"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                  borderRadius: '12px',
                  color: isDark ? 'white' : '#1a1a1a',
                  fontSize: '15px',
                  outline: 'none',
                }}
                autoFocus
              />
            </div>
          )}

          {!step.isSelection && !step.isHabitCreation && !step.isTaskCreation && (
            <div style={{
              padding: '20px',
              background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
              borderRadius: '12px',
              textAlign: 'center',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
            }}>
              <p style={{
                fontSize: '14px',
                color: isDark ? '#9ca3af' : '#6b7280',
                margin: 0,
              }}>
                Готов начать? 🚀
              </p>
            </div>
          )}
        </div>

        {/* Кнопки навигации */}
        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'space-between',
        }}>
          <button
            onClick={handleBack}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
              borderRadius: '10px',
              color: isDark ? '#6b7280' : '#6b7280',
              fontSize: '14px',
              cursor: currentStep === 0 ? 'default' : 'pointer',
              opacity: currentStep === 0 ? 0 : 1,
              transition: 'all 0.2s',
            }}
            disabled={currentStep === 0}
          >
            <ArrowLeft size={18} />
          </button>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={toggleTheme}
              style={{
                padding: '8px 12px',
                background: 'transparent',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                borderRadius: '8px',
                color: isDark ? '#6b7280' : '#6b7280',
                cursor: 'pointer',
              }}
            >
              {isDark ? '🌙' : '☀️'}
            </button>

            <button
              onClick={step.isHabitCreation ? createFirstHabit : step.isTaskCreation ? createFirstTask : handleNext}
              disabled={isNextDisabled()}
              style={{
                padding: '10px 24px',
                background: isNextDisabled()
                  ? '#374151'
                  : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isNextDisabled() ? 'not-allowed' : 'pointer',
                opacity: isNextDisabled() ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {currentStep === totalSteps - 1 ? 'Начать' : 'Дальше'}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Счётчик шагов */}
        <div style={{
          marginTop: '16px',
          textAlign: 'center',
          fontSize: '11px',
          color: isDark ? '#4b5563' : '#9ca3af',
          fontFamily: 'monospace',
        }}>
          {currentStep + 1} / {totalSteps}
        </div>
      </div>

      <style>{`
        @keyframes onboardingIcon {
          0% { transform: scale(0.5) rotate(-10deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
      `}</style>
    </div>
  );
}