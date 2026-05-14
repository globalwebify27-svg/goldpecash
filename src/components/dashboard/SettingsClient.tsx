"use client";

import { useState } from "react";
import ProfileSettings from "@/components/dashboard/ProfileSettings";
import SecuritySettings from "@/components/dashboard/SecuritySettings";
import BranchSettings from "@/components/dashboard/BranchSettings";
import { User, Shield, Building2 } from "lucide-react";

export default function SettingsClient({ user, branch }: any) {
  const userRole = user?.role;
  const [activeTab, setActiveTab] = useState(userRole === "SUPER_ADMIN" ? "profile" : "security");

  const tabs = [
    { id: "profile", label: "My Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    ...(userRole === "SUPER_ADMIN" && branch ? [{ id: "branch", label: "Branch Settings", icon: Building2 }] : []),
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your account preferences and branch configuration.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? "bg-primary text-primary-foreground premium-shadow" 
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {/* Profile Section */}
          {activeTab === "profile" && (
            <div className="premium-card space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Personal Information</h2>
                  <p className="text-xs text-slate-500">Update your name, email and contact details.</p>
                </div>
              </div>
              <ProfileSettings user={user} />
            </div>
          )}

          {/* Security Section */}
          {activeTab === "security" && (
            <div className="premium-card space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Security & Password</h2>
                  <p className="text-xs text-slate-500">Ensure your account remains secure with a strong password.</p>
                </div>
              </div>
              <SecuritySettings user={user} />
            </div>
          )}

          {/* Branch Section */}
          {activeTab === "branch" && branch && (
            <div className="premium-card space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Branch Configuration</h2>
                  <p className="text-xs text-slate-500">Manage business details for this specific branch.</p>
                </div>
              </div>
              <BranchSettings branch={branch} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
