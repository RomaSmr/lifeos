// apps/web/app/api/auth/send-verification/route.ts

import { query } from '@/lib/db/client';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { sendVerificationEmail } from '@/lib/email';

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

function generateCode(): string {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

export async function POST(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { email } = await request.json();

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Введите корректный email' }, { status: 400 });
  }

  try {
    const existing = await query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [email, userId]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Email уже используется' }, { status: 400 });
    }

    const code = generateCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    await query(
      `UPDATE users 
       SET verification_code = $1, 
           verification_code_expires = $2,
           email = $3
       WHERE id = $4`,
      [code, expiresAt, email, userId]
    );

    try {
      await sendVerificationEmail(email, code);
      console.log(`✅ Код ${code} отправлен на ${email}`);
    } catch (emailError) {
      console.error('❌ Ошибка отправки email:', emailError);
      return NextResponse.json({ 
        error: 'Не удалось отправить письмо. Попробуйте позже.' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Код отправлен на почту'
    });
  } catch (error) {
    console.error('❌ Send verification error:', error);
    return NextResponse.json({ error: 'Ошибка отправки кода' }, { status: 500 });
  }
}