const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/postgres'
});

async function setup() {
  try {
    console.log('📦 Создаём базу lifeos...');
    await pool.query('CREATE DATABASE lifeos;');
    console.log('✅ База lifeos создана!');

    // Подключаемся к новой базе
    const dbPool = new Pool({
      connectionString: 'postgresql://postgres:postgres@localhost:5432/lifeos'
    });

    console.log('📦 Создаём таблицы...');
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        name TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        priority TEXT DEFAULT 'medium',
        status TEXT DEFAULT 'active',
        due_date TIMESTAMP WITH TIME ZONE,
        completed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        order_index INTEGER DEFAULT 0,
        goal_id UUID
      );
      -- (остальные таблицы аналогично, но для теста хватит и одной users)
    `);
    console.log('✅ Всё готово! Можешь запускать приложение.');
    
    await dbPool.end();
  } catch (err) {
    console.error('❌ Ошибка:', err.message);
  }
  await pool.end();
}

setup();