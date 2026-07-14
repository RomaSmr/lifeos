// apps/web/app/admin/hooks/useAdminData.ts

'use client';

import { useState, useEffect } from 'react';
import { Stats, User, Feedback } from '../types';

export function useAdminData() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
      ]);
      
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
      
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const fetchFeedback = async () => {
    try {
      const res = await fetch('/api/admin/feedback');
      if (res.ok) {
        const data = await res.json();
        setFeedbackList(data);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    }
  };

  useEffect(() => {
    fetchAllData();
    fetchFeedback();
  }, []);

  return { stats, users, feedbackList, loading, fetchAllData, fetchFeedback, setUsers, setFeedbackList };
}