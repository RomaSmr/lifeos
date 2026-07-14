// apps/web/app/api/workouts/route.ts

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

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await query(
      'SELECT * FROM workouts WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { day_of_week, motivation, workout_plan, nutrition_calories, nutrition_foods } = await request.json();

  try {
    // Проверяем, есть ли уже запись на этот день
    const existing = await query(
      'SELECT id FROM workouts WHERE user_id = $1 AND day_of_week = $2',
      [userId, day_of_week]
    );

    if (existing.rows.length > 0) {
      // Обновляем существующую
      const result = await query(
        `UPDATE workouts 
         SET motivation = $1, workout_plan = $2, nutrition_calories = $3, nutrition_foods = $4, updated_at = NOW()
         WHERE user_id = $5 AND day_of_week = $6 RETURNING *`,
        [motivation, workout_plan, nutrition_calories, nutrition_foods, userId, day_of_week]
      );
      return NextResponse.json(result.rows[0]);
    } else {
      // Создаём новую
      const result = await query(
        `INSERT INTO workouts (user_id, day_of_week, motivation, workout_plan, nutrition_calories, nutrition_foods)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [userId, day_of_week, motivation, workout_plan, nutrition_calories, nutrition_foods]
      );
      return NextResponse.json(result.rows[0]);
    }
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  try {
    await query('DELETE FROM workouts WHERE id = $1 AND user_id = $2', [id, userId]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}