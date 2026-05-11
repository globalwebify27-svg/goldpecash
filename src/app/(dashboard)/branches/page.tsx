import { 
  MapPin, 
  Phone, 
  User, 
  Building2,
} from "lucide-react";
import { getBranches } from "@/lib/data";
import { auth } from "@/auth";
import AddBranchButton from "@/components/dashboard/AddBranchButton";

export default async function BranchesPage() {
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  const userBranchId = (session?.user as any)?.branchId;
  const filterBranchId = userRole === "SUPER_ADMIN" ? undefined : userBranchId;

  const branches = await getBranches(filterBranchId);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Branches</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage all operational branches and their managers.</p>
        </div>
        <AddBranchButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.length > 0 ? branches.map((branch) => (
          <div key={branch.id} className="premium-card group hover:border-primary/50 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                <Building2 className="w-6 h-6" />
              </div>
              <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                branch.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {branch.status}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{branch.name}</h3>
            <p className="text-xs text-primary font-bold uppercase tracking-widest mb-4">{branch.code}</p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm text-slate-500">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <p>{branch.address}, {branch.city}</p>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <User className="w-4 h-4 shrink-0" />
                <p>{branch.managerName}</p>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <Phone className="w-4 h-4 shrink-0" />
                <p>{branch.phone}</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-2">
              <button className="flex-1 text-sm font-bold py-2 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 transition-all">
                Edit Details
              </button>
              <button className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 transition-all">
                Stats
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-12 text-center text-slate-500">
            No branches found. Start by adding one.
          </div>
        )}
      </div>
    </div>
  );
}
