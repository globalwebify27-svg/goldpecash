import mysql from "mysql2/promise";

const url = process.env.DATABASE_URL || "mysql://root@localhost:3306/gold_pe_cash";

const globalForDb = globalThis as unknown as {
  connPool: mysql.Pool | undefined;
};

const pool = globalForDb.connPool ?? mysql.createPool({
  uri: url,
  connectionLimit: 5, // Reduced limit for serverless environment to prevent exhaustion
  waitForConnections: true,
  queueLimit: 0,
});

if (process.env.NODE_ENV !== "production") globalForDb.connPool = pool;

export default pool;

