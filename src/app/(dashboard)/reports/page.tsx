import { auth } from "@/auth";
import { 
  getDashboardStats, 
  getDailyRevenue, 
  getWeeklyRevenue, 
  getMonthlyRevenue, 
  getAllTransactions, 
  getBranches 
} from "@/lib/data";
import ReportsClient from "@/components/dashboard/ReportsClient";

export default async function ReportsPage() {
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  const userBranchId = (session?.user as any)?.branchId;
  const filterBranchId = userRole === "SUPER_ADMIN" ? undefined : userBranchId;

  // Retrieve data in parallel
  const [
    stats,
    dailyRevenue,
    weeklyRevenue,
    monthlyRevenue,
    transactions,
    branches
  ] = await Promise.all([
    getDashboardStats(filterBranchId),
    getDailyRevenue(filterBranchId),
    getWeeklyRevenue(filterBranchId),
    getMonthlyRevenue(filterBranchId),
    getAllTransactions(filterBranchId),
    getBranches()
  ]);

  return (
    <ReportsClient 
      stats={stats}
      dailyRevenue={dailyRevenue}
      weeklyRevenue={weeklyRevenue}
      monthlyRevenue={monthlyRevenue}
      transactions={transactions}
      branches={branches}
      userRole={userRole}
    />
  );
}
