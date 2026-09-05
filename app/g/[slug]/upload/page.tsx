"use client";

import { useParams, useRouter } from "next/navigation";
import GalleryUpload from "@/components/guest/GalleryUpload";

export default function UploadPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  return (
    <GalleryUpload
      slug={slug}
      onSuccess={() => router.push(`/g/${slug}/feed`)}
    />
  );
}
