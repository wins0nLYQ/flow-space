import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Database connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err: Error) => {
  console.error('❌ Unexpected database error:', err);
});

export const query = async <T = any>(text: string, params?: any[]): Promise<T[]> => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res.rows as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export const queryOne = async <T = any>(text: string, params?: any[]): Promise<T | null> => {
  const rows = await query<T>(text, params);
  return rows[0] || null;
};

export default pool;
