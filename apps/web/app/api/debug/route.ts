import { query } from '@/lib/db/client';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. Проверка текущей схемы
    const schema = await query('SELECT current_schema();');
    
    // 2. Проверка всех таблиц в public
    const tables = await query(`
      SELECT table_name, table_schema 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    // 3. Попытка SELECT из habits с явной схемой
    let habitsTest = null;
    try {
      habitsTest = await query('SELECT * FROM public.habits LIMIT 1');
    } catch (err: any) {
      habitsTest = { error: err.message };
    }
    
    // 4. Попытка SELECT из habit_logs с явной схемой
    let habitLogsTest = null;
    try {
      habitLogsTest = await query('SELECT * FROM public.habit_logs LIMIT 1');
    } catch (err: any) {
      habitLogsTest = { error: err.message };
    }
    
    // 5. Проверка search_path
    const searchPath = await query('SHOW search_path;');
    
    return NextResponse.json({
      success: true,
      schema: schema.rows[0],
      tables: tables.rows,
      searchPath: searchPath.rows[0],
      habitsTest: habitsTest,
      habitLogsTest: habitLogsTest,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
      stack: err.stack
    }, { status: 500 });
  }
}