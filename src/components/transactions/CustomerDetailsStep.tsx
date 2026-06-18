"use client";

import { useState, useRef, useEffect } from "react";
import { UserCircle, Mail, Phone, MapPin, Loader2, CheckCircle2, AlertCircle, UserCheck, Users } from "lucide-react";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useSession } from "next-auth/react";

export default function CustomerDetailsStep({ onNext, onPrev, updateData, data, loading }: any) {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;
  const isSuperAdmin = userRole === "SUPER_ADMIN";

  const initialMobileRef = useRef(data.mobile || "");
  const [isEditing, setIsEditing] = useState(false);
  const [verifiedState, setVerifiedState] = useState(
    !!(data.mobile && data.customerId && data.mobile === initialMobileRef.current)
  );

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  // Bypass mobile OTP verification for now: auto-verify if a valid 10-digit number is entered.
  const isVerified = !!(data.mobile && data.mobile.length >= 10);

  // Reset verification if mobile changes (and isn't the initial database mobile)
  useEffect(() => {
    if (data.mobile !== initialMobileRef.current) {
      setVerifiedState(false);
      setOtpSent(false);
      setConfirmationResult(null);
    }
  }, [data.mobile]);

  // Clean up recaptcha verifier on unmount
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  const handleSendOtp = async () => {
    if (!data.mobile || data.mobile.length < 10) {
      setOtpError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setSendingOtp(true);
    setOtpError("");
    setOtpSuccess("");

    try {
      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
        });
      }

      const formattedPhone = data.mobile.startsWith("+") ? data.mobile : `+91${data.mobile}`;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifierRef.current);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      setOtpSuccess("OTP sent successfully to " + formattedPhone);
    } catch (err: any) {
      console.error("Firebase sendOtp error:", err);
      setOtpError(err.message || "Failed to send OTP. Please check your configuration.");
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setOtpError("Please enter a 6-digit OTP code.");
      return;
    }
    setVerifyingOtp(true);
    setOtpError("");
    setOtpSuccess("");

    try {
      if (!confirmationResult) {
        setOtpError("No active verification session. Send OTP again.");
        return;
      }
      await confirmationResult.confirm(otp);
      setVerifiedState(true);
      setIsEditing(false);
      setOtpSuccess("Mobile number verified successfully!");
      setOtpSent(false);
    } catch (err: any) {
      console.error("Firebase verifyOtp error:", err);
      setOtpError("Invalid OTP code. Please try again.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVerified) {
      setOtpError("Please verify your mobile number first.");
      return;
    }
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
          <UserCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Additional Customer Details</h2>
          <p className="text-sm text-slate-500">Please provide contact and demographic information.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Full Name (Auto-fetched)</label>
            <input
              type="text"
              readOnly
              value={data.fullName || ""}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 outline-none"
            />
          </div>
  
          <div className="space-y-2">
            <label className="text-sm font-medium">Mobile Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                required
                value={data.mobile || ""}
                onChange={(e) => updateData({ mobile: e.target.value.replace(/\D/g, "") })}
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                placeholder="9999999999"
              />
              {isVerified && (
                <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
            </div>
          </div>
  
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={data.email || ""}
                onChange={(e) => updateData({ email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                placeholder="customer@example.com"
              />
            </div>
          </div>
  
          <div className="space-y-2">
            <label className="text-sm font-medium">PAN Number</label>
            <input
              type="text"
              value={data.panNumber || ""}
              onChange={(e) => updateData({ panNumber: e.target.value.toUpperCase() })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
              placeholder="ABCDE1234F"
            />
          </div>
  
          {/* Reference Person Details */}
          <div className="md:col-span-2 border-t border-slate-100 dark:border-slate-800 pt-6 mt-2 space-y-4">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold">Reference Person Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Reference Name</label>
                <div className="relative">
                  <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={data.refName || ""}
                    onChange={(e) => updateData({ refName: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                    placeholder="e.g. Rajesh Kumar"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Reference Mobile</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={data.refMobile || ""}
                    onChange={(e) => updateData({ refMobile: e.target.value.replace(/\D/g, "") })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                    placeholder="9999999999"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Relation with Customer</label>
                <div className="relative">
                  <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={data.refRelation || ""}
                    onChange={(e) => updateData({ refRelation: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                    placeholder="e.g. Brother, Friend, Neighbor"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Aadhaar Address (Auto-fetched)</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                <textarea
                  readOnly
                  value={data.address || ""}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 outline-none min-h-[80px]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <input
                type="checkbox"
                id="diffAddress"
                checked={data.isCurrentAddressDifferent || false}
                onChange={(e) => updateData({ isCurrentAddressDifferent: e.target.checked })}
                className="w-5 h-5 rounded-lg border-slate-300 text-primary focus:ring-primary"
              />
              <label htmlFor="diffAddress" className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                Current residential address is different from Aadhaar address
              </label>
            </div>

            {data.isCurrentAddressDifferent && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <label className="text-sm font-medium">Current Residential Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 w-4 h-4 text-primary" />
                  <textarea
                    required
                    value={data.currentAddress || ""}
                    onChange={(e) => updateData({ currentAddress: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-primary/30 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none min-h-[100px]"
                    placeholder="Enter your current residential address"
                  />
                </div>
              </div>
            )}
          </div>
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-slate-100 dark:border-slate-800">
        <button type="button" onClick={onPrev} className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 font-semibold transition-all">
          Back
        </button>
        <div className="flex flex-col items-end">
          <button
            type="submit"
            disabled={!isVerified || loading}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Continue
          </button>
          {!isVerified && (
            <span className="text-[10px] text-amber-500 font-medium mt-1">
              Verify mobile number to continue
            </span>
          )}
        </div>
      </div>
    </form>
  );
}
