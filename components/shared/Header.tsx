import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-primary">
            Manunggal
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/cara-kerja"
              className="text-muted-foreground hover:text-foreground"
            >
              Cara Kerja
            </Link>
            <Link
              href="/harga"
              className="text-muted-foreground hover:text-foreground"
            >
              Harga
            </Link>
            <Link
              href="/login"
              className="text-muted-foreground hover:text-foreground"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
            >
              Coba Gratis
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
