import { 
  Users, 
  Search, 
  Filter, 
  Download, 
} from "lucide-react";
import { getCustomers } from "@/lib/data";
import { auth } from "@/auth";
import CustomerTable from "@/components/dashboard/CustomerTable";

export default async function CustomersPage() {
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  const userBranchId = (session?.user as any)?.branchId;
  const filterBranchId = userRole === "SUPER_ADMIN" ? undefined : userBranchId;

  const customers = await getCustomers(filterBranchId);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Customers</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage and view all onboarded customers across branches.</p>
        </div>

      </div>

      <CustomerTable customers={customers} />
    </div>
  );
}
