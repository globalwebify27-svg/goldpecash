"use client";

import { Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function SignatureStep({ onNext, onPrev, updateData, data }: any) {
  const [signed, setSigned] = useState(false);

  const handleSign = () => {
    setSigned(true);
    updateData({ signature: "base64_signature_placeholder" });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
          <Pencil className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Customer Signature</h2>
          <p className="text-sm text-slate-500">The customer must sign the digital agreement to proceed.</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto space-y-4">
        <div className="aspect-[2/1] rounded-2xl bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 relative group overflow-hidden">
          {!signed ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <Pencil className="w-12 h-12 mb-4 animate-bounce" />
              <p className="text-sm font-medium">Use mouse or touch to sign here</p>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50">
              <div className="w-3/4 h-2/3 border-b-2 border-slate-400 flex items-end justify-center italic text-4xl text-slate-700 dark:text-slate-300 pb-2">
                {data.fullName}
              </div>
              <div className="absolute top-4 right-4">
                <button 
                  onClick={() => setSigned(false)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
          <canvas 
            className="absolute inset-0 cursor-crosshair" 
            onClick={handleSign}
          ></canvas>
        </div>

        <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-xs text-slate-500">
          <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary" />
          <p>By signing, the customer agrees to the terms and conditions of gold purchase and confirms that the gold belongs to them and is not subject to any dispute.</p>
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
        <button onClick={onPrev} className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 font-semibold transition-all">
          Back
        </button>
        <button 
          onClick={onNext} 
          disabled={!signed}
          className="btn-primary disabled:opacity-50"
        >
          Generate Agreement
        </button>
      </div>
    </div>
  );
}
