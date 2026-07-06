// apps/web/app/components/Loader.tsx

'use client';

import { Sparkles } from 'lucide-react';

interface LoaderProps {
  text?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function Loader({ text = 'Загрузка...', size = 'medium' }: LoaderProps) {
  const sizeMap = {
    small: { container: 'w-12 h-12', icon: 'w-5 h-5', text: 'text-xs' },
    medium: { container: 'w-16 h-16', icon: 'w-7 h-7', text: 'text-sm' },
    large: { container: 'w-24 h-24', icon: 'w-10 h-10', text: 'text-base' },
  };

  const currentSize = sizeMap[size];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
    }}>
      <div style={{
        width: currentSize.container,
        height: currentSize.container,
        borderRadius: '50%',
        border: '2px solid rgba(255,255,255,0.06)',
        borderTop: '2px solid #3b82f6',
        borderRight: '2px solid #8b5cf6',
        animation: 'spin 0.8s cubic-bezier(0.6, 0, 0.4, 1) infinite',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          inset: '-4px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
        <div style={{
          width: '60%',
          height: '60%',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Sparkles style={{
            width: currentSize.icon,
            height: currentSize.icon,
            color: '#8b5cf6',
            animation: 'pulse 1.2s ease-in-out infinite',
          }} />
        </div>
      </div>
      <p style={{
        color: '#6b7280',
        fontSize: currentSize.text,
        fontFamily: 'monospace',
        letterSpacing: '1px',
        animation: 'fadeInOut 1.5s ease-in-out infinite',
        margin: 0,
      }}>
        {text}
      </p>
      <div style={{
        display: 'flex',
        gap: '6px',
        marginTop: '-4px',
      }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#3b82f6',
              opacity: 0.3,
              animation: `dotPulse 1.4s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.95); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}