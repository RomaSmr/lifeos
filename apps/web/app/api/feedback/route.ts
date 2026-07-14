// apps/web/app/api/feedback/route.ts

import { query } from '@/lib/db/client';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

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

// GET — получить свои тикеты
export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await query(
      `SELECT id, title, severity, description, screenshot_url, status, admin_response, 
              created_at, updated_at
       FROM feedback 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// POST — создать тикет
export async function POST(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const title = formData.get('title') as string;
  const severity = formData.get('severity') as string;
  const description = formData.get('description') as string;
  const screenshot = formData.get('screenshot') as File | null;

  if (!title || !description) {
    return NextResponse.json({ error: 'Заполните все обязательные поля' }, { status: 400 });
  }

  let screenshot_url: string | null = null;

  // Сохраняем скриншот, если есть
  if (screenshot) {
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'feedback');
      await mkdir(uploadDir, { recursive: true });

      const ext = path.extname(screenshot.name);
      const filename = `${userId}_${Date.now()}${ext}`;
      const filepath = path.join(uploadDir, filename);

      const bytes = await screenshot.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);

      screenshot_url = `/uploads/feedback/${filename}`;
    } catch (error) {
      console.error('Ошибка сохранения скриншота:', error);
    }
  }

  try {
    const result = await query(
      `INSERT INTO feedback (user_id, title, severity, description, screenshot_url)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, title, severity, description, screenshot_url]
    );
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}