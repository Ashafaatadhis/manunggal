"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isInHero, setIsInHero] = useState(pathname === "/");
  const [isOnDarkSection, setIsOnDarkSection] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const useLightContent = pathname === "/" && (isInHero || isOnDarkSection);
  const navigation = [
    { label: "Cara Kerja", href: pathname === "/" ? "#cara-kerja" : "/#cara-kerja" },
    { label: "Harga", href: pathname === "/" ? "#harga" : "/#harga" },
  ];

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 16);
    const updateHeroState = () => {
      const hero = document.querySelector<HTMLElement>("[data-hero]");
      setIsInHero(hero ? hero.getBoundingClientRect().bottom > 16 : window.scrollY < window.innerHeight);
      const darkSections = document.querySelectorAll<HTMLElement>("[data-dark-nav]");
      setIsOnDarkSection(
        Array.from(darkSections).some(
          (section) => section.getBoundingClientRect().top < 72 && section.getBoundingClientRect().bottom > 16,
        ),
      );
    };
    updateScrollState();
    updateHeroState();
    const handleScroll = () => {
      updateScrollState();
      updateHeroState();
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    void fetch("/api/auth/me")
      .then((response) => response.json())
      .then((data: { success?: boolean }) => setIsAuthenticated(data.success === true))
      .catch(() => setIsAuthenticated(false));
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <header className="fixed inset-x-0 top-0 z-50" data-light-content={useLightContent}>
      <motion.div
        animate={{
          // Keep mobile navbar surface aligned with hero px-5.
          maxWidth: isScrolled ? 1192 : 1240,
          paddingLeft: isScrolled ? 20 : 0,
          paddingRight: isScrolled ? 20 : 0,
          paddingTop: isScrolled ? 8 : 0,
        }}
        transition={{ type: "spring", stiffness: 280, damping: 30 }}
        className="mx-auto"
      >
      <motion.div
        animate={{
          borderRadius: isScrolled ? 16 : 0,
          backgroundColor: isScrolled ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0)",
          boxShadow: isScrolled ? "0 8px 30px rgba(7, 17, 31, 0.10)" : "0 0 0 rgba(7, 17, 31, 0)",
        }}
        transition={{ type: "spring", stiffness: 280, damping: 30 }}
        className={cn(
          "border",
          isScrolled ? "border-white/15" : "border-transparent",
          isScrolled ? "backdrop-blur-xl" : "backdrop-blur-none"
        )}
        data-scrolled={isScrolled}
      >
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className={cn(
              "rounded-lg text-xl font-bold tracking-tight outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
               useLightContent ? "!text-white" : "text-primary"
            )}
            style={useLightContent ? { color: "white" } : undefined}
            onClick={() => setIsOpen(false)}
          >
             Manunggal<span className={useLightContent ? "!text-white/70" : "text-foreground"}>.</span>
          </Link>

          <nav aria-label="Navigasi utama" className="hidden items-center gap-1 md:flex">
            {navigation.map((item) => {
              const isActive = pathname !== "/" && pathname === item.href;
              return (
                <motion.div
                  key={item.href}
                  className="relative rounded-full"
                  whileHover={{ y: -1 }}
                  transition={{ type: "spring", stiffness: 420, damping: 28 }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "relative z-10 block rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isActive
                        ? useLightContent
                          ? "!text-white"
                          : "text-foreground"
                        : useLightContent
                          ? "!text-white hover:!text-white"
                          : "text-muted-foreground hover:text-foreground"
                    )}
                    style={useLightContent ? { color: "white" } : undefined}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="desktop-nav-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-blush-100"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    {item.label}
                  </Link>
                </motion.div>
              );
            })}
            <Link
              href={isAuthenticated ? "/dashboard" : "/register"}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {isAuthenticated ? "Dashboard" : "Coba Gratis"}
            </Link>
          </nav>

          <button
            type="button"
            aria-label={isOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={isOpen}
            className={cn(
              "rounded-lg p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden",
               useLightContent ? "!text-white hover:bg-white/10" : "text-foreground hover:bg-muted"
            )}
            onClick={() => setIsOpen((open) => !open)}
          >
            {isOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.nav
              aria-label="Navigasi mobile"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 360, damping: 32 }}
              className="overflow-hidden border-t border-border/70 md:hidden"
            >
              <div className="flex flex-col gap-1 px-4 pb-4 pt-3">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                   className={cn(
                     "rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                     useLightContent ? "!text-white hover:bg-white/10 hover:!text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                   )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href={isAuthenticated ? "/dashboard" : "/register"}
                className="mt-2 rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
                onClick={() => setIsOpen(false)}
              >
                {isAuthenticated ? "Dashboard" : "Coba Gratis"}
              </Link>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.div>
      </motion.div>
      </header>
    </MotionConfig>
  );
}
