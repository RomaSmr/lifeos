const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/lifeos',
});

async function test() {
  console.log('🔍 Проверяем подключение к PostgreSQL...');
  console.log('📡 URL:', 'postgresql://postgres:postgres@localhost:5432/lifeos');
  
  try {
    const result = await pool.query('SELECT version();');
    console.log('✅ PostgreSQL версия:', result.rows[0].version);
    
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log('📊 Таблицы в БД:', tables.rows.map(r => r.table_name));
    
    const habits = await pool.query('SELECT COUNT(*) FROM habits;');
    console.log('📋 Привычек в БД:', habits.rows[0].count);
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
  
  await pool.end();
}

test();