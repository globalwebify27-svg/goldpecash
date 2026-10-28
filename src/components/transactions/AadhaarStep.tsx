"use client";

import { useState } from "react";
import { Fingerprint, Smartphone, CheckCircle2, AlertCircle, Search, X } from "lucide-react";
import { requestOtpAction, verifyOtpAction } from "@/app/actions/aadhaar";
import { searchCustomer } from "@/app/actions/transaction";

export default function AadhaarStep({ onNext, updateData, data, jumpToStep }: any) {
  const [aadhaar, setAadhaar] = useState(data.aadhaarNumber || "");
  const [otpSent, setOtpSent] = useState(false);
  const [referenceId, setReferenceId] = useState("");
  const [otp, setOtp] = useState("");
  const [otpMessage, setOtpMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");

  // Search Modal State
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  const [searching, setSearching] = useState(false);

  const handleSearchCustomer = async () => {
    if (!searchQuery) return;
    setSearching(true);
    setSearchError("");
    
    const result = await searchCustomer(searchQuery);
    if (result.success) {
      const c = result.data;
      setVerified(true);
      setShowSearchModal(false);
      updateData({
        customerId: c.id,
        aadhaarNumber: c.aadhaarNumber,
        fullName: c.fullName,
        dob: c.dob ? new Date(c.dob).toISOString().split('T')[0] : "",
        gender: c.gender,
        mobile: c.mobile,
        address: c.address,
      });
    } else {
      setSearchError(result.message || "Customer not found.");
    }
    setSearching(false);
  };

  const handleSendOtp = async () => {
    if (aadhaar.length !== 12 || loading) return;
    setLoading(true);
    setError("");
    
    // Check if customer already exists in DB
    const searchResult = await searchCustomer(aadhaar);
    if (searchResult.success) {
      const c = searchResult.data;
      setVerified(true);
      updateData({
        customerId: c.id,
        aadhaarNumber: c.aadhaarNumber,
        fullName: c.fullName,
        dob: c.dob ? new Date(c.dob).toISOString().split('T')[0] : "",
        gender: c.gender,
        mobile: c.mobile,
        address: c.address,
      });
      setLoading(false);
      return;
    } else if (searchResult.isFraud) {
      setError(searchResult.message || "This Aadhaar is blacklisted.");
      setLoading(false);
      return;
    }

    // Customer does not exist, send OTP
    const result = await requestOtpAction(aadhaar);
    if (result.success) {
      setReferenceId(result.referenceId!);
      setOtpMessage(result.message || "OTP sent to your linked mobile number");
      setOtpSent(true);
    } else {
      setError(result.message || "Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const handleManualProceed = () => {
    if (aadhaar.length !== 12) {
      setError("Please enter a valid 12-digit Aadhaar number first.");
      return;
    }
    updateData({
      aadhaarNumber: aadhaar,
      fullName: data.fullName && data.fullName !== "N/A" ? data.fullName : "",
      address: data.address && data.address !== "N/A" ? data.address : "",
    });
    onNext();
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6 || loading) return;
    setLoading(true);
    setError("");

    const result = await verifyOtpAction(otp, referenceId, aadhaar);
    if (result.success) {
      const kyc = result.data?.data || result.data || {};
      setVerified(true);

      // Extract Name supporting multiple API key variations
      const rawName = kyc.name || kyc.fullName || kyc.full_name || kyc.resident_name || kyc.user_full_name || kyc.name_on_card || "";
      const resolvedName = (rawName && rawName !== "N/A" && rawName !== "null" && rawName !== "undefined") ? String(rawName).trim() : "";

      // Build address cleanly supporting string, object, and split_address formats
      let resolvedAddress = "";
      if (typeof kyc.full_address === "string" && kyc.full_address.trim() && kyc.full_address.trim() !== "N/A") {
        resolvedAddress = kyc.full_address.trim();
      } else if (typeof kyc.address === "string" && kyc.address.trim() && kyc.address.trim() !== "N/A") {
        resolvedAddress = kyc.address.trim();
      } else {
        const addrObj = (typeof kyc.address === "object" && kyc.address !== null)
          ? kyc.address
          : (typeof kyc.split_address === "object" && kyc.split_address !== null)
          ? kyc.split_address
          : null;

        if (addrObj) {
          const parts = [
            addrObj.care_of ? `C/O: ${addrObj.care_of}` : null,
            addrObj.house,
            addrObj.street,
            addrObj.landmark,
            addrObj.loc || addrObj.locality,
            addrObj.vtc || addrObj.city,
            addrObj.subdistrict || addrObj.sub_district || addrObj.taluk || addrObj.tehsil,
            addrObj.post_office || addrObj.po,
            addrObj.district,
            addrObj.state
          ].filter(val => val && val !== "null" && val !== "undefined" && String(val).trim() !== "");
          
          resolvedAddress = parts.join(", ");
          const pin = addrObj.pincode || addrObj.pin || addrObj.postal_code;
          if (pin) {
            resolvedAddress += ` - ${pin}`;
          }
        }
      }

      if (resolvedAddress === "N/A" || resolvedAddress === "null" || resolvedAddress === "undefined") {
        resolvedAddress = "";
      }

      const rawDob = kyc.date_of_birth || kyc.dob || (kyc.year_of_birth ? `${kyc.year_of_birth}-01-01` : "");
      const resolvedDob = (rawDob && rawDob !== "N/A") ? String(rawDob).trim() : "";

      const rawGender = kyc.gender || "";
      const resolvedGender = (rawGender && rawGender !== "N/A") ? String(rawGender).trim() : "";

      const photoUrl = kyc.photo || kyc.image || kyc.profile_image || null;

      updateData({
        aadhaarNumber: aadhaar,
        fullName: resolvedName,
        dob: resolvedDob,
        gender: resolvedGender,
        address: resolvedAddress,
        ...(photoUrl ? { photo: photoUrl.startsWith("data:") ? photoUrl : `data:image/jpeg;base64,${photoUrl}` } : {})
      });
    } else {
      setError(result.message || "Invalid OTP or verification failed.");
    }
    setLoading(false);
  };


  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Fingerprint className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Aadhaar Verification</h2>
            <p className="text-sm text-slate-500">Securely verify customer identity using Aadhaar e-KYC.</p>
          </div>
        </div>
        {!verified && (
          <button onClick={() => setShowSearchModal(true)} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-sm font-bold transition-all text-slate-600 dark:text-slate-300">
            Existing Customer?
          </button>
        )}
      </div>

      {showSearchModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowSearchModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-primary-foreground rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-2">Search Customer</h3>
            <p className="text-sm text-slate-500 mb-6">Enter Aadhaar or Mobile Number to fetch existing details.</p>
            
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value.replace(/\D/g, ""))}
                  placeholder="Aadhaar or Mobile Number"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all"
                />
              </div>
              
              {searchError && <p className="text-red-500 text-sm font-medium">{searchError}</p>}
              
              <button 
                onClick={handleSearchCustomer}
                disabled={searching || !searchQuery}
                className="w-full btn-primary py-3"
              >
                {searching ? "Searching..." : "Search & Fetch"}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-2xl space-y-3 animate-in shake duration-300 max-w-md mx-auto">
          <div className="flex items-start gap-2.5 text-red-600">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold">Aadhaar OTP Service Unavailable</p>
              <p className="text-xs mt-1 text-red-700/80 dark:text-red-300 leading-relaxed">{error}</p>
            </div>
          </div>
          {aadhaar.length === 12 && (
            <button
              type="button"
              onClick={handleManualProceed}
              className="w-full py-2.5 px-4 bg-primary text-primary-foreground hover:brightness-110 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              Proceed with In-Store Manual Verification &rarr;
            </button>
          )}
        </div>
      )}

      {!verified ? (
        <div className="max-w-md mx-auto space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Aadhaar Number</label>
            <div className="relative">
              <input
                type="text"
                maxLength={12}
                disabled={otpSent}
                value={aadhaar}
                onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ""))}
                placeholder="0000 0000 0000"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all disabled:opacity-50"
              />
              {aadhaar.length === 12 && !otpSent && (
                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="absolute right-2 top-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:brightness-110 disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              )}
            </div>
            {aadhaar.length === 12 && !otpSent && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleManualProceed}
                  className="text-xs text-slate-500 hover:text-primary transition-all font-semibold underline underline-offset-4"
                >
                  Skip OTP & Verify In-Store (Manual Entry)
                </button>
              </div>
            )}
          </div>

          {otpSent && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Enter 6-digit OTP</label>
                  <button 
                    onClick={() => setOtpSent(false)}
                    className="text-xs text-primary hover:underline font-bold"
                  >
                    Change Number
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <Smartphone className="w-5 h-5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="••••••"
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all tracking-[1em] font-bold text-center"
                  />
                </div>
                <p className="text-[10px] text-slate-500 text-center">{otpMessage}</p>
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 6}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Verify & Fetch Data
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-2xl p-8 text-center space-y-6 animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto premium-shadow">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-green-700 dark:text-green-400">Aadhaar Verified!</h3>
            <p className="text-green-600 dark:text-green-500/80 mt-1">Data successfully retrieved from Sandbox API.</p>
          </div>
          
          <div className="max-w-sm mx-auto p-4 bg-white dark:bg-slate-900 rounded-xl border border-green-100 dark:border-green-900/30 text-left space-y-2">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Name</p>
            {data.fullName && data.fullName !== "N/A" ? (
              <p className="font-bold">{data.fullName}</p>
            ) : (
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium italic">
                Not returned by Aadhaar API — you can enter it in the next step
              </p>
            )}
            <div className="h-[1px] bg-slate-100 dark:bg-slate-800"></div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Address</p>
            {data.address && data.address !== "N/A" ? (
              <p className="text-sm">{data.address}</p>
            ) : (
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium italic">
                Not returned by Aadhaar API — you can enter it in the next step
              </p>
            )}
          </div>

          <button onClick={onNext} className="btn-primary w-full max-w-sm mx-auto py-3">
            Continue to Details
          </button>
        </div>
      )}
    </div>
  );
}
