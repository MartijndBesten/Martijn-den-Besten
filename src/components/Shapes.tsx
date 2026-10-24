// Zwevende geometrische vormen voor op de achtergrond. Puur decoratief.

import type { CSSProperties } from "react";

type ShapeKind = "circle" | "half" | "squiggle" | "star" | "triangle" | "ring" | "blob" | "plus";

export type ShapeSpec = {
  kind: ShapeKind;
  color: string;
  size: number;
  top: string;
  left: string;
  dur?: number;
  delay?: number;
  dx?: number;
  dy?: number;
  rot?: number;
};

const C: Record<string, string> = {
  kobalt: "#2a3bdb",
  koraal: "#ff5c47",
  lila: "#c6b3ff",
  boter: "#ffd24d",
  groen: "#34c77b",
  creme: "#fff4e0",
  roze: "#ffa6c9",
  inkt: "#17153a",
};

function ShapeSvg({ kind, color }: { kind: ShapeKind; color: string }) {
  const fill = C[color] ?? color;
  const stroke = "#17153a";
  switch (kind) {
    case "circle":
      return <circle cx="50" cy="50" r="46" fill={fill} stroke={stroke} strokeWidth="4" />;
    case "half":
      return <path d="M4 60a46 46 0 0 1 92 0z" fill={fill} stroke={stroke} strokeWidth="4" strokeLinejoin="round" />;
    case "squiggle":
      return <path d="M6 60c10-30 20-30 30 0s20 30 30 0 20-30 30 0" fill="none" stroke={fill} strokeWidth="10" strokeLinecap="round" />;
    case "star":
      return (
        <path
          d="M50 4l10 30 32 2-25 19 9 31-26-18-26 18 9-31L8 36l32-2z"
          fill={fill}
          stroke={stroke}
          strokeWidth="4"
          strokeLinejoin="round"
        />
      );
    case "triangle":
      return <path d="M50 8l42 80H8z" fill={fill} stroke={stroke} strokeWidth="4" strokeLinejoin="round" />;
    case "ring":
      return <circle cx="50" cy="50" r="38" fill="none" stroke={fill} strokeWidth="14" />;
    case "blob":
      return <path d="M70 12c18 10 26 34 18 54S56 96 36 90 4 66 8 44 52 2 70 12z" fill={fill} stroke={stroke} strokeWidth="4" />;
    case "plus":
      return <path d="M38 6h24v32h32v24H62v32H38V62H6V38h32z" fill={fill} stroke={stroke} strokeWidth="4" strokeLinejoin="round" />;
  }
}

export function Shapes({ items }: { items: ShapeSpec[] }) {
  return (
    <div className="shapes" aria-hidden="true">
      {items.map((s, i) => (
        <div
          key={i}
          className="shape"
          style={
            {
              width: s.size,
              height: s.size,
              top: s.top,
              left: s.left,
              "--dur": `${s.dur ?? 10 + (i % 5) * 2}s`,
              "--delay": `${s.delay ?? -i * 1.3}s`,
              "--dx": `${s.dx ?? 18}px`,
              "--dy": `${s.dy ?? -26}px`,
              "--rot": `${s.rot ?? 22}deg`,
            } as CSSProperties
          }
        >
          <svg viewBox="0 0 100 100">
            <ShapeSvg kind={s.kind} color={s.color} />
          </svg>
        </div>
      ))}
    </div>
  );
}
