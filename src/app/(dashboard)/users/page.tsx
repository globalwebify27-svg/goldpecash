import { 
  UserCircle, 
  Shield, 
  Building2, 
  Mail,
  MoreVertical
} from "lucide-react";
import { getUsers, getBranches } from "@/lib/data";
import AddUserButton from "@/components/dashboard/AddUserButton";

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

      <div className="premium-card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Branch</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {users.length > 0 ? users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <UserCircle className="w-6 h-6 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {user.role.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Building2 className="w-4 h-4" />
                      {user.branchName || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                      user.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-400">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                    No users found.
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
