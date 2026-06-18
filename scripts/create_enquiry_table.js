const mysql = require('mysql2/promise');
const dotenv = require("dotenv");
dotenv.config();
const url = process.env.DATABASE_URL || "mysql://root@localhost:3306/gold_pe_cash";

async function run() {
  const connection = await mysql.createConnection(url);
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Enquiry (
        id VARCHAR(191) PRIMARY KEY,
        name VARCHAR(191) NOT NULL,
        mobile VARCHAR(191) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(191) DEFAULT 'PENDING',
        branchId VARCHAR(191) NOT NULL,
        createdBy VARCHAR(191) NOT NULL,
        createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
      )
    `);
    console.log("Enquiry table created successfully");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await connection.end();
  }
}
run();
