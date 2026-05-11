const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

const url = process.env.DATABASE_URL || "mysql://root@localhost:3306/gold_pe_cash";

async function testConnection() {
  console.log("Testing database connection...");
  console.log("URL:", url);

  try {
    const connection = await mysql.createConnection(url);
    console.log("✅ Success! Database is connected.");
    
    const [rows] = await connection.query("SELECT DATABASE() as db, VERSION() as version");
    console.log("Database Name:", rows[0].db);
    console.log("MySQL Version:", rows[0].version);

    const [tables] = await connection.query("SHOW TABLES");
    console.log("Found Tables:", tables.length);

    await connection.end();
  } catch (err) {
    console.error("❌ Connection Failed!");
    console.error("Error Message:", err.message);
    process.exit(1);
  }
}

testConnection();
