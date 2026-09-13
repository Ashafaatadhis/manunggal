import type { Event } from "@/lib/types";

export type EventLifecycleAction = "activate" | "end";

export function canChangeEventStatus(
  status: Event["status"],
  nextStatus: "active" | "ended",
): boolean {
  return (status === "draft" && nextStatus === "active")
    || ((status === "active" || status === "live") && nextStatus === "ended");
}

export function getEventStatusAction(status: Event["status"]): EventLifecycleAction | null {
  if (status === "draft") return "activate";
  if (status === "active" || status === "live") return "end";
  return null;
}
