"use client";

import { Bell, Search, User, Menu, X } from "lucide-react";
import { useState } from "react";
import Sidebar from "./Sidebar";

export default function Header({ user }: { user: any }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="h-16 glass border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
        <div className="flex items-center gap-3 flex-1">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 md:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="relative max-w-md w-full hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search customers, transactions..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>

      <div className="flex items-center gap-4">
        <button className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-950"></span>
        </button>

        <div className="h-8 w-[1px] bg-slate-200 dark:border-slate-800"></div>

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900 dark:text-white leading-none">{user.name}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">
              {user.branchName || "Main Office"} • {user.role}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-800">
            <User className="w-6 h-6 text-slate-400" />
          </div>
        </div>
      </div>
    </header>

    {/* Mobile Menu Overlay */}
    {isMobileMenuOpen && (
      <div className="fixed inset-0 z-50 md:hidden">
        <div 
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <div className="absolute inset-y-0 left-0 w-64 bg-white dark:bg-slate-950 shadow-2xl animate-in slide-in-from-left duration-300">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/logo.webp" alt="Logo" className="w-8 h-8 rounded-lg" />
                <span className="font-bold">Gol Pe Cash</span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto" onClick={() => setIsMobileMenuOpen(false)}>
              <Sidebar user={user} isMobile />
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
