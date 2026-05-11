"use server";

import { sendAadhaarOtp, verifyAadhaarOtp } from "@/lib/aadhaar";

import db from "@/lib/db";

export async function requestOtpAction(aadhaarNumber: string) {
  // Check if Aadhaar is blacklisted before sending OTP
  const [rows]: any = await db.query("SELECT isFraud FROM Customer WHERE aadhaarNumber = ?", [aadhaarNumber]);
  if (rows.length > 0 && rows[0].isFraud) {
    return { success: false, message: "This Aadhaar is blacklisted due to fraudulent activity." };
  }
  return await sendAadhaarOtp(aadhaarNumber);
}

export async function verifyOtpAction(otp: string, referenceId: string, aadhaarNumber: string) {
  const result = await verifyAadhaarOtp(otp, referenceId);
  if (result.success) {
    // Double check DB just in case
    const [rows]: any = await db.query("SELECT isFraud FROM Customer WHERE aadhaarNumber = ?", [aadhaarNumber]);
    if (rows.length > 0 && rows[0].isFraud) {
      return { success: false, message: "Verification blocked: This Aadhaar is blacklisted." };
    }
  }
  return result;
}
