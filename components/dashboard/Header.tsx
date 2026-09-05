"use client";

import { useSession } from "@/hooks/useSession";
import { useRouter } from "next/navigation";

export default function DashboardHeader() {
  const { user, isLoading } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <header className="h-16 border-b border-border bg-white flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">
          Host Dashboard
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {!isLoading && user && (
          <>
            <span className="text-sm text-muted-foreground">{user.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}
