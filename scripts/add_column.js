const mysql = require('mysql2/promise');
const url = process.env.DATABASE_URL || "mysql://root@localhost:3306/gold_pe_cash";

async function run() {
  const connection = await mysql.createConnection(url);
  try {
    await connection.query("ALTER TABLE Customer ADD COLUMN currentAddress VARCHAR(191) AFTER address");
    console.log("Column currentAddress added successfully");
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}
run();
