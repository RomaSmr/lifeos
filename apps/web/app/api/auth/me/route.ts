// apps/web/app/api/auth/me/route.ts

import { query } from '@/lib/db/client';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    // 🔥 Добавляем новые поля
    const result = await query(
      `SELECT id, email, name, nickname, avatar_url, last_seen, email_verified, 
              bio, location, website, old_nicknames, created_at 
       FROM users WHERE id = $1`,
      [decoded.userId]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Обновляем last_seen
    await query(
      `UPDATE users SET last_seen = NOW() WHERE id = $1`,
      [decoded.userId]
    );
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Auth Error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}