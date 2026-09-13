"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(useGSAP);

const heroImage =
  "https://images.unsplash.com/photo-1756267237113-8e51341a21ff?fm=jpg&q=85&w=1800&auto=format&fit=crop";

export default function HeroParallax() {
  const scope = useRef<HTMLElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const orb = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.to(image.current, {
        yPercent: 8,
        scale: 1.045,
        ease: "none",
        scrollTrigger: {
          trigger: scope.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.8,
        },
      });
      gsap.to(orb.current, {
        yPercent: -12,
        rotate: 4,
        ease: "none",
        scrollTrigger: {
          trigger: scope.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        },
      });
    },
    { scope }
  );

  return (
    <section ref={scope} data-hero className="relative isolate h-[100svh] overflow-hidden bg-[#07111F] text-white">
      <div className="absolute inset-0 -z-20 bg-[#07111F]" />
      <img ref={image} src={heroImage} alt="" aria-hidden="true" className="hero-parallax-image absolute inset-0 -z-10 h-[115%] w-full object-cover object-[58%_center] opacity-70 will-change-transform sm:object-center" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(7,17,31,0.96)_0%,rgba(7,17,31,0.78)_43%,rgba(7,17,31,0.22)_100%),linear-gradient(0deg,rgba(7,17,31,0.78)_0%,transparent_55%)]" />
      <div ref={orb} className="hero-parallax-orb absolute -right-48 top-20 -z-10 size-[24rem] rounded-full bg-[#2196F3]/20 blur-3xl will-change-transform sm:-right-32 sm:top-24 sm:size-[30rem] lg:size-[34rem]" />

      <div className="mx-auto flex h-full max-w-6xl items-center px-5 py-0 sm:px-8 md:px-10">
        <div className="relative z-10 max-w-2xl">
          <p className="mb-4 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#90CAF9] sm:mb-5 sm:text-xs sm:tracking-[0.28em] md:mb-6 md:text-sm">Foto tamu, langsung masuk</p>
          <h1 className="max-w-xl text-[3.25rem] leading-[0.92] tracking-[-0.045em] text-white sm:max-w-2xl sm:text-6xl md:text-7xl lg:max-w-2xl lg:text-7xl xl:text-[6.5rem]">
            Foto acara,
            <br />
            <em className="text-[#90CAF9]">satu tempat.</em>
          </h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-white/70 sm:mt-6 sm:max-w-xl sm:text-base sm:leading-7 md:text-lg">Tamu scan QR, upload foto dari browser, lalu kamu pilih foto untuk ditampilkan di layar venue.</p>
          <div className="mt-6 flex flex-col items-stretch gap-3 sm:mt-7 sm:flex-row sm:items-center">
            <a href="/register" className="rounded-xl bg-[#2196F3] px-5 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-[#2196F3]/25 transition-transform hover:-translate-y-1 hover:bg-[#1976D2] sm:px-6 sm:py-3.5 sm:text-base">Buat event pertama</a>
            <a href="#cara-kerja" className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-center text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20 sm:px-6 sm:py-3.5 sm:text-base">Lihat alurnya</a>
          </div>
        </div>
      </div>
    </section>
  );
}
