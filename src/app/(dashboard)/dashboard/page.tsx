import { 
  Users, 
  Coins, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  CheckCircle2
} from "lucide-react";
import { auth } from "@/auth";
import { getDashboardStats, getRecentTransactions, getMonthlyRevenue, getDailyRevenue, getWeeklyRevenue } from "@/lib/data";
import RevenueChart from "@/components/dashboard/RevenueChart";

export default async function DashboardPage() {
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  const userBranchId = (session?.user as any)?.branchId;
  
  // Filter by branch if not Super Admin
  const filterBranchId = userRole === "SUPER_ADMIN" ? undefined : userBranchId;

  const statsData = await getDashboardStats(filterBranchId);
  const recentTransactions = await getRecentTransactions(filterBranchId);
  
  const [daily, weekly, monthly] = await Promise.all([
    getDailyRevenue(filterBranchId),
    getWeeklyRevenue(filterBranchId),
    getMonthlyRevenue(filterBranchId)
  ]);

  const revenueData = { daily, weekly, monthly };

  const stats = [
    { 
      name: "Total Customers", 
      value: statsData.totalCustomers.toString(), 
      change: `${parseFloat(statsData.customerGrowth) >= 0 ? '+' : ''}${statsData.customerGrowth}%`, 
      trendingUp: parseFloat(statsData.customerGrowth) >= 0, 
      icon: Users 
    },
    { 
      name: "Gold Purchased", 
      value: `${statsData.totalWeight} g`, 
      change: `${parseFloat(statsData.weightGrowth) >= 0 ? '+' : ''}${statsData.weightGrowth}%`, 
      trendingUp: parseFloat(statsData.weightGrowth) >= 0, 
      icon: Coins 
    },
    { 
      name: "Total Payout", 
      value: statsData.totalPayout, 
      change: `${parseFloat(statsData.payoutGrowth) >= 0 ? '+' : ''}${statsData.payoutGrowth}%`, 
      trendingUp: parseFloat(statsData.payoutGrowth) >= 0, 
      icon: TrendingUp 
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-slate-500 dark:text-slate-400">Welcome back, here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="premium-card relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
                stat.trendingUp ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
              }`}>
                {stat.trendingUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{stat.name}</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="premium-card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">Recent Transactions</h2>
            <button className="text-primary text-sm font-semibold hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {recentTransactions.length > 0 ? recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-bold text-slate-500">
                    {tx.customerName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{tx.customerName}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-tighter">{tx.transactionNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 dark:text-white">
                    ₹{(tx.finalAmount || 0).toLocaleString('en-IN')}
                  </p>
                  <p className={`text-xs font-bold flex items-center justify-end gap-1 ${
                    tx.status === 'COMPLETED' ? 'text-green-500' : tx.status === 'CANCELLED' ? 'text-red-500' : 'text-amber-500'
                  }`}>
                    {tx.status === 'COMPLETED' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {tx.status}
                  </p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-slate-500">No transactions found</div>
            )}
          </div>
        </div>

        <div className="premium-card overflow-hidden">
          <RevenueChart data={revenueData} />
        </div>
      </div>
    </div>
  );
}
