"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Building2, Users, Scale, IndianRupee, Loader2 } from "lucide-react";
import { getBranchStatsAction } from "@/app/actions/branch";

interface BranchStatsModalProps {
  branch: any;
  onClose: () => void;
}

export default function BranchStatsModal({ branch, onClose }: BranchStatsModalProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    
    async function loadStats() {
      const result = await getBranchStatsAction(branch.id);
      if (result.success) {
        setStats(result.stats);
      } else {
        setError(result.message || "Failed to load statistics");
      }
      setLoading(false);
    }
    loadStats();

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [branch.id]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-8 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-primary-foreground rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 mb-6 sm:mb-8">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">{branch.name}</h2>
            <p className="text-xs sm:text-sm text-slate-500">Branch Performance & Statistics</p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-slate-500">Fetching latest statistics...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-red-600 rounded-2xl text-sm font-medium text-center">
            {error}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {/* Stat Card: Customers */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">Total Customers</p>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{stats?.totalCustomers || 0}</p>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>

              {/* Stat Card: Weight */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">Gold Weight Purchased</p>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{stats?.totalWeight || 0} g</p>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
                  <Scale className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>

              {/* Stat Card: Payout */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">Total Payout Amount</p>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{stats?.totalPayout || "₹0"}</p>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
                  <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full btn-primary py-3 rounded-2xl font-bold text-center mt-2"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
