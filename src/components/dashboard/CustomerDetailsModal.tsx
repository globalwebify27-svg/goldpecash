"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, User, Phone, Mail, CreditCard, MapPin, Calendar, ShieldAlert } from "lucide-react";

interface CustomerDetailsModalProps {
  customer: any;
  onClose: () => void;
}

export default function CustomerDetailsModal({ customer, onClose }: CustomerDetailsModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl shadow-2xl relative animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-8 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 relative shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-primary-foreground rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-xl sm:text-3xl font-bold shadow-inner shrink-0 ${
              customer.isFraud ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'
            }`}>
              {customer.fullName.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white line-clamp-1">{customer.fullName}</h2>
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
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 overflow-y-auto flex-1 custom-scrollbar">
          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Phone className="w-4 h-4" /> Contact Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-[11px] sm:text-xs text-slate-500">Mobile Number</span>
                <span className="text-xs sm:text-sm font-bold">{customer.mobile || customer.mobileNumber}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-[11px] sm:text-xs text-slate-500">Email Address</span>
                <span className="text-xs sm:text-sm font-bold truncate max-w-[150px] sm:max-w-none">{customer.email || "N/A"}</span>
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
                <span className="text-xs sm:text-sm font-bold font-mono">XXXX-XXXX-{customer.aadhaarNumber.slice(-4)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-[11px] sm:text-xs text-slate-500">PAN Card</span>
                <span className="text-xs sm:text-sm font-bold font-mono uppercase">{customer.panNumber || "N/A"}</span>
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
                <p className="text-xs sm:text-sm leading-relaxed">{customer.address}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Current Residence</p>
                <p className="text-xs sm:text-sm leading-relaxed">{customer.currentAddress || "Same as permanent"}</p>
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
      </div>
    </div>,
    document.body
  );
}
