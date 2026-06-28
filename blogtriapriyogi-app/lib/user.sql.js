const db = require('./db');

async function getUsers() {
  const res = await db.query('SELECT * FROM "User"');
  return res.rows;
}

module.exports = { getUsers };
