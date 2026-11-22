// Eenvoudige lijniconen (eigen tekening, 24 × 24), zodat er geen iconenbibliotheek nodig is.

import type { SVGProps } from "react";

const basis = (p: SVGProps<SVGSVGElement>) => ({ viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true, ...p });

export const IcoonMand = (p: SVGProps<SVGSVGElement>) => (
  <svg {...basis(p)}><path d="M3 5h2l2.2 10.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.5L20.5 8H6.2" /><circle cx="10" cy="20" r="1.3" /><circle cx="17" cy="20" r="1.3" /></svg>
);
export const IcoonSluit = (p: SVGProps<SVGSVGElement>) => (
  <svg {...basis(p)}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const IcoonPijlLinks = (p: SVGProps<SVGSVGElement>) => (
  <svg {...basis(p)}><path d="M15 18 9 12l6-6" /></svg>
);
export const IcoonPijlRechts = (p: SVGProps<SVGSVGElement>) => (
  <svg {...basis(p)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const IcoonVink = (p: SVGProps<SVGSVGElement>) => (
  <svg {...basis({ strokeWidth: 2.4, ...p })}><path d="m5 12.5 4.2 4.2L19 7" /></svg>
);
export const IcoonKlok = (p: SVGProps<SVGSVGElement>) => (
  <svg {...basis(p)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
export const IcoonInfo = (p: SVGProps<SVGSVGElement>) => (
  <svg {...basis(p)}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
);
export const IcoonLet = (p: SVGProps<SVGSVGElement>) => (
  <svg {...basis(p)}><path d="M12 3 2.5 20h19L12 3Z" /><path d="M12 10v4M12 17h.01" /></svg>
);
export const IcoonHuis = (p: SVGProps<SVGSVGElement>) => (
  <svg {...basis(p)}><path d="M3 11 12 4l9 7" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></svg>
);
export const IcoonBus = (p: SVGProps<SVGSVGElement>) => (
  <svg {...basis(p)}><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.6" /><circle cx="17" cy="17.5" r="1.6" /></svg>
);
export const IcoonEuro = (p: SVGProps<SVGSVGElement>) => (
  <svg {...basis(p)}><path d="M17 6.5A6.5 6.5 0 1 0 17 17.5" /><path d="M4 10h9M4 14h9" /></svg>
);
export const IcoonSneeuw = (p: SVGProps<SVGSVGElement>) => (
  <svg {...basis(p)}><path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7" /><path d="m9 4 3 2 3-2M9 20l3-2 3 2M4 10.5l3.5-.5-1-3.3M20 13.5l-3.5.5 1 3.3M4 13.5l3.5.5-1 3.3M20 10.5l-3.5-.5 1-3.3" /></svg>
);
export const IcoonKopie = (p: SVGProps<SVGSVGElement>) => (
  <svg {...basis(p)}><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg>
);

/** Merkteken: sneeuwkristal in een afgeronde donkerblauwe tegel. */
export function Merkteken({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id="sz-merk-v" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#245a8f" />
          <stop offset="1" stopColor="#0f2c4c" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill="url(#sz-merk-v)" />
      <g stroke="#fff" strokeWidth="2.6" strokeLinecap="round" fill="none">
        <path d="M24 11v26M12.7 17.5l22.6 13M12.7 30.5l22.6-13" />
        <path d="m20.5 13.5 3.5 2.6 3.5-2.6M20.5 34.5l3.5-2.6 3.5 2.6M13.3 22.2l4.2.5-1.6-4M34.7 25.8l-4.2-.5 1.6 4M13.3 25.8l4.2-.5-1.6 4M34.7 22.2l-4.2.5 1.6-4" strokeWidth="2" />
      </g>
    </svg>
  );
}
