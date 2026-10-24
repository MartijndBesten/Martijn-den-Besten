import type React from "react";
// Procedurele 'kunstwerken' voor museumstukken: elk object krijgt een eigen compositie op basis van een seed.

import { seeded, pick } from "../lib/random";

const PALETTE = ["#2a3bdb", "#ff5c47", "#c6b3ff", "#ffd24d", "#34c77b", "#ffa6c9", "#fff4e0"];

export function Artwork({ seed, label, bg }: { seed: number; label: string; bg?: string }) {
  const rng = seeded(seed);
  const background = bg ?? pick(PALETTE, rng);
  const colors = PALETTE.filter((c) => c !== background);
  const parts: React.ReactElement[] = [];
  const count = 4 + Math.floor(rng() * 4);
  for (let i = 0; i < count; i++) {
    const kind = Math.floor(rng() * 6);
    const fill = pick(colors, rng);
    const x = 15 + rng() * 170;
    const y = 15 + rng() * 170;
    const s = 24 + rng() * 60;
    const rot = Math.floor(rng() * 8) * 45;
    const common = { fill, stroke: "#17153a", strokeWidth: 4, key: i } as const;
    if (kind === 0) parts.push(<circle cx={x} cy={y} r={s / 2} {...common} />);
    else if (kind === 1) parts.push(<rect x={x - s / 2} y={y - s / 2} width={s} height={s} rx={rng() > 0.5 ? s / 5 : 0} transform={`rotate(${rot} ${x} ${y})`} {...common} />);
    else if (kind === 2) parts.push(<path d={`M${x - s / 2} ${y + s / 2} L${x} ${y - s / 2} L${x + s / 2} ${y + s / 2}Z`} transform={`rotate(${rot} ${x} ${y})`} strokeLinejoin="round" {...common} />);
    else if (kind === 3) parts.push(<path d={`M${x - s / 2} ${y} a${s / 2} ${s / 2} 0 0 1 ${s} 0z`} transform={`rotate(${rot} ${x} ${y})`} {...common} />);
    else if (kind === 4)
      parts.push(
        <path
          key={i}
          d={`M${x - s} ${y} q${s / 4} -${s / 2} ${s / 2} 0 t${s / 2} 0 t${s / 2} 0 t${s / 2} 0`}
          fill="none"
          stroke={fill}
          strokeWidth={9}
          strokeLinecap="round"
        />,
      );
    else parts.push(<circle key={i} cx={x} cy={y} r={s / 2.4} fill="none" stroke={fill} strokeWidth={12} />);
  }
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label={`Abstract kunstwerk bij ${label}`} className="artwork">
      <rect width="200" height="200" fill={background} />
      {parts}
    </svg>
  );
}
