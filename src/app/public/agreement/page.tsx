"use client";

import { useEffect, useState, use } from "react";
import { getPublicTransaction } from "@/app/actions/transaction";
import { FileText, Printer, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";

interface PublicAgreementPageProps {
  searchParams: Promise<{ txnId?: string; print?: string }>;
}

export default function PublicAgreementPage(props: PublicAgreementPageProps) {
  const searchParams = use(props.searchParams);
  const txnId = searchParams.txnId;
  const autoPrint = searchParams.print === "true";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      if (!txnId) {
        setError("Invalid agreement link. Missing transaction ID.");
        setLoading(false);
        return;
      }
      try {
        const res = await getPublicTransaction(txnId);
        if (res.success && res.data) {
          setData(res.data);
          
          if (autoPrint) {
            setTimeout(() => {
              window.print();
            }, 800);
          }
        } else {
          setError(res.message || "Could not load the agreement details.");
        }
      } catch (err) {
        console.error(err);
        setError("An unexpected error occurred while fetching the agreement.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [txnId, autoPrint]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-slate-500 font-medium">Loading agreement details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
        <div className="bg-white dark:bg-slate-900 border border-red-100 dark:border-red-950 p-8 rounded-3xl max-w-md w-full text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Access Denied</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{error || "This agreement details could not be found."}</p>
        </div>
      </div>
    );
  }

  const subtotal = data.goldItems ? data.goldItems.reduce((acc: number, item: any) => {
    const netWeight = (parseFloat(item.gross) || 0) - (parseFloat(item.stone) || 0);
    return acc + (netWeight * (parseFloat(item.rate) || 0) * (parseFloat(item.purity) / 100));
  }, 0) : 0;
  const lessAmount = subtotal * ((data.lessPercent || 0) / 100);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      {/* Custom Global Style for Printing */}
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
            top: 0px;
            width: 100%;
            padding: 0px;
            background: white !important;
            color: black !important;
            display: block !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Floating Action Header (Hide during Print) */}
      <div className="max-w-2xl mx-auto mb-6 flex justify-between items-center no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white">Gold Purchase Agreement</h1>
            <p className="text-xs text-slate-500">{data.transactionNumber}</p>
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
        >
          <Printer className="w-4 h-4" /> Print / Save PDF
        </button>
      </div>

      {/* Printable Agreement Document Container */}
      <div 
        id="printable-agreement" 
        className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs text-slate-900 dark:text-slate-100 shadow-sm"
      >
        <div className="text-center border-b pb-4 pt-2">
          <img src="/logo.webp" alt="Gold Pe Cash" className="h-12 mx-auto object-contain mb-1" />
          <p className="text-[11px] font-bold uppercase text-slate-800 dark:text-slate-100">GPC ORNAMENTS (OPC) PRIVATE LIMITED</p>
          <p className="text-[9px] font-bold tracking-widest uppercase text-slate-500">Premium Gold Buying Service</p>
          <p className="text-[10px] text-slate-400">Authorized Branch: {data.branchName} | Agreement: Digitally Signed</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b pb-4">
          <div className="space-y-2">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Customer Details</p>
              <p className="font-bold text-base text-slate-900 dark:text-white">{data.fullName}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-slate-600 dark:text-slate-350 w-full leading-tight">
                <span className="font-bold text-[9px] text-slate-400 block uppercase">Permanent Address (Aadhaar)</span>
                {data.address}
              </p>
              {data.currentAddress && (
                <p className="text-slate-600 dark:text-slate-350 w-full leading-tight">
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
              <p className="font-bold text-slate-900 dark:text-white">{new Date().toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}</p>
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
                <th className="px-3 py-2 text-right">Stone Wt</th>
                <th className="px-3 py-2 text-right">Purity</th>
                <th className="px-3 py-2 text-right">Rate/g</th>
                <th className="px-3 py-2 text-right">Value (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.goldItems.map((item: any, i: number) => {
                const netWeight = (parseFloat(item.gross) || 0) - (parseFloat(item.stone) || 0);
                const baseValue = netWeight * (parseFloat(item.rate) || 0) * (parseFloat(item.purity) / 100);
                return (
                  <tr key={i}>
                    <td className="px-3 py-2">
                      <p className="font-bold dark:text-white">{item.type}</p>
                    </td>
                    <td className="px-3 py-2 text-right font-medium dark:text-slate-200">{item.gross}g</td>
                    <td className="px-3 py-2 text-right font-medium dark:text-slate-200">{item.stone}g</td>
                    <td className="px-3 py-2 text-right font-medium dark:text-slate-200">{item.purity}%</td>
                    <td className="px-3 py-2 text-right font-medium dark:text-slate-200">₹ {(parseFloat(item.rate) || 0).toLocaleString("en-IN")}</td>
                    <td className="px-3 py-2 text-right font-bold dark:text-white">₹ {(baseValue || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-200 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-400">
                <td className="px-3 py-1.5 text-right" colSpan={5}>Subtotal</td>
                <td className="px-3 py-1.5 text-right">₹ {(subtotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
              </tr>
              {data.lessPercent > 0 && (
                <tr className="font-semibold text-red-500">
                  <td className="px-3 py-1.5 text-right" colSpan={5}>Less ({data.lessPercent}%)</td>
                  <td className="px-3 py-1.5 text-right">-₹ {(lessAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                </tr>
              )}
              {data.addAmount > 0 && (
                <tr className="font-semibold text-green-500">
                  <td className="px-3 py-1.5 text-right" colSpan={5}>Add Amount</td>
                  <td className="px-3 py-1.5 text-right">+₹ {(parseFloat(data.addAmount) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                </tr>
              )}
              <tr className="bg-slate-900 text-white font-bold">
                <td className="px-3 py-3 rounded-bl-lg" colSpan={5}>
                  Net Total Payout
                  <span className="ml-2 text-[10px] font-normal text-slate-300 uppercase tracking-widest">
                    (Via: {data.paymentMethod || "CASH"})
                  </span>
                </td>
                <td className="px-3 py-3 text-right text-lg text-primary rounded-br-lg">₹ {(data.totalPayout || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2" style={{ pageBreakInside: 'avoid' }}>
           <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase text-slate-400">Gold Photos</p>
              <div className="grid grid-cols-3 gap-2">
                {data.goldPhotos && data.goldPhotos.length > 0 ? (
                  data.goldPhotos.map((photo: string, i: number) => (
                    <img key={i} src={photo} className="w-full h-20 rounded-lg object-cover border border-slate-200" />
                  ))
                ) : data.goldPhoto ? (
                  <img src={data.goldPhoto} className="w-full h-20 rounded-lg object-cover border border-slate-200" />
                ) : (
                  <p className="text-slate-400 italic text-[10px]">No gold photos uploaded</p>
                )}
              </div>
           </div>
           <div className="space-y-1.5 text-left sm:text-right">
              <p className="text-[10px] font-bold uppercase text-slate-400">Invoice/Aadhaar Photos</p>
              <div className="grid grid-cols-3 gap-2 sm:justify-items-end">
                {data.invoicePhotos && data.invoicePhotos.length > 0 ? (
                  data.invoicePhotos.map((photo: string, i: number) => (
                    <img key={i} src={photo} className="w-full h-20 rounded-lg object-cover border border-slate-200" />
                  ))
                ) : data.invoicePhoto ? (
                  <img src={data.invoicePhoto} className="w-full h-20 rounded-lg object-cover border border-slate-200" />
                ) : (
                  <p className="text-slate-400 italic text-[10px] w-full text-left sm:text-right">No invoice/aadhaar uploaded</p>
                )}
              </div>
           </div>
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
            <p className="text-[9px] text-green-600 font-bold uppercase tracking-wider mt-0.5">✓ Digitally Signed</p>
          </div>
        </div>

        <div className="pt-2 text-[9px] text-slate-400 leading-tight" style={{ pageBreakInside: 'avoid' }}>
          <div className="font-bold mb-0.5 uppercase text-slate-500 flex justify-between items-center">
            <span>Terms & Conditions:</span>
            <a 
              href="/GOLD%20EKYC%20AGREEMENT%20T%26C.pdf" 
              target="_blank" 
              className="text-primary hover:underline font-bold no-print"
            >
              View Full T&C (PDF)
            </a>
          </div>
          <p>1. I hereby declare that the gold ornaments listed above are my personal property. 2. I confirm that I am selling this gold voluntarily. 3. The purity and weight have been verified in my presence. 4. GPC ORNAMENTS (OPC) PRIVATE LIMITED is not responsible for any legal disputes regarding the ownership of these ornaments. <span className="hidden print:inline font-bold text-slate-500">(Full Terms & Conditions available at /GOLD EKYC AGREEMENT T&C.pdf)</span></p>
        </div>
      </div>
    </div>
  );
}
