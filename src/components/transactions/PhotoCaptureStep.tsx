"use client";

import { Camera, RefreshCw, CheckCircle2, Loader2, Upload, Video, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function PhotoCaptureStep({ onNext, onPrev, updateData, data, loading }: any) {
  const [captured, setCaptured] = useState(!!data.photo);
  const [localLoading, setLocalLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  useEffect(() => {
    if (isCameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraOpen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      setIsCameraOpen(true);
    } catch (err) {
      alert("Error accessing camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const captureFromCamera = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
      updateData({ photo: compressedBase64 });
      setCaptured(true);
      stopCamera();
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLocalLoading(true);
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
          updateData({ photo: compressedBase64 });
          setCaptured(true);
          setLocalLoading(false);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRetake = () => {
    setCaptured(false);
    updateData({ photo: null });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
          <Camera className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Customer Photo Capture</h2>
          <p className="text-sm text-slate-500">Capture a live photo of the customer for record-keeping.</p>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        <div className="aspect-square rounded-3xl bg-slate-900 overflow-hidden relative border-4 border-white dark:border-slate-800 premium-shadow">
          {!captured && !isCameraOpen ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6 bg-slate-100 dark:bg-slate-900">
              <button onClick={startCamera} className="w-64 btn-primary py-4 flex items-center justify-center gap-2 text-lg">
                <Video className="w-6 h-6" />
                Open Web Camera
              </button>
              
              <div className="flex items-center w-64 gap-4 text-slate-400">
                <div className="h-px bg-slate-300 dark:bg-slate-700 flex-1"></div>
                <span className="text-xs font-bold uppercase tracking-widest">OR</span>
                <div className="h-px bg-slate-300 dark:bg-slate-700 flex-1"></div>
              </div>

              <div className="w-64 relative">
                <div className="w-full bg-white dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl py-4 flex flex-col items-center justify-center text-slate-500 hover:text-primary hover:border-primary transition-all cursor-pointer">
                  <Upload className="w-6 h-6 mb-2" />
                  <span className="font-bold">Upload Photo</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer z-20"
                />
              </div>
            </div>
          ) : isCameraOpen && !captured ? (
            <div className="absolute inset-0 flex flex-col bg-black">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="flex-1 object-cover w-full h-full"
              />
              <button 
                onClick={stopCamera} 
                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all z-30"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-6 inset-x-0 flex justify-center z-30">
                <button 
                  onClick={captureFromCamera}
                  className="w-16 h-16 rounded-full border-4 border-white/50 bg-white hover:bg-slate-200 transition-all flex items-center justify-center"
                >
                  <div className="w-12 h-12 bg-white rounded-full"></div>
                </button>
              </div>
            </div>
          ) : (
            <img 
              src={data.photo} 
              alt="Captured" 
              className="w-full h-full object-cover animate-in fade-in zoom-in duration-500"
            />
          )}

          {localLoading && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
          )}

          {captured && (
            <div className="absolute inset-x-0 bottom-6 flex justify-center px-6 z-30">
              <button 
                onClick={handleRetake}
                className="bg-black/50 hover:bg-black/70 transition-all backdrop-blur-md text-white px-6 py-2 rounded-2xl font-bold flex items-center gap-2 cursor-pointer pointer-events-auto"
              >
                <RefreshCw className="w-4 h-4" />
                Retake Photo
              </button>
            </div>
          )}
        </div>

        {captured && (
          <div className="mt-6 flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-xl text-green-700 dark:text-green-400">
            <CheckCircle2 className="w-5 h-5" />
            <p className="text-sm font-medium">Photo captured and verified successfully.</p>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
        <button onClick={onPrev} className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 font-semibold transition-all">
          Back
        </button>
        <button 
          onClick={onNext} 
          disabled={!captured || loading || localLoading}
          className="btn-primary disabled:opacity-50 flex items-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Saving..." : "Continue"}
        </button>
      </div>
    </div>
  );
}
