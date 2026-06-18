"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  History, 
  MapPin, 
  UserCircle, 
  BarChart3, 
  Settings,
  LogOut,
  PlusCircle,
  MessageSquare
} from "lucide-react";
import Image from "next/image";
import { signOut } from "next-auth/react";

const sidebarLinks = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "New Transaction", href: "/transactions/new", icon: PlusCircle },
  { name: "Transactions", href: "/transactions", icon: History },
  { name: "Enquiries", href: "/enquiries", icon: MessageSquare },
  { name: "Branches", href: "/branches", icon: MapPin, role: "SUPER_ADMIN" },
  { name: "Users", href: "/users", icon: UserCircle, role: "SUPER_ADMIN" },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar({ user, isMobile }: { user: any; isMobile?: boolean }) {
  const pathname = usePathname();

  const asideClasses = isMobile 
    ? "w-full flex flex-col h-full bg-transparent border-none" 
    : "w-64 glass border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col sticky top-0 h-screen";

  return (
    <aside className={asideClasses}>
      {!isMobile && (
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <img 
            src="/logo.webp" 
            alt="Logo" 
            className="w-10 h-10 rounded-lg"
          />
          <div>
            <h1 className="font-bold text-slate-900 dark:text-white leading-tight">Gol Pe Cash</h1>
            <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Management</p>
          </div>
        </div>
      )}

      <nav className="flex-1 p-4 space-y-1">
        {sidebarLinks.map((link) => {
          if (link.role && user.role !== link.role) return null;
          
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? "bg-primary text-primary-foreground premium-shadow font-semibold" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
              }`}
            >
              <link.icon className={`w-5 h-5 ${isActive ? "text-primary-foreground" : "text-slate-500"}`} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => signOut()}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
