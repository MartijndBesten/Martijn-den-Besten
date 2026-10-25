// Procedurele museumobjecten in ‘plat 3D’. Elk object krijgt op basis van zijn seed een eigen compositie:
// een hoofdvorm, een kleinere bijvorm, een detail en precies één technische knipoog (maatlijn en fig.-nummer).
// Met `unfinished` ontbreekt er een stuk: een gestippelde contour en een strook bouwtape.

import type React from "react";
import { seeded, pick, type Rng } from "../lib/random";

const INK = "#191b2e";
type Col = { base: string; dark: string; light: string };
const COLORS: Col[] = [
  { base: "#f2785c", dark: "#d4502f", light: "#ffb19e" },
  { base: "#3c5bd6", dark: "#2a3fa0", light: "#7f96ee" },
  { base: "#9fc39a", dark: "#6f9a6a", light: "#cfe3c8" },
  { base: "#c3b2f0", dark: "#9a85d6", light: "#e6ddff" },
  { base: "#f6d36b", dark: "#d9b245", light: "#fbe9b0" },
];
const BACKDROPS = ["#f9cfc2", "#cdd6fa", "#cfe3c8", "#dcd0f7", "#f7e3a1"];

const line = { stroke: INK, strokeWidth: 2, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

type Kind = "bol" | "cilinder" | "kubus" | "kegel" | "ring" | "blob" | "boog";
const KINDS: Kind[] = ["bol", "cilinder", "kubus", "kegel", "ring", "blob", "boog"];

function shape(kind: Kind, x: number, y: number, s: number, c: Col, key: string): React.ReactNode {
  const r = s / 2;
  switch (kind) {
    case "bol":
      return (
        <g key={key}>
          <circle cx={x} cy={y} r={r} fill={c.base} {...line} />
          <path d={`M${x + r * 0.2} ${y + r * 0.97}a${r} ${r} 0 0 0 ${r * 0.78} ${-r * 1.4}a${r * 1.1} ${r * 1.1} 0 0 1 ${-r * 0.78} ${r * 1.4}z`} fill={c.dark} opacity=".55" />
          <ellipse cx={x - r * 0.38} cy={y - r * 0.4} rx={r * 0.26} ry={r * 0.16} fill="#fff" opacity=".7" transform={`rotate(-35 ${x - r * 0.38} ${y - r * 0.4})`} />
        </g>
      );
    case "cilinder": {
      const h = s * 0.9;
      const ry = r * 0.32;
      return (
        <g key={key}>
          <path d={`M${x - r} ${y - h / 2}v${h}a${r} ${ry} 0 0 0 ${s} 0v${-h}`} fill={c.base} {...line} />
          <path d={`M${x + r * 0.45} ${y - h / 2 + ry * 0.9}v${h - ry * 0.4}`} stroke={c.dark} strokeWidth={r * 0.5} opacity=".5" />
          <ellipse cx={x} cy={y - h / 2} rx={r} ry={ry} fill={c.light} {...line} />
        </g>
      );
    }
    case "kubus": {
      const a = r * 0.86;
      return (
        <g key={key}>
          <path d={`M${x} ${y - r}l${a} ${r / 2}l${-a} ${r / 2}l${-a} ${-r / 2}z`} fill={c.light} {...line} />
          <path d={`M${x - a} ${y - r / 2}l${a} ${r / 2}v${r}l${-a} ${-r / 2}z`} fill={c.base} {...line} />
          <path d={`M${x + a} ${y - r / 2}l${-a} ${r / 2}v${r}l${a} ${-r / 2}z`} fill={c.dark} {...line} />
        </g>
      );
    }
    case "kegel":
      return (
        <g key={key}>
          <path d={`M${x} ${y - r}L${x + r} ${y + r * 0.7}a${r} ${r * 0.3} 0 0 1 ${-s} 0z`} fill={c.base} {...line} />
          <path d={`M${x} ${y - r}L${x + r} ${y + r * 0.7}a${r} ${r * 0.3} 0 0 1 ${-r * 0.7} ${r * 0.28}z`} fill={c.dark} opacity=".5" />
        </g>
      );
    case "ring":
      return (
        <g key={key}>
          <ellipse cx={x} cy={y} rx={r} ry={r * 0.62} fill="none" stroke={INK} strokeWidth={r * 0.46 + 4} />
          <ellipse cx={x} cy={y} rx={r} ry={r * 0.62} fill="none" stroke={c.base} strokeWidth={r * 0.46} />
          <path d={`M${x - r * 0.8} ${y - r * 0.3}a${r} ${r * 0.62} 0 0 1 ${r * 0.8} ${-r * 0.32}`} fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="3" />
        </g>
      );
    case "blob":
      return (
        <g key={key}>
          <path
            d={`M${x - r} ${y + r * 0.1}c${-r * 0.1} ${-r * 0.8} ${r * 0.5} ${-r * 1.2} ${r * 1.1} ${-r * 0.9}c${r * 0.7} ${r * 0.3} ${r * 1.1} ${r * 0.9} ${r * 0.6} ${r * 1.4}c${-r * 0.5} ${r * 0.5} ${-r * 1.5} ${r * 0.4} ${-r * 1.7} ${-r * 0.5}z`}
            fill={c.base}
            {...line}
          />
          <path d={`M${x - r * 0.5} ${y - r * 0.3}q${r * 0.2} ${-r * 0.4} ${r * 0.6} ${-r * 0.45}`} fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="4" strokeLinecap="round" />
        </g>
      );
    case "boog":
      return (
        <g key={key}>
          <path d={`M${x - r} ${y + r * 0.6}v${-r * 0.4}a${r} ${r} 0 0 1 ${s} 0v${r * 0.4}h${-r * 0.42}v${-r * 0.4}a${r * 0.58} ${r * 0.58} 0 0 0 ${-r * 1.16} 0v${r * 0.4}z`} fill={c.base} {...line} />
          <path d={`M${x - r * 0.79} ${y + r * 0.2}a${r * 0.79} ${r * 0.79} 0 0 1 ${r * 1.58} 0`} fill="none" stroke={c.light} strokeWidth={r * 0.14} />
        </g>
      );
  }
}

function detail(rng: Rng, c: Col, key: string): React.ReactNode {
  const x = 40 + rng() * 120;
  const y = 30 + rng() * 30;
  const k = Math.floor(rng() * 3);
  if (k === 0)
    return (
      <path key={key} d={`M${x} ${y - 9}l2.6 6 6.4.6-4.8 4.4 1.4 6.4-5.6-3.4-5.6 3.4 1.4-6.4-4.8-4.4 6.4-.6z`} fill={c.base} {...line} strokeWidth={1.6} />
    );
  if (k === 1)
    return (
      <g key={key} fill={c.base} stroke={INK} strokeWidth="1.4">
        <circle cx={x} cy={y} r="4" />
        <circle cx={x + 11} cy={y + 6} r="3" />
        <circle cx={x + 4} cy={y + 14} r="2.4" />
      </g>
    );
  return <path key={key} d={`M${x - 14} ${y}q7-10 14 0t14 0`} fill="none" stroke={c.dark} strokeWidth="4" strokeLinecap="round" />;
}

export function Artwork({ seed, label, unfinished = false }: { seed: number; label: string; unfinished?: boolean }) {
  const rng = seeded(seed);
  const backdrop = pick(BACKDROPS, rng);
  const cMain = pick(COLORS, rng);
  let cSide = pick(COLORS, rng);
  if (cSide === cMain) cSide = COLORS[(COLORS.indexOf(cMain) + 2) % COLORS.length];
  const cDetail = COLORS[(COLORS.indexOf(cSide) + 1) % COLORS.length];
  const main = pick(KINDS, rng);
  const side = pick(KINDS.filter((k) => k !== main), rng);
  const size = 78 + rng() * 22;
  const onTop = rng() < 0.5;
  const mx = 92 + rng() * 16;
  const my = 118;
  const sideSize = size * (0.42 + rng() * 0.12);
  const sx = onTop ? mx + (rng() - 0.5) * 16 : mx + (rng() < 0.5 ? -1 : 1) * (size * 0.52 + sideSize * 0.3);
  const sy = onTop ? my - size * 0.55 - sideSize * 0.3 : my + size * 0.3 - sideSize * 0.3;
  const blobPath = `M30 ${100 + (seed % 20)}c0-50 40-80 80-76s68 34 62 76-40 70-80 66-62-20-62-66z`;

  return (
    <svg viewBox="0 0 200 200" role="img" aria-label={`Museumobject: ${label}`} className="artwork">
      <path d={blobPath} fill={backdrop} />
      <ellipse cx={mx} cy={my + size * 0.5 + 8} rx={size * 0.62} ry="7" fill={INK} opacity=".14" />
      {!onTop && shape(side, sx, sy, sideSize, cSide, "s")}
      {shape(main, mx, my, size, cMain, "m")}
      {onTop && shape(side, sx, sy, sideSize, cSide, "s")}
      {detail(rng, cDetail, "d")}
      {unfinished && (
        <g>
          <circle cx={mx + size * 0.42} cy={my - size * 0.42} r={size * 0.22} fill="none" stroke={INK} strokeWidth="1.6" strokeDasharray="4 4" />
          <g transform={`rotate(-14 100 160)`}>
            <rect x="-10" y="150" width="220" height="16" fill="#f6d36b" stroke={INK} strokeWidth="1.6" />
            <text x="100" y="161.5" textAnchor="middle" fontFamily="Geist Mono, monospace" fontWeight="700" fontSize="8.5" letterSpacing="2" fill={INK}>
              IN AANBOUW · IN AANBOUW · IN AANBOUW
            </text>
          </g>
        </g>
      )}
      <path d="M16 186h32M16 182v8M48 182v8" stroke={INK} strokeWidth="1" opacity=".55" />
      <text x="54" y="189" fontFamily="Geist Mono, monospace" fontSize="7" fill={INK} opacity=".6">
        FIG. {(seed % 89) + 10}
      </text>
    </svg>
  );
}
