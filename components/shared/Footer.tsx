export default function Footer() {
  return (
    <footer className="bg-white border-t border-border py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <p className="text-muted-foreground text-sm">
            © 2026 Manunggal. Album digital real-time untuk semua acaramu.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a
              href="https://instagram.com"
              className="text-muted-foreground hover:text-foreground"
            >
              Instagram
            </a>
            <a
              href="https://tiktok.com"
              className="text-muted-foreground hover:text-foreground"
            >
              TikTok
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
