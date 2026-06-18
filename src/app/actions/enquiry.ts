"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function saveEnquiry(data: { name: string, mobile: string, message: string, branchId: string, createdBy: string }) {
  try {
    const { name, mobile, message, branchId, createdBy } = data;
    const id = crypto.randomUUID();

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
