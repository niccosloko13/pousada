"use client";

import { useEffect, useState } from "react";
import { BookingSearchBar } from "@/components/home/BookingSearchBar";
import { LegalEntityMini } from "@/components/trust/TrustSealBand";

export function StickyBookingBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 220);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed left-0 right-0 top-[78px] z-40 hidden px-4 transition-all duration-500 md:block ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0 pointer-events-none"
      }`}
    >
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-white/50 bg-white/80 p-2 backdrop-blur-md">
          <BookingSearchBar compact />
          <div className="mt-2 px-1 pb-1">
            <LegalEntityMini tone="light" />
          </div>
        </div>
      </div>
    </div>
  );
}
