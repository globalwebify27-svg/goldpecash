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
