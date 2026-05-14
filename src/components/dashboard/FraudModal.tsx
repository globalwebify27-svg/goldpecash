"use client";

import { useState } from "react";
import { X, AlertTriangle, ShieldAlert, Loader2 } from "lucide-react";
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
  const router = useRouter();

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

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200 border border-red-100 dark:border-red-900/30">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-primary-foreground rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4 animate-pulse">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Mark as Fraud</h2>
          <p className="text-slate-500 mt-2">
            You are blacklisting <span className="font-bold text-red-600">{customer.fullName}</span>. 
            This action will block them from all branches permanently.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold ml-1">Reason for Blacklisting</label>
            <textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Attempted to sell stolen gold, Fake documents, etc."
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-red-500 outline-none transition-all min-h-[120px] resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 font-bold hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading || !reason}
              className="flex-[2] bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-red-200 dark:shadow-none flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Blacklist"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
