// apps/web/app/dashboard/components/ProgressCard.tsx

'use client';

import { Task } from '@/types';

interface ProgressCardProps {
  tasks: Task[];
  isDarkMode: boolean;
}

export function ProgressCard({ tasks, isDarkMode }: ProgressCardProps) {
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div style={{
      background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)',
      border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
      borderRadius: '16px',
      padding: '20px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      <div>
        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
          Сегодня
        </p>
        <p style={{ fontSize: '16px', fontWeight: '500', color: isDarkMode ? 'white' : '#1a1a1a', margin: '2px 0 0' }}>
          {new Date().toLocaleDateString('ru-RU', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
          })}
        </p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          border: `2px solid ${progress === 100 ? '#22c55e' : progress > 0 ? '#3b82f6' : '#374151'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{
            fontSize: '16px',
            fontWeight: '600',
            color: progress === 100 ? '#22c55e' : progress > 0 ? '#60a5fa' : '#6b7280',
          }}>
            {progress}%
          </span>
        </div>
        <p style={{ fontSize: '10px', color: '#6b7280', margin: '4px 0 0' }}>
          прогресс
        </p>
      </div>
    </div>
  );
}