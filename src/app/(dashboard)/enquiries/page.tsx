import { auth } from "@/auth";
import { getEnquiries } from "@/lib/data";
import EnquirySection from "@/components/dashboard/EnquirySection";
import AddEnquiryButton from "@/components/dashboard/AddEnquiryButton";

export default async function EnquiriesPage() {
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  const userBranchId = (session?.user as any)?.branchId;
  
  // Filter by branch if not Super Admin
  const filterBranchId = userRole === "SUPER_ADMIN" ? undefined : userBranchId;
  const enquiries = await getEnquiries(filterBranchId);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Customer Enquiries</h1>
          <p className="text-slate-500 dark:text-slate-400">View and manage customer walk-in or telephone shop enquiries.</p>
        </div>
        <AddEnquiryButton branchId={userBranchId} userId={session?.user?.id} />
      </div>

      <EnquirySection enquiries={enquiries} />
    </div>
  );
}
