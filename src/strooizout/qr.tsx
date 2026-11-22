// QR-code als inline SVG, lokaal berekend (qrcode-generator, MIT). Geen externe QR-dienst, geen tracking.

import qrcode from "qrcode-generator";
import { useMemo } from "react";

export const WINKEL_URL = "https://martijndenbesten.com/strooizout";
export const KORTE_URL = "martijndenbesten.com/zout";

/** Pad van alle donkere modules (één <path>, scherp bij elke grootte). */
export function qrPad(tekst: string, niveau: "L" | "M" | "Q" | "H" = "M"): { pad: string; grootte: number } {
  const qr = qrcode(0, niveau);
  qr.addData(tekst);
  qr.make();
  const n = qr.getModuleCount();
  let pad = "";
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) if (qr.isDark(r, c)) pad += `M${c} ${r}h1v1h-1z`;
  }
  return { pad, grootte: n };
}

export function QrCode({ tekst = WINKEL_URL, label, kleur = "#0f2c4c", className }: { tekst?: string; label: string; kleur?: string; className?: string }) {
  const { pad, grootte } = useMemo(() => qrPad(tekst), [tekst]);
  const marge = 2;
  return (
    <svg className={className} viewBox={`${-marge} ${-marge} ${grootte + marge * 2} ${grootte + marge * 2}`} role="img" aria-label={label} shapeRendering="crispEdges">
      <rect x={-marge} y={-marge} width={grootte + marge * 2} height={grootte + marge * 2} fill="#fff" />
      <path d={pad} fill={kleur} />
    </svg>
  );
}
