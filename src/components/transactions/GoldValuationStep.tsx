"use client";

import { useState, useRef, useEffect } from "react";
import { Coins, Plus, Trash2, Calculator, Camera, FileText, CheckCircle2, Loader2, Video, Upload, X, RefreshCw } from "lucide-react";

export default function GoldValuationStep({ onNext, onPrev, updateData, data, loading }: any) {
  const [items, setItems] = useState(data.goldItems.length > 0 ? data.goldItems : [
    { id: Date.now(), type: "Chain", gross: "", stone: "0", purity: "91.6", rate: "6250" }
  ]);

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

  const captureFromCamera = (field: string) => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
      updateData({ [field]: compressedBase64 });
      stopCamera();
    }
  };

  const addItem = () => {
    setItems([...items, { id: Date.now(), type: "", gross: "", stone: "0", purity: "91.6", rate: "6250" }]);
  };

  const removeItem = (id: number) => {
    if (items.length === 1) return;
    setItems(items.filter((item: any) => item.id !== id));
  };

  const updateItem = (id: number, field: string, value: string) => {
    setItems(items.map((item: any) => item.id === id ? { ...item, [field]: value } : item));
  };

  const handlePhotoUpload = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
          updateData({ [field]: compressedBase64 });
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateTotal = () => {
    return items.reduce((acc: number, item: any) => {
      const netWeight = (parseFloat(item.gross) || 0) - (parseFloat(item.stone) || 0);
      const value = netWeight * (parseFloat(item.rate) || 0) * (parseFloat(item.purity) / 100);
      return acc + value;
    }, 0);
  };

  const handleNext = () => {
    const newData = { goldItems: items, totalPayout: calculateTotal() };
    updateData(newData);
    onNext(newData);
  };

  const renderPhotoBox = (field: string, title: string, Icon: any) => {
    const photoData = data[field];
    const isCameraActive = activeCameraField === field;

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">{title}</label>
        <div className="relative aspect-video rounded-2xl bg-slate-100 dark:bg-slate-900 overflow-hidden border-2 border-dashed border-slate-200 dark:border-slate-800 group transition-all hover:border-primary/50">
          {!photoData && !isCameraActive ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
              <button onClick={() => startCamera(field)} className="px-6 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl font-bold flex items-center gap-2 transition-all">
                <Video className="w-4 h-4" />
                Open Camera
              </button>
              
              <div className="flex items-center gap-2 text-slate-400">
                <div className="w-8 h-px bg-slate-300 dark:bg-slate-700"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest">OR</span>
                <div className="w-8 h-px bg-slate-300 dark:bg-slate-700"></div>
              </div>

              <div className="relative">
                <button className="px-6 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm border border-slate-200 dark:border-slate-700">
                  <Upload className="w-4 h-4" />
                  Upload Image
                </button>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoUpload(field)}
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                />
              </div>
            </div>
          ) : isCameraActive ? (
            <div className="absolute inset-0 bg-black flex flex-col">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              <button 
                onClick={stopCamera} 
                className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all z-30"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-4 inset-x-0 flex justify-center z-30">
                <button 
                  onClick={() => captureFromCamera(field)}
                  className="w-12 h-12 rounded-full border-4 border-white/50 bg-white hover:bg-slate-200 transition-all flex items-center justify-center"
                >
                  <div className="w-8 h-8 bg-white rounded-full"></div>
                </button>
              </div>
            </div>
          ) : (
            <>
              <img src={photoData} className="w-full h-full object-cover" />
              <div className="absolute inset-x-0 bottom-4 flex justify-center px-4 z-30">
                <button 
                  onClick={() => updateData({ [field]: null })}
                  className="bg-black/50 hover:bg-black/70 transition-all backdrop-blur-md text-white px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  <RefreshCw className="w-3 h-3" />
                  Retake {title}
                </button>
              </div>
            </>
          )}
        </div>
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
          <h2 className="text-xl font-bold">Gold Valuation & Photos</h2>
          <p className="text-sm text-slate-500">Add ornaments, set purity %, and upload required photos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderPhotoBox("goldPhoto", "Gold Photo", Camera)}
        {renderPhotoBox("invoicePhoto", "Invoice Photo", FileText)}
      </div>

      <div className="space-y-4">
        {items.map((item: any, index: number) => (
          <div key={item.id} className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 relative group">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-500">Ornament Type</label>
                <input
                  type="text"
                  value={item.type}
                  onChange={(e) => updateItem(item.id, "type", e.target.value)}
                  placeholder="e.g. Chain, Ring"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-500">Gross (g)</label>
                <input
                  type="number"
                  value={item.gross}
                  onChange={(e) => updateItem(item.id, "gross", e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-500">Stone (g)</label>
                <input
                  type="number"
                  value={item.stone}
                  onChange={(e) => updateItem(item.id, "stone", e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-500">Purity (%)</label>
                <input
                  type="number"
                  value={item.purity}
                  onChange={(e) => updateItem(item.id, "purity", e.target.value)}
                  placeholder="91.6"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-500">Rate / g</label>
                <input
                  type="number"
                  value={item.rate}
                  onChange={(e) => updateItem(item.id, "rate", e.target.value)}
                  placeholder="6000"
                  className="w-full px-3 py-2 rounded-lg border border-primary/20 dark:border-primary/20 bg-white dark:bg-slate-900 outline-none focus:border-primary"
                />
              </div>
              <div className="flex items-end pb-1 absolute top-2 right-2 md:relative md:top-0 md:right-0">
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
          <p className="text-primary font-bold text-sm">Net Wt × Rate × Purity %</p>
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
        <button onClick={onPrev} className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 font-semibold transition-all text-sm">
          Back
        </button>
        <button 
          onClick={handleNext} 
          disabled={!data.goldPhoto || loading}
          className="btn-primary disabled:opacity-50 text-sm px-8 flex items-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Saving..." : "Continue to Signature"}
        </button>
      </div>
    </div>
  );
}
