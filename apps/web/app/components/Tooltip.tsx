// apps/web/app/components/Tooltip.tsx

'use client';

import { useState, ReactNode, useRef, useEffect } from 'react';

interface TooltipProps {
  children: ReactNode;
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export function Tooltip({ 
  children, 
  text, 
  position = 'top', 
  delay = 300 
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const childRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    const id = setTimeout(() => {
      if (childRef.current) {
        const rect = childRef.current.getBoundingClientRect();
        let top = 0;
        let left = 0;

        switch (position) {
          case 'top':
            top = rect.top - 8;
            left = rect.left + rect.width / 2;
            break;
          case 'bottom':
            top = rect.bottom + 8;
            left = rect.left + rect.width / 2;
            break;
          case 'left':
            top = rect.top + rect.height / 2;
            left = rect.left - 8;
            break;
          case 'right':
            top = rect.top + rect.height / 2;
            left = rect.right + 8;
            break;
          default:
            top = rect.top - 8;
            left = rect.left + rect.width / 2;
        }

        setCoords({ top, left });
        setIsVisible(true);
      }
    }, delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  const getTransform = () => {
    switch (position) {
      case 'top':
      case 'bottom':
        return 'translateX(-50%)';
      case 'left':
      case 'right':
        return 'translateY(-50%)';
      default:
        return 'translateX(-50%)';
    }
  };

  return (
    <div
      ref={childRef}
      style={{ display: 'inline-block' }}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onTouchStart={() => setIsVisible(true)}
      onTouchEnd={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          style={{
            position: 'fixed',
            top: coords.top,
            left: coords.left,
            transform: getTransform(),
            padding: '6px 12px',
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            borderRadius: '6px',
            color: 'white',
            fontSize: '11px',
            fontWeight: '500',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 99999,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.06)',
            animation: 'tooltipFadeIn 0.15s ease',
            maxWidth: '300px',
            textAlign: 'center',
          }}
        >
          {text}
          <style>{`
            @keyframes tooltipFadeIn {
              from { opacity: 0; transform: ${getTransform()} scale(0.95); }
              to { opacity: 1; transform: ${getTransform()} scale(1); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}