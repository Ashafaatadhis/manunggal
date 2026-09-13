import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white text-foreground">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="grid gap-12 md:grid-cols-[1.5fr_0.7fr_0.7fr] md:gap-16">
          <div>
            <Link href="/" className="text-2xl font-bold tracking-tight">
              Manunggal<span className="text-primary">.</span>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-6 text-white/60">
              Kumpulkan foto tamu dan tampilkan momen acara di satu tempat.
            </p>
            <Link href="/register" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80">
              Buat event pertama <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </div>

          <nav aria-label="Navigasi footer">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Jelajahi</p>
            <div className="mt-5 flex flex-col items-start gap-3 text-sm text-muted-foreground">
              <Link href="#cara-kerja" className="transition-colors hover:text-foreground">Cara kerja</Link>
              <Link href="#harga" className="transition-colors hover:text-foreground">Harga</Link>
              <Link href="/login" className="transition-colors hover:text-foreground">Masuk</Link>
            </div>
          </nav>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Ikuti kami</p>
            <div className="mt-5 flex flex-col items-start gap-3 text-sm text-muted-foreground">
              <a href="https://instagram.com" className="transition-colors hover:text-foreground">Instagram</a>
              <a href="https://tiktok.com" className="transition-colors hover:text-foreground">TikTok</a>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} Manunggal. Semua momen tetap bersama.</p>
          <p>Dibuat untuk acara yang ingin dikenang.</p>
        </div>
      </div>
    </footer>
  );
}
