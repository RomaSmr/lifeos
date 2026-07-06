// apps/web/app/components/UserAvatar.tsx

'use client';

import { User } from '@/types';
import { useRouter } from 'next/navigation';
import { ChevronDown, User as UserIcon, LogOut, Settings } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface UserAvatarProps {
  user: User;
  isDarkMode: boolean;
  onLogout: () => void;
}

export function UserAvatar({ user, isDarkMode, onLogout }: UserAvatarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = () => {
    const displayName = user?.nickname || user?.name || user?.email || 'U';
    return displayName.charAt(0).toUpperCase();
  };

  const displayName = user?.nickname || user?.name || user?.email || 'User';

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 12px 4px 4px',
          borderRadius: '100px',
          background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
          border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
        }}
      >
        {/* Аватар */}
        {user?.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={displayName}
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
            fontWeight: '600',
            color: 'white',
          }}>
            {getInitials()}
          </div>
        )}
        
        <span style={{
          fontSize: '13px',
          color: isDarkMode ? '#d1d5db' : '#4b5563',
          maxWidth: '100px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {displayName}
        </span>
        
        <ChevronDown size={14} style={{
          color: '#6b7280',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
        }} />
      </button>

      {/* Выпадающее меню */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: '200px',
          background: isDarkMode ? '#141414' : '#ffffff',
          border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          borderRadius: '12px',
          boxShadow: isDarkMode ? '0 20px 60px rgba(0,0,0,0.8)' : '0 20px 60px rgba(0,0,0,0.15)',
          padding: '4px',
          zIndex: 100,
        }}>
          <button
            onClick={() => {
              router.push('/profile');
              setIsOpen(false);
            }}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: isDarkMode ? '#d1d5db' : '#4b5563',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <UserIcon size={16} />
            Профиль
          </button>
          
          <button
            onClick={() => {
              router.push('/profile');
              setIsOpen(false);
            }}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: isDarkMode ? '#d1d5db' : '#4b5563',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <Settings size={16} />
            Настройки
          </button>

          <div style={{
            height: '1px',
            margin: '4px 8px',
            background: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
          }} />

          <button
            onClick={() => {
              onLogout();
              setIsOpen(false);
            }}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: '#ef4444',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <LogOut size={16} />
            Выйти
          </button>
        </div>
      )}
    </div>
  );
}