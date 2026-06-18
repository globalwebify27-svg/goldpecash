const mysql = require('mysql2/promise');
const dotenv = require("dotenv");
dotenv.config();
const url = process.env.DATABASE_URL || "mysql://root@localhost:3306/gold_pe_cash";

async function run() {
  const connection = await mysql.createConnection(url);
  try {
    await connection.query("ALTER TABLE GoldItem ADD COLUMN lessPercent DOUBLE DEFAULT 0 AFTER ratePerGram");
    await connection.query("ALTER TABLE GoldItem ADD COLUMN addAmount DOUBLE DEFAULT 0 AFTER lessPercent");
    console.log("GoldItem columns (lessPercent, addAmount) added successfully");
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}
run();
