// apps/web/app/dashboard/hooks/useHabits.ts

'use client';

import { useState, useEffect } from 'react';
import { Habit, HabitLog } from '@/types';
import { getCache, setCache } from '@/lib/utils/storage';

export function useHabits(userId: string | null) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHabits = async () => {
    try {
      const cachedHabits = getCache<Habit[]>('habits_cache');
      const cachedLogs = getCache<HabitLog[]>('habit_logs_cache');

      if (cachedHabits) setHabits(cachedHabits);
      if (cachedLogs) setHabitLogs(cachedLogs);

      const [habitsRes, logsRes] = await Promise.all([
        fetch('/api/habits'),
        fetch('/api/habit-logs'),
      ]);

      if (habitsRes.ok) {
        const data = await habitsRes.json();
        setHabits(data);
        setCache('habits_cache', data);
      }
      if (logsRes.ok) {
        const data = await logsRes.json();
        setHabitLogs(data);
        setCache('habit_logs_cache', data);
      }
      setLoading(false);
    } catch (err) {
      console.error('Ошибка загрузки привычек:', err);
      setLoading(false);
    }
  };

  const createHabit = async (data: Partial<Habit>) => {
    const tempHabit = {
      id: 'temp-' + Date.now(),
      ...data,
      streak: 0,
      longest_streak: 0,
      created_at: new Date().toISOString(),
    } as Habit;

    const newHabits = [...habits, tempHabit];
    setHabits(newHabits);
    setCache('habits_cache', newHabits);

    const res = await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const result = await res.json();
      const updated = newHabits.map(h => h.id === tempHabit.id ? result : h);
      setHabits(updated);
      setCache('habits_cache', updated);
      return result;
    } else {
      const cached = getCache<Habit[]>('habits_cache');
      if (cached) setHabits(cached);
      throw new Error('Ошибка создания привычки');
    }
  };

  const toggleHabit = async (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const today = new Date().toISOString().split('T')[0];
    const alreadyLogged = habitLogs.some(log => {
      const logDate = new Date(log.completed_at).toISOString().split('T')[0];
      return log.habit_id === habitId && logDate === today;
    });

    if (alreadyLogged) {
      alert('Сегодня уже отмечено! 🔥');
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const hadYesterday = habitLogs.some(log => {
      if (log.habit_id !== habitId) return false;
      const logDate = new Date(log.completed_at).toISOString().split('T')[0];
      return logDate === yesterdayStr;
    });

    const newStreak = hadYesterday ? (habit.streak || 0) + 1 : 1;
    const newLongest = Math.max(habit.longest_streak || 0, newStreak);

    const updatedHabits = habits.map(h =>
      h.id === habitId ? { ...h, streak: newStreak, longest_streak: newLongest } : h
    );
    setHabits(updatedHabits);
    setCache('habits_cache', updatedHabits);

    await fetch('/api/habits', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: habitId, streak: newStreak, longest_streak: newLongest }),
    });

    const tempLog = {
      id: 'temp-' + Date.now(),
      habit_id: habitId,
      user_id: userId!,
      completed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    } as HabitLog;

    const updatedLogs = [...habitLogs, tempLog];
    setHabitLogs(updatedLogs);
    setCache('habit_logs_cache', updatedLogs);

    const res = await fetch('/api/habit-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ habit_id: habitId }),
    });

    if (res.ok) {
      const data = await res.json();
      const finalLogs = updatedLogs.map(log => log.id === tempLog.id ? data : log);
      setHabitLogs(finalLogs);
      setCache('habit_logs_cache', finalLogs);
    }
  };

  const deleteHabit = async (habitId: string) => {
    const updated = habits.filter(h => h.id !== habitId);
    setHabits(updated);
    setCache('habits_cache', updated);
    await fetch(`/api/habits?id=${habitId}`, { method: 'DELETE' });
  };

  const getHabitStats = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return { totalDays: 0, completedDays: 0, skippedDays: 0, percent: 0 };

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const startDate = new Date(habit.created_at);
    startDate.setHours(0, 0, 0, 0);

    let totalDaysAll = 0;
    if (habit.target_date) {
      const endDate = new Date(habit.target_date);
      endDate.setHours(23, 59, 59, 999);
      totalDaysAll = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    } else {
      totalDaysAll = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }

    const displayDays = Math.min(totalDaysAll, 30);
    const logs = habitLogs.filter(log => log.habit_id === habitId);
    const completedDays = logs.length;
    const skippedDays = Math.max(0, displayDays - completedDays);
    const percent = totalDaysAll > 0 ? Math.round((completedDays / totalDaysAll) * 100) : 0;

    return { totalDays: displayDays, completedDays, skippedDays, percent };
  };

  useEffect(() => {
    if (userId) fetchHabits();
  }, [userId]);

  return {
    habits,
    habitLogs,
    loading,
    createHabit,
    toggleHabit,
    deleteHabit,
    getHabitStats,
    refetch: fetchHabits,
  };
}