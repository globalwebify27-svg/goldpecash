"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import AadhaarStep from "@/components/transactions/AadhaarStep";
import CustomerDetailsStep from "@/components/transactions/CustomerDetailsStep";
import PhotoCaptureStep from "@/components/transactions/PhotoCaptureStep";
import GoldValuationStep from "@/components/transactions/GoldValuationStep";
import SignatureStep from "@/components/transactions/SignatureStep";
import AgreementStep from "@/components/transactions/AgreementStep";
import { 
  saveCustomer, 
  saveTransactionDraft, 
  saveTransactionPhotos, 
  saveTransactionValuation,
  getDraftTransaction,
  saveTransactionSignature
} from "@/app/actions/transaction";

const steps = [
  "Aadhaar Verification",
  "Customer Details",
  "Live Photo",
  "Gold Valuation",
  "Signature",
  "Agreement"
];

export default function NewTransactionPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const prefillAadhaar = searchParams?.get('aadhaar') || "";
  const isNewMode = searchParams?.get('new') === 'true';
  const txnId = searchParams?.get('txnId');

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    aadhaarNumber: prefillAadhaar,
    fullName: "",
    dob: "",
    gender: "",
    mobile: "",
    email: "",
    panNumber: "",
    address: "",
    isCurrentAddressDifferent: false,
    currentAddress: "",
    photo: null,
    goldPhoto: null,
    invoicePhoto: null,
    goldPhotos: [] as string[],
    invoicePhotos: [] as string[],
    goldItems: [],
    totalPayout: 0,
    paymentMethod: "CASH",
    signature: null,
    customerId: null,
    transactionId: null,
  });

  const [saving, setSaving] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(!!(prefillAadhaar || txnId));

  useEffect(() => {
    async function loadDraft() {
      if (!prefillAadhaar && !txnId) {
        setLoadingDraft(false);
        return;
      }
      const res = await getDraftTransaction(prefillAadhaar, isNewMode, txnId || undefined);
      if (res.success && res.data) {
        setFormData(prev => ({ ...prev, ...res.data }));
        
        if (txnId) {
          setCurrentStep(steps.length - 1);
        } else if (isNewMode) {
          setCurrentStep(1); 
        } else {
          if (res.data.signature) setCurrentStep(5);
          else if (res.data.goldItems?.length > 0) setCurrentStep(4);
          else if (res.data.photo) setCurrentStep(3);
          else if (res.data.mobile) setCurrentStep(2);
          else setCurrentStep(1);
        }
      }
      setLoadingDraft(false);
    }
    loadDraft();
  }, [prefillAadhaar, isNewMode, txnId]);

  const handleNextStep = async (stepData?: any) => {
    setSaving(true);
    try {
      const currentData = stepData ? { ...formData, ...stepData } : formData;

      if (currentStep === 1) { // Customer Details Step
        const res = await saveCustomer({
          ...currentData,
          branchId: (session?.user as any)?.branchId,
          createdBy: (session?.user as any)?.id
        });
        if (!res.success) throw new Error(res.error);
        
        const txnRes = await saveTransactionDraft({
          customerId: res.customerId,
          branchId: (session?.user as any)?.branchId,
          createdBy: (session?.user as any)?.id,
          transactionId: currentData.transactionId
        });
        if (!txnRes.success) throw new Error(txnRes.error);

        setFormData(prev => ({ 
          ...prev, 
          customerId: res.customerId, 
          transactionId: txnRes.transactionId,
          transactionNumber: txnRes.transactionNumber
        }));
      } 
      else if (currentStep === 2) { // Photo Capture Step
        const res = await saveTransactionPhotos(currentData.transactionId!, currentData.customerId!, {
          customerPhoto: currentData.photo || undefined
        });
        if (!res.success) throw new Error(res.error);
      }
      else if (currentStep === 3) { // Gold Valuation Step
        let txnId = currentData.transactionId;
        if (!txnId) {
          const txnRes = await saveTransactionDraft({
            customerId: currentData.customerId,
            branchId: (session?.user as any)?.branchId,
            createdBy: (session?.user as any)?.id,
            transactionId: null
          });
          if (!txnRes.success) throw new Error(txnRes.error);
          txnId = txnRes.transactionId;
          setFormData(prev => ({ 
            ...prev, 
            transactionId: txnId,
            transactionNumber: txnRes.transactionNumber
          }));
        }

        const res = await saveTransactionValuation(
          txnId, 
          currentData.goldItems, 
          currentData.totalPayout, 
          currentData.paymentMethod,
          currentData.lessPercent,
          currentData.addAmount
        );
        if (!res.success) throw new Error(res.error);
        
         const photoRes = await saveTransactionPhotos(txnId, currentData.customerId!, {
          goldPhoto: currentData.goldPhoto || undefined,
          invoicePhoto: currentData.invoicePhoto || undefined,
          goldPhotos: currentData.goldPhotos || [],
          invoicePhotos: currentData.invoicePhotos || []
        });
        if (!photoRes.success) throw new Error(photoRes.error);
      }
      else if (currentStep === 4) { // Signature Step
        const res = await saveTransactionSignature(currentData.transactionId!, currentData.customerId!, currentData.signature!);
        if (!res.success) throw new Error(res.error);
      }
      
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    } catch (error: any) {
      alert("Error saving progress: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));
  const jumpToStep = (index: number) => setCurrentStep(index);

  const updateFormData = (newData: any) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  if (loadingDraft) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">Fetching previous data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-8 no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">New Purchase Transaction</h1>
          <p className="text-slate-500 dark:text-slate-400">Follow the steps to complete the gold purchase process.</p>
        </div>

        {/* Stepper */}
        <div className="relative flex justify-between">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0"></div>
          <div 
          className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-500"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        ></div>
        
        {steps.map((step, index) => (
          <div key={step} className="relative z-10 flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
              index <= currentStep 
                ? "bg-primary text-primary-foreground premium-shadow" 
                : "bg-slate-200 dark:bg-slate-800 text-slate-500"
            }`}>
              {index + 1}
            </div>
            <p className={`text-[10px] font-bold uppercase tracking-wider mt-2 hidden md:block ${
              index <= currentStep ? "text-primary" : "text-slate-400"
            }`}>
              {step}
            </p>
          </div>
        ))}
        </div>
      </div>

      <div className="premium-card">
        {currentStep === 0 && (
          <AadhaarStep onNext={() => setCurrentStep(1)} updateData={updateFormData} data={formData} jumpToStep={jumpToStep} />
        )}
        {currentStep === 1 && (
          <CustomerDetailsStep onNext={handleNextStep} onPrev={prevStep} updateData={updateFormData} data={formData} loading={saving} />
        )}
        {currentStep === 2 && (
          <PhotoCaptureStep onNext={handleNextStep} onPrev={prevStep} updateData={updateFormData} data={formData} loading={saving} />
        )}
        {currentStep === 3 && (
          <GoldValuationStep onNext={handleNextStep} onPrev={prevStep} updateData={updateFormData} data={formData} loading={saving} />
        )}
        {currentStep === 4 && (
          <SignatureStep onNext={handleNextStep} onPrev={prevStep} updateData={updateFormData} data={formData} loading={saving} />
        )}
        {currentStep === 5 && (
          <AgreementStep onPrev={prevStep} data={formData} user={session?.user} />
        )}
      </div>
    </div>
  );
}
