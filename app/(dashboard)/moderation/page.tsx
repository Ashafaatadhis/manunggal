"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PhotoCard from "@/components/dashboard/PhotoCard";
import type { Photo, ApiResponse } from "@/lib/types";

export default function ModerationPage() {
  const queryClient = useQueryClient();

  const { data: photos, isLoading } = useQuery({
    queryKey: ["pending-photos"],
    queryFn: async () => {
      const res = await fetch("/api/photos?status=pending");
      const data: ApiResponse<Photo[]> = await res.json();
      return data.data || [];
    },
  });

  const moderateMutation = useMutation({
    mutationFn: async ({
      photoId,
      status,
    }: {
      photoId: string;
      status: "approved" | "hidden";
    }) => {
      const res = await fetch(`/api/photos/${photoId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-photos"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (photoId: string) => {
      const res = await fetch(`/api/photos/${photoId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "deleted" }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-photos"] });
    },
  });

  const approveAllMutation = useMutation({
    mutationFn: async () => {
      if (!photos) return;
      const promises = photos.map((photo) =>
        fetch(`/api/photos/${photo.id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "approved" }),
        })
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-photos"] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Photo Moderation</h2>
        {photos && photos.length > 0 && (
          <button
            onClick={() => approveAllMutation.mutate()}
            disabled={approveAllMutation.isPending}
            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {approveAllMutation.isPending
              ? "Approving..."
              : `Approve All (${photos.length})`}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : photos && photos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              onApprove={(id) =>
                moderateMutation.mutate({ photoId: id, status: "approved" })
              }
              onReject={(id) =>
                moderateMutation.mutate({ photoId: id, status: "hidden" })
              }
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <p className="text-4xl mb-4">✅</p>
          <p className="text-muted-foreground">No photos pending moderation</p>
        </div>
      )}
    </div>
  );
}
