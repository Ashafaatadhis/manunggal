export default function CaraKerjaPage() {
  return (
    <div className="py-20 px-4 bg-cream-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-foreground mb-4">
          Cara Kerja
        </h1>
        <p className="text-center text-muted-foreground mb-16">
          Empat langkah, selesai.
        </p>

        <div className="space-y-16">
          {[
            {
              step: 1,
              title: "Bikin Event Kamu",
              desc: "Pilih tanggal, isi nama acara, atur jatah foto per tamu. QR langsung jadi dalam hitungan menit.",
            },
            {
              step: 2,
              title: "Bagikan Lewat QR",
              desc: "Kartu QR siap cetak atau share link via WhatsApp. Tamu tinggal scan, nggak perlu install app.",
            },
            {
              step: 3,
              title: "Tamu Motret",
              desc: "Tamu jepret kapan aja selama acara. Bisa dari kamera atau upload dari galeri HP.",
            },
            {
              step: 4,
              title: "Live di TV",
              desc: "Foto langsung muncul di live feed. Tayangkan slideshow di proyektor atau TV venue.",
            },
          ].map((item) => (
            <div key={item.step} className="flex gap-8 items-start">
              <div className="w-16 h-16 bg-blush-100 text-primary rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">
                {item.step}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {item.title}
                </h2>
                <p className="text-muted-foreground text-lg">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
