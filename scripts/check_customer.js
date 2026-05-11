const mysql = require('mysql2/promise');
const url = process.env.DATABASE_URL || "mysql://root@localhost:3306/gold_pe_cash";

async function check() {
  const connection = await mysql.createConnection(url);
  try {
    const [customers] = await connection.query("DESCRIBE Customer");
    console.log("Customer table:", customers);
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}
check();
