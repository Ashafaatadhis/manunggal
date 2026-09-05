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

  const handleCapture = (photo: string) => {
    setCapturedPhoto(photo);
  };

  const handleBack = () => {
    router.push(`/g/${slug}`);
  };

  if (capturedPhoto) {
    return (
      <WishForm
        photo={capturedPhoto}
        eventId={slug}
        onBack={() => setCapturedPhoto(null)}
        onSuccess={() => router.push(`/g/${slug}/feed`)}
      />
    );
  }

  return <CameraCapture onCapture={handleCapture} onBack={handleBack} />;
}
