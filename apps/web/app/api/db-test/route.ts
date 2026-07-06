import { query } from '@/lib/db/client';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const version = await query('SELECT version();');
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    const habits = await query('SELECT COUNT(*) FROM habits;');
    
    return NextResponse.json({
      success: true,
      version: version.rows[0].version,
      tables: tables.rows.map(r => r.table_name),
      habitsCount: parseInt(habits.rows[0].count),
      database_url: process.env.DATABASE_URL ? '✅ set' : '❌ not set',
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      database_url: process.env.DATABASE_URL ? '✅ set' : '❌ not set',
    }, { status: 500 });
  }
}