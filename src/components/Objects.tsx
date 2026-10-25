// Kleurrijke objecten in ‘plat 3D’: volle vlakken met één glanslicht en één schaduwkant.
// Gebruikt als illustraties bij de afdelingen en als zwevende vormen in de hero.

const INK = "#191b2e";
const C = {
  koraal: "#f2785c",
  koraalDark: "#d4502f",
  kobalt: "#3c5bd6",
  kobaltDark: "#2a3fa0",
  salie: "#9fc39a",
  salieDark: "#6f9a6a",
  lila: "#c3b2f0",
  lilaDark: "#9a85d6",
  boter: "#f6d36b",
  boterDark: "#d9b245",
  ivoor: "#fffdf8",
  ivoorDark: "#e2d8c5",
};
const line = { stroke: INK, strokeWidth: 2.2, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

export type ObjectKind = "knop" | "sokkel" | "lamp" | "ticket" | "certificaat" | "planeet";

export function DeptObject({ kind, className }: { kind: ObjectKind; className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={`obj obj--${kind} ${className ?? ""}`} aria-hidden="true">
      <ellipse cx="100" cy="182" rx="66" ry="8" fill={INK} opacity=".14" />
      {kind === "knop" && (
        <g className="obj__part">
          <path d="M34 128v18c0 15 30 26 66 26s66-11 66-26v-18z" fill={C.boterDark} {...line} />
          <ellipse cx="100" cy="128" rx="66" ry="26" fill={C.boter} {...line} />
          <path d="M58 108v16c0 10 19 17 42 17s42-7 42-17v-16z" fill={C.koraalDark} {...line} />
          <g className="obj__press">
            <path d="M58 96v14c0 10 19 17 42 17s42-7 42-17v-14z" fill={C.koraalDark} {...line} />
            <ellipse cx="100" cy="96" rx="42" ry="17" fill={C.koraal} {...line} />
            <path d="M76 92q10-8 26-8" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="5" strokeLinecap="round" />
          </g>
          <path d="M150 40l6 12M166 52l-10 6M134 36l2 12" {...line} />
        </g>
      )}
      {kind === "sokkel" && (
        <g className="obj__part">
          <path d="M56 116v54c0 7 20 12 44 12s44-5 44-12v-54z" fill={C.ivoorDark} {...line} />
          <path d="M120 120v58" stroke={INK} strokeOpacity=".12" strokeWidth="18" />
          <ellipse cx="100" cy="116" rx="44" ry="12" fill={C.ivoor} {...line} />
          <g className="obj__float">
            <path d="M70 62c-4-24 20-40 40-34 22 6 28 30 18 46-10 16-34 20-48 10-6-5-9-13-10-22z" fill={C.lila} {...line} />
            <path d="M86 46q8-8 20-6" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="5" strokeLinecap="round" />
            <circle cx="122" cy="76" r="9" fill={C.koraal} {...line} />
          </g>
          <ellipse cx="100" cy="108" rx="22" ry="4" fill={INK} opacity=".12" className="obj__shadow" />
        </g>
      )}
      {kind === "lamp" && (
        <g className="obj__part">
          <g className="obj__rays" stroke={INK} strokeWidth="2.6" strokeLinecap="round">
            <path d="M100 18v-10M150 38l7-7M50 38l-7-7M170 86h10M20 86h10" />
          </g>
          <path d="M70 118c-14-12-20-26-20-40 0-28 22-50 50-50s50 22 50 50c0 14-6 28-20 40l-4 20h-52z" fill={C.boter} {...line} />
          <path d="M66 72a34 34 0 0 1 22-28" fill="none" stroke="#fff" strokeOpacity=".75" strokeWidth="7" strokeLinecap="round" />
          <path d="M84 104q8-22 16 0t16 0" fill="none" {...line} />
          <rect x="72" y="136" width="56" height="12" rx="4" fill={C.kobalt} {...line} />
          <rect x="74" y="148" width="52" height="12" rx="4" fill={C.kobaltDark} {...line} />
          <path d="M88 160h24l-4 10h-16z" fill={INK} />
        </g>
      )}
      {kind === "ticket" && (
        <g className="obj__part">
          <g transform="rotate(-8 100 100)">
            <path d="M40 58h120v26a12 12 0 0 0 0 24v26H40v-26a12 12 0 0 0 0-24z" fill={C.salieDark} {...line} transform="translate(6 8)" />
            <path d="M40 58h120v26a12 12 0 0 0 0 24v26H40v-26a12 12 0 0 0 0-24z" fill={C.salie} {...line} />
            <path d="M128 64v64" stroke={INK} strokeWidth="2" strokeDasharray="4 5" />
            <text x="84" y="112" textAnchor="middle" fontFamily="Geist, sans-serif" fontWeight="800" fontSize="40" fill={INK}>
              247
            </text>
            <text x="84" y="80" textAnchor="middle" fontFamily="Geist Mono, monospace" fontSize="9" fill={INK}>
              UW NUMMER
            </text>
            <circle cx="144" cy="96" r="6" fill={C.boter} {...line} />
          </g>
        </g>
      )}
      {kind === "certificaat" && (
        <g className="obj__part">
          <rect x="36" y="40" width="120" height="120" rx="10" fill={C.ivoor} {...line} transform="rotate(5 96 100)" />
          <rect x="48" y="34" width="112" height="120" rx="10" fill={C.ivoor} {...line} transform="rotate(-4 104 94)" />
          <path d="M64 62h70M64 76h56M64 90h64" stroke={INK} strokeOpacity=".5" strokeWidth="3" strokeLinecap="round" transform="rotate(-4 104 94)" />
          <g className="obj__seal">
            <path d="M118 128l-10 34 14-8 10 12 6-34z" fill={C.kobalt} {...line} />
            <circle cx="128" cy="124" r="22" fill={C.koraal} {...line} />
            <path d="M128 112l3.5 8 8.5.5-6.5 5.5 2 8.5-7.5-4.5-7.5 4.5 2-8.5-6.5-5.5 8.5-.5z" fill={C.boter} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
          </g>
        </g>
      )}
      {kind === "planeet" && (
        <g className="obj__part">
          <circle cx="100" cy="96" r="50" fill={C.kobalt} {...line} />
          <path d="M66 72a40 40 0 0 1 26-22" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="7" strokeLinecap="round" />
          <path d="M118 140a50 50 0 0 0 30-44" fill="none" stroke={INK} strokeOpacity=".2" strokeWidth="12" />
          <ellipse cx="100" cy="100" rx="86" ry="20" fill="none" stroke={C.boter} strokeWidth="8" transform="rotate(-14 100 100)" />
          <ellipse cx="100" cy="100" rx="86" ry="20" fill="none" stroke={INK} strokeWidth="2" transform="rotate(-14 100 100)" />
          <circle cx="160" cy="40" r="9" fill={C.koraal} {...line} />
        </g>
      )}
    </svg>
  );
}

/** Kleine zwevende vormen rond de hero-typografie. */
export function Floaters() {
  return (
    <div className="floaters" aria-hidden="true">
      <svg className="floater floater--sphere" viewBox="0 0 60 60">
        <circle cx="30" cy="30" r="27" fill={C.koraal} />
        <path d="M30 57a27 27 0 0 0 27-27" fill="none" stroke={C.koraalDark} strokeWidth="9" opacity=".7" />
        <ellipse cx="20" cy="18" rx="8" ry="5" fill="#fff" opacity=".55" transform="rotate(-30 20 18)" />
      </svg>
      <svg className="floater floater--ring" viewBox="0 0 60 60">
        <circle cx="30" cy="30" r="20" fill="none" stroke={C.lila} strokeWidth="12" />
        <path d="M14 22a20 20 0 0 1 14-12" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <svg className="floater floater--star" viewBox="0 0 60 60">
        <path d="M30 4l6 18 19 1-15 11 5 19-15-11-15 11 5-19L5 23l19-1z" fill={C.boter} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      </svg>
      <svg className="floater floater--pill" viewBox="0 0 80 40">
        <rect x="4" y="6" width="72" height="28" rx="14" fill={C.kobalt} />
        <rect x="40" y="6" width="36" height="28" rx="14" fill={C.salie} />
        <path d="M40 6v28" stroke={INK} strokeWidth="2" />
        <path d="M14 14h14" stroke="#fff" strokeOpacity=".6" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <svg className="floater floater--squiggle" viewBox="0 0 90 30">
        <path d="M4 18c8-14 16-14 24 0s16 14 24 0 16-14 24 0" fill="none" stroke={C.salie} strokeWidth="7" strokeLinecap="round" />
      </svg>
    </div>
  );
}
