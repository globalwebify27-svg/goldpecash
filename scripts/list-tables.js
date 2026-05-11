const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
dotenv.config();
const url = process.env.DATABASE_URL || "mysql://root@localhost:3306/gold_pe_cash";
async function run() {
  const connection = await mysql.createConnection(url);
  const [tables] = await connection.query("SHOW TABLES");
  console.log(JSON.stringify(tables, null, 2));
  await connection.end();
}
run();
