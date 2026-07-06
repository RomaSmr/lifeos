// apps/web/app/api/user/update/route.ts

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

export async function PATCH(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { nickname, avatar_url, bio, location, website } = await request.json();

  try {
    // Получаем текущего пользователя для проверки смены ника
    const current = await query(
      'SELECT nickname, old_nicknames FROM users WHERE id = $1',
      [userId]
    );

    let oldNicknames = current.rows[0]?.old_nicknames || [];
    
    // Если ник меняется — добавляем старый в историю
    if (nickname && nickname !== current.rows[0]?.nickname) {
      oldNicknames = [...oldNicknames, current.rows[0]?.nickname || ''];
    }

    const result = await query(
      `UPDATE users 
       SET nickname = COALESCE($1, nickname),
           avatar_url = COALESCE($2, avatar_url),
           bio = COALESCE($3, bio),
           location = COALESCE($4, location),
           website = COALESCE($5, website),
           old_nicknames = $6
       WHERE id = $7
       RETURNING id, email, name, nickname, avatar_url, last_seen, 
                 email_verified, bio, location, website, old_nicknames, created_at`,
      [nickname, avatar_url, bio, location, website, oldNicknames, userId]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Update Error:', error);
    return NextResponse.json({ error: 'Error updating profile' }, { status: 500 });
  }
}