import Link from "next/link";
import { ScanQrCode } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-[#F8FAFC] lg:grid-cols-[minmax(0,1fr)_minmax(28rem,0.9fr)]">
      <aside className="relative hidden overflow-hidden bg-[#07111F] px-10 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
        <div className="absolute -right-40 top-24 size-[32rem] rounded-full bg-[#2196F3]/20 blur-3xl" />
        <div className="relative z-10">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            Manunggal<span className="text-[#90CAF9]">.</span>
          </Link>
          <div className="mt-24 max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#90CAF9]">Foto acara, satu tempat</p>
            <h1 className="mt-6 text-6xl leading-[0.92] tracking-[-0.045em] xl:text-7xl">Bawa semua tamu masuk ke ceritanya.</h1>
            <p className="mt-7 max-w-md text-base leading-7 text-white/65">Buat event, bagikan QR, lalu kumpulkan foto yang bisa kamu tampilkan di layar venue.</p>
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-[#2196F3] text-white">
            <ScanQrCode aria-hidden="true" className="size-6" strokeWidth={1.6} />
          </div>
          <p className="max-w-xs text-sm leading-6 text-white/55">Scan QR, lalu upload foto dari browser.</p>
        </div>
      </aside>
      <main className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
