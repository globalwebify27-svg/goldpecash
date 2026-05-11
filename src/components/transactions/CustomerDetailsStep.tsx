"use client";

import { UserCircle, Mail, Phone, MapPin, Loader2 } from "lucide-react";

export default function CustomerDetailsStep({ onNext, onPrev, updateData, data, loading }: any) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
          <UserCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Additional Customer Details</h2>
          <p className="text-sm text-slate-500">Please provide contact and demographic information.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Full Name (Auto-fetched)</label>
            <input
              type="text"
              readOnly
              value={data.fullName || ""}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 outline-none"
            />
          </div>
  
          <div className="space-y-2">
            <label className="text-sm font-medium">Mobile Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                required
                value={data.mobile || ""}
                onChange={(e) => updateData({ mobile: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                placeholder="9999999999"
              />
            </div>
          </div>
  
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={data.email || ""}
                onChange={(e) => updateData({ email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                placeholder="customer@example.com"
              />
            </div>
          </div>
  
          <div className="space-y-2">
            <label className="text-sm font-medium">PAN Number</label>
            <input
              type="text"
              value={data.panNumber || ""}
              onChange={(e) => updateData({ panNumber: e.target.value.toUpperCase() })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
              placeholder="ABCDE1234F"
            />
          </div>
  
          <div className="md:col-span-2 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Aadhaar Address (Auto-fetched)</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                <textarea
                  readOnly
                  value={data.address || ""}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 outline-none min-h-[80px]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <input
                type="checkbox"
                id="diffAddress"
                checked={data.isCurrentAddressDifferent || false}
                onChange={(e) => updateData({ isCurrentAddressDifferent: e.target.checked })}
                className="w-5 h-5 rounded-lg border-slate-300 text-primary focus:ring-primary"
              />
              <label htmlFor="diffAddress" className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                Current residential address is different from Aadhaar address
              </label>
            </div>

            {data.isCurrentAddressDifferent && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <label className="text-sm font-medium">Current Residential Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 w-4 h-4 text-primary" />
                  <textarea
                    required
                    value={data.currentAddress || ""}
                    onChange={(e) => updateData({ currentAddress: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-primary/30 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none min-h-[100px]"
                    placeholder="Enter your current residential address"
                  />
                </div>
              </div>
            )}
          </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
        <button type="button" onClick={onPrev} className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 font-semibold transition-all">
          Back
        </button>
        <button type="submit" className="btn-primary">
          Continue
        </button>
      </div>
    </form>
  );
}
