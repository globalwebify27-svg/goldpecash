"use client";

import { useState } from "react";
import { X, Building2, MapPin, Phone, User, Loader2 } from "lucide-react";
import { createBranchAction } from "../../app/actions/branch";
import { useRouter } from "next/navigation";

export default function BranchModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await createBranchAction(formData);

    if (result.success) {
      router.refresh();
      onClose();
    } else {
      setError(result.message || "Failed to create branch");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Add New Branch</h2>
            <p className="text-sm text-slate-500">Create a new operational branch for GoldPeCash.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-red-600 rounded-2xl text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-semibold ml-1">Branch Name</label>
              <input 
                name="name"
                required
                placeholder="e.g. Hyderabad Main"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Branch Code</label>
              <input 
                name="code"
                required
                placeholder="e.g. HYD01"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Phone Number</label>
              <input 
                name="phone"
                required
                placeholder="10-digit mobile"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold ml-1">Manager Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                name="managerName"
                required
                placeholder="Branch Manager Full Name"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold ml-1">Full Address</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
              <textarea 
                name="address"
                required
                placeholder="Complete branch location address"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all min-h-[100px]"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-4 flex items-center justify-center gap-2 text-lg"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Branch"}
          </button>
        </form>
      </div>
    </div>
  );
}
