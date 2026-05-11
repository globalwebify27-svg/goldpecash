"use client";

import { useState } from "react";
import { Building2, MapPin, Phone, Mail, Loader2, Save } from "lucide-react";
import { updateBranchAction } from "@/app/actions/user";

export default function BranchSettings({ branch }: any) {
  const [formData, setFormData] = useState({
    name: branch?.name || "",
    address: branch?.address || "",
    phone: branch?.phone || "",
    email: branch?.email || ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  if (!branch) return (
    <div className="p-8 text-center text-slate-500 italic">
      No branch information associated with your account.
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    const result = await updateBranchAction(branch.id, formData);
    if (result.success) {
      setMessage({ type: "success", text: "Branch settings updated successfully" });
    } else {
      setMessage({ type: "error", text: result.message || "Failed to update branch" });
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold ml-1">Branch Name</label>
          <div className="relative">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold ml-1">Branch Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold ml-1">Branch Phone</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="tel" 
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-semibold ml-1">Branch Address</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
            <textarea 
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all min-h-[100px]"
            />
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-2xl text-sm font-medium animate-in slide-in-from-top-2 duration-300 ${
          message.type === "success" ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex justify-end">
        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary flex items-center gap-2 px-8"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save Branch Details
        </button>
      </div>
    </form>
  );
}
