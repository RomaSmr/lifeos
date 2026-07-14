// apps/web/app/admin/types/index.ts

export interface Stats {
  totalUsers: number;
  totalTasks: number;
  totalHabits: number;
  totalGoals: number;
  activeTasks: number;
  completedTasks: number;
  totalFocusSessions: number;
  totalHabitLogs: number;
  usersWithAvatar: number;
  verifiedEmails: number;
  blockedUsers: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  nickname: string;
  avatar_url: string;
  last_seen: string;
  email_verified: boolean;
  created_at: string;
  bio: string;
  location: string;
  website: string;
  old_nicknames: string[];
  is_blocked: boolean;
  role: 'user' | 'admin';
}

export interface Feedback {
  id: string;
  user_id: string;
  title: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  screenshot_url?: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  admin_response?: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
  nickname?: string;
  email?: string;
  avatar_url?: string;
}