"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { ApiResponse, Photo } from "@/lib/types";

interface WishFormProps {
  photo: string;
  eventId: string;
  onBack: () => void;
  onSuccess: () => void;
}

export default function WishForm({ photo, eventId, onBack, onSuccess }: WishFormProps) {
  const [message, setMessage] = useState("");

  const uploadMutation = useMutation({
    mutationFn: async () => {
      // 1. Get upload signature
      const sigRes = await fetch(`/api/events/${eventId}/upload-signature`);
      const sigData: ApiResponse<{ timestamp: number; signature: string; apiKey: string; cloudName: string; folder: string }> = await sigRes.json();

      if (!sigData.success || !sigData.data) {
        throw new Error("Failed to get upload signature");
      }

      const { timestamp, signature, apiKey, cloudName, folder } = sigData.data;

      // 2. Convert base64 to blob
      const response = await fetch(photo);
      const blob = await response.blob();
      const file = new File([blob], "photo.jpg", { type: "image/jpeg" });

      // 3. Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );

      const uploadData = await uploadRes.json();

      // 4. Save metadata to database
      const guestName = localStorage.getItem("guestName") || "Anonymous";

      const saveRes = await fetch(`/api/events/${eventId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileKey: uploadData.public_id,
          fileUrl: uploadData.secure_url,
          fileProvider: "cloudinary",
          thumbnailUrl: uploadData.secure_url,
          guestName,
          message: message || undefined,
          metadata: {
            width: uploadData.width,
            height: uploadData.height,
            format: uploadData.format,
          },
        }),
      });

      const saveData: ApiResponse<Photo> = await saveRes.json();
      if (!saveData.success) {
        throw new Error("Failed to save photo metadata");
      }

      return saveData.data;
    },
    onSuccess: () => {
      onSuccess();
    },
    onError: (error) => {
      console.error("Upload failed:", error);
      alert("Gagal mengunggah foto. Silakan coba lagi.");
    },
  });

  return (
    <div className="min-h-screen bg-cream-100 py-8 px-4">
      <div className="max-w-sm mx-auto">
        <button onClick={onBack} className="mb-6 text-muted-foreground hover:text-foreground">
          ← Kembali
        </button>

        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <img
            src={photo}
            alt="Captured"
            className="w-full rounded-xl aspect-[3/4] object-cover"
          />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <label className="block text-sm font-medium text-foreground mb-2">
            Tulis ucapan atau doa (opsional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Selamat ya! Semoga bahagia selalu 🎉"
            maxLength={500}
            rows={3}
            className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none mb-4"
          />
          <p className="text-xs text-muted-foreground mb-4">{message.length}/500</p>
          <button
            onClick={() => uploadMutation.mutate()}
            disabled={uploadMutation.isPending}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {uploadMutation.isPending ? "Mengunggah..." : "📤 Kirim"}
          </button>
        </div>
      </div>
    </div>
  );
}
