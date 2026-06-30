import db from "./db";

export async function getDashboardStats(branchId?: string) {
  try {
    const customerWhere = branchId ? "WHERE branchId = ?" : "";
    const transactionWhere = branchId ? "AND branchId = ?" : "";
    const params = branchId ? [branchId] : [];

    // Total Customers
    const [rows1]: any = await db.query(`SELECT COUNT(*) as total FROM Customer ${customerWhere}`, params);
    const totalCustomers = rows1[0]?.total || 0;
    
    // Customers 24h ago
    const [rows1Prev]: any = await db.query(`SELECT COUNT(*) as total FROM Customer ${customerWhere ? customerWhere + " AND " : "WHERE "} createdAt < DATE_SUB(NOW(), INTERVAL 24 HOUR)`, params);
    const prevCustomers = rows1Prev[0]?.total || 0;
    const customerGrowth = prevCustomers === 0 ? (totalCustomers > 0 ? 100 : 0) : ((totalCustomers - prevCustomers) / prevCustomers) * 100;

    // Total Weight
    const [rows2]: any = await db.query(`SELECT SUM(totalWeight) as total FROM Transaction WHERE status = 'COMPLETED' ${transactionWhere}`, params);
    const totalWeight = rows2[0]?.total || 0;
    
    // Weight 24h ago
    const [rows2Prev]: any = await db.query(`SELECT SUM(totalWeight) as total FROM Transaction WHERE status = 'COMPLETED' AND createdAt < DATE_SUB(NOW(), INTERVAL 24 HOUR) ${transactionWhere}`, params);
    const prevWeight = rows2Prev[0]?.total || 0;
    const weightGrowth = prevWeight === 0 ? (totalWeight > 0 ? 100 : 0) : ((totalWeight - prevWeight) / prevWeight) * 100;

    // Total Payout
    const [rows3]: any = await db.query(`SELECT SUM(finalAmount) as total FROM Transaction WHERE status = 'COMPLETED' ${transactionWhere}`, params);
    const totalPayout = rows3[0]?.total || 0;
    
    // Payout 24h ago
    const [rows3Prev]: any = await db.query(`SELECT SUM(finalAmount) as total FROM Transaction WHERE status = 'COMPLETED' AND createdAt < DATE_SUB(NOW(), INTERVAL 24 HOUR) ${transactionWhere}`, params);
    const prevPayout = rows3Prev[0]?.total || 0;
    const payoutGrowth = prevPayout === 0 ? (totalPayout > 0 ? 100 : 0) : ((totalPayout - prevPayout) / prevPayout) * 100;

    return {
      totalCustomers: totalCustomers || 0,
      customerGrowth: customerGrowth.toFixed(1),
      totalWeight: (totalWeight || 0).toFixed(2),
      weightGrowth: weightGrowth.toFixed(1),
      totalPayout: (totalPayout || 0).toLocaleString('en-IN', {
        maximumFractionDigits: 0,
        style: 'currency',
        currency: 'INR',
      }),
      payoutGrowth: payoutGrowth.toFixed(1),
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalCustomers: 0,
      customerGrowth: "0",
      totalWeight: "0.00",
      weightGrowth: "0",
      totalPayout: "₹0",
      payoutGrowth: "0",
    };
  }
}

export async function getRecentTransactions(branchId?: string) {
  try {
    const whereClause = branchId ? "WHERE c.branchId = ?" : "";
    const params = branchId ? [branchId] : [];
    const [rows] = await db.query(`
      SELECT 
        t.*, 
        c.fullName as customerName, 
        c.customerCode,
        c.aadhaarNumber,
        c.mobile
      FROM Transaction t
      JOIN Customer c ON t.customerId = c.id
      ${whereClause}
      ORDER BY t.createdAt DESC
      LIMIT 5
    `, params);
    return rows as any[];
  } catch (error) {
    console.error("Error fetching recent transactions:", error);
    return [];
  }
}

export async function getCustomers(branchId?: string) {
  try {
    if (branchId) {
      const [rows] = await db.query(`
        SELECT c.*, 
               COALESCE(SUM(t.finalAmount), 0) as totalAmount,
               COUNT(t.id) as transactionCount,
               GROUP_CONCAT(DISTINCT t.paymentMethod SEPARATOR ', ') as paymentMethods
        FROM Customer c
        LEFT JOIN \`Transaction\` t ON c.id = t.customerId AND t.status = 'COMPLETED'
        WHERE c.branchId = ?
        GROUP BY c.id
        ORDER BY c.createdAt DESC
      `, [branchId]);
      return rows as any[];
    }
    
    const [rows] = await db.query(`
      SELECT c.*, 
             COALESCE(SUM(t.finalAmount), 0) as totalAmount,
             COUNT(t.id) as transactionCount,
             GROUP_CONCAT(DISTINCT t.paymentMethod SEPARATOR ', ') as paymentMethods
      FROM Customer c
      LEFT JOIN \`Transaction\` t ON c.id = t.customerId AND t.status = 'COMPLETED'
      GROUP BY c.id
      ORDER BY c.createdAt DESC
    `);
    return rows as any[];
  } catch (error) {
    console.error("Error fetching customers:", error);
    return [];
  }
}

export async function getUserById(id: string) {
  try {
    const [rows] = await db.query("SELECT * FROM User WHERE id = ?", [id]);
    return (rows as any[])[0] || null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export async function getBranchById(id: string) {
  try {
    const [rows] = await db.query("SELECT * FROM Branch WHERE id = ?", [id]);
    return (rows as any[])[0] || null;
  } catch (error) {
    console.error("Error fetching branch:", error);
    return null;
  }
}

export async function getBranches(branchId?: string) {
  try {
    const whereClause = branchId ? "WHERE id = ?" : "";
    const params = branchId ? [branchId] : [];
    const [rows] = await db.query(`SELECT * FROM Branch ${whereClause} ORDER BY name ASC`, params);
    return rows as any[];
  } catch (error) {
    console.error("Error fetching branches:", error);
    return [];
  }
}

export async function getUsers(branchId?: string) {
  try {
    const whereClause = branchId ? "WHERE u.branchId = ?" : "";
    const params = branchId ? [branchId] : [];
    const [rows] = await db.query(`
      SELECT u.*, b.name as branchName 
      FROM User u 
      LEFT JOIN Branch b ON u.branchId = b.id 
      ${whereClause}
      ORDER BY u.name ASC
    `, params);
    return rows as any[];
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export async function getAllTransactions(branchId?: string) {
  try {
    const whereClause = branchId ? "WHERE c.branchId = ?" : "";
    const params = branchId ? [branchId] : [];
    const [rows] = await db.query(`
      SELECT 
        t.*, 
        c.fullName as customerName, 
        c.customerCode,
        c.aadhaarNumber,
        c.mobile,
        (
          SELECT GROUP_CONCAT(CONCAT(gi.ornamentName, ' (', gi.goldType, ')') SEPARATOR ', ')
          FROM GoldItem gi
          WHERE gi.transactionId = t.id
        ) as ornaments,
        (
          SELECT GROUP_CONCAT(CONCAT(gi.purity, '%') SEPARATOR ', ')
          FROM GoldItem gi
          WHERE gi.transactionId = t.id
        ) as purities
      FROM Transaction t
      JOIN Customer c ON t.customerId = c.id
      ${whereClause}
      ORDER BY t.createdAt DESC
    `, params);
    return rows as any[];
  } catch (error) {
    console.error("Error fetching all transactions:", error);
    return [];
  }
}
export async function getDailyRevenue(branchId?: string) {
  try {
    const whereClause = branchId ? "AND branchId = ?" : "";
    const params = branchId ? [branchId] : [];
    const [rows] = await db.query(`
      SELECT 
        DATE_FORMAT(createdAt, '%d %b') as label,
        SUM(finalAmount) as amount
      FROM \`Transaction\`
      WHERE status = 'COMPLETED'
      ${whereClause}
      AND createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(createdAt), label
      ORDER BY DATE(createdAt) ASC
    `, params);
    return rows as any[];
  } catch (error) {
    console.error("Error fetching daily revenue:", error);
    return [];
  }
}

export async function getWeeklyRevenue(branchId?: string) {
  try {
    const whereClause = branchId ? "AND branchId = ?" : "";
    const params = branchId ? [branchId] : [];
    const [rows] = await db.query(`
      SELECT 
        CONCAT('Week ', WEEK(createdAt)) as label,
        SUM(finalAmount) as amount
      FROM \`Transaction\`
      WHERE status = 'COMPLETED'
      ${whereClause}
      AND createdAt >= DATE_SUB(NOW(), INTERVAL 8 WEEK)
      GROUP BY WEEK(createdAt), label
      ORDER BY MIN(createdAt) ASC
    `, params);
    return rows as any[];
  } catch (error) {
    console.error("Error fetching weekly revenue:", error);
    return [];
  }
}

export async function getMonthlyRevenue(branchId?: string) {
  try {
    const whereClause = branchId ? "AND branchId = ?" : "";
    const params = branchId ? [branchId] : [];
    const [rows] = await db.query(`
      SELECT 
        DATE_FORMAT(createdAt, '%b') as label,
        SUM(finalAmount) as amount
      FROM \`Transaction\`
      WHERE status = 'COMPLETED'
      ${whereClause}
      AND createdAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(createdAt, '%Y-%m'), label
      ORDER BY DATE_FORMAT(createdAt, '%Y-%m') ASC
    `, params);
    return rows as any[];
  } catch (error) {
    console.error("Error fetching monthly revenue:", error);
    return [];
  }
}

export async function getEnquiries(branchId?: string) {
  try {
    const whereClause = branchId ? "WHERE branchId = ?" : "";
    const params = branchId ? [branchId] : [];
    const [rows] = await db.query(`SELECT * FROM Enquiry ${whereClause} ORDER BY createdAt DESC`, params);
    return rows as any[];
  } catch (error) {
    console.error("Error fetching enquiries:", error);
    return [];
  }
}
