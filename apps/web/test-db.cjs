const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/lifeos',
});

async function test() {
  try {
    console.log('🔍 Проверяем подключение к БД...');
    
    // Проверяем таблицы
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('📊 Таблицы в БД:');
    console.log(result.rows.map(r => r.table_name));
    
    // Проверяем habits
    try {
      const habits = await pool.query('SELECT * FROM public.habits LIMIT 1');
      console.log('✅ habits доступны');
    } catch (e) {
      console.log('❌ habits НЕ доступны:', e.message);
    }
    
    // Проверяем habit_logs
    try {
      const habitLogs = await pool.query('SELECT * FROM public.habit_logs LIMIT 1');
      console.log('✅ habit_logs доступны');
    } catch (e) {
      console.log('❌ habit_logs НЕ доступны:', e.message);
    }
    
    // Проверяем goals
    try {
      const goals = await pool.query('SELECT * FROM public.goals LIMIT 1');
      console.log('✅ goals доступны');
    } catch (e) {
      console.log('❌ goals НЕ доступны:', e.message);
    }
    
    console.log('✅ Тест завершён!');
  } catch (error) {
    console.error('❌ Ошибка подключения:', error.message);
  }
  
  await pool.end();
}

test();