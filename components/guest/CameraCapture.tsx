"use client";

import { useEffect } from "react";
import { useCamera } from "@/hooks/useCamera";

interface CameraCaptureProps {
  onCapture: (photo: string) => void;
  onBack: () => void;
}

export default function CameraCapture({ onCapture, onBack }: CameraCaptureProps) {
  const { videoRef, canvasRef, photo, startCamera, stopCamera, takePhoto, flipCamera, clearPhoto } =
    useCamera();

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const handleCapture = () => {
    const photoData = takePhoto();
    if (photoData) {
      onCapture(photoData);
    }
  };

  return (
    <div className="relative w-full h-screen bg-black">
      <canvas ref={canvasRef} className="hidden" />

      {photo ? (
        <div className="relative w-full h-full">
          <img src={photo} alt="Captured" className="w-full h-full object-cover" />
          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4">
            <button
              onClick={clearPhoto}
              className="px-6 py-3 bg-white/20 backdrop-blur text-white rounded-xl"
            >
              ❌ Hapus
            </button>
            <button
              onClick={() => onCapture(photo)}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium"
            >
              📤 Kirim
            </button>
          </div>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4">
            <button
              onClick={onBack}
              className="p-2 bg-black/30 backdrop-blur text-white rounded-full"
            >
              ←
            </button>
          </div>
          <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-8">
            <button
              onClick={flipCamera}
              className="p-4 bg-black/30 backdrop-blur text-white rounded-full"
            >
              🔄
            </button>
            <button
              onClick={handleCapture}
              className="w-20 h-20 bg-white rounded-full border-4 border-white/50 active:scale-95 transition-transform"
            />
            <div className="w-12" />
          </div>
        </>
      )}
    </div>
  );
}
