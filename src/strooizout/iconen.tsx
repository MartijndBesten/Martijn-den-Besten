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
export const IcoonDelen = (p: SVGProps<SVGSVGElement>) => (
  <svg {...basis(p)}><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4" /></svg>
);

/**
 * Merkteken: dak en voordeur met een veilige looproute in de vorm van een S, met drie strooikorrels
 * (public/strooizout/logo/merk.svg). Dik genoeg getekend om ook als favicon van 16 px leesbaar te blijven.
 */
export function Merkteken({ className, opDonker = false }: { className?: string; opDonker?: boolean }) {
  const id = opDonker ? "sz-mk-d" : "sz-mk";
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <clipPath id={id}>
          <rect width="64" height="64" rx="16" />
        </clipPath>
      </defs>
      {opDonker ? <rect x="1" y="1" width="62" height="62" rx="15" fill="#123461" stroke="#cfe6f6" strokeOpacity=".35" strokeWidth="2" /> : <rect width="64" height="64" rx="16" fill="#0b2340" />}
      <g clipPath={`url(#${id})`}>
        <path d="M32 41 C 45 44, 46 52, 31 54.5 C 17 57, 15 63, 19 70" fill="none" stroke="#cfe6f6" strokeWidth="9.5" strokeLinecap="round" />
        <g fill="#ffb547">
          <circle cx="41.2" cy="46.6" r="2.3" />
          <circle cx="30.6" cy="54.6" r="2.6" />
          <circle cx="19.6" cy="60.6" r="2.9" />
        </g>
      </g>
      <path d="M11.5 30.5 32 13l20.5 17.5" fill="none" stroke="#fff" strokeWidth="6.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M27.4 41.5v-9.2a4.6 4.6 0 0 1 9.2 0v9.2z" fill="#fff" />
    </svg>
  );
}

/** Logo: merkteken met ‘Strooizout’ en ‘voor de buurt’. */
export function Logo({ className = "", opDonker = false }: { className?: string; opDonker?: boolean }) {
  return (
    <span className={`sz-logo${opDonker ? " sz-logo--donker" : ""} ${className}`}>
      <Merkteken className="sz-logo__teken" opDonker={opDonker} />
      <span className="sz-logo__woord">
        <strong>Strooizout</strong>
        <span>voor de buurt</span>
      </span>
    </span>
  );
}
