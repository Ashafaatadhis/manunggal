"use client";

import { useSession } from "@/hooks/useSession";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, isLoading } = useSession();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-white/95 px-6 backdrop-blur">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Buka navigasi dashboard"
          onClick={onMenuClick}
        >
          <Menu aria-hidden="true" className="size-5" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">
          Host Dashboard
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {!isLoading && user && (
          <>
            <span className="text-sm text-muted-foreground">
              Selamat datang, {user.name}!
            </span>
          </>
        )}
      </div>
    </header>
  );
}
