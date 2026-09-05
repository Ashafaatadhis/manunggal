import Link from "next/link";

export default function HargaPage() {
  const packages = [
    {
      name: "Free",
      price: "Rp 0",
      features: ["50 foto", "Akses 7 hari", "Live feed", "Tanpa watermark"],
      cta: "Mulai Gratis",
      primary: false,
    },
    {
      name: "Pro Event",
      price: "Rp 200rb",
      features: [
        "Unlimited foto",
        "Penyimpanan 1 tahun",
        "Live slideshow",
        "Bulk download ZIP",
        "Tanpa watermark",
        "Moderasi konten",
      ],
      cta: "Pilih Pro",
      primary: true,
    },
    {
      name: "Vendor",
      price: "Hubungi Kami",
      features: [
        "Unlimited events",
        "Custom branding",
        "Dashboard vendor",
        "Support prioritas",
        "Semua fitur Pro",
      ],
      cta: "Jadi Partner",
      primary: false,
    },
  ];

  return (
    <div className="py-20 px-4 bg-cream-100">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-foreground mb-4">
          Harga
        </h1>
        <p className="text-center text-muted-foreground mb-12">
          Pilih paket sesuai kebutuhan acaramu
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className={`rounded-xl p-8 ${
                pkg.primary
                  ? "bg-primary text-primary-foreground ring-4 ring-primary/30"
                  : "bg-white"
              }`}
            >
              <h3
                className={`text-xl font-bold mb-2 ${
                  pkg.primary ? "text-primary-foreground" : "text-foreground"
                }`}
              >
                {pkg.name}
              </h3>
              <p
                className={`text-3xl font-bold mb-6 ${
                  pkg.primary ? "text-primary-foreground" : "text-foreground"
                }`}
              >
                {pkg.price}
              </p>
              <ul className="space-y-3 mb-8">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <svg
                      className={`w-5 h-5 mr-2 ${
                        pkg.primary ? "text-primary-foreground" : "text-primary"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span
                      className={
                        pkg.primary ? "text-primary-foreground" : "text-muted-foreground"
                      }
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`block text-center py-3 rounded-lg font-medium transition-colors ${
                  pkg.primary
                    ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                    : "bg-blush-100 text-primary hover:bg-blush-200"
                }`}
              >
                {pkg.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
