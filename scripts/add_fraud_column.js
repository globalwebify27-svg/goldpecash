const mysql = require('mysql2/promise');
const url = process.env.DATABASE_URL || "mysql://root@localhost:3306/gold_pe_cash";

async function run() {
  const connection = await mysql.createConnection(url);
  try {
    await connection.query("ALTER TABLE Customer ADD COLUMN isFraud TINYINT(1) DEFAULT 0");
    await connection.query("ALTER TABLE Customer ADD COLUMN fraudReason TEXT AFTER isFraud");
    console.log("Column isFraud and fraudReason added successfully");
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}
run();
