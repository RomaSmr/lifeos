import { query } from '@/lib/db/client';
import { NextResponse } from 'next/server';
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

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await query(
      'SELECT * FROM habit_logs WHERE user_id = $1 ORDER BY completed_at DESC',
      [userId]
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { habit_id } = await request.json();

  try {
    const result = await query(
      `INSERT INTO habit_logs (habit_id, user_id, completed_at)
       VALUES ($1, $2, NOW()) RETURNING *`,
      [habit_id, userId]
    );
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}