"use client";

import { useState } from "react";
import { User, Mail, Phone, Loader2, Save } from "lucide-react";
import { updateProfileAction } from "@/app/actions/user";

export default function ProfileSettings({ user }: any) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  if (!user) return <div className="p-4 text-slate-500">Loading user data...</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    const result = await updateProfileAction(user.id, formData);
    if (result.success) {
      setMessage({ type: "success", text: "Profile updated successfully" });
    } else {
      setMessage({ type: "error", text: result.message || "Failed to update profile" });
    }
    setLoading(false);
  };

  const isReadOnly = user?.role !== "SUPER_ADMIN";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold ml-1">Full Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              required
              readOnly={isReadOnly}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all ${isReadOnly ? 'opacity-70 cursor-not-allowed bg-slate-50' : ''}`}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold ml-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="email" 
              required
              readOnly={isReadOnly}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all ${isReadOnly ? 'opacity-70 cursor-not-allowed bg-slate-50' : ''}`}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold ml-1">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="tel" 
              readOnly={isReadOnly}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={`w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all ${isReadOnly ? 'opacity-70 cursor-not-allowed bg-slate-50' : ''}`}
              placeholder="+91 00000 00000"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold ml-1">Role</label>
          <input 
            type="text" 
            disabled
            value={user.role}
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-500 outline-none"
          />
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-2xl text-sm font-medium animate-in slide-in-from-top-2 duration-300 ${
          message.type === "success" ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"
        }`}>
          {message.text}
        </div>
      )}

      {!isReadOnly && (
        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary flex items-center gap-2 px-8"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Changes
          </button>
        </div>
      )}
    </form>
  );
}
