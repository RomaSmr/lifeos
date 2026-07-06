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
      'SELECT * FROM habits WHERE user_id = $1 ORDER BY created_at ASC',
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

  const { title, description, emoji, goal, target_date, frequency } = await request.json();

  try {
    const result = await query(
      `INSERT INTO habits (user_id, title, description, emoji, goal, target_date, frequency)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [userId, title, description, emoji, goal, target_date, frequency]
    );
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, streak, longest_streak } = await request.json();

  try {
    const result = await query(
      `UPDATE habits SET streak = $1, longest_streak = $2 WHERE id = $3 AND user_id = $4 RETURNING *`,
      [streak, longest_streak, id, userId]
    );
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  try {
    await query('DELETE FROM habits WHERE id = $1 AND user_id = $2', [id, userId]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}