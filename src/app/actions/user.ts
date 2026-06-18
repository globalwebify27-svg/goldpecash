"use server";

import crypto from "crypto";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function createUserAction(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const role = formData.get("role") as string;
    const branchId = formData.get("branchId") as string;
    const password = formData.get("password") as string;

    // Basic validation
    if (!name || !email || !role || !password) {
      return { success: false, message: "All fields are required" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = crypto.randomUUID();
    const now = new Date();

    // Insert into DB
    await db.query(
      "INSERT INTO User (id, name, email, phone, password, role, branchId, status, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, name, email, phone, hashedPassword, role, branchId || null, "ACTIVE", now]
    );

    revalidatePath("/users");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating user:", error);
    if (error.code === 'ER_DUP_ENTRY') {
      return { success: false, message: "Email already exists" };
    }
    return { success: false, message: "Something went wrong" };
  }
}

export async function updateProfileAction(userId: string, data: { name: string; email: string; phone: string }) {
  try {
    await db.query(
      "UPDATE User SET name = ?, email = ?, phone = ?, updatedAt = NOW(3) WHERE id = ?",
      [data.name, data.email, data.phone, userId]
    );
    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, message: "Failed to update profile" };
  }
}

export async function updatePasswordAction(userId: string, data: { current: string; new: string }) {
  try {
    const [rows]: any = await db.query("SELECT password FROM User WHERE id = ?", [userId]);
    if (rows.length === 0) return { success: false, message: "User not found" };

    const isMatch = await bcrypt.compare(data.current, rows[0].password);
    if (!isMatch) return { success: false, message: "Current password incorrect" };

    const hashedPassword = await bcrypt.hash(data.new, 10);
    await db.query("UPDATE User SET password = ?, updatedAt = NOW(3) WHERE id = ?", [hashedPassword, userId]);
    
    return { success: true };
  } catch (error) {
    console.error("Error updating password:", error);
    return { success: false, message: "Failed to update password" };
  }
}

export async function updateBranchAction(branchId: string, data: { name: string; address: string; phone: string; email: string }) {
  try {
    await db.query(
      "UPDATE Branch SET name = ?, address = ?, phone = ?, email = ?, updatedAt = NOW(3) WHERE id = ?",
      [data.name, data.address, data.phone, data.email, branchId]
    );
    revalidatePath("/branches");
    return { success: true };
  } catch (error) {
    console.error("Error updating branch:", error);
    return { success: false, message: "Failed to update branch settings" };
  }
}

export async function updateUserAction(userId: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const role = formData.get("role") as string;
    const branchId = formData.get("branchId") as string;
    const status = formData.get("status") as string || "ACTIVE";
    const password = formData.get("password") as string;

    // Basic validation
    if (!name || !email || !role) {
      return { success: false, message: "Name, email, and role are required" };
    }

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query(
        "UPDATE User SET name = ?, email = ?, phone = ?, role = ?, branchId = ?, status = ?, password = ?, updatedAt = NOW(3) WHERE id = ?",
        [name, email, phone, role, branchId || null, status, hashedPassword, userId]
      );
    } else {
      await db.query(
        "UPDATE User SET name = ?, email = ?, phone = ?, role = ?, branchId = ?, status = ?, updatedAt = NOW(3) WHERE id = ?",
        [name, email, phone, role, branchId || null, status, userId]
      );
    }

    revalidatePath("/users");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating user:", error);
    if (error.code === 'ER_DUP_ENTRY') {
      return { success: false, message: "Email already exists" };
    }
    return { success: false, message: "Something went wrong" };
  }
}

export async function toggleUserStatusAction(userId: string, currentStatus: string) {
  try {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await db.query("UPDATE User SET status = ?, updatedAt = NOW(3) WHERE id = ?", [newStatus, userId]);
    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    console.error("Error toggling user status:", error);
    return { success: false, message: "Failed to update user status" };
  }
}

export async function deleteUserAction(userId: string) {
  try {
    await db.query("DELETE FROM User WHERE id = ?", [userId]);
    revalidatePath("/users");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return { success: false, message: "Failed to delete user: " + error.message };
  }
}


