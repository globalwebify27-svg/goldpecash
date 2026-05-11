import { 
  History, 
  Search, 
  Filter, 
  Download, 
  Eye,
  Printer,
  FileText,
  CheckCircle2,
  Clock,
  Pencil
} from "lucide-react";
import Link from "next/link";
import { getAllTransactions } from "@/lib/data";
import { auth } from "@/auth";

export default async function TransactionsPage() {
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  const userBranchId = (session?.user as any)?.branchId;
  const filterBranchId = userRole === "SUPER_ADMIN" ? undefined : userBranchId;

  const transactions = await getAllTransactions(filterBranchId);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Transactions</h1>
          <p className="text-slate-500 dark:text-slate-400">View and manage all gold purchase transactions.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold text-sm flex items-center gap-2 hover:bg-slate-50 transition-all">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <div className="premium-card !p-0 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by ID or customer..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold text-sm flex items-center gap-2 hover:bg-slate-50 transition-all">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {transactions.length > 0 ? transactions.map((tx) => (
            <div key={tx.id} className="premium-card p-4 space-y-3">
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
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="premium-card p-8 text-center text-slate-500 italic">
              No transactions recorded yet.
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
              {transactions.length > 0 ? transactions.map((tx) => (
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
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 italic">
                    No transactions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

