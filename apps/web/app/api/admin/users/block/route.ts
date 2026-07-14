// apps/web/app/api/admin/users/block/route.ts

import { query } from '@/lib/db/client';
import { NextRequest, NextResponse } from 'next/server';
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

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId, block } = await request.json();

  try {
    await query(
      'UPDATE users SET is_blocked = $1 WHERE id = $2',
      [block, userId]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Block error:', error);
    return NextResponse.json({ error: 'Error updating user' }, { status: 500 });
  }
}