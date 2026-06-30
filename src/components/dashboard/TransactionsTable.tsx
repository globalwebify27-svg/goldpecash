"use client";

import { useState } from "react";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Printer, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Pencil,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

interface TransactionsTableProps {
  transactions: any[];
  branches: any[];
  userRole: string;
  userBranchId?: string;
}

export default function TransactionsTable({ transactions, branches, userRole, userBranchId }: TransactionsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedBranchId, setSelectedBranchId] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Filter logic
  const filteredTransactions = transactions.filter((tx) => {
    // 1. Search Query
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      String(tx.transactionNumber || "").toLowerCase().includes(query) ||
      String(tx.customerName || "").toLowerCase().includes(query) ||
      String(tx.aadhaarNumber || "").includes(query);

    // 2. Status Filter
    const matchesStatus = statusFilter === "ALL" || tx.status === statusFilter;

    // 3. Branch Filter
    const matchesBranch = selectedBranchId === "ALL" || tx.branchId === selectedBranchId;

    // 4. Date Filter
    let matchesDate = true;
    if (tx.createdAt) {
      const createdAtDate = new Date(tx.createdAt);
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (createdAtDate < start) matchesDate = false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (createdAtDate > end) matchesDate = false;
      }
    }

    return matchesSearch && matchesStatus && matchesBranch && matchesDate;
  });

  const handleExportCSV = () => {
    const headers = ["Transaction Number", "Customer Name", "Branch", "Aadhaar Number", "Weight (g)", "Amount (INR)", "Status", "Date"];
    const csvContent = [
      headers.join(","),
      ...filteredTransactions.map(tx => [
        `"${String(tx.transactionNumber || '').replace(/"/g, '""')}"`,
        `"${String(tx.customerName || '').replace(/"/g, '""')}"`,
        `"${String(branches.find(b => b.id === tx.branchId)?.name || 'Unknown').replace(/"/g, '""')}"`,
        `"${String(tx.aadhaarNumber || '').replace(/"/g, '""')}"`,
        `"${tx.totalWeight}"`,
        `"${tx.finalAmount}"`,
        `"${tx.status}"`,
        `"${new Date(tx.createdAt).toLocaleDateString('en-IN')}"`
      ].join(","))
    ].join("\n");

    const filename = `transactions_export_${new Date().toISOString().slice(0,10)}.csv`;

    // Check if running inside Flutter Webview
    if (typeof window !== 'undefined' && (window as any).FlutterDownloadChannel) {
      const base64Data = btoa(unescape(encodeURIComponent(csvContent)));
      (window as any).FlutterDownloadChannel.postMessage(JSON.stringify({
        filename,
        base64Data
      }));
      return;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleWhatsAppShare = (tx: any) => {
    let phone = tx.mobile || "";
    phone = phone.replace(/\D/g, "");
    if (phone.length === 10) {
      phone = `91${phone}`;
    }

    const message = `Dear ${tx.customerName},

Thank you for transacting with GPC Ornaments (OPC) Private Limited.

*Transaction Number*: ${tx.transactionNumber}
*Total Weight*: ${tx.totalWeight}g
*Payout Amount*: ₹${(tx.finalAmount || 0).toLocaleString("en-IN")}
*Status*: ${tx.status}

You can view and print your digitally signed purchase agreement here:
${window.location.origin}/public/agreement?txnId=${tx.id}

Thank you for choosing Gold Pe Cash!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="premium-card !p-0 overflow-hidden">
      {/* Search and Filter Controls */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by Transaction ID, name, or Aadhaar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
          />
        </div>
        <div className="flex gap-2 items-center">
          <button 
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold text-sm flex items-center gap-2 hover:bg-slate-50 transition-all text-slate-700 dark:text-slate-300"
            title="Export CSV"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-xl border font-semibold text-sm flex items-center gap-2 transition-all ${
              showFilters || statusFilter !== "ALL" || selectedBranchId !== "ALL" || startDate || endDate
                ? "border-primary bg-primary/5 text-primary" 
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
            }`}
          >
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="px-6 pb-6 border-b border-slate-100 dark:border-slate-800 pt-4 bg-slate-50/50 dark:bg-slate-900/10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all text-slate-700 dark:text-slate-300"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          {userRole === "SUPER_ADMIN" ? (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Branch</label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all text-slate-700 dark:text-slate-300"
              >
                <option value="ALL">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Branch</label>
              <input
                type="text"
                disabled
                value={branches.find(b => b.id === userBranchId)?.name || "My Branch"}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none transition-all text-slate-500 cursor-not-allowed"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all text-slate-700 dark:text-slate-300"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all text-slate-700 dark:text-slate-300"
            />
          </div>
          {(statusFilter !== "ALL" || selectedBranchId !== "ALL" || startDate !== "" || endDate !== "") && (
            <div className="md:col-span-4 flex justify-end">
              <button
                onClick={() => {
                  setStatusFilter("ALL");
                  setSelectedBranchId("ALL");
                  setStartDate("");
                  setEndDate("");
                }}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4 p-4 bg-slate-50/50 dark:bg-slate-900/10">
        {filteredTransactions.length > 0 ? filteredTransactions.map((tx) => (
          <div key={tx.id} className="premium-card p-4 space-y-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-mono font-bold text-slate-900 dark:text-white text-xs">{tx.transactionNumber}</p>
                <p className="font-bold text-slate-900 dark:text-white mt-1">{tx.customerName}</p>
              </div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                tx.status === "COMPLETED" ? "bg-green-50 text-green-600 border-green-100" :
                tx.status === "PENDING" ? "bg-amber-50 text-amber-600 border-amber-100" :
                "bg-red-50 text-red-600 border-red-100"
              }`}>
                {tx.status}
              </div>
            </div>
            
            <div className="flex justify-between items-end">
              <div className="text-sm">
                <p className="text-slate-500">Weight: <span className="font-medium text-slate-900 dark:text-white">{tx.totalWeight}g</span></p>
                <p className="text-slate-500">Date: <span className="font-medium text-slate-900 dark:text-white">{new Date(tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span></p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-slate-900 dark:text-white">₹{(tx.finalAmount || 0).toLocaleString('en-IN')}</p>
                <div className="flex gap-2 mt-2 justify-end">
                  {tx.status === 'PENDING' && (
                    <Link href={`/transactions/new?aadhaar=${tx.aadhaarNumber}`} className="p-2 rounded-lg bg-amber-50 text-amber-600" title="Resume">
                      <Pencil className="w-4 h-4" />
                    </Link>
                  )}
                  <Link href={`/transactions/new?aadhaar=${tx.aadhaarNumber}&txnId=${tx.id}`} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400" title="View">
                    <FileText className="w-4 h-4" />
                  </Link>
                  <Link href={`/transactions/new?aadhaar=${tx.aadhaarNumber}&txnId=${tx.id}&print=true`} className="p-2 rounded-lg bg-primary/10 text-primary" title="Print">
                    <Printer className="w-4 h-4" />
                  </Link>
                  {tx.status === 'COMPLETED' && (
                    <button 
                      onClick={() => handleWhatsAppShare(tx)}
                      className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-all flex items-center justify-center" 
                      title="Share on WhatsApp"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.022-.08-.085-.184-.245-.26-.159-.077-.945-.467-1.092-.518-.147-.052-.254-.077-.36.078-.106.156-.412.518-.506.623-.093.106-.188.118-.346.04-.159-.077-.67-.247-1.275-.788-.47-.42-1.127-1.008-1.22-1.164-.093-.157-.01-.242.07-.32.072-.07.16-.188.24-.28.08-.093.106-.157.159-.26.053-.105.026-.196-.013-.273-.04-.077-.36-.867-.494-1.19-.13-.31-.264-.268-.36-.273-.093-.005-.201-.005-.308-.005-.107 0-.28.04-.427.197-.147.157-.56.548-.56 1.336 0 .788.574 1.548.654 1.654.08.106 1.13 1.719 2.736 2.41.382.166.68.265.912.339.385.122.735.105 1.013.064.31-.046.945-.386 1.078-.76.132-.372.132-.69.093-.76-.04-.07-.15-.11-.31-.19zm-5.44 8.62h-.001c-1.89 0-3.74-.51-5.35-1.47l-.38-.22-3.99 1.05 1.07-3.89-.25-.4c-1.05-1.67-1.61-3.61-1.61-5.6 0-5.83 4.74-10.57 10.57-10.57 2.83 0 5.48 1.1 7.48 3.1 2 2 3.1 4.66 3.1 7.48 0 5.83-4.74 10.58-10.57 10.58zm8.79-18.06c-2.35-2.35-5.47-3.64-8.79-3.64-6.83 0-12.4 5.57-12.4 12.4 0 2.21.57 4.37 1.68 6.26l-1.78 6.52 6.67-1.75c1.8 1 3.85 1.53 5.92 1.53h.005c6.83 0 12.4-5.57 12.4-12.4 0-3.31-1.29-6.43-3.5-8.62z"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="p-8 text-center text-slate-500 italic">
            No matching transactions found.
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="overflow-x-auto hidden md:block">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-[10px] uppercase font-bold text-slate-400 tracking-widest">
              <th className="px-6 py-4">Transaction ID</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Weight</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            {filteredTransactions.length > 0 ? filteredTransactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all group">
                <td className="px-6 py-4">
                  <p className="font-mono font-bold text-slate-900 dark:text-white">{tx.transactionNumber}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-900 dark:text-white">{tx.customerName}</p>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{tx.totalWeight}g</td>
                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                  ₹{(tx.finalAmount || 0).toLocaleString('en-IN')}
                </td>
                <td className="px-6 py-4">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                    tx.status === "COMPLETED" ? "bg-green-50 text-green-600 border-green-100" :
                    tx.status === "PENDING" ? "bg-amber-50 text-amber-600 border-amber-100" :
                    "bg-red-50 text-red-600 border-red-100"
                  }`}>
                    {tx.status === "COMPLETED" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {tx.status}
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500">
                  {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {tx.status === 'PENDING' && (
                      <Link href={`/transactions/new?aadhaar=${tx.aadhaarNumber}`} className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 hover:premium-shadow transition-all text-slate-400 hover:text-amber-500" title="Resume Transaction">
                        <Pencil className="w-4 h-4" />
                      </Link>
                    )}
                    <Link href={`/transactions/new?aadhaar=${tx.aadhaarNumber}&txnId=${tx.id}`} className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 hover:premium-shadow transition-all text-slate-400 hover:text-primary" title="View Agreement">
                      <FileText className="w-4 h-4" />
                    </Link>
                    <Link href={`/transactions/new?aadhaar=${tx.aadhaarNumber}&txnId=${tx.id}&print=true`} className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 hover:premium-shadow transition-all text-slate-400 hover:text-primary" title="Print Receipt">
                      <Printer className="w-4 h-4" />
                    </Link>
                    {tx.status === 'COMPLETED' && (
                      <button 
                        onClick={() => handleWhatsAppShare(tx)}
                        className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 hover:premium-shadow transition-all text-slate-400 hover:text-green-500 flex items-center justify-center" 
                        title="Share on WhatsApp"
                      >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.022-.08-.085-.184-.245-.26-.159-.077-.945-.467-1.092-.518-.147-.052-.254-.077-.36.078-.106.156-.412.518-.506.623-.093.106-.188.118-.346.04-.159-.077-.67-.247-1.275-.788-.47-.42-1.127-1.008-1.22-1.164-.093-.157-.01-.242.07-.32.072-.07.16-.188.24-.28.08-.093.106-.157.159-.26.053-.105.026-.196-.013-.273-.04-.077-.36-.867-.494-1.19-.13-.31-.264-.268-.36-.273-.093-.005-.201-.005-.308-.005-.107 0-.28.04-.427.197-.147.157-.56.548-.56 1.336 0 .788.574 1.548.654 1.654.08.106 1.13 1.719 2.736 2.41.382.166.68.265.912.339.385.122.735.105 1.013.064.31-.046.945-.386 1.078-.76.132-.372.132-.69.093-.76-.04-.07-.15-.11-.31-.19zm-5.44 8.62h-.001c-1.89 0-3.74-.51-5.35-1.47l-.38-.22-3.99 1.05 1.07-3.89-.25-.4c-1.05-1.67-1.61-3.61-1.61-5.6 0-5.83 4.74-10.57 10.57-10.57 2.83 0 5.48 1.1 7.48 3.1 2 2 3.1 4.66 3.1 7.48 0 5.83-4.74 10.58-10.57 10.58zm8.79-18.06c-2.35-2.35-5.47-3.64-8.79-3.64-6.83 0-12.4 5.57-12.4 12.4 0 2.21.57 4.37 1.68 6.26l-1.78 6.52 6.67-1.75c1.8 1 3.85 1.53 5.92 1.53h.005c6.83 0 12.4-5.57 12.4-12.4 0-3.31-1.29-6.43-3.5-8.62z"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500 italic">
                  No transactions found matching the filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-sm">
        <p className="text-slate-500">Showing {filteredTransactions.length} of {transactions.length} entries</p>
      </div>
    </div>
  );
}
