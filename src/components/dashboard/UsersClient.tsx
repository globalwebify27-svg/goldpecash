"use client";

import { useState, useEffect, useRef } from "react";
import { 
  UserCircle, 
  Shield, 
  Building2, 
  Mail,
  MoreVertical,
  Pencil,
  Power,
  PowerOff
} from "lucide-react";
import { toggleUserStatusAction } from "@/app/actions/user";
import { useRouter } from "next/navigation";
import UserModal from "./UserModal";

interface UsersClientProps {
  users: any[];
  branches: any[];
}

export default function UsersClient({ users, branches }: UsersClientProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    setActiveMenuId(null);
    const res = await toggleUserStatusAction(userId, currentStatus);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.message || "Failed to toggle status");
    }
  };

  return (
    <div className="premium-card !p-0 overflow-visible">
      <div className="overflow-x-auto overflow-y-visible">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-[10px] uppercase font-bold text-slate-400 tracking-widest">
              <th className="px-6 py-4">User Details</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Branch</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            {users.length > 0 ? users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <UserCircle className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {user.role.replace('_', ' ')}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Building2 className="w-4 h-4" />
                    {user.branchName || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                    user.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right relative overflow-visible">
                  <div className="inline-block text-left">
                    <button 
                      onClick={() => setActiveMenuId(activeMenuId === user.id ? null : user.id)}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-400 hover:text-slate-950 dark:hover:text-white"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuId === user.id && (
                      <div 
                        ref={menuRef}
                        className="absolute right-6 mt-1 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-1 duration-150"
                      >
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setActiveMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5 text-slate-400" />
                          Edit Details
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user.id, user.status)}
                          className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
                            user.status === 'ACTIVE'
                              ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20'
                              : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20'
                          }`}
                        >
                          {user.status === 'ACTIVE' ? (
                            <>
                              <PowerOff className="w-3.5 h-3.5" />
                              Deactivate User
                            </>
                          ) : (
                            <>
                              <Power className="w-3.5 h-3.5" />
                              Activate User
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <UserModal 
          user={editingUser} 
          branches={branches} 
          onClose={() => setEditingUser(null)} 
        />
      )}
    </div>
  );
}
