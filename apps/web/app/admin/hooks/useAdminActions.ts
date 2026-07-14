// apps/web/app/admin/hooks/useAdminActions.ts

'use client';

import { useState } from 'react';
import { User, Feedback } from '../types';

export function useAdminActions(setUsers: (users: User[]) => void, setFeedbackList: (list: Feedback[]) => void) {
  const [actionLoading, setActionLoading] = useState(false);

  const toggleUserBlock = async (userId: string, block: boolean, users: User[]) => {
    if (!confirm(block ? '❌ Заблокировать пользователя?' : '✅ Разблокировать пользователя?')) return;
    
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/users/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, block }),
      });
      
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, is_blocked: block } : u));
      }
    } catch (error) {
      alert('Ошибка');
    }
    setActionLoading(false);
  };

  const toggleEmailVerification = async (userId: string, verify: boolean, users: User[]) => {
    if (!confirm(verify ? '✅ Подтвердить email пользователя?' : '❌ Отменить подтверждение email?')) return;
    
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/users/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, verify }),
      });
      
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, email_verified: verify } : u));
      }
    } catch (error) {
      alert('Ошибка');
    }
    setActionLoading(false);
  };

  const resetUserPassword = async (userId: string) => {
    const newPassword = Math.random().toString(36).slice(-8);
    if (!confirm(`Сбросить пароль на: ${newPassword}?`)) return;
    
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPassword }),
      });
      
      if (res.ok) {
        alert(`✅ Пароль сброшен: ${newPassword}`);
      }
    } catch (error) {
      alert('Ошибка');
    }
    setActionLoading(false);
  };

  const deleteUser = async (userId: string, users: User[]) => {
    if (!confirm('🚨 УДАЛИТЬ ПОЛЬЗОВАТЕЛЯ СО ВСЕМИ ДАННЫМИ? Это необратимо!')) return;
    
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId));
      }
    } catch (error) {
      alert('Ошибка');
    }
    setActionLoading(false);
  };

  const handleFeedbackResponse = async (
    selectedFeedback: Feedback | null,
    adminResponse: string,
    feedbackStatus: string,
    setFeedbackList: (list: Feedback[]) => void,
    feedbackList: Feedback[],
    setShowFeedbackModal: (show: boolean) => void,
    setAdminResponse: (res: string) => void
  ) => {
    if (!selectedFeedback) return;
    if (!adminResponse.trim()) {
      alert('Введите ответ');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedFeedback.id,
          response: adminResponse.trim(),
          status: feedbackStatus,
        }),
      });

      if (res.ok) {
        alert('✅ Ответ отправлен пользователю');
        setShowFeedbackModal(false);
        setAdminResponse('');
        const updated = feedbackList.map(f => 
          f.id === selectedFeedback.id 
            ? { ...f, admin_response: adminResponse.trim(), status: feedbackStatus as any, responded_at: new Date().toISOString() }
            : f
        );
        setFeedbackList(updated);
      } else {
        alert('❌ Ошибка отправки');
      }
    } catch (error) {
      alert('❌ Ошибка соединения');
    }
    setActionLoading(false);
  };

  return {
    actionLoading,
    toggleUserBlock,
    toggleEmailVerification,
    resetUserPassword,
    deleteUser,
    handleFeedbackResponse,
  };
}