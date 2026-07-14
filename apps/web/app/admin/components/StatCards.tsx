// apps/web/app/admin/components/StatCards.tsx

'use client';

import { Users, Ban, ClipboardList, Flame } from 'lucide-react';

interface StatCardsProps {
  stats: any;
  isDarkMode: boolean;
}

const statCards = [
  { label: 'Пользователей', key: 'totalUsers', icon: Users, color: '#3b82f6' },
  { label: 'Заблокированных', key: 'blockedUsers', icon: Ban, color: '#ef4444' },
  { label: 'Задач', key: 'totalTasks', icon: ClipboardList, color: '#8b5cf6' },
  { label: 'Привычек', key: 'totalHabits', icon: Flame, color: '#f97316' },
];

export function StatCards({ stats, isDarkMode }: StatCardsProps) {
  return (
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
              background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
              borderRadius: '12px',
              padding: '16px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)';
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
                  color: isDarkMode ? 'white' : '#1a1a1a',
                }}>
                  {stats?.[card.key] || 0}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: isDarkMode ? '#6b7280' : '#6b7280',
                  marginTop: '2px',
                }}>
                  {card.label}
                </div>
              </div>
              <div style={{
                padding: '8px',
                borderRadius: '10px',
                background: `rgba(${card.color === '#3b82f6' ? '59,130,246' : 
                                  card.color === '#ef4444' ? '239,68,68' : 
                                  card.color === '#8b5cf6' ? '139,92,246' : 
                                  '249,115,22'}, 0.1)`,
              }}>
                <Icon size={20} style={{ color: card.color }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}