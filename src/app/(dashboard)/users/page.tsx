import { getUsers, getBranches } from "@/lib/data";
import AddUserButton from "@/components/dashboard/AddUserButton";
import UsersClient from "@/components/dashboard/UsersClient";
import { auth } from "@/auth";

export default async function UsersPage() {
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  const userBranchId = (session?.user as any)?.branchId;
  const filterBranchId = userRole === "SUPER_ADMIN" ? undefined : userBranchId;

  const users = await getUsers(filterBranchId);
  const branches = await getBranches(filterBranchId);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Users</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage administrative and branch-level staff access.</p>
        </div>
        <AddUserButton branches={branches} />
      </div>

      <UsersClient users={users} branches={branches} />
    </div>
  );
}
