"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Building2, MapPin, Phone, User, Loader2 } from "lucide-react";
import { createBranchAction, updateBranchAction } from "../../app/actions/branch";
import { useRouter } from "next/navigation";

export default function BranchModal({ onClose, branch }: { onClose: () => void; branch?: any }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const isEdit = !!branch;

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = isEdit 
      ? await updateBranchAction(branch.id, formData)
      : await createBranchAction(formData);

    if (result.success) {
      router.refresh();
      onClose();
    } else {
      setError(result.message || `Failed to ${isEdit ? "update" : "create"} branch`);
    }
    setLoading(false);
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-8 w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-primary-foreground rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 mb-6 shrink-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">{isEdit ? "Edit Branch" : "Add New Branch"}</h2>
            <p className="text-xs sm:text-sm text-slate-500">{isEdit ? "Update details for this branch." : "Create a new operational branch for GoldPeCash."}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-red-600 rounded-2xl text-xs sm:text-sm font-medium shrink-0">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1 pr-1 sm:pr-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs sm:text-sm font-semibold ml-1">Branch Name</label>
              <input 
                name="name"
                required
                defaultValue={branch?.name || ""}
                placeholder="e.g. Hyderabad Main"
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs sm:text-sm font-semibold ml-1">Branch Code</label>
              <input 
                name="code"
                required
                defaultValue={branch?.code || ""}
                placeholder="e.g. HYD01"
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs sm:text-sm font-semibold ml-1">Phone Number</label>
              <input 
                name="phone"
                required
                defaultValue={branch?.phone || ""}
                placeholder="10-digit mobile"
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs sm:text-sm font-semibold ml-1">Manager Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                name="managerName"
                required
                defaultValue={branch?.managerName || ""}
                placeholder="Branch Manager Full Name"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs sm:text-sm font-semibold ml-1">Full Address</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
              <textarea 
                name="address"
                required
                defaultValue={branch?.address || ""}
                placeholder="Complete branch location address"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all min-h-[80px] text-sm"
              />
            </div>
          </div>

          {isEdit && (
            <div className="space-y-1">
              <label className="text-xs sm:text-sm font-semibold ml-1">Status</label>
              <select 
                name="status"
                defaultValue={branch?.status || "ACTIVE"}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all appearance-none text-sm"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2 text-base mt-2 shrink-0"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isEdit ? "Save Changes" : "Create Branch")}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
