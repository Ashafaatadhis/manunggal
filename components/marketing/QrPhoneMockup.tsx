"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useRef } from "react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function QrPhoneMockup() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const phone = scope.current?.querySelector("[data-qr-phone]");
      if (!phone) return;

      gsap.from(phone, {
        y: 32,
        opacity: 0,
        rotate: -5,
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: scope.current,
          start: "top 78%",
          once: true,
        },
      });

      gsap.to(phone, {
        y: -4,
        duration: 3.2,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 1.1,
      });
    },
    { scope },
  );

  return (
    <div ref={scope} className="relative mx-auto w-full max-w-[31rem]">
      <div className="absolute -inset-8 rounded-[3rem] bg-[#90CAF9]/30 blur-3xl" />
      <div
        data-qr-phone
        className="relative mx-auto w-full max-w-[18rem] rotate-1 rounded-[2.5rem] border-[0.7rem] border-[#182433] bg-[#182433] p-1 shadow-[0_24px_80px_rgba(7,17,31,0.24)] will-change-transform"
      >
        <div className="absolute left-1/2 top-1 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-[#182433]" />
        <div className="overflow-hidden rounded-[1.8rem] bg-white">
          <div className="flex h-7 items-center justify-between bg-white px-5 text-[0.55rem] font-semibold text-slate-700">
            <span>9:41</span>
            <span>▮▮▮</span>
          </div>
          <Image
            src="/qr-example.png"
            alt="Contoh signage QR Manunggal"
            width={960}
            height={1280}
            className="w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}
