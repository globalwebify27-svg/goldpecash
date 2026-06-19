"use client";

import { Pencil, Trash2, CheckCircle2, Upload, Crop, X, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface CropModalProps {
  imageSrc: string;
  onCrop: (croppedImage: string) => void;
  onClose: () => void;
}

// Downscale images on the fly to prevent database size errors and Vercel payload limits
const compressImage = (base64Str: string, maxWidth: number, callback: (compressed: string) => void) => {
  const img = new Image();
  img.src = base64Str;
  img.onload = () => {
    if (img.width <= maxWidth) {
      callback(base64Str);
      return;
    }
    const canvas = document.createElement('canvas');
    const width = maxWidth;
    const height = (img.height / img.width) * width;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, 0, 0, width, height);
      callback(canvas.toDataURL('image/png'));
    } else {
      callback(base64Str);
    }
  };
  img.onerror = () => {
    callback(base64Str);
  };
};

function CropModal({ imageSrc, onCrop, onClose }: CropModalProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [crop, setCrop] = useState({ x: 10, y: 10, width: 80, height: 80 });

  const handleImageLoad = () => {
    const img = imgRef.current;
    if (img) {
      setDimensions({
        width: img.clientWidth,
        height: img.clientHeight,
      });
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const img = imgRef.current;
      if (img) {
        setDimensions({
          width: img.clientWidth,
          height: img.clientHeight,
        });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const startDrag = (e: React.MouseEvent | React.TouchEvent, actionType: 'move' | 'nw' | 'ne' | 'sw' | 'se') => {
    e.preventDefault();
    const startX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const startY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const startCrop = { ...crop };

    const onMouseMove = (moveEvent: MouseEvent | TouchEvent) => {
      const currentX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const currentY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;

      const deltaX = ((currentX - startX) / dimensions.width) * 100;
      const deltaY = ((currentY - startY) / dimensions.height) * 100;

      setCrop(() => {
        let x = startCrop.x;
        let y = startCrop.y;
        let width = startCrop.width;
        let height = startCrop.height;

        if (actionType === 'move') {
          x = Math.max(0, Math.min(100 - width, startCrop.x + deltaX));
          y = Math.max(0, Math.min(100 - height, startCrop.y + deltaY));
        } else {
          if (actionType.includes('w')) {
            const nextX = Math.max(0, Math.min(startCrop.x + startCrop.width - 5, startCrop.x + deltaX));
            width = startCrop.width + (startCrop.x - nextX);
            x = nextX;
          }
          if (actionType.includes('e')) {
            width = Math.max(5, Math.min(100 - startCrop.x, startCrop.width + deltaX));
          }
          if (actionType.includes('n')) {
            const nextY = Math.max(0, Math.min(startCrop.y + startCrop.height - 5, startCrop.y + deltaY));
            height = startCrop.height + (startCrop.y - nextY);
            y = nextY;
          }
          if (actionType.includes('s')) {
            height = Math.max(5, Math.min(100 - startCrop.y, startCrop.height + deltaY));
          }
        }
        return { x, y, width, height };
      });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchmove', onMouseMove);
      document.removeEventListener('touchend', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchmove', onMouseMove, { passive: false });
    document.addEventListener('touchend', onMouseUp);
  };

  const handleCropClick = () => {
    const img = imgRef.current;
    if (!img) return;

    const sourceX = (crop.x / 100) * img.naturalWidth;
    const sourceY = (crop.y / 100) * img.naturalHeight;
    const sourceW = (crop.width / 100) * img.naturalWidth;
    const sourceH = (crop.height / 100) * img.naturalHeight;

    // Scale final signature output to maximum width of 400px for compression
    const targetW = Math.min(sourceW, 400);
    const targetH = (sourceH / sourceW) * targetW;

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, sourceX, sourceY, sourceW, sourceH, 0, 0, targetW, targetH);
      const croppedBase64 = canvas.toDataURL('image/png');
      onCrop(croppedBase64);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Crop Signature</h3>
            <p className="text-xs text-slate-500">Drag corners or box to adjust crop area</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cropping Area */}
        <div className="flex-1 p-6 flex items-center justify-center bg-slate-50 dark:bg-slate-950 min-h-[300px] overflow-hidden">
          <div className="relative select-none overflow-hidden max-h-[50vh] flex items-center justify-center">
            <img
              src={imageSrc}
              ref={imgRef}
              onLoad={handleImageLoad}
              className="max-h-[50vh] max-w-full object-contain pointer-events-none"
              alt="Signature to crop"
            />
            {dimensions.width > 0 && (
              <div
                style={{
                  position: 'absolute',
                  left: `${crop.x}%`,
                  top: `${crop.y}%`,
                  width: `${crop.width}%`,
                  height: `${crop.height}%`,
                  boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.65)',
                  border: '2px solid #f97316',
                }}
                className="cursor-move"
                onMouseDown={(e) => startDrag(e, 'move')}
                onTouchStart={(e) => startDrag(e, 'move')}
              >
                {/* Resize handles */}
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-orange-500 border-2 border-white dark:border-slate-900 rounded-full cursor-nwse-resize shadow-md" onMouseDown={(e) => { e.stopPropagation(); startDrag(e, 'nw'); }} onTouchStart={(e) => { e.stopPropagation(); startDrag(e, 'nw'); }} />
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-orange-500 border-2 border-white dark:border-slate-900 rounded-full cursor-nesw-resize shadow-md" onMouseDown={(e) => { e.stopPropagation(); startDrag(e, 'ne'); }} onTouchStart={(e) => { e.stopPropagation(); startDrag(e, 'ne'); }} />
                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-orange-500 border-2 border-white dark:border-slate-900 rounded-full cursor-nesw-resize shadow-md" onMouseDown={(e) => { e.stopPropagation(); startDrag(e, 'sw'); }} onTouchStart={(e) => { e.stopPropagation(); startDrag(e, 'sw'); }} />
                <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-orange-500 border-2 border-white dark:border-slate-900 rounded-full cursor-nwse-resize shadow-md" onMouseDown={(e) => { e.stopPropagation(); startDrag(e, 'se'); }} onTouchStart={(e) => { e.stopPropagation(); startDrag(e, 'se'); }} />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-white dark:bg-slate-900">
          <button onClick={onClose} className="px-5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-all text-sm">
            Cancel
          </button>
          <button onClick={handleCropClick} className="btn-primary px-5 py-2 flex items-center gap-2 font-semibold text-sm">
            <Check className="w-4 h-4" /> Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SignatureStep({ onNext, onPrev, updateData, data, loading }: any) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(data.signature || null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  // Upload handler
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const rawBase64 = reader.result as string;
        // Pre-compress uploaded signature image to max 800px before displaying or cropping
        compressImage(rawBase64, 800, (compressedBase64) => {
          setPreviewUrl(compressedBase64);
          updateData({ signature: compressedBase64 });
          setIsCropModalOpen(true); // Auto-open crop modal on new upload for user convenience
        });
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
            <div className="relative w-full h-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden p-2">
              <img src={previewUrl} className="max-h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCropModalOpen(true)}
                  className="p-2 bg-orange-50 text-orange-500 rounded-xl hover:bg-orange-100 dark:bg-orange-950/25 dark:text-orange-400 dark:hover:bg-orange-950/45 transition-all"
                  title="Crop Signature"
                >
                  <Crop className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewUrl(null);
                    updateData({ signature: null });
                  }}
                  className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 dark:bg-red-950/25 dark:text-red-400 dark:hover:bg-red-950/45 transition-all"
                  title="Delete Signature"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
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

      {/* Crop Modal */}
      {isCropModalOpen && previewUrl && (
        <CropModal
          imageSrc={previewUrl}
          onClose={() => setIsCropModalOpen(false)}
          onCrop={(croppedImage) => {
            setPreviewUrl(croppedImage);
            updateData({ signature: croppedImage });
            setIsCropModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
