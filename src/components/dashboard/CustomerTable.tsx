"use client";

import { useState } from "react";
import { 
  PlusCircle, 
  Pencil, 
  Eye, 
  History, 
  ShieldAlert,
  Search,
  Filter,
  Download
} from "lucide-react";
import Link from "next/link";
import FraudModal from "./FraudModal";
import CustomerDetailsModal from "./CustomerDetailsModal";

interface CustomerTableProps {
  customers: any[];
  branches: any[];
  userRole: string;
  userBranchId?: string;
}

export default function CustomerTable({ customers, branches, userRole, userBranchId }: CustomerTableProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showFraudModal, setShowFraudModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filteredCustomers = customers.filter((customer) => {
    // 1. Search Query
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || (
      String(customer.fullName || "").toLowerCase().includes(query) ||
      String(customer.customerCode || "").toLowerCase().includes(query) ||
      String(customer.mobile || "").includes(query) ||
      String(customer.aadhaarNumber || "").includes(query)
    );

    // 2. Branch Filter
    const matchesBranch = selectedBranchId === "ALL" || customer.branchId === selectedBranchId;

    // 3. Date Filter
    let matchesDate = true;
    if (customer.createdAt) {
      const createdAtDate = new Date(customer.createdAt);
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

    return matchesSearch && matchesBranch && matchesDate;
  });

  const handleExportCSV = () => {
    const headers = ["Customer Code", "Full Name", "Branch", "Mobile", "Email", "Aadhaar Number", "Total Payout", "Transaction Count", "Payment Methods", "Is Fraud", "Fraud Reason", "Created At"];
    const csvContent = [
      headers.join(","),
      ...filteredCustomers.map(c => [
        `"${String(c.customerCode || '').replace(/"/g, '""')}"`,
        `"${String(c.fullName || '').replace(/"/g, '""')}"`,
        `"${String(branches.find(b => b.id === c.branchId)?.name || 'Unknown').replace(/"/g, '""')}"`,
        `"${String(c.mobile || '').replace(/"/g, '""')}"`,
        `"${String(c.email || '').replace(/"/g, '""')}"`,
        `"${String(c.aadhaarNumber || '').replace(/"/g, '""')}"`,
        `"${c.totalAmount}"`,
        `"${c.transactionCount}"`,
        `"${String(c.paymentMethods || '').replace(/"/g, '""')}"`,
        `"${c.isFraud ? 'Yes' : 'No'}"`,
        `"${String(c.fraudReason || '').replace(/"/g, '""')}"`,
        `"${new Date(c.createdAt).toLocaleDateString()}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `customers_export_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasActiveFilters = selectedBranchId !== "ALL" || startDate !== "" || endDate !== "";

  return (
    <>
      <div className="premium-card !p-0 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, Aadhaar, or mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold text-sm flex items-center gap-2 hover:bg-slate-50 transition-all text-slate-700 dark:text-slate-300"
              title="Export CSV"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-xl border transition-all ${
                showFilters || hasActiveFilters
                  ? "border-primary bg-primary/5 text-primary" 
                  : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-500"
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="px-6 pb-6 border-b border-slate-100 dark:border-slate-800 pt-4 bg-slate-50/50 dark:bg-slate-900/10 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
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
            {hasActiveFilters && (
              <div className="md:col-span-3 flex justify-end">
                <button
                  onClick={() => {
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

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Aadhaar</th>
                <th className="px-6 py-4 text-right">Total Payout</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {filteredCustomers.length > 0 ? filteredCustomers.map((customer) => (
                <tr key={customer.id} className={`hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all group ${customer.isFraud ? 'bg-red-50/30 dark:bg-red-900/5' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${customer.isFraud ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'}`}>
                        {customer.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className={`font-bold ${customer.isFraud ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
                          {customer.fullName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {customer.customerCode} • {branches.find(b => b.id === customer.branchId)?.name || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {customer.isFraud ? (
                      <span className="px-2 py-1 rounded-lg bg-red-100 text-red-600 text-[10px] font-bold uppercase tracking-tight flex items-center gap-1 w-fit">
                        <ShieldAlert className="w-3 h-3" /> Fraud
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-lg bg-green-100 text-green-600 text-[10px] font-bold uppercase tracking-tight w-fit">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-700 dark:text-slate-300 font-medium">{customer.mobile}</p>
                    <p className="text-xs text-slate-500">{customer.email}</p>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-500">
                    XXXX-XXXX-{customer.aadhaarNumber?.slice(-4)}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-slate-900 dark:text-white">
                    {customer.totalAmount > 0 ? (
                      <div>
                        <span>₹{Number(customer.totalAmount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                        <p className="text-[10px] text-slate-400 font-normal">
                          {customer.transactionCount} txn{customer.transactionCount > 1 ? 's' : ''}
                          {customer.paymentMethods ? ` • ${customer.paymentMethods}` : ''}
                        </p>
                      </div>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 font-normal italic text-xs">No Payout</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {!customer.isFraud && (
                        <>
                          <Link href={`/transactions/new?aadhaar=${customer.aadhaarNumber}&new=true`} className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 hover:premium-shadow transition-all text-slate-400 hover:text-green-500" title="Start New Transaction">
                            <PlusCircle className="w-4 h-4" />
                          </Link>
                          <Link href={`/transactions/new?aadhaar=${customer.aadhaarNumber}`} className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 hover:premium-shadow transition-all text-slate-400 hover:text-primary" title="Resume Draft">
                            <Pencil className="w-4 h-4" />
                          </Link>
                        </>
                      )}
                      <button 
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowViewModal(true);
                        }}
                        className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 hover:premium-shadow transition-all text-slate-400 hover:text-primary" 
                        title="View Customer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {!customer.isFraud && (
                        <button 
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setShowFraudModal(true);
                          }}
                          className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 hover:premium-shadow transition-all text-slate-400 hover:text-red-500" 
                          title="Mark as Fraud"
                        >
                          <ShieldAlert className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                    No customers onboarded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-sm">
          <p className="text-slate-500">Showing {filteredCustomers.length} entries</p>
        </div>
      </div>

      {showFraudModal && selectedCustomer && (
        <FraudModal 
          customer={selectedCustomer} 
          onClose={() => setShowFraudModal(false)} 
        />
      )}

      {showViewModal && selectedCustomer && (
        <CustomerDetailsModal 
          customer={selectedCustomer} 
          onClose={() => setShowViewModal(false)} 
        />
      )}
    </>
  );
}
