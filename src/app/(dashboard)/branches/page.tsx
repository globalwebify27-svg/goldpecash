import { getBranches } from "@/lib/data";
import { auth } from "@/auth";
import BranchesClient from "@/components/dashboard/BranchesClient";

export default async function BranchesPage() {
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  const userBranchId = (session?.user as any)?.branchId;
  const filterBranchId = userRole === "SUPER_ADMIN" ? undefined : userBranchId;

  const branches = await getBranches(filterBranchId);

  return (
    <div className="animate-in fade-in duration-700">
      <BranchesClient branches={branches} userRole={userRole} />
    </div>
  );
}

