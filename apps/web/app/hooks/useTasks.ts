// apps/web/app/dashboard/hooks/useTasks.ts

'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/types';
import { getCache, setCache } from '@/lib/utils/storage';

export function useTasks(userId: string | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const cached = getCache<Task[]>('tasks_cache');
      if (cached) {
        setTasks(cached);
        setLoading(false);
      }

      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
        setCache('tasks_cache', data);
        setLoading(false);
      }
    } catch (err) {
      console.error('Ошибка загрузки задач:', err);
      setLoading(false);
    }
  };

  const createTask = async (data: Partial<Task>) => {
    const tempTask = {
      id: 'temp-' + Date.now(),
      ...data,
      status: 'active',
      order_index: tasks.length,
    } as Task;

    const newTasks = [...tasks, tempTask];
    setTasks(newTasks);
    setCache('tasks_cache', newTasks);

    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const result = await res.json();
      const updated = newTasks.map(t => t.id === tempTask.id ? result : t);
      setTasks(updated);
      setCache('tasks_cache', updated);
      return result;
    } else {
      const cached = getCache<Task[]>('tasks_cache');
      if (cached) setTasks(cached);
      throw new Error('Ошибка создания задачи');
    }
  };

  const toggleTask = async (taskId: string, forceComplete?: boolean) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newStatus = forceComplete ? 'completed' : (task.status === 'active' ? 'completed' : 'active');
    const updated = tasks.map(t =>
      t.id === taskId
        ? { ...t, status: newStatus, completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined }
        : t
    ) as Task[];

    setTasks(updated);
    setCache('tasks_cache', updated);

    await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: taskId, status: newStatus }),
    });
  };

  const deleteTask = async (taskId: string) => {
    const updated = tasks.filter(t => t.id !== taskId);
    setTasks(updated);
    setCache('tasks_cache', updated);
    await fetch(`/api/tasks?id=${taskId}`, { method: 'DELETE' });
  };

  useEffect(() => {
    if (userId) fetchTasks();
  }, [userId]);

  return { tasks, loading, createTask, toggleTask, deleteTask, refetch: fetchTasks };
}