// apps/web/types/index.ts

export interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  nickname?: string;
  avatar_url?: string;
  last_seen?: string;
  email_verified?: boolean;
  bio?: string;
  location?: string;
  website?: string;
  old_nicknames?: string[];
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: 'active' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  completed_at?: string;
  goal_id?: string;
  order_index: number;
  created_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  emoji: string;
  goal?: string;
  target_date?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  streak: number;
  longest_streak: number;
  created_at: string;
  reminder_enabled?: boolean;  // 🔥 ДОБАВЛЯЕМ
  reminder_time?: string;      // 🔥 ДОБАВЛЯЕМ
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  progress: number;
  target_date?: string;
  status: 'active' | 'completed' | 'archived';
  created_at: string;
}

export interface FocusSession {
  id: string;
  user_id: string;
  title: string;
  duration: number;
  type: string;
  status: 'active' | 'paused' | 'completed';
  started_at: string;
  completed_at?: string;
  paused_at?: string;
  paused_duration?: number;
  emoji?: string;
  created_at: string;
}