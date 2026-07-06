// apps/web/app/api/focus-sessions/[id]/route.ts

import { query } from '@/lib/db/client';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

// 🔥 ИСПРАВЛЯЕМ: params теперь async
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params; // 🔥 Разворачиваем Promise
  const { status, completed_at, paused_at, paused_duration } = await request.json();

  try {
    const result = await query(
      `UPDATE focus_sessions 
       SET status = $1, completed_at = $2, paused_at = $3, paused_duration = $4, updated_at = NOW()
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [status, completed_at, paused_at, paused_duration, id, userId]
    );
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params; // 🔥 Разворачиваем Promise

  try {
    await query(
      'DELETE FROM focus_sessions WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}