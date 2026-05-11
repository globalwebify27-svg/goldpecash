const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
dotenv.config();
const url = process.env.DATABASE_URL || "mysql://root@localhost:3306/gold_pe_cash";
async function run() {
  const connection = await mysql.createConnection(url);
  const tables = ["Customer", "Transaction", "GoldItem", "CustomerDocument"];
  for (const table of tables) {
    console.log(`--- ${table} ---`);
    const [cols] = await connection.query(`DESCRIBE ${table}`);
    console.log(JSON.stringify(cols, null, 2));
  }
  await connection.end();
}
run();
