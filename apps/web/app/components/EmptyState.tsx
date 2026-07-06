// apps/web/app/components/EmptyState.tsx

'use client';

import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  isDarkMode?: boolean;
}

export function EmptyState({ icon: Icon, title, description, action, isDarkMode = true }: EmptyStateProps) {
  return (
    <div style={{
      background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
      border: `1px dashed ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
      borderRadius: '12px',
      padding: '40px 20px',
      textAlign: 'center',
    }}>
      <Icon style={{
        width: '48px',
        height: '48px',
        color: '#6b7280',
        margin: '0 auto 12px',
        opacity: 0.5,
      }} />
      <h3 style={{
        fontSize: '16px',
        fontWeight: '500',
        color: isDarkMode ? '#d1d5db' : '#4b5563',
        margin: '0 0 4px',
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: '13px',
        color: '#6b7280',
        margin: '0 0 16px',
      }}>
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          style={{
            padding: '8px 20px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '13px',
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
          {action.label}
        </button>
      )}
    </div>
  );
}