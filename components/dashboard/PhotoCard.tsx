"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Photo } from "@/lib/types";

interface PhotoCardProps {
  photo: Photo;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

const statusColors: Record<Photo["status"], string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  hidden: "bg-gray-100 text-gray-700",
  deleted: "bg-red-100 text-red-700",
};

export default function PhotoCard({
  photo,
  onApprove,
  onReject,
  onDelete,
  showActions = true,
}: PhotoCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square relative">
        <img
          src={photo.thumbnailUrl || photo.fileUrl}
          alt={photo.guestName || "Guest photo"}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge className={statusColors[photo.status]}>{photo.status}</Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{photo.guestName || "Anonymous"}</span>
            <span className="text-muted-foreground">
              {new Date(photo.uploadedAt).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          {photo.message && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {photo.message}
            </p>
          )}
          {showActions && photo.status === "pending" && (
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => onApprove?.(photo.id)}
              >
                ✅ Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => onReject?.(photo.id)}
              >
                ❌ Reject
              </Button>
            </div>
          )}
          {showActions && photo.status !== "deleted" && onDelete && (
            <Button
              size="sm"
              variant="destructive"
              className="w-full mt-2"
              onClick={() => onDelete(photo.id)}
            >
              🗑️ Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
