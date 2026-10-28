"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, User, Phone, Mail, CreditCard, MapPin, Calendar, ShieldAlert, Edit2, Save, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { updateCustomerDetails } from "@/app/actions/transaction";
import { useRouter } from "next/navigation";

interface CustomerDetailsModalProps {
  customer: any;
  onClose: () => void;
}

export default function CustomerDetailsModal({ customer, onClose }: CustomerDetailsModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    fullName: customer.fullName === "N/A" ? "" : (customer.fullName || ""),
    address: customer.address === "N/A" ? "" : (customer.address || ""),
    currentAddress: customer.currentAddress || "",
    mobile: customer.mobile || customer.mobileNumber || "",
    email: customer.email === "N/A" ? "" : (customer.email || ""),
    panNumber: customer.panNumber === "N/A" ? "" : (customer.panNumber || ""),
  });

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.fullName.trim() || formData.fullName.trim() === "N/A") {
      setError("Please provide a valid Customer Full Name.");
      return;
    }
    if (!formData.address.trim() || formData.address.trim() === "N/A") {
      setError("Please provide a valid Permanent Address.");
      return;
    }

    setLoading(true);
    try {
      const res = await updateCustomerDetails(customer.id, {
        fullName: formData.fullName.trim(),
        address: formData.address.trim(),
        currentAddress: formData.currentAddress.trim() || undefined,
        mobile: formData.mobile.trim() || undefined,
        email: formData.email.trim() || undefined,
        panNumber: formData.panNumber.trim().toUpperCase() || undefined,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to update customer details.");
      }

      customer.fullName = formData.fullName.trim();
      customer.address = formData.address.trim();
      customer.currentAddress = formData.currentAddress.trim();
      customer.mobile = formData.mobile.trim();
      customer.email = formData.email.trim();
      customer.panNumber = formData.panNumber.trim().toUpperCase();

      setSuccess("Customer details updated successfully!");
      setIsEditing(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl shadow-2xl relative animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-8 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 relative shrink-0">
          <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
            {!isEditing && (
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setSuccess("");
                  setIsEditing(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-primary transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Details
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-primary-foreground rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-xl sm:text-3xl font-bold shadow-inner shrink-0 ${
              customer.isFraud ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'
            }`}>
              {(formData.fullName || customer.fullName || "C").charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white line-clamp-1">
                {formData.fullName || customer.fullName}
              </h2>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                <span className="text-xs font-mono text-slate-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-700">
                  {customer.customerCode}
                </span>
                {customer.isFraud ? (
                  <span className="px-2 py-0.5 rounded-lg bg-red-100 text-red-600 text-[10px] font-bold uppercase tracking-tight flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> Fraud / Blacklisted
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-lg bg-green-100 text-green-600 text-[10px] font-bold uppercase tracking-tight">
                    Verified Active
                  </span>
                )}
                {isEditing && (
                  <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-bold uppercase tracking-tight">
                    Editing Mode
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-red-600 rounded-xl text-sm flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}
        {success && (
          <div className="mx-6 mt-4 p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 text-green-600 rounded-xl text-sm flex items-center gap-2 shrink-0">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <p className="font-medium">{success}</p>
          </div>
        )}

        {/* Content */}
        {isEditing ? (
          <form onSubmit={handleSave} className="p-5 sm:p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Enter customer full name"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, "") })}
                  placeholder="10-digit mobile"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="customer@example.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  PAN Number
                </label>
                <input
                  type="text"
                  value={formData.panNumber}
                  onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                  placeholder="ABCDE1234F"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none text-sm font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Aadhaar Number
                </label>
                <input
                  type="text"
                  disabled
                  value={`XXXX-XXXX-${customer.aadhaarNumber?.slice(-4)}`}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono text-sm cursor-not-allowed"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Permanent Address (Aadhaar) <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter customer permanent address"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none text-sm"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Current Residential Address
                </label>
                <textarea
                  rows={2}
                  value={formData.currentAddress}
                  onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })}
                  placeholder="Enter current residential address (optional)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                disabled={loading}
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary px-5 py-2 text-sm flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="p-5 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 overflow-y-auto flex-1 custom-scrollbar">
            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Phone className="w-4 h-4" /> Contact Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[11px] sm:text-xs text-slate-500">Mobile Number</span>
                  <span className="text-xs sm:text-sm font-bold">{formData.mobile || customer.mobile || customer.mobileNumber}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[11px] sm:text-xs text-slate-500">Email Address</span>
                  <span className="text-xs sm:text-sm font-bold truncate max-w-[150px] sm:max-w-none">{formData.email || customer.email || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Identity Info */}
            <div className="space-y-4">
              <h3 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Identity Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[11px] sm:text-xs text-slate-500">Aadhaar Number</span>
                  <span className="text-xs sm:text-sm font-bold font-mono">XXXX-XXXX-{customer.aadhaarNumber?.slice(-4)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[11px] sm:text-xs text-slate-500">PAN Card</span>
                  <span className="text-xs sm:text-sm font-bold font-mono uppercase">{formData.panNumber || customer.panNumber || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Residential Addresses
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Permanent (Aadhaar)</p>
                  <p className={`text-xs sm:text-sm leading-relaxed ${formData.address === "N/A" || !formData.address ? "text-red-500 font-semibold" : ""}`}>
                    {formData.address || customer.address || "N/A"}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Current Residence</p>
                  <p className="text-xs sm:text-sm leading-relaxed">{formData.currentAddress || customer.currentAddress || "Same as permanent"}</p>
                </div>
              </div>
            </div>

            {/* Fraud Details */}
            {customer.isFraud && (
              <div className="md:col-span-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30">
                <h3 className="text-xs sm:text-sm font-bold text-red-600 mb-2 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Fraud Reason
                </h3>
                <p className="text-xs sm:text-sm text-red-800 dark:text-red-400 italic">"{customer.fraudReason}"</p>
              </div>
            )}

            {/* Metadata */}
            <div className="md:col-span-2 flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3" /> Joined: {new Date(customer.createdAt).toLocaleDateString()}
              </div>
              <div>Branch ID: {customer.branchId}</div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
