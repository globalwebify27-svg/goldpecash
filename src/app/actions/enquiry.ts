"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { resolveBranchId } from "./transaction";

export async function saveEnquiry(data: { name: string, mobile: string, message: string, branchId: string, createdBy: string }) {
  try {
    const { name, mobile, message } = data;
    const id = crypto.randomUUID();

    // Server-side session verification to enforce user's branch
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    let targetBranchId = data.branchId;
    if (userRole !== "SUPER_ADMIN" && session?.user) {
      targetBranchId = (session.user as any).branchId;
    }
    const branchId = await resolveBranchId(targetBranchId);
    const createdBy = session?.user?.id || data.createdBy || "SYSTEM";

    await db.query(
      "INSERT INTO Enquiry (id, name, mobile, message, status, branchId, createdBy) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id, name, mobile, message, "PENDING", branchId, createdBy]
    );

    revalidatePath("/dashboard");
    return { success: true, id };
  } catch (error: any) {
    console.error("Error saving enquiry:", error);
    return { success: false, error: error.message };
  }
}

export async function updateEnquiryStatus(id: string, status: string) {
  try {
    await db.query(
      "UPDATE Enquiry SET status = ?, updatedAt = NOW(3) WHERE id = ?",
      [status, id]
    );

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating enquiry status:", error);
    return { success: false, error: error.message };
  }
}
