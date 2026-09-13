"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ChevronLeft, ChevronRight, LayoutDashboard, LogOut, ShieldCheck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Events", href: "/events", icon: CalendarDays },
  { name: "Moderation", href: "/moderation", icon: ShieldCheck },
];

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

export default function Sidebar({ isMobileOpen = false, onMobileOpenChange }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const content = (
    <>
      <div className={cn("flex h-20 items-center border-b border-border", isCollapsed ? "justify-center px-3" : "justify-between px-5")}>
        <Link href="/dashboard" className="text-xl font-bold tracking-tight text-primary" title="Manunggal">
          {isCollapsed ? "M." : "Manunggal."}
        </Link>
        <button
          type="button"
          aria-label={isCollapsed ? "Perbesar sidebar" : "Kecilkan sidebar"}
          title={isCollapsed ? "Perbesar sidebar" : "Kecilkan sidebar"}
          className={cn("flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground", isCollapsed && "absolute right-[-16px] top-6 z-20 border border-border bg-white shadow-sm")}
          onClick={() => setIsCollapsed((collapsed) => !collapsed)}
        >
          {isCollapsed ? <ChevronRight aria-hidden="true" className="size-4" /> : <ChevronLeft aria-hidden="true" className="size-4" />}
        </button>
        <button
          type="button"
          aria-label="Tutup navigasi dashboard"
          className="ml-auto flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted md:hidden"
          onClick={() => onMobileOpenChange?.(false)}
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>

      <nav aria-label="Navigasi dashboard" className="flex flex-1 flex-col gap-1 px-3 py-5">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              aria-label={isCollapsed ? item.name : undefined}
              title={isCollapsed ? item.name : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isCollapsed && "justify-center px-0",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon aria-hidden="true" className="size-5 shrink-0" strokeWidth={1.8} />
              {!isCollapsed && item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <button
          type="button"
          aria-label="Keluar"
          title="Keluar"
          className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-700", isCollapsed && "justify-center px-0")}
          onClick={() => setIsLogoutOpen(true)}
        >
          <LogOut aria-hidden="true" className="size-5 shrink-0" strokeWidth={1.8} />
          {!isCollapsed && "Keluar"}
        </button>
      </div>
      <Dialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Keluar dari dashboard?</DialogTitle>
            <DialogDescription>
              Sesi kamu akan berakhir di perangkat ini. Kamu bisa masuk lagi kapan saja.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsLogoutOpen(false)}>
              Tetap di sini
            </Button>
            <Button type="button" variant="destructive" onClick={handleLogout}>
              Keluar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );

  return (
    <>
      <aside className={cn("relative z-30 sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-white transition-[width] duration-200 md:flex", isCollapsed ? "w-[76px]" : "w-64")}>
        {content}
      </aside>
      {isMobileOpen && (
        <>
          <button
            type="button"
            aria-label="Tutup navigasi dashboard"
            className="fixed inset-0 z-40 bg-slate-950/40 md:hidden"
            onClick={() => onMobileOpenChange?.(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-white shadow-xl md:hidden">
            {content}
          </aside>
        </>
      )}
    </>
  );
}
