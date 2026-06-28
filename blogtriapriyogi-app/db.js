const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function test() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('CONNECTED:', res.rows[0]);
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    process.exit();
  }
}

test();
