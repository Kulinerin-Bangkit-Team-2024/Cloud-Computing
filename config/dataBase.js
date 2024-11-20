const mysql = require("mysql");
require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});

db.connect((err) => {
  if (err) {
    console.error("Error: Unable to connect to the database.", err.message);
    process.exit(1);
  }
  console.log("Database connected successfully.");
});

module.exports = db;
