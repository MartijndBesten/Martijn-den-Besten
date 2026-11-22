// Kleine bewegingshulpjes voor de webshop, zonder animatiebibliotheek: een getal dat soepel naar zijn nieuwe waarde
// loopt, onderdelen die in beeld komen bij scrollen, en een lichte kanteling die de muis volgt.
// Alles respecteert ‘minder beweging’ (prefers-reduced-motion) en blokkeert nooit een klik of invoer.

import { useEffect, useRef, useState, type RefObject } from "react";

export const minderBeweging = () => typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Loopt in korte tijd van de vorige naar de nieuwe waarde (hele getallen, bijv. centen). */
export function useTween(doel: number, ms = 320): number {
  const [waarde, setWaarde] = useState(doel);
  const huidig = useRef(doel);
  useEffect(() => {
    if (huidig.current === doel) return;
    if (minderBeweging() || typeof requestAnimationFrame !== "function") {
      huidig.current = doel;
      setWaarde(doel);
      return;
    }
    const van = huidig.current;
    const start = performance.now();
    let raf = 0;
    const stap = (nu: number) => {
      const p = Math.min(1, (nu - start) / ms);
      const zacht = 1 - Math.pow(1 - p, 3);
      const x = Math.round(van + (doel - van) * zacht);
      huidig.current = x;
      setWaarde(x);
      if (p < 1) raf = requestAnimationFrame(stap);
    };
    raf = requestAnimationFrame(stap);
    return () => cancelAnimationFrame(raf);
  }, [doel, ms]);
  return waarde;
}

/**
 * Onderdelen met `data-onthul` binnen het element komen rustig in beeld zodra ze zichtbaar worden. Zonder
 * IntersectionObserver of bij ‘minder beweging’ staat alles er gewoon (de verborgen begintoestand geldt alleen
 * onder de klasse `wn-js`, die hier wordt gezet).
 */
export function useOnthul(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver !== "function" || minderBeweging()) return;
    el.classList.add("wn-js");
    const io = new IntersectionObserver(
      (items) => {
        for (const item of items) {
          if (!item.isIntersecting) continue;
          item.target.classList.add("is-zichtbaar");
          io.unobserve(item.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    el.querySelectorAll("[data-onthul]").forEach((x) => io.observe(x));
    return () => {
      io.disconnect();
      el.classList.remove("wn-js");
    };
  }, [ref]);
}

/**
 * Laat het element licht meebewegen met de muis: zet `--kx` en `--ky` (−1 … 1) op het element. Alleen met een
 * muis of trackpad; op een telefoon blijft het bij de rustige zweefanimatie uit de CSS.
 */
export function useKantel(ref: RefObject<HTMLElement | null>, gebied?: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const el = ref.current;
    const zone = gebied?.current ?? el;
    if (!el || !zone || minderBeweging() || typeof window.matchMedia !== "function" || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let raf = 0;
    let x = 0;
    let y = 0;
    const teken = () => {
      raf = 0;
      el.style.setProperty("--kx", x.toFixed(3));
      el.style.setProperty("--ky", y.toFixed(3));
    };
    const beweeg = (e: PointerEvent) => {
      const r = zone.getBoundingClientRect();
      x = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
      y = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
      if (!raf) raf = requestAnimationFrame(teken);
    };
    const weg = () => {
      x = 0;
      y = 0;
      if (!raf) raf = requestAnimationFrame(teken);
    };
    zone.addEventListener("pointermove", beweeg, { passive: true });
    zone.addEventListener("pointerleave", weg, { passive: true });
    return () => {
      zone.removeEventListener("pointermove", beweeg);
      zone.removeEventListener("pointerleave", weg);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref, gebied]);
}
