import Link from "next/link";

export default function HomePage() {
  return (
    <div className="bg-cream-100">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Album Digital Real-Time
            <br />
            <span className="text-primary">untuk Semua Acaramu</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Scan, foto, langsung muncul di TV. Tanpa app, tanpa ribet.
          </p>
          <Link
            href="/register"
            className="inline-block bg-primary text-primary-foreground px-8 py-4 rounded-xl text-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Coba Gratis Sekarang
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Cara Kerja
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Bikin Event",
                desc: "Isi nama acara, tanggal, QR langsung jadi",
              },
              {
                step: "2",
                title: "Share QR",
                desc: "Cetak atau kirim link ke tamu",
              },
              {
                step: "3",
                title: "Tamu Foto",
                desc: "Scan QR, foto langsung muncul",
              },
              {
                step: "4",
                title: "Live di TV",
                desc: "Tayangkan slideshow di venue",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-blush-100 text-primary rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
