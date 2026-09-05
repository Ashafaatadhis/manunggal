"use client";

import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import type { ApiResponse, Photo } from "@/lib/types";

interface GalleryUploadProps {
  slug: string;
  onSuccess: () => void;
}

export default function GalleryUpload({ slug, onSuccess }: GalleryUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (files.length === 0) return;

      // Get upload signature
      const sigRes = await fetch(`/api/g/${slug}/upload-signature`);
      const sigData: ApiResponse<{ timestamp: number; signature: string; apiKey: string; cloudName: string; folder: string }> = await sigRes.json();
      if (!sigData.success || !sigData.data) throw new Error("Failed to get signature");

      const { timestamp, signature, apiKey, cloudName, folder } = sigData.data;
      const guestName = localStorage.getItem("guestName") || "Anonymous";

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Upload to Cloudinary
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

        // Save metadata
        await fetch(`/api/g/${slug}/photos`, {
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

        setProgress(Math.round(((i + 1) / files.length) * 100));
      }
    },
    onSuccess: () => {
      onSuccess();
    },
    onError: (error) => {
      console.error("Upload failed:", error);
      alert("Gagal mengunggah foto. Silakan coba lagi.");
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 10) {
      alert("Maksimal 10 foto per upload");
      return;
    }

    setFiles(selectedFiles);
    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  return (
    <div className="min-h-screen bg-cream-100 py-8 px-4">
      <div className="max-w-sm mx-auto">
        <h1 className="text-xl font-bold text-foreground mb-6">
          Pilih Foto dari Galeri
        </h1>

        {files.length === 0 ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-16 border-2 border-dashed border-border rounded-2xl text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <div className="text-4xl mb-2">🖼️</div>
            <div>Ketuk untuk memilih foto</div>
            <div className="text-sm mt-1">Maksimal 10 foto</div>
          </button>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {previews.map((preview, i) => (
                <img
                  key={i}
                  src={preview}
                  alt={`Preview ${i + 1}`}
                  className="w-full aspect-square object-cover rounded-lg"
                />
              ))}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Tulis ucapan (opsional, berlaku untuk semua foto)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Selamat ya! 🎉"
                maxLength={500}
                rows={2}
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            {uploadMutation.isPending && (
              <div className="mb-6">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Mengunggah {progress}%
                </p>
              </div>
            )}

            <button
              onClick={() => uploadMutation.mutate()}
              disabled={uploadMutation.isPending}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {uploadMutation.isPending
                ? "Mengunggah..."
                : `📤 Upload ${files.length} Foto`}
            </button>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}