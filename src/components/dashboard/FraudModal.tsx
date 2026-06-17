"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ShieldAlert, Loader2 } from "lucide-react";
import { markAsFraud } from "@/app/actions/transaction";
import { useRouter } from "next/navigation";

interface FraudModalProps {
  customer: {
    id: string;
    fullName: string;
    customerCode: string;
  };
  onClose: () => void;
}

export default function FraudModal({ customer, onClose }: FraudModalProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    
    setLoading(true);
    const result = await markAsFraud(customer.id, reason);
    if (result.success) {
      router.refresh();
      onClose();
    } else {
      alert("Error: " + result.error);
    }
    setLoading(false);
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-8 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200 border border-red-100 dark:border-red-900/30 flex flex-col max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-primary-foreground rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mb-6 shrink-0">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4 animate-pulse shrink-0">
            <ShieldAlert className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Mark as Fraud</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            You are blacklisting <span className="font-bold text-red-600">{customer.fullName}</span>. 
            This action will block them from all branches permanently.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1 pr-1 sm:pr-2">
          <div className="space-y-1">
            <label className="text-xs sm:text-sm font-semibold ml-1">Reason for Blacklisting</label>
            <textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Attempted to sell stolen gold, Fake documents, etc."
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-red-500 outline-none transition-all min-h-[100px] resize-none text-sm"
            />
          </div>

          <div className="flex gap-3 mt-2 shrink-0">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 font-bold hover:bg-slate-50 transition-all text-sm"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading || !reason}
              className="flex-[2] bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-2xl font-bold transition-all shadow-lg shadow-red-200 dark:shadow-none flex items-center justify-center gap-2 text-sm"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Blacklist"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
