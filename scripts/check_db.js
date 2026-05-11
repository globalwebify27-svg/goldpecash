const mysql = require('mysql2/promise');
const url = process.env.DATABASE_URL || "mysql://root@localhost:3306/gold_pe_cash";

async function check() {
  const connection = await mysql.createConnection(url);
  try {
    const [branches] = await connection.query("DESCRIBE Branch");
    console.log("Branch table:", branches);
    const [users] = await connection.query("DESCRIBE User");
    console.log("User table:", users);
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}
check();
