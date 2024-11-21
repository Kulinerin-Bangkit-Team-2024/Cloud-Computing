const mysql = require("mysql2/promise");
require("dotenv").config();

const db = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});

const query = async (sql, params) => {
  const [rows] = await db.execute(sql, params);
  return rows;
};

module.exports = { query };
