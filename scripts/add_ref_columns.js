const mysql = require('mysql2/promise');
const dotenv = require("dotenv");
dotenv.config();
const url = process.env.DATABASE_URL || "mysql://root@localhost:3306/gold_pe_cash";

async function run() {
  const connection = await mysql.createConnection(url);
  try {
    await connection.query("ALTER TABLE Customer ADD COLUMN refName VARCHAR(191) AFTER currentAddress");
    await connection.query("ALTER TABLE Customer ADD COLUMN refMobile VARCHAR(191) AFTER refName");
    await connection.query("ALTER TABLE Customer ADD COLUMN refRelation VARCHAR(191) AFTER refMobile");
    console.log("Reference columns (refName, refMobile, refRelation) added successfully");
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}
run();
