import { Pool } from 'pg';

// Принудительное создание нового подключения при каждом запросе
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  
  // Создаём НОВЫЙ pool при каждом запросе
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 1,
    idleTimeoutMillis: 0,
    connectionTimeoutMillis: 5000,
  });
  
  try {
    // Принудительно добавляем public. если её нет
    let sql = text;
    const tables = ['habits', 'habit_logs', 'goals', 'profiles', 'tasks', 'users'];
    for (const table of tables) {
      if (!sql.includes(`public.${table}`) && !sql.includes('information_schema')) {
        const regex = new RegExp(`\\b${table}\\b`, 'g');
        sql = sql.replace(regex, `public.${table}`);
      }
    }
    
    console.log('🔍 Выполняем запрос:', sql);
    const res = await pool.query(sql, params);
    const duration = Date.now() - start;
    console.log('✅ Выполнено за', duration, 'ms, строк:', res.rowCount);
    return res;
  } catch (error) {
    console.error('❌ Ошибка запроса:', error);
    throw error;
  } finally {
    await pool.end();
  }
}