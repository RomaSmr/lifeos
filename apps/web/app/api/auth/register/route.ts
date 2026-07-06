import { query } from '@/lib/db/client';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const { email, password, name } = await request.json();

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (email, password, name)
       VALUES ($1, $2, $3) RETURNING id, email, name`,
      [email, hashedPassword, name || '']
    );

    const user = result.rows[0];

    // Сразу логиним после регистрации
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return NextResponse.json({ 
      success: true, 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name || user.email 
      } 
    });
  } catch (error: any) {
    console.error('Registration Error:', error);
    if (error.constraint === 'users_email_key') {
      return NextResponse.json({ error: 'Email уже существует' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Ошибка регистрации' }, { status: 500 });
  }
}