"use client";

import { Pencil, Trash2, CheckCircle2, Upload } from "lucide-react";
import { useState } from "react";

export default function SignatureStep({ onNext, onPrev, updateData, data, loading }: any) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(data.signature || null);

  // Upload handler
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreviewUrl(base64);
        updateData({ signature: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
          <Pencil className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Customer Signature</h2>
          <p className="text-sm text-slate-500">Please upload an image of the customer's signature.</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto space-y-6">
        {/* Signature Area */}
        <div className="aspect-[2/1] rounded-2xl bg-white dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-800 relative group overflow-hidden flex items-center justify-center">
          {previewUrl ? (
            <div className="relative w-full h-full flex items-center justify-center bg-slate-50 dark:bg-slate-905 rounded-xl overflow-hidden p-2">
              <img src={previewUrl} className="max-h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
              <button
                type="button"
                onClick={() => {
                  setPreviewUrl(null);
                  updateData({ signature: null });
                }}
                className="absolute top-3 right-3 p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 dark:bg-red-950/25 dark:text-red-400 dark:hover:bg-red-950/45 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 text-center gap-3">
              <Upload className="w-10 h-10 text-slate-300 dark:text-slate-700 animate-pulse" />
              <div className="relative">
                <span className="btn-primary text-xs px-4 py-2 cursor-pointer">
                  Choose Signature Image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">PNG, JPG or JPEG (transparent signature preferred)</p>
            </div>
          )}
        </div>

        <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-xs text-slate-500">
          <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
          <p>By uploading, the customer agrees to the terms and conditions of gold purchase and confirms that the gold belongs to them and is not subject to any dispute.</p>
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
        <button onClick={onPrev} className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 font-semibold transition-all">
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!previewUrl || loading}
          className="btn-primary disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? "Saving..." : "Generate Agreement"}
        </button>
      </div>
    </div>
  );
}
