import { getAllTransactions, getBranches } from "@/lib/data";
import { auth } from "@/auth";
import TransactionsTable from "@/components/dashboard/TransactionsTable";

export default async function TransactionsPage() {
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  const userBranchId = (session?.user as any)?.branchId;
  const filterBranchId = userRole === "SUPER_ADMIN" ? undefined : userBranchId;

  const [transactions, branches] = await Promise.all([
    getAllTransactions(filterBranchId),
    getBranches(),
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Transactions</h1>
          <p className="text-slate-500 dark:text-slate-400">View and manage all gold purchase transactions.</p>
        </div>
      </div>

      <TransactionsTable 
        transactions={transactions} 
        branches={branches}
        userRole={userRole}
        userBranchId={userBranchId}
      />
    </div>
  );
}

