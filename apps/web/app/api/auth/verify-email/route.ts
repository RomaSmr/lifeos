// apps/web/app/api/auth/verify-email/route.ts

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

export async function POST(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { code } = await request.json();

  if (!code || code.length !== 5) {
    return NextResponse.json({ error: 'Введите 5-значный код' }, { status: 400 });
  }

  try {
    const result = await query(
      `SELECT verification_code, verification_code_expires 
       FROM users 
       WHERE id = $1`,
      [userId]
    );

    const user = result.rows[0];

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    if (!user.verification_code) {
      return NextResponse.json({ error: 'Код не был отправлен' }, { status: 400 });
    }

    const expiresAt = new Date(user.verification_code_expires);
    if (expiresAt < new Date()) {
      return NextResponse.json({ error: 'Код истёк. Запросите новый.' }, { status: 400 });
    }

    if (user.verification_code !== code) {
      return NextResponse.json({ error: 'Неверный код' }, { status: 400 });
    }

    await query(
      `UPDATE users 
       SET email_verified = TRUE, 
           verification_code = NULL,
           verification_code_expires = NULL
       WHERE id = $1`,
      [userId]
    );

    const updated = await query(
      `SELECT id, email, name, nickname, avatar_url, last_seen, email_verified,
              bio, location, website, old_nicknames, created_at
       FROM users WHERE id = $1`,
      [userId]
    );

    return NextResponse.json({ 
      success: true, 
      message: '✅ Email подтверждён!',
      user: updated.rows[0]
    });
  } catch (error) {
    console.error('❌ Verify email error:', error);
    return NextResponse.json({ error: 'Ошибка подтверждения' }, { status: 500 });
  }
}