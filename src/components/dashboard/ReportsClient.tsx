"use client";

import { useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Calendar, 
  DollarSign, 
  Scale, 
  Users, 
  CheckCircle,
  Clock,
  ArrowRight,
  Filter
} from "lucide-react";

interface ReportsClientProps {
  stats: {
    totalCustomers: number;
    customerGrowth: string;
    totalWeight: string;
    weightGrowth: string;
    totalPayout: string;
    payoutGrowth: string;
  };
  dailyRevenue: any[];
  weeklyRevenue: any[];
  monthlyRevenue: any[];
  transactions: any[];
  branches: any[];
  userRole: string;
}

export default function ReportsClient({
  stats,
  dailyRevenue,
  weeklyRevenue,
  monthlyRevenue,
  transactions,
  branches,
  userRole
}: ReportsClientProps) {
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly">("daily");
  const [selectedBranch, setSelectedBranch] = useState("ALL");

  // Get active revenue data based on timeframe
  const revenueData = timeframe === "daily" 
    ? dailyRevenue 
    : timeframe === "weekly" 
      ? weeklyRevenue 
      : monthlyRevenue;

  // Filter transactions by branch if selected (for SUPER_ADMIN)
  const filteredTxns = transactions.filter(tx => 
    selectedBranch === "ALL" || tx.branchId === selectedBranch
  );

  // Calculate totals from filtered transactions
  const filteredTotalPayout = filteredTxns
    .filter(tx => tx.status === "COMPLETED")
    .reduce((sum, tx) => sum + (parseFloat(tx.finalAmount) || 0), 0);
  
  const filteredTotalWeight = filteredTxns
    .filter(tx => tx.status === "COMPLETED")
    .reduce((sum, tx) => sum + (parseFloat(tx.totalWeight) || 0), 0);

  const filteredTotalTxns = filteredTxns.length;
  
  const completedTxns = filteredTxns.filter(tx => tx.status === "COMPLETED").length;
  const completionRate = filteredTotalTxns > 0 ? ((completedTxns / filteredTotalTxns) * 100).toFixed(0) : "0";

  // Generate CSV Report
  const handleExportCSV = () => {
    const headers = ["Transaction Number", "Customer Name", "Aadhaar Number", "Weight (g)", "Amount (INR)", "Status", "Date", "Branch"];
    const csvContent = [
      headers.join(","),
      ...filteredTxns.map(tx => {
        const branchName = branches.find(b => b.id === tx.branchId)?.name || "Main Branch";
        return [
          `"${String(tx.transactionNumber || '').replace(/"/g, '""')}"`,
          `"${String(tx.customerName || '').replace(/"/g, '""')}"`,
          `"${String(tx.aadhaarNumber || '').replace(/"/g, '""')}"`,
          `"${tx.totalWeight}"`,
          `"${tx.finalAmount}"`,
          `"${tx.status}"`,
          `"${new Date(tx.createdAt).toLocaleDateString('en-IN')}"`,
          `"${branchName}"`
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `reports_export_${selectedBranch.toLowerCase()}_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Find max value for SVG chart scaling
  const maxAmount = Math.max(...revenueData.map(d => parseFloat(d.amount) || 0), 1000);
  const chartHeight = 200;
  const chartWidth = 500;
  const padding = 30;

  // Generate SVG Points for Line/Area chart
  const points = revenueData.map((d, index) => {
    const x = padding + (index * (chartWidth - 2 * padding)) / Math.max(revenueData.length - 1, 1);
    const amountVal = parseFloat(d.amount) || 0;
    const y = chartHeight - padding - (amountVal * (chartHeight - 2 * padding)) / maxAmount;
    return { x, y, label: d.label, amount: amountVal };
  });

  const pathD = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ")
    : "";

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`
    : "";

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics & Reports</h1>
          <p className="text-slate-500 dark:text-slate-400">View real-time branch performance, payouts, and download transaction logs.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          {userRole === "SUPER_ADMIN" && (
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-sm">
              <Filter className="w-4 h-4 text-slate-400" />
              <select 
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="bg-transparent border-none outline-none font-semibold text-slate-700 dark:text-slate-300 pr-4"
              >
                <option value="ALL">All Branches</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}

          <button 
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center gap-2 hover:brightness-110 shadow-md transition-all"
          >
            <Download className="w-4 h-4" /> Export Report (CSV)
          </button>
        </div>
      </div>

      {/* Scoped Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Payout */}
        <div className="premium-card">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-2xl bg-green-500/10 text-green-500">
              <DollarSign className="w-6 h-6" />
            </div>
            {parseFloat(stats.payoutGrowth) >= 0 ? (
              <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-950/20 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +{stats.payoutGrowth}%
              </span>
            ) : (
              <span className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/20 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" /> {stats.payoutGrowth}%
              </span>
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Total Scoped Payout</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            ₹{(filteredTotalPayout).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </h3>
        </div>

        {/* Gold Weight */}
        <div className="premium-card">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
              <Scale className="w-6 h-6" />
            </div>
            {parseFloat(stats.weightGrowth) >= 0 ? (
              <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-950/20 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +{stats.weightGrowth}%
              </span>
            ) : (
              <span className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/20 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" /> {stats.weightGrowth}%
              </span>
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Total Scoped Weight</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {(filteredTotalWeight).toFixed(2)}g
          </h3>
        </div>

        {/* Total Transactions */}
        <div className="premium-card">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
              <CheckCircle className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
              Active Count
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Transactions Count</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {filteredTotalTxns}
          </h3>
        </div>

        {/* Completion Rate */}
        <div className="premium-card">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 px-2.5 py-1 rounded-lg">
              Success Rate
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Completion Rate</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {completionRate}%
          </h3>
        </div>
      </div>

      {/* Revenue Graph / Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Visual Graph Card */}
        <div className="premium-card lg:col-span-2 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">Revenue History</h3>
              <p className="text-xs text-slate-400">Total payouts made to customers over time.</p>
            </div>
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg text-xs font-bold">
              {(["daily", "weekly", "monthly"] as const).map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1.5 rounded-md capitalize transition-all ${
                    timeframe === tf 
                      ? "bg-white dark:bg-slate-900 text-primary shadow-sm" 
                      : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Custom SVG Line Chart */}
          <div className="relative h-64 w-full flex items-center justify-center">
            {revenueData.length > 0 ? (
              <svg 
                viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
                className="w-full h-full text-primary"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary, #d97706)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--color-primary, #d97706)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Y Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                  const y = padding + ratio * (chartHeight - 2 * padding);
                  return (
                    <line 
                      key={i} 
                      x1={padding} 
                      y1={y} 
                      x2={chartWidth - padding} 
                      y2={y} 
                      stroke="currentColor" 
                      strokeOpacity="0.07" 
                      strokeDasharray="4"
                    />
                  );
                })}

                {/* Area under the line */}
                {areaD && <path d={areaD} fill="url(#chartGrad)" />}

                {/* Path line */}
                {pathD && (
                  <path 
                    d={pathD} 
                    fill="none" 
                    stroke="var(--color-primary, #d97706)" 
                    strokeWidth="3" 
                    strokeLinecap="round"
                  />
                )}

                {/* Data point markers */}
                {points.map((p, idx) => (
                  <g key={idx}>
                    <circle 
                      cx={p.x} 
                      cy={p.y} 
                      r="4" 
                      fill="var(--color-primary, #d97706)"
                      stroke="white"
                      strokeWidth="2"
                    />
                    {/* Hover text label */}
                    <text 
                      x={p.x} 
                      y={p.y - 10} 
                      textAnchor="middle" 
                      className="fill-slate-700 dark:fill-slate-300 font-bold text-[8px]"
                    >
                      ₹{(p.amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </text>
                  </g>
                ))}

                {/* X Axis Labels */}
                {points.map((p, idx) => (
                  <text 
                    key={idx} 
                    x={p.x} 
                    y={chartHeight - 10} 
                    textAnchor="middle" 
                    className="fill-slate-400 font-bold text-[8px]"
                  >
                    {p.label}
                  </text>
                ))}
              </svg>
            ) : (
              <p className="text-slate-500 italic">No revenue recorded in this period.</p>
            )}
          </div>
        </div>

        {/* Branch Performance / Details */}
        <div className="premium-card flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">Branch Breakdown</h3>
            <p className="text-xs text-slate-400 mb-6">Transactions and weights distributed by branch location.</p>
          </div>

          <div className="space-y-5 flex-1 overflow-y-auto max-h-60 custom-scrollbar pr-1">
            {branches.map(branch => {
              const branchTxns = transactions.filter(t => t.branchId === branch.id);
              const branchPayout = branchTxns
                .filter(t => t.status === "COMPLETED")
                .reduce((s, t) => s + (parseFloat(t.finalAmount) || 0), 0);
              const branchWeight = branchTxns
                .filter(t => t.status === "COMPLETED")
                .reduce((s, t) => s + (parseFloat(t.totalWeight) || 0), 0);

              const percent = filteredTotalPayout > 0 
                ? ((branchPayout / filteredTotalPayout) * 100).toFixed(0) 
                : "0";

              return (
                <div key={branch.id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{branch.name}</span>
                    <span className="font-semibold text-slate-500">{percent}% ({branchTxns.length} txn)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full transition-all duration-700" 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                    <span>₹{branchPayout.toLocaleString('en-IN')}</span>
                    <span>{branchWeight.toFixed(1)}g</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scoped Transaction Table Logs */}
      <div className="premium-card !p-0">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Detailed Report Logs</h3>
            <p className="text-xs text-slate-400">All filtered transaction items with customer and payout details.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Weight</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {filteredTxns.length > 0 ? filteredTxns.slice(0, 10).map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all">
                  <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">
                    {tx.transactionNumber}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{tx.customerName}</p>
                      <p className="text-xs text-slate-400 font-mono">Aadhaar: XXXX-XXXX-{tx.aadhaarNumber?.slice(-4)}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{tx.totalWeight}g</td>
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                    ₹{(tx.finalAmount || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase ${
                      tx.status === "COMPLETED" ? "bg-green-100 text-green-600" :
                      tx.status === "PENDING" ? "bg-amber-100 text-amber-600" :
                      "bg-red-100 text-red-600"
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(tx.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredTxns.length > 10 && (
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Showing top 10 logs. Export full report as CSV to view all {filteredTxns.length} records.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
