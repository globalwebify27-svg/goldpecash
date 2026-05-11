"use client";

import { useState } from "react";
import { Lock, Loader2, Save, ShieldCheck } from "lucide-react";
import { updatePasswordAction } from "@/app/actions/user";

export default function SecuritySettings({ user }: any) {
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }
    
    setLoading(true);
    setMessage({ type: "", text: "" });

    const result = await updatePasswordAction(user.id, {
      current: passwords.current,
      new: passwords.new
    });

    if (result.success) {
      setMessage({ type: "success", text: "Password updated successfully" });
      setPasswords({ current: "", new: "", confirm: "" });
    } else {
      setMessage({ type: "error", text: result.message || "Failed to update password" });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md space-y-8">
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 text-amber-700 dark:text-amber-500">
        <ShieldCheck className="w-6 h-6 flex-shrink-0" />
        <p className="text-xs font-medium">Changing your password will log you out of all other active sessions.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold ml-1">Current Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="password" 
              required
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold ml-1">New Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="password" 
              required
              minLength={6}
              value={passwords.new}
              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold ml-1">Confirm New Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="password" 
              required
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all"
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

        <button 
          type="submit" 
          disabled={loading || !passwords.current || !passwords.new}
          className="btn-primary w-full flex items-center gap-2 justify-center py-3"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Update Password
        </button>
      </form>
    </div>
  );
}
