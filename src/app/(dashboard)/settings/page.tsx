import { auth } from "@/auth";
import { getUserById, getBranchById } from "@/lib/data";
import SettingsClient from "@/components/dashboard/SettingsClient";
import db from "@/lib/db";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const sessionUser = session.user as any;
  let user = await getUserById(sessionUser.id);
  
  // Fallback: search by email if ID fetch fails
  if (!user && sessionUser.email) {
    const [rows]: any = await db.query("SELECT * FROM User WHERE email = ?", [sessionUser.email]);
    user = rows[0] || null;
  }

  const branch = sessionUser.branchId ? await getBranchById(sessionUser.branchId) : null;

  return <SettingsClient user={user} branch={branch} />;
}
