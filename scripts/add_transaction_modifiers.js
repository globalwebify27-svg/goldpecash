const mysql = require('mysql2/promise');
const dotenv = require("dotenv");
dotenv.config();
const url = process.env.DATABASE_URL || "mysql://root@localhost:3306/gold_pe_cash";

async function run() {
  const connection = await mysql.createConnection(url);
  try {
    // Check if columns exist and add them
    const [columns] = await connection.query("SHOW COLUMNS FROM `Transaction`");
    const colNames = columns.map(c => c.Field);

    if (!colNames.includes('paymentMethod')) {
      await connection.query("ALTER TABLE `Transaction` ADD COLUMN paymentMethod VARCHAR(191) DEFAULT 'CASH' AFTER finalAmount");
      console.log("Column paymentMethod added.");
    }
    if (!colNames.includes('lessPercent')) {
      await connection.query("ALTER TABLE `Transaction` ADD COLUMN lessPercent DOUBLE DEFAULT 0 AFTER paymentMethod");
      console.log("Column lessPercent added.");
    }
    if (!colNames.includes('addAmount')) {
      await connection.query("ALTER TABLE `Transaction` ADD COLUMN addAmount DOUBLE DEFAULT 0 AFTER lessPercent");
      console.log("Column addAmount added.");
    }
    console.log("Database schema synchronized successfully.");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await connection.end();
  }
}
run();
