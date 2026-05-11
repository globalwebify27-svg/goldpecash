"use client";

import { FileText, Printer, Download, CheckCircle2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { completeTransaction } from "@/app/actions/transaction";

export default function AgreementStep({ onPrev, data, user }: any) {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(data.status === 'COMPLETED');
  const [txnNumber, setTxnNumber] = useState(data.transactionNumber || "");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams?.get("print") === "true") {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleFinish = async () => {
    setLoading(true);
    try {
      const result = await completeTransaction(data.transactionId);

      if (result.success) {
        setTxnNumber(data.transactionNumber);
        setCompleted(true);
      } else {
        alert("Error completing transaction: " + result.error);
      }
    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const printableAgreement = (
    <>
      <style jsx global>{`
        @media print {
          @page {
            margin-top: 15mm;
            margin-bottom: 10mm;
          }
          body * {
            visibility: hidden;
          }
          #printable-agreement, #printable-agreement * {
            visibility: visible;
          }
          #printable-agreement {
            position: absolute;
            left: 0;
            top: 20px;
            width: 100%;
            padding: 20px;
            background: white !important;
            color: black !important;
            display: block !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div id="printable-agreement" className={`max-w-2xl mx-auto glass p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 ${completed ? 'hidden print:block' : ''}`}>
        <div className="text-center border-b pb-4 pt-4">
          <img src="/logo.webp" alt="Gold Pe Cash" className="h-14 mx-auto object-contain mb-1" />
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Premium Gold Buying Service</p>
          <p className="text-[10px] text-slate-400">Authorized Branch: {user?.branchName || "Main Branch"} | Agreement: Pending</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b pb-4">
          <div className="space-y-2">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Customer Details</p>
              <p className="font-bold text-base text-slate-900 dark:text-white">{data.fullName}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-slate-600 w-full leading-tight">
                <span className="font-bold text-[9px] text-slate-400 block uppercase">Permanent Address (Aadhaar)</span>
                {data.address}
              </p>
              {data.currentAddress && (
                <p className="text-slate-600 w-full leading-tight">
                  <span className="font-bold text-[9px] text-slate-400 block uppercase">Current Residential Address</span>
                  {data.currentAddress}
                </p>
              )}
            </div>
            <p className="text-slate-600 dark:text-slate-300 font-medium">{data.mobile}</p>
            <div className="pt-1">
              <p className="text-[10px] font-bold uppercase text-slate-400">Aadhaar Verified</p>
              <p className="font-medium text-slate-900 dark:text-white">XXXX-XXXX-{data.aadhaarNumber?.slice(-4)}</p>
            </div>
          </div>
          <div className="space-y-2 text-left sm:text-right flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Agreement Date</p>
              <p className="font-bold text-slate-900">{new Date().toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Customer Photo</p>
              {data.photo && (
                <img src={data.photo} className="w-16 h-16 rounded-lg object-cover border border-slate-200 sm:ml-auto" />
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <th className="px-3 py-2 text-left">Description</th>
                <th className="px-3 py-2 text-right">Gross Wt</th>
                <th className="px-3 py-2 text-right">Rate/g</th>
                <th className="px-3 py-2 text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.goldItems.map((item: any, i: number) => {
                const netWeight = (parseFloat(item.gross) || 0) - (parseFloat(item.stone) || 0);
                const value = netWeight * (parseFloat(item.rate) || 0) * (parseFloat(item.purity) / 100);
                return (
                  <tr key={i}>
                    <td className="px-3 py-2">
                      <p className="font-bold dark:text-white">{item.type}</p>
                      <p className="text-[10px] text-slate-500">Purity: {item.purity}%</p>
                    </td>
                    <td className="px-3 py-2 text-right font-medium dark:text-slate-200">{item.gross}g</td>
                    <td className="px-3 py-2 text-right font-medium dark:text-slate-200">₹ {parseFloat(item.rate).toLocaleString("en-IN")}</td>
                    <td className="px-3 py-2 text-right font-bold dark:text-white">₹ {value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-900 text-white font-bold">
                <td className="px-3 py-3 rounded-bl-lg" colSpan={3}>Net Total Payout</td>
                <td className="px-3 py-3 text-right text-lg text-primary rounded-br-lg">₹ {data.totalPayout.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2" style={{ pageBreakInside: 'avoid' }}>
           <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase text-slate-400">Gold Photo</p>
              {data.goldPhoto && <img src={data.goldPhoto} className="w-full h-24 rounded-lg object-cover border border-slate-200" />}
           </div>
           {data.invoicePhoto && (
             <div className="space-y-1 text-left sm:text-right">
                <p className="text-[10px] font-bold uppercase text-slate-400">Invoice Photo</p>
                <img src={data.invoicePhoto} className="w-full h-24 rounded-lg object-cover border border-slate-200" />
             </div>
           )}
        </div>

        <div className="flex justify-end pt-4" style={{ pageBreakInside: 'avoid' }}>
          <div className="text-center">
            <div className="w-48 h-12 border-b border-slate-300 mb-1 flex items-center justify-center overflow-hidden">
              {data.signature && data.signature.startsWith('data:image/') ? (
                <img src={data.signature} className="h-full object-contain" />
              ) : (
                <span className="italic text-lg font-medium text-slate-900">{data.fullName}</span>
              )}
            </div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Customer Signature</p>
          </div>
        </div>

        <div className="pt-2 text-[9px] text-slate-400 leading-tight" style={{ pageBreakInside: 'avoid' }}>
          <p className="font-bold mb-0.5 uppercase text-slate-500">Terms & Conditions:</p>
          <p>1. I hereby declare that the gold ornaments listed above are my personal property. 2. I confirm that I am selling this gold voluntarily. 3. The purity and weight have been verified in my presence. 4. Gold Pe Cash is not responsible for any legal disputes regarding the ownership of these ornaments.</p>
        </div>
      </div>
    </>
  );

  if (completed) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12 space-y-8 animate-in zoom-in duration-500 no-print">
          <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto premium-shadow">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Transaction Successful!</h2>
            <p className="text-slate-500 mt-2 text-lg">Transaction <span className="font-bold text-primary">#{txnNumber}</span> has been recorded.</p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={handlePrint}
              className="px-8 py-3 rounded-xl border border-slate-200 dark:border-slate-800 font-bold hover:bg-slate-50 flex items-center justify-center gap-2"
            >
              <Printer className="w-5 h-5" /> Print Agreement
            </button>
            <button 
              onClick={() => router.push("/dashboard")}
              className="btn-primary px-8 py-3"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
        {printableAgreement}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 no-print">
        <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Agreement Preview</h2>
          <p className="text-sm text-slate-500">Review all details before finalizing the transaction.</p>
        </div>
      </div>

      {printableAgreement}

      <div className="flex justify-between pt-6 border-t border-slate-100 dark:border-slate-800 no-print">
        <button onClick={onPrev} className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 font-semibold transition-all">
          Back
        </button>
        <div className="flex gap-4">
          <button 
            onClick={handlePrint}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
          >
            <Printer className="w-5 h-5" />
          </button>
          <button 
            onClick={handleFinish}
            disabled={loading}
            className="btn-primary flex items-center gap-2 min-w-[160px] justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              "Confirm & Finish"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
