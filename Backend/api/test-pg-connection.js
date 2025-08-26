import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT NOW()');
    console.log('Conexión exitosa:', res.rows[0]);
    client.release();
    process.exit(0);
  } catch (err) {
    console.error('Error de conexión:', err);
    process.exit(1);
  }
}

testConnection();
