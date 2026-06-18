const mysql = require('mysql2/promise');
const dotenv = require("dotenv");
dotenv.config();
const url = process.env.DATABASE_URL || "mysql://root@localhost:3306/gold_pe_cash";

async function run() {
  const connection = await mysql.createConnection(url);
  try {
    await connection.query("ALTER TABLE `Transaction` ADD COLUMN paymentMethod VARCHAR(191) DEFAULT 'CASH' AFTER finalAmount");
    console.log("Transaction column (paymentMethod) added successfully");
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}
run();
