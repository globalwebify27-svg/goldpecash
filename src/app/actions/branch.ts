"use server";

import crypto from "crypto";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createBranchAction(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const code = formData.get("code") as string;
    const phone = formData.get("phone") as string;
    const managerName = formData.get("managerName") as string;
    const address = formData.get("address") as string;

    // Basic validation
    if (!name || !code || !phone || !managerName || !address) {
      return { success: false, message: "All fields are required" };
    }

    const id = crypto.randomUUID();
    const now = new Date();

    // Insert into DB
    await db.query(
      "INSERT INTO Branch (id, name, code, phone, managerName, address, city, status, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, name, code, phone, managerName, address, "Default City", "ACTIVE", now]
    );

    revalidatePath("/branches");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating branch:", error);
    if (error.code === 'ER_DUP_ENTRY') {
      return { success: false, message: "Branch code already exists" };
    }
    return { success: false, message: "Something went wrong" };
  }
}

export async function updateBranchAction(branchId: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const code = formData.get("code") as string;
    const phone = formData.get("phone") as string;
    const managerName = formData.get("managerName") as string;
    const address = formData.get("address") as string;
    const status = formData.get("status") as string || "ACTIVE";

    // Basic validation
    if (!name || !code || !phone || !managerName || !address) {
      return { success: false, message: "All fields are required" };
    }

    await db.query(
      "UPDATE Branch SET name = ?, code = ?, phone = ?, managerName = ?, address = ?, status = ?, updatedAt = NOW(3) WHERE id = ?",
      [name, code, phone, managerName, address, status, branchId]
    );

    revalidatePath("/branches");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating branch:", error);
    if (error.code === 'ER_DUP_ENTRY') {
      return { success: false, message: "Branch code already exists" };
    }
    return { success: false, message: "Something went wrong" };
  }
}
import { getDashboardStats } from "@/lib/data";

export async function getBranchStatsAction(branchId: string) {
  try {
    const stats = await getDashboardStats(branchId);
    return { success: true, stats };
  } catch (error) {
    console.error("Error getting branch stats:", error);
    return { success: false, message: "Failed to load branch statistics" };
  }
}

export async function deleteBranchAction(branchId: string) {
  try {
    await db.query("DELETE FROM Branch WHERE id = ?", [branchId]);
    revalidatePath("/branches");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting branch:", error);
    return { success: false, message: "Failed to delete branch: " + error.message };
  }
}

