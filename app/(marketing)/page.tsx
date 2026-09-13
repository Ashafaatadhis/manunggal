import HeroParallax from "@/components/marketing/HeroParallax";
import QrPhoneMockup from "@/components/marketing/QrPhoneMockup";
import { CalendarPlus, Check, Clock3, Download, EyeOff, ImagePlus, MonitorPlay, QrCode, ScanQrCode, ShieldCheck, Upload, type LucideIcon } from "lucide-react";

const howItWorks: Array<[LucideIcon, string, string]> = [
  [CalendarPlus, "Buat halaman acara", "Isi nama acara. QR dan link langsung tersedia."],
  [QrCode, "Bagikan QR", "Pasang di meja registrasi atau kirim ke grup tamu."],
  [MonitorPlay, "Tampilkan foto", "Setujui foto pilihan untuk muncul di layar venue."],
];

export default function HomePage() {
  return (
    <div className="bg-cream-100">
      <HeroParallax />

      {/* One QR, every moment */}
      <section aria-labelledby="one-qr-heading" className="overflow-hidden border-b border-slate-200 bg-[#F8FAFC]">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:px-8 md:grid-cols-[0.9fr_1.1fr] md:gap-16 md:py-28 lg:px-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Scan QR dari kamera HP</p>
            <h2 id="one-qr-heading" className="mt-5 max-w-lg text-4xl leading-[0.98] tracking-[-0.04em] text-foreground sm:text-5xl">
              Semua foto tamu
              <br />
              <em className="text-primary">masuk ke galeri.</em>
            </h2>
            <p className="mt-6 max-w-md text-base leading-7 text-muted-foreground sm:text-lg">Scan QR, upload foto dari browser, lalu foto masuk ke galeri acara dan layar venue.</p>
            <div className="mt-8 grid gap-5 border-t border-slate-200 pt-6 sm:grid-cols-3 md:grid-cols-1">
              {[
                [ScanQrCode, "Scan QR", "Kamera HP langsung membuka halaman acara."],
                [Upload, "Upload foto", "Pilih foto, lalu kirim dari browser."],
                [MonitorPlay, "Muncul di layar", "Pilih foto untuk ditampilkan di layar venue."],
              ].map(([Icon, title, description]) => (
                <div key={title as string} className="flex gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#E3F2FD] text-primary">
                    <Icon aria-hidden="true" className="size-4" strokeWidth={1.8} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{title as string}</h3>
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">{description as string}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <QrPhoneMockup />
        </div>
      </section>

      <section id="cara-kerja" className="border-b border-slate-200 bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Cara pakainya</p>
            <h2 className="mt-5 text-4xl leading-[0.98] tracking-[-0.04em] text-foreground sm:text-5xl">Dari halaman acara sampai layar venue.</h2>
            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">Tiga langkah untuk mengumpulkan foto tamu dan menampilkannya saat acara berlangsung.</p>
          </div>
          <div className="relative mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
            <div className="pointer-events-none absolute left-[17%] right-[17%] top-16 hidden border-t border-dashed border-slate-300 md:block" />
            {howItWorks.map(([Icon, title, description]) => (
              <div key={title} className="relative z-10 text-center">
                <div className="mx-auto flex size-32 items-center justify-center rounded-[2rem] border border-slate-200 bg-[#F8FAFC] text-primary shadow-[0_12px_35px_rgba(7,17,31,0.08)]">
                  <Icon aria-hidden="true" className="size-12" strokeWidth={1.35} />
                </div>
                <h3 className="mt-8 text-xl font-semibold tracking-tight text-foreground">{title}</h3>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section data-dark-nav className="overflow-hidden bg-[#07111F] py-20 text-white sm:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-8 md:grid-cols-[0.85fr_1.15fr] md:gap-16 lg:px-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#90CAF9]">Untuk layar venue</p>
            <h2 className="mt-5 max-w-lg text-4xl leading-[0.98] tracking-[-0.04em] sm:text-5xl">Foto tamu masuk, lalu tampil saat kamu siap.</h2>
            <p className="mt-6 max-w-md text-base leading-7 text-white/65 sm:text-lg">Host memeriksa foto yang masuk sebelum menampilkannya. Acara tetap berjalan, tamu tetap ikut berbagi.</p>
            <a href="/register" className="mt-8 inline-flex rounded-xl bg-[#2196F3] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1976D2] sm:px-6 sm:py-3.5 sm:text-base">Buat event pertama</a>
          </div>
          <div className="relative">
            <div className="absolute -inset-8 rounded-[3rem] bg-[#2196F3]/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-2 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[#182433]">
                <img
                  src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?fm=jpg&q=85&w=1400&auto=format&fit=crop"
                  alt="Tamu menikmati suasana acara"
                  className="absolute inset-0 size-full object-cover opacity-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07111F]/90 via-[#07111F]/15 to-transparent" />
                <p className="absolute bottom-5 left-5 max-w-xs text-xl font-medium tracking-tight sm:bottom-7 sm:left-7 sm:text-2xl">Foto tamu, tampil di layar acara.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-[#F8FAFC] py-20 sm:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-8 md:grid-cols-[0.85fr_1.15fr] md:gap-16 lg:px-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Kamu tetap pegang kendali</p>
            <h2 className="mt-5 max-w-lg text-4xl leading-[0.98] tracking-[-0.04em] text-foreground sm:text-5xl">Pilih foto yang layak tampil.</h2>
            <p className="mt-6 max-w-md text-base leading-7 text-muted-foreground sm:text-lg">Foto baru masuk ke antrean. Setujui yang siap dibagikan, sembunyikan sisanya, lalu layar venue tetap berjalan tanpa gangguan.</p>
            <a href="/register" className="mt-8 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:px-6 sm:py-3.5 sm:text-base">Buat event pertama</a>
          </div>
          <div className="relative">
            <div className="absolute -inset-8 rounded-[3rem] bg-[#90CAF9]/30 blur-3xl" />
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(7,17,31,0.12)]">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
                <div>
                  <p className="text-sm font-semibold text-foreground">Foto masuk</p>
                  <p className="mt-1 text-xs text-muted-foreground">Acara Kita · 12 foto</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF7E6] px-2.5 py-1 text-xs font-medium text-[#A16207]"><Clock3 className="size-3.5" /> 3 menunggu</span>
              </div>
              <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 sm:p-6">
                {[
                  ["https://images.unsplash.com/photo-1519225421980-715cb0215aed?fm=jpg&q=80&w=600&auto=format&fit=crop", "approved"],
                  ["https://images.unsplash.com/photo-1519741497674-611481863552?fm=jpg&q=80&w=600&auto=format&fit=crop", "pending"],
                  ["https://images.unsplash.com/photo-1511285560929-80b456fea0bc?fm=jpg&q=80&w=600&auto=format&fit=crop", "approved"],
                  ["https://images.unsplash.com/photo-1507504031003-b417219a0fde?fm=jpg&q=80&w=600&auto=format&fit=crop", "pending"],
                  ["https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?fm=jpg&q=80&w=600&auto=format&fit=crop", "approved"],
                  ["https://images.unsplash.com/photo-1519167758481-83f550bb49b3?fm=jpg&q=80&w=600&auto=format&fit=crop", "pending"],
                ].map(([src, status]) => (
                  <div key={src} className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100">
                    <img src={src} alt="Foto tamu acara" className="size-full object-cover" />
                    <div className="absolute inset-x-2 bottom-2 flex items-center justify-between rounded-lg bg-white/95 p-1.5 shadow-sm backdrop-blur">
                      {status === "pending" ? (
                        <>
                          <span className="px-1.5 text-[0.65rem] font-medium text-[#A16207]">Menunggu</span>
                          <button type="button" aria-label="Setujui foto" className="flex size-7 items-center justify-center rounded-md bg-primary text-white"><Check className="size-3.5" /></button>
                        </>
                      ) : (
                        <>
                          <span className="px-1.5 text-[0.65rem] font-medium text-emerald-700">Tampil</span>
                          <button type="button" aria-label="Sembunyikan foto" className="flex size-7 items-center justify-center rounded-md bg-slate-100 text-slate-500"><EyeOff className="size-3.5" /></button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Untuk acara apa pun</p>
            <h2 className="mt-5 max-w-xl text-4xl leading-[0.98] tracking-[-0.04em] text-foreground sm:text-5xl">Setiap acara punya cerita yang berbeda.</h2>
            <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">Manunggal mengumpulkan foto dari tamu tanpa membuat mereka pindah ke aplikasi lain.</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              [
                "Pernikahan",
                "Dari meja tamu sampai pesta selesai, semua foto masuk ke album yang sama.",
                "https://images.unsplash.com/photo-1519741497674-611481863552?fm=jpg&q=85&w=1000&auto=format&fit=crop",
              ],
              [
                "Ulang tahun",
                "Biarkan teman dan keluarga mengisi album tanpa harus mengirim foto satu per satu.",
                "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?fm=jpg&q=85&w=1000&auto=format&fit=crop",
              ],
              [
                "Gathering kantor",
                "Tampilkan momen tim di layar venue dan simpan semuanya setelah acara selesai.",
                "https://images.unsplash.com/photo-1511632765486-a01980e01a18?fm=jpg&q=85&w=1000&auto=format&fit=crop",
              ],
            ].map(([title, description, image]) => (
              <article key={title} className="group overflow-hidden rounded-2xl border border-slate-200 bg-[#F8FAFC]">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={image} alt={`Suasana ${title.toLowerCase()}`} className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="p-6 sm:p-7">
                  <h3 className="text-xl font-semibold tracking-tight text-foreground">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F8FAFC] py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
          <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Yang kamu dapat</p>
              <h2 className="mt-5 max-w-md text-4xl leading-[0.98] tracking-[-0.04em] text-foreground sm:text-5xl">Semua yang dibutuhkan untuk mengelola foto acara.</h2>
              <p className="mt-6 max-w-sm text-base leading-7 text-muted-foreground sm:text-lg">Tamu punya cara mudah untuk berbagi. Kamu punya alat untuk mengatur apa yang tampil.</p>
            </div>
            <div className="grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-2">
              {[
                [QrCode, "QR siap dibagikan", "Buat QR unik untuk setiap event dan cetak kapan saja."],
                [ImagePlus, "Galeri bersama", "Foto tamu terkumpul di satu galeri, bukan tersebar di chat."],
                [ShieldCheck, "Moderasi manual", "Periksa foto sebelum masuk ke galeri dan layar venue."],
                [Download, "Unduh setelah acara", "Simpan semua foto yang sudah dikumpulkan dalam kualitas asli."],
              ].map(([Icon, title, description]) => (
                <div key={title as string} className="bg-white p-6 sm:p-7">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-[#E3F2FD] text-primary">
                    <Icon aria-hidden="true" className="size-5" strokeWidth={1.7} />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold tracking-tight text-foreground">{title as string}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{description as string}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="harga" className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Harga per event</p>
            <h2 className="mt-5 text-4xl leading-[0.98] tracking-[-0.04em] text-foreground sm:text-5xl">Pilih yang cocok untuk acaramu.</h2>
            <p className="mx-auto mt-6 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">Mulai tanpa biaya. Upgrade saat acara membutuhkan lebih banyak ruang dan waktu.</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              ["Free", "Rp 0", "Untuk acara kecil", ["50 foto", "Akses 7 hari", "Live feed", "Tanpa watermark"], false],
              ["Pro Event", "Rp 200rb", "Untuk acara dengan banyak tamu", ["Unlimited foto", "Penyimpanan 1 tahun", "Live slideshow", "Bulk download ZIP", "Moderasi konten"], true],
              ["Vendor", "Hubungi kami", "Untuk wedding organizer dan vendor", ["Unlimited events", "Custom branding", "Dashboard vendor", "Support prioritas"], false],
            ].map(([name, price, description, features, featured]) => (
              <article key={name as string} className={featured ? "rounded-2xl bg-[#07111F] p-7 text-white shadow-[0_20px_60px_rgba(7,17,31,0.2)] sm:p-8" : "rounded-2xl border border-slate-200 bg-[#F8FAFC] p-7 sm:p-8"}>
                <p className={featured ? "text-xs font-semibold uppercase tracking-[0.2em] text-[#90CAF9]" : "text-xs font-semibold uppercase tracking-[0.2em] text-primary"}>{name as string}</p>
                <p className={featured ? "mt-5 text-3xl font-semibold tracking-tight text-white" : "mt-5 text-3xl font-semibold tracking-tight text-foreground"}>{price as string}</p>
                <p className={featured ? "mt-2 min-h-12 text-sm leading-6 text-white/60" : "mt-2 min-h-12 text-sm leading-6 text-muted-foreground"}>{description as string}</p>
                <div className={featured ? "my-7 border-t border-white/15" : "my-7 border-t border-slate-200"} />
                <ul className="grid gap-3">
                  {(features as string[]).map((feature) => (
                    <li key={feature} className={featured ? "flex items-center gap-2 text-sm text-white/80" : "flex items-center gap-2 text-sm text-muted-foreground"}>
                      <Check className={featured ? "size-4 text-[#90CAF9]" : "size-4 text-primary"} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <a href="/register" className={featured ? "mt-8 block rounded-xl bg-[#2196F3] px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#1976D2]" : "mt-8 block rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"}>
                  {name === "Vendor" ? "Jadi partner" : "Mulai sekarang"}
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F8FAFC] py-20 sm:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 md:grid-cols-[0.8fr_1.2fr] md:gap-20 lg:px-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Pertanyaan umum</p>
            <h2 className="mt-5 max-w-md text-4xl leading-[0.98] tracking-[-0.04em] text-foreground sm:text-5xl">Sebelum acaramu dimulai.</h2>
          </div>
          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {[
              ["Apakah tamu perlu install aplikasi?", "Tidak. Tamu scan QR dan upload foto dari browser di HP mereka."],
              ["Kapan foto muncul di layar venue?", "Setelah kamu menyetujuinya di dashboard moderasi, foto akan muncul di slideshow."],
              ["Bisa dipakai di TV atau proyektor?", "Bisa. Buka link slideshow di browser perangkat yang tersambung ke layar venue."],
              ["Apa yang terjadi setelah acara selesai?", "Semua foto tetap tersedia di galeri event dan bisa kamu unduh."],
            ].map(([question, answer]) => (
              <details key={question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-base font-semibold tracking-tight text-foreground marker:hidden">
                  {question}
                  <span className="text-2xl font-normal leading-none text-primary transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="max-w-xl pr-10 pt-3 text-sm leading-6 text-muted-foreground">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section data-dark-nav className="bg-[#07111F] px-5 py-24 text-center text-white sm:px-8 sm:py-32">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#90CAF9]">Siap untuk acara berikutnya?</p>
          <h2 className="mt-5 text-5xl leading-[0.95] tracking-[-0.045em] sm:text-7xl">Biar tamu ikut mengisi ceritanya.</h2>
          <p className="mx-auto mt-6 max-w-lg text-base leading-7 text-white/65 sm:text-lg">Buat event, cetak QR, dan kumpulkan foto dari semua orang di ruangan.</p>
          <a href="/register" className="mt-8 inline-flex rounded-xl bg-[#2196F3] px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-[#1976D2]">Buat event pertama</a>
        </div>
      </section>
    </div>
  );
}
