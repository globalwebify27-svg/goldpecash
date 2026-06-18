"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Search, Phone, Check, RefreshCw, User, Calendar } from "lucide-react";
import { updateEnquiryStatus } from "@/app/actions/enquiry";

export default function EnquirySection({ enquiries: initialEnquiries }: any) {
  const [enquiries, setEnquiries] = useState(initialEnquiries || []);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "FOLLOWED_UP">("PENDING");
  const [search, setSearch] = useState("");

  // Sync state with server props when they change (e.g., after router.refresh())
  useEffect(() => {
    setEnquiries(initialEnquiries || []);
  }, [initialEnquiries]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await updateEnquiryStatus(id, newStatus);
      if (res.success) {
        setEnquiries(enquiries.map((enq: any) => 
          enq.id === id ? { ...enq, status: newStatus } : enq
        ));
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    }
  };

  const filteredEnquiries = enquiries.filter((enq: any) => {
    const matchesFilter = filter === "ALL" ? true : enq.status === filter;
    const matchesSearch = 
      enq.name.toLowerCase().includes(search.toLowerCase()) ||
      enq.mobile.includes(search) ||
      enq.message.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div id="enquiries" className="premium-card space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Customer Enquiries</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Track and follow up on shop enquiries.</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg w-full sm:w-auto">
          {[
            { id: "PENDING", label: "Pending" },
            { id: "FOLLOWED_UP", label: "Followed Up" },
            { id: "ALL", label: "All Enquiries" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`flex-1 sm:flex-initial py-1.5 px-3 rounded-md text-xs font-semibold transition-all ${
                filter === tab.id
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search enquiries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none text-xs focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Enquiries List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-150 dark:border-slate-850 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Message</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
            {filteredEnquiries.length > 0 ? (
              filteredEnquiries.map((enq: any) => (
                <tr key={enq.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                  <td className="py-4 px-4">
                    <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {enq.name}
                    </p>
                    <p className="text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {enq.mobile}
                    </p>
                  </td>
                  <td className="py-4 px-4 max-w-xs md:max-w-sm truncate whitespace-pre-wrap text-slate-600 dark:text-slate-350">
                    {enq.message}
                  </td>
                  <td className="py-4 px-4 text-slate-500 whitespace-nowrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(enq.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      enq.status === "PENDING"
                        ? "bg-amber-50 text-amber-600 dark:bg-amber-950/20"
                        : "bg-green-50 text-green-600 dark:bg-green-950/20"
                    }`}>
                      {enq.status === "PENDING" ? "Pending" : "Followed Up"}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    {enq.status === "PENDING" ? (
                      <button
                        onClick={() => handleUpdateStatus(enq.id, "FOLLOWED_UP")}
                        className="py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-green-500 hover:text-green-500 hover:bg-green-50/10 font-bold transition-all text-[10px] flex items-center justify-center gap-1.5 ml-auto"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Mark Followed Up
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(enq.id, "PENDING")}
                        className="py-1 px-2.5 rounded-lg text-slate-400 hover:text-amber-500 font-bold transition-all text-[10px] flex items-center justify-center gap-1.5 ml-auto"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Re-open
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-10 text-center text-slate-400 font-medium">
                  No enquiries found matching filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
