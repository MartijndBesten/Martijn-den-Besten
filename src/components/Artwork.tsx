// Procedurele octrooitekeningen voor museumstukken. Elk object krijgt op basis van zijn seed
// een eigen compositie: inktlijnen, arcering, constructielijnen en precies één accentkleur.

import type React from "react";
import { seeded, pick, type Rng } from "../lib/random";

const ACCENTS = ["#b65a3a", "#4a4f8c", "#8a9a7b", "#c2913a"];

type Shape = { kind: number; x: number; y: number; s: number; rot: number };

function shapeEl(sh: Shape, props: React.SVGProps<SVGElement>, key: string) {
  const { x, y, s, rot } = sh;
  const t = `rotate(${rot} ${x} ${y})`;
  switch (sh.kind) {
    case 0:
      return <circle key={key} cx={x} cy={y} r={s / 2} {...(props as React.SVGProps<SVGCircleElement>)} />;
    case 1:
      return <rect key={key} x={x - s / 2} y={y - s / 2} width={s} height={s} transform={t} {...(props as React.SVGProps<SVGRectElement>)} />;
    case 2:
      return <path key={key} d={`M${x - s / 2} ${y + s / 2.4}L${x} ${y - s / 2}L${x + s / 2} ${y + s / 2.4}Z`} transform={t} {...(props as React.SVGProps<SVGPathElement>)} />;
    case 3:
      return <path key={key} d={`M${x - s / 2} ${y}a${s / 2} ${s / 2} 0 0 1 ${s} 0z`} transform={t} {...(props as React.SVGProps<SVGPathElement>)} />;
    default:
      return <rect key={key} x={x - s / 2} y={y - s / 5} width={s} height={s / 2.5} rx={s / 5} transform={t} {...(props as React.SVGProps<SVGRectElement>)} />;
  }
}

function compose(rng: Rng): Shape[] {
  const n = 3 + Math.floor(rng() * 3);
  return Array.from({ length: n }, () => ({
    kind: Math.floor(rng() * 5),
    x: 50 + rng() * 100,
    y: 50 + rng() * 100,
    s: 34 + rng() * 56,
    rot: Math.floor(rng() * 8) * 15,
  }));
}

export function Artwork({ seed, label }: { seed: number; label: string; bg?: string }) {
  const rng = seeded(seed);
  const accent = pick(ACCENTS, rng);
  const shapes = compose(rng);
  const hatched = Math.floor(rng() * shapes.length);
  const filled = (hatched + 1 + Math.floor(rng() * (shapes.length - 1))) % shapes.length;
  const hatchId = `art-hatch-${seed}`;
  const main = shapes[filled];
  const dimY = 186;
  const callout = shapes[hatched];

  return (
    <svg viewBox="0 0 200 200" role="img" aria-label={`Octrooitekening bij ${label}`} className="artwork draw" fill="none" stroke="currentColor" strokeWidth="1.1">
      <defs>
        <pattern id={hatchId} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform={`rotate(${45 + (seed % 3) * 30})`}>
          <line x1="0" y1="0" x2="0" y2="5" stroke="currentColor" strokeWidth="0.6" />
        </pattern>
      </defs>
      {/* constructielijnen */}
      <path d="M100 18v164M18 100h164" strokeWidth="0.4" strokeDasharray="2 3" opacity="0.6" />
      <circle cx="100" cy="100" r={46 + (seed % 5) * 6} strokeWidth="0.4" strokeDasharray="2 3" opacity="0.6" />
      {shapes.map((sh, i) =>
        i === filled
          ? shapeEl(sh, { fill: accent, stroke: "none", className: "fill" }, `f${i}`)
          : i === hatched
            ? shapeEl(sh, { fill: `url(#${hatchId})`, stroke: "none", className: "fill" }, `h${i}`)
            : null,
      )}
      {shapes.map((sh, i) => shapeEl(sh, {}, `o${i}`))}
      {/* maatvoering onder het hoofdobject */}
      <path d={`M${main.x - main.s / 2} ${dimY}h${main.s}M${main.x - main.s / 2} ${dimY - 4}v8M${main.x + main.s / 2} ${dimY - 4}v8`} strokeWidth="0.6" />
      {/* callout */}
      <path d={`M${callout.x} ${callout.y}L${callout.x > 100 ? 178 : 22} 24`} strokeWidth="0.5" />
      <circle cx={callout.x > 100 ? 178 : 22} cy="24" r="6" strokeWidth="0.7" />
      <text x={callout.x > 100 ? 178 : 22} y="26.5" textAnchor="middle" fontFamily="Geist Mono" fontSize="6.5" fill="currentColor" stroke="none">
        {(seed % 9) + 1}
      </text>
    </svg>
  );
}
