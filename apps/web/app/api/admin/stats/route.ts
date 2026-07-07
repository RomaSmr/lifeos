// apps/web/app/api/admin/stats/route.ts

import { query } from '@/lib/db/client';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const ADMINS = ['romagronki@gmail.com', 'admin@lifeos.app'];

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return false;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { email: string };
    return ADMINS.includes(decoded.email);
  } catch {
    return false;
  }
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 🔥 ИСПРАВЛЕНО: добавил переменные для avatar и verified
    const [users, tasks, habits, goals, focusSessions, habitLogs, usersWithAvatar, verifiedEmails] = await Promise.all([
      query('SELECT COUNT(*) FROM users'),
      query('SELECT COUNT(*), SUM(CASE WHEN status = \'completed\' THEN 1 ELSE 0 END) FROM tasks'),
      query('SELECT COUNT(*) FROM habits'),
      query('SELECT COUNT(*) FROM goals'),
      query('SELECT COUNT(*) FROM focus_sessions'),
      query('SELECT COUNT(*) FROM habit_logs'),
      query('SELECT COUNT(*) FROM users WHERE avatar_url IS NOT NULL AND avatar_url != \'\''),
      query('SELECT COUNT(*) FROM users WHERE email_verified = true'),
    ]);

    return NextResponse.json({
      totalUsers: parseInt(users.rows[0].count),
      totalTasks: parseInt(tasks.rows[0].count),
      activeTasks: parseInt(tasks.rows[0].count) - parseInt(tasks.rows[0].sum || 0),
      completedTasks: parseInt(tasks.rows[0].sum || 0),
      totalHabits: parseInt(habits.rows[0].count),
      totalGoals: parseInt(goals.rows[0].count),
      totalFocusSessions: parseInt(focusSessions.rows[0].count),
      totalHabitLogs: parseInt(habitLogs.rows[0].count),
      usersWithAvatar: parseInt(usersWithAvatar.rows[0].count),
      verifiedEmails: parseInt(verifiedEmails.rows[0].count),
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Error fetching stats' }, { status: 500 });
  }
}