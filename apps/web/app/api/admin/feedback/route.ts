// apps/web/app/api/admin/feedback/route.ts

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

// GET — получить все тикеты
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await query(
      `SELECT f.*, u.nickname, u.email, u.avatar_url
       FROM feedback f
       JOIN users u ON f.user_id = u.id
       ORDER BY 
         CASE f.status 
           WHEN 'new' THEN 1 
           WHEN 'in_progress' THEN 2 
           WHEN 'resolved' THEN 3 
           WHEN 'closed' THEN 4 
         END,
         f.created_at DESC`
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// PATCH — ответить на тикет
export async function PATCH(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, response, status } = await request.json();

  try {
    const result = await query(
      `UPDATE feedback 
       SET admin_response = $1, status = $2, responded_at = NOW(), updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [response, status || 'resolved', id]
    );
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}