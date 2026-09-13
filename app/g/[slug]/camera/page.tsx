"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import CameraCapture from "@/components/guest/CameraCapture";
import WishForm from "@/components/guest/WishForm";

export default function CameraPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState("");

  const handleCapture = (photo: string) => {
    setUploadMessage("");
    setCapturedPhoto(photo);
  };

  const handleBack = () => {
    router.push(`/g/${slug}`);
  };

  if (capturedPhoto) {
    return (
      <WishForm
        photo={capturedPhoto}
        slug={slug}
        onBack={() => setCapturedPhoto(null)}
        onSuccess={() => {
          setCapturedPhoto(null);
          setUploadMessage("Foto berhasil dikirim. Silakan ambil foto lagi.");
        }}
      />
    );
  }

  return (
    <div className="relative">
      <CameraCapture onCapture={handleCapture} onBack={handleBack} />
      {uploadMessage && (
        <div
          className="absolute left-4 right-4 top-4 z-10 rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-medium text-white shadow-lg"
          role="status"
        >
          {uploadMessage}
        </div>
      )}
    </div>
  );
}
