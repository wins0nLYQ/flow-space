import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

async function verify() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'tasks'
      AND column_name = 'display_order'
    `);

    console.log('display_order column schema:');
    console.log(JSON.stringify(result.rows, null, 2));

    // Also check a few tasks to see their display_order values
    const tasksResult = await pool.query(`
      SELECT id, title, status, display_order
      FROM tasks
      ORDER BY status, display_order
      LIMIT 10
    `);

    console.log('\nSample tasks with display_order:');
    console.log(JSON.stringify(tasksResult.rows, null, 2));
  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

verify();
