"use client";

import { useState, useRef, useEffect } from "react";
import { Coins, Plus, Trash2, Calculator, Camera, FileText, CheckCircle2, Loader2, Video, Upload, X, RefreshCw } from "lucide-react";

export default function GoldValuationStep({ onNext, onPrev, updateData, data, loading }: any) {
  const [items, setItems] = useState(data.goldItems.length > 0 ? data.goldItems : [
    { id: Date.now(), metal: "GOLD", type: "Chain", gross: "", stone: "0", purity: "91.6", rate: "6250" }
  ]);

  const [lessPercent, setLessPercent] = useState(data.lessPercent || "0");
  const [addAmount, setAddAmount] = useState(data.addAmount || "0");
  const [paymentMethod, setPaymentMethod] = useState(data.paymentMethod || "CASH");
  const [activeCameraField, setActiveCameraField] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  useEffect(() => {
    if (activeCameraField && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [activeCameraField]);

  const startCamera = async (field: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setActiveCameraField(field);
    } catch (err) {
      alert("Error accessing camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setActiveCameraField(null);
  };

  const addItem = () => {
    setItems([...items, { id: Date.now(), metal: "GOLD", type: "", gross: "", stone: "0", purity: "91.6", rate: "6250" }]);
  };

  const removeItem = (id: number) => {
    if (items.length === 1) return;
    setItems(items.filter((item: any) => item.id !== id));
  };

  const updateItem = (id: number, field: string, value: string) => {
    setItems(items.map((item: any) => item.id === id ? { ...item, [field]: value } : item));
  };

  const calculateTotal = () => {
    const subtotal = items.reduce((acc: number, item: any) => {
      const netWeight = (parseFloat(item.gross) || 0) - (parseFloat(item.stone) || 0);
      const baseValue = netWeight * (parseFloat(item.rate) || 0) * ((parseFloat(item.purity) || 0) / 100);
      return acc + baseValue;
    }, 0);
    const lessVal = Math.min(3, parseFloat(lessPercent) || 0);
    const addVal = parseFloat(addAmount) || 0;
    return subtotal - (subtotal * (lessVal / 100)) + addVal;
  };

  const handleNext = () => {
    const newData = { 
      goldItems: items, 
      totalPayout: calculateTotal(), 
      paymentMethod,
      lessPercent: parseFloat(lessPercent) || 0,
      addAmount: parseFloat(addAmount) || 0
    };
    updateData(newData);
    onNext(newData);
  };

  const renderMultiPhotoBox = (field: string, title: string, Icon: any) => {
    const photosArray = data[field] || [];
    const isCameraActive = activeCameraField === field;

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
        Array.from(files).forEach((file) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement("canvas");
              const MAX_WIDTH = 1024;
              const MAX_HEIGHT = 1024;
              let width = img.width;
              let height = img.height;

              if (width > height) {
                if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
                }
              }
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext("2d");
              ctx?.drawImage(img, 0, 0, width, height);
              
              const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
              const currentPhotos = [...photosArray, compressedBase64];
              const singleField = field === "goldPhotos" ? "goldPhoto" : "invoicePhoto";
              updateData({ 
                [field]: currentPhotos,
                [singleField]: currentPhotos[0]
              });
            };
            img.src = reader.result as string;
          };
          reader.readAsDataURL(file);
        });
      }
    };

    const removePhoto = (index: number) => {
      const currentPhotos = photosArray.filter((_: any, i: number) => i !== index);
      const singleField = field === "goldPhotos" ? "goldPhoto" : "invoicePhoto";
      updateData({ 
        [field]: currentPhotos,
        [singleField]: currentPhotos.length > 0 ? currentPhotos[0] : null
      });
    };

    const handleCameraCapture = (capturedBase64: string) => {
      const currentPhotos = [...photosArray, capturedBase64];
      const singleField = field === "goldPhotos" ? "goldPhoto" : "invoicePhoto";
      updateData({ 
        [field]: currentPhotos,
        [singleField]: currentPhotos[0]
      });
    };

    return (
      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          {title} ({photosArray.length})
        </label>
        
        {isCameraActive ? (
          <div className="relative aspect-video rounded-3xl bg-black overflow-hidden border-2 border-primary">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover animate-in fade-in" />
            <button 
              type="button"
              onClick={stopCamera} 
              className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all z-30 animate-in fade-in"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-4 inset-x-0 flex justify-center z-30 animate-in slide-in-from-bottom-2">
              <button 
                type="button"
                onClick={() => {
                  if (videoRef.current) {
                    const canvas = document.createElement("canvas");
                    const video = videoRef.current;
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    const ctx = canvas.getContext("2d");
                    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
                    handleCameraCapture(compressedBase64);
                    stopCamera();
                  }
                }}
                className="w-12 h-12 rounded-full border-4 border-white/50 bg-white hover:bg-slate-200 transition-all flex items-center justify-center"
              >
                <div className="w-8 h-8 bg-white rounded-full"></div>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photosArray.map((photo: string, index: number) => (
              <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 group transition-all duration-200 hover:scale-[1.02]">
                <img src={photo} className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 p-1.5 bg-red-600/95 text-white rounded-xl hover:bg-red-700 transition-all opacity-0 group-hover:opacity-100 shadow-md"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <div className="relative aspect-square rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-3 text-center bg-slate-50/50 dark:bg-slate-900/50 transition-all hover:border-primary/50 group min-h-[110px] space-y-2">
              <button 
                type="button" 
                onClick={() => startCamera(field)}
                className="w-full py-1.5 px-2 rounded-lg bg-white dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:text-primary hover:bg-slate-100 transition-all border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5 text-primary" />
                Live Photo
              </button>
              <div className="relative w-full">
                <button
                  type="button"
                  className="w-full py-1.5 px-2 rounded-lg bg-white dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:text-primary hover:bg-slate-100 transition-all border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-primary" />
                  Upload Files
                </button>
                <input 
                  type="file" 
                  multiple
                  accept="image/*" 
                  onChange={handleUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gold-500/10 text-gold-600 flex items-center justify-center">
          <Coins className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Ornament Valuation & Photos</h2>
          <p className="text-sm text-slate-500">Add ornaments, set purity %, and upload required photos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {renderMultiPhotoBox("goldPhotos", "Ornament Photos", Camera)}
        {renderMultiPhotoBox("invoicePhotos", "Invoice/Aadhaar Photos", FileText)}
      </div>

      <div className="space-y-4">
        {items.map((item: any, index: number) => (
          <div key={item.id} className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 relative group bg-white dark:bg-slate-900/40">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-8 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-500">Metal</label>
                <select
                  value={item.metal || "GOLD"}
                  onChange={(e) => {
                    const metal = e.target.value;
                    const defaultPurity = metal === "GOLD" ? "91.6" : "99.9";
                    const defaultRate = metal === "GOLD" ? "6250" : "80";
                    setItems(items.map((it: any) => it.id === item.id ? { ...it, metal, purity: defaultPurity, rate: defaultRate } : it));
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-700 dark:text-slate-300"
                >
                  <option value="GOLD">Gold</option>
                  <option value="SILVER">Silver</option>
                </select>
              </div>
              <div className="lg:col-span-2 space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-500">Ornament Type</label>
                <input
                  type="text"
                  value={item.type}
                  onChange={(e) => updateItem(item.id, "type", e.target.value)}
                  placeholder="e.g. Chain, Ring"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-500">Weight (g)</label>
                <input
                  type="number"
                  value={item.gross}
                  onChange={(e) => updateItem(item.id, "gross", e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-500">Stone (g)</label>
                <input
                  type="number"
                  value={item.stone}
                  onChange={(e) => updateItem(item.id, "stone", e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-500">Purity (%)</label>
                <input
                  type="number"
                  value={item.purity}
                  onChange={(e) => updateItem(item.id, "purity", e.target.value)}
                  placeholder="91.6"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-500">Rate / g</label>
                <input
                  type="number"
                  value={item.rate}
                  onChange={(e) => updateItem(item.id, "rate", e.target.value)}
                  placeholder="6000"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
              <div className="flex items-end pb-1 absolute top-2 right-2 sm:relative sm:top-0 sm:right-0">
                <button 
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
          </div>
        ))}

        <button 
          onClick={addItem}
          className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 font-bold text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Another Item
        </button>
      </div>

      {/* Transaction Adjustments Card */}
      <div className="premium-card p-6 border border-slate-200 dark:border-slate-800 space-y-4">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Transaction Adjustments</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold uppercase text-slate-500">Less (%) (Max 3%)</label>
              {parseFloat(lessPercent) > 3 && (
                <span className="text-[9px] text-red-500 font-semibold animate-pulse">Max allowed: 3%</span>
              )}
            </div>
            <input
              type="number"
              max={3}
              min={0}
              step={0.1}
              value={lessPercent}
              onChange={(e) => {
                let val = parseFloat(e.target.value) || 0;
                if (val > 3) val = 3;
                if (val < 0) val = 0;
                setLessPercent(e.target.value);
              }}
              placeholder="0.0"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-semibold text-red-600"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-500">Add Amount (₹)</label>
            <input
              type="number"
              min={0}
              value={addAmount}
              onChange={(e) => setAddAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-semibold text-green-600"
            />
          </div>
        </div>
      </div>

      {/* Payment Method Selector Card */}
      <div className="premium-card p-6 border border-slate-200 dark:border-slate-800 space-y-4">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Choose Payment Method</label>
        <div className="grid grid-cols-3 gap-4">
          {[
            { id: "CASH", label: "💵 Cash Payout" },
            { id: "ONLINE", label: "⚡ Online (UPI)" },
            { id: "ACCOUNT", label: "🏦 Bank Account" }
          ].map((method) => (
            <button
              key={method.id}
              type="button"
              onClick={() => setPaymentMethod(method.id)}
              className={`py-3.5 px-4 rounded-2xl font-bold border-2 transition-all text-xs sm:text-sm ${
                paymentMethod === method.id 
                  ? "border-primary bg-primary/5 text-primary" 
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400"
              }`}
            >
              {method.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 text-white p-8 rounded-3xl premium-shadow flex flex-col md:flex-row justify-between items-center gap-6 overflow-hidden relative">
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-primary">
            <Calculator className="w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Estimated Total Payout</p>
            <p className="text-4xl font-bold tracking-tight">₹ {calculateTotal().toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
        <div className="relative z-10 text-center md:text-right">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Valuation Logic</p>
          <p className="text-primary font-bold text-sm">Net Wt × Rate × Purity % - Less % + Add</p>
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
        <button onClick={onPrev} className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 font-semibold transition-all text-sm">
          Back
        </button>
        <button 
          onClick={handleNext} 
          disabled={!(data.goldPhotos && data.goldPhotos.length > 0) && !data.goldPhoto || loading}
          className="btn-primary disabled:opacity-50 text-sm px-8 flex items-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Saving..." : "Continue to Signature"}
        </button>
      </div>
    </div>
  );
}
