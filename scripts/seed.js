const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

const url = process.env.DATABASE_URL || "mysql://root@localhost:3306/gold_pe_cash";

async function main() {
  const connection = await mysql.createConnection(url);
  console.log("Connected to MySQL via mysql2");

  try {
    console.log("Seeding Branch...");
    const [branches] = await connection.query("SELECT id FROM Branch WHERE code = 'MAIN001'");
    let branchId;
    
    if ((branches).length === 0) {
      await connection.query(
        "INSERT INTO Branch (id, name, code, address, city, state, pincode, managerName, phone, status, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(3))",
        ["branch-id-1", "Main Branch", "MAIN001", "123 Gold Street", "Mumbai", "Maharashtra", "400001", "Super Admin", "9999999999", "ACTIVE"]
      );
      branchId = "branch-id-1";
      console.log("Created Main Branch");
    } else {
      branchId = branches[0].id;
      console.log("Main Branch already exists");
    }

    console.log("Seeding Super Admin...");
    const [users] = await connection.query("SELECT id FROM User WHERE email = 'admin@goldpecash.com'");
    if ((users).length === 0) {
      await connection.query(
        "INSERT INTO User (id, name, email, password, role, branchId, status, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(3))",
        ["admin-id-1", "Super Admin", "admin@goldpecash.com", "password123", "SUPER_ADMIN", branchId, "ACTIVE"]
      );
      console.log("Created Super Admin");
    } else {
      console.log("Super Admin already exists");
    }

    console.log("Seed data created successfully");
  } catch (err) {
    console.error("Error during seeding:", err);
  } finally {
    await connection.end();
  }
}

main();
