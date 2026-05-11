import mysql from "mysql2/promise";

const url = process.env.DATABASE_URL || "mysql://root@localhost:3306/gold_pe_cash";

const pool = mysql.createPool({
  uri: url,
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
});

export default pool;
