// Kleine technische tekening bij een uitvinding: een gekleurd apparaatje met één kenmerkend onderdeel
// (propeller, schaar, antenne, …), wielen of pootjes en een maatlijn als knipoog naar het octrooibureau.

import { useId } from "react";
import { seeded } from "../lib/random";
import type { FigKind, Tone } from "../content/inventions";

export const TONE_HEX: Record<Tone, string> = {
  koraal: "#ee9aac",
  kobalt: "#34407a",
  salie: "#a9dcc4",
  lila: "#cdbdf0",
  boter: "#f6d781",
};
const SECOND: Record<Tone, string> = {
  koraal: "#f6d781",
  kobalt: "#ee9aac",
  salie: "#34407a",
  lila: "#ee9aac",
  boter: "#34407a",
};

const INK = "#191b2e";

function Attachment({ kind, top, accent }: { kind: FigKind; top: number; accent: string }) {
  const s = { stroke: INK, strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (kind) {
    case "propeller":
      return (
        <g>
          <path d={`M80 ${top}v-16`} {...s} />
          <g className="ifig__spin" style={{ transformOrigin: `80px ${top - 18}px` }}>
            <ellipse cx="66" cy={top - 18} rx="14" ry="4.5" fill={accent} {...s} />
            <ellipse cx="94" cy={top - 18} rx="14" ry="4.5" fill={accent} {...s} />
          </g>
          <circle cx="80" cy={top - 18} r="3.5" fill={INK} />
        </g>
      );
    case "schaar":
      return (
        <g>
          <path d={`M108 ${top + 18}l26-16M108 ${top + 18}l26 8`} {...s} strokeWidth={3} stroke={accent} />
          <path d={`M108 ${top + 18}l26-16M108 ${top + 18}l26 8`} {...s} fill="none" />
          <circle cx="108" cy={top + 18} r="3" fill={INK} />
        </g>
      );
    case "ringen":
      return (
        <g fill="none">
          <ellipse cx="80" cy={top + 22} rx="44" ry="11" {...s} stroke={accent} strokeWidth={3.2} transform={`rotate(-14 80 ${top + 22})`} />
          <ellipse cx="80" cy={top + 22} rx="44" ry="11" {...s} transform={`rotate(-14 80 ${top + 22})`} strokeWidth={1} />
        </g>
      );
    case "antenne":
      return (
        <g fill="none">
          <path d={`M92 ${top}l10-26`} {...s} />
          <circle cx="102" cy={top - 28} r="5" fill={accent} {...s} />
          <path d={`M110 ${top - 38}a12 12 0 0 1 4 14M116 ${top - 44}a20 20 0 0 1 6 24`} {...s} strokeWidth={1.3} />
        </g>
      );
    case "wijzer":
      return (
        <g>
          <circle cx="80" cy={top + 22} r="13" fill="#fffdf8" {...s} />
          <path d={`M72 ${top + 26}a9 9 0 0 1 16 0`} fill="none" stroke={accent} strokeWidth="3" />
          <path className="ifig__needle" style={{ transformOrigin: `80px ${top + 22}px` }} d={`M80 ${top + 22}l7-7`} {...s} />
        </g>
      );
    case "schoorsteen":
      return (
        <g>
          <rect x="94" y={top - 18} width="12" height="20" rx="2" fill={accent} {...s} />
          <circle className="ifig__puff" cx="104" cy={top - 26} r="5" fill="#fffdf8" {...s} strokeWidth={1.1} />
          <circle className="ifig__puff ifig__puff--2" cx="112" cy={top - 36} r="7" fill="#fffdf8" {...s} strokeWidth={1.1} />
        </g>
      );
    case "veer":
      return (
        <g fill="none">
          <path d={`M80 ${top}l-7-4 14-4-14-4 14-4-14-4 7-3`} {...s} />
          <path d={`M80 ${top - 36}l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z`} fill={accent} {...s} strokeWidth={1.3} />
        </g>
      );
    case "trechter":
      return (
        <g>
          <path d={`M60 ${top - 22}h40l-14 20h-12z`} fill={accent} {...s} />
          <circle cx="74" cy={top - 26} r="4" fill="#ee9aac" {...s} strokeWidth={1.1} />
          <circle cx="86" cy={top - 27} r="3.5" fill="#a9dcc4" {...s} strokeWidth={1.1} />
        </g>
      );
    case "wolk":
      return (
        <path
          d={`M56 ${top - 10}a9 9 0 0 1 8-12a12 12 0 0 1 22-4a10 10 0 0 1 16 8a8 8 0 0 1-2 16h-40a8 8 0 0 1-4-8z`}
          fill="#fffdf8"
          {...s}
        />
      );
    default:
      return null;
  }
}

export function InventionFig({ seed, tone, kind, label }: { seed: number; tone: Tone; kind: FigKind; label: string }) {
  const rng = seeded(seed);
  const shape = Math.floor(rng() * 3);
  const wheels = rng() < 0.6;
  const main = TONE_HEX[tone];
  const accent = SECOND[tone];
  const id = useId().replace(/:/g, "");
  const top = shape === 1 ? 46 : 52;
  const s = { stroke: INK, strokeWidth: 1.6, strokeLinejoin: "round" as const };

  const body = (dx = 0, scale = 1) => (
    <g transform={dx || scale !== 1 ? `translate(${dx} 0) translate(80 74) scale(${scale}) translate(-80 -74)` : undefined}>
      {shape === 0 && <rect x="48" y={top} width="64" height="46" rx="13" fill={main} {...s} />}
      {shape === 1 && <circle cx="80" cy="74" r="28" fill={main} {...s} />}
      {shape === 2 && <rect x="44" y={top + 4} width="72" height="40" rx="20" fill={main} {...s} />}
      {/* glans en schaduw: plat, maar met diepte */}
      <path d={shape === 1 ? "M62 66a20 20 0 0 1 14-12" : `M${shape === 2 ? 58 : 56} ${top + 10}h14`} stroke="#fff" strokeOpacity=".6" strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx={shape === 1 ? 88 : 96} cy={shape === 1 ? 80 : top + 26} r="5" fill="#fffdf8" {...s} strokeWidth={1.2} />
      <circle cx={shape === 1 ? 88 : 96} cy={shape === 1 ? 80 : top + 26} r="2" fill={INK} />
    </g>
  );

  return (
    <svg viewBox="0 0 160 120" className="ifig" role="img" aria-label={`Tekening van ${label}`}>
      <defs>
        <pattern id={`ifig-grid-${id}`} width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M10 0H0V10" fill="none" stroke={INK} strokeOpacity=".07" />
        </pattern>
      </defs>
      <rect width="160" height="120" fill={`url(#ifig-grid-${id})`} />
      <ellipse cx="80" cy="108" rx="44" ry="5" fill={INK} opacity=".12" />
      {kind === "dubbel" && <g opacity=".9">{body(-22, 0.62)}</g>}
      <Attachment kind={kind === "dubbel" ? "trechter" : kind} top={top} accent={accent} />
      {body(kind === "dubbel" ? 14 : 0)}
      {wheels ? (
        <g>
          <circle cx="62" cy="102" r="7" fill={INK} />
          <circle cx="98" cy="102" r="7" fill={INK} />
          <circle cx="62" cy="102" r="2.4" fill="#fffdf8" />
          <circle cx="98" cy="102" r="2.4" fill="#fffdf8" />
        </g>
      ) : (
        <path d="M64 98v8M96 98v8M58 106h12M90 106h12" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      )}
      <path d="M14 18v10M14 23h22M36 18v10" stroke={INK} strokeWidth=".8" opacity=".6" />
      <text x="40" y="26" fontFamily="Geist Mono, monospace" fontSize="7" fill={INK} opacity=".7">
        FIG. {(seed % 97) + 2}
      </text>
    </svg>
  );
}
