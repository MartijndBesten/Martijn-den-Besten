// Productbeeld van de hero: een eigen illustratie van de zak strooizout (geen foto van de geleverde verpakking) op een
// winterse ondergrond, met de gestrooide looproute uit het logo. De stapel groeit mee met het gekozen aantal (tot 4
// zakken zichtbaar) en kantelt licht mee met de muis. Alles is SVG en CSS; geen 3D-bibliotheek.

import { useRef } from "react";
import { useKantel } from "./beweging";

/** De zak als herbruikbaar SVG-symbool (320 × 420). */
function ZakSymbool() {
  const vorm = "M58 60 C 44 116, 26 252, 42 352 Q 47 384, 80 389 C 132 397, 188 397, 240 389 Q 273 384, 278 352 C 294 252, 276 116, 262 60 Q 160 48 58 60 Z";
  return (
    <defs>
      <linearGradient id="wn-zk-h" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#9fb2c6" />
        <stop offset="0.09" stopColor="#dbe5ee" />
        <stop offset="0.36" stopColor="#ffffff" />
        <stop offset="0.66" stopColor="#f1f5f9" />
        <stop offset="0.9" stopColor="#c6d3e0" />
        <stop offset="1" stopColor="#93a7bc" />
      </linearGradient>
      <linearGradient id="wn-zk-v" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#0b2340" stopOpacity="0.1" />
        <stop offset="0.16" stopColor="#0b2340" stopOpacity="0" />
        <stop offset="0.74" stopColor="#0b2340" stopOpacity="0" />
        <stop offset="1" stopColor="#0b2340" stopOpacity="0.26" />
      </linearGradient>
      <linearGradient id="wn-zk-etiket" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1a4a80" />
        <stop offset="1" stopColor="#0b2340" />
      </linearGradient>
      <linearGradient id="wn-zk-etiket-h" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#020a14" stopOpacity="0.55" />
        <stop offset="0.2" stopColor="#020a14" stopOpacity="0" />
        <stop offset="0.4" stopColor="#ffffff" stopOpacity="0.07" />
        <stop offset="0.75" stopColor="#020a14" stopOpacity="0" />
        <stop offset="1" stopColor="#020a14" stopOpacity="0.5" />
      </linearGradient>
      <linearGradient id="wn-zk-naad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#a9bacb" />
        <stop offset="0.4" stopColor="#f4f8fb" />
        <stop offset="1" stopColor="#9fb2c6" />
      </linearGradient>
      <pattern id="wn-zk-weef" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(2)">
        <path d="M0 0H7M0 3.5H7" stroke="#6f8ba6" strokeWidth="0.5" opacity="0.28" />
        <path d="M0 0V7M3.5 0V7" stroke="#ffffff" strokeWidth="0.6" opacity="0.5" />
      </pattern>
      <clipPath id="wn-zk-vorm">
        <path d={vorm} />
      </clipPath>
      <linearGradient id="wn-zk-glans" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
        <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.55" />
        <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
      <radialGradient id="wn-schaduw" cx="50%" cy="50%" r="50%">
        <stop offset="0" stopColor="#020a14" stopOpacity="0.6" />
        <stop offset="0.6" stopColor="#020a14" stopOpacity="0.22" />
        <stop offset="1" stopColor="#020a14" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="wn-grond" cx="50%" cy="50%" r="50%">
        <stop offset="0" stopColor="#cfe6f6" stopOpacity="0.2" />
        <stop offset="0.55" stopColor="#8fc4ea" stopOpacity="0.08" />
        <stop offset="1" stopColor="#8fc4ea" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="wn-route" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#eaf5fc" stopOpacity="0.32" />
        <stop offset="1" stopColor="#cfe6f6" stopOpacity="0.1" />
      </linearGradient>
      <linearGradient id="wn-hoop" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="1" stopColor="#cfe0ee" />
      </linearGradient>
      <symbol id="wn-zak" viewBox="0 0 320 420">
        <path d="M50 30 L 60 26 L 260 26 L 270 30 L 264 64 Q 160 74 56 64 Z" fill="url(#wn-zk-naad)" />
        <path d="M50 30 L 60 26 L 260 26 L 270 30" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.9" />
        <path d={vorm} fill="url(#wn-zk-h)" />
        <g clipPath="url(#wn-zk-vorm)">
          <rect x="20" y="40" width="280" height="370" fill="url(#wn-zk-weef)" />
          <g fill="none" stroke="#5f7a95" strokeLinecap="round" opacity="0.13">
            <path d="M70 78 C 96 104, 100 140, 84 168" strokeWidth="7" />
            <path d="M250 84 C 226 112, 226 146, 244 170" strokeWidth="8" />
            <path d="M150 70 C 156 96, 150 124, 160 150" strokeWidth="5" />
            <path d="M64 330 C 110 322, 210 322, 256 334" strokeWidth="8" />
            <path d="M58 352 C 80 362, 96 372, 100 386" strokeWidth="6" />
          </g>
          <path d="M30 170 Q 160 194 290 170 L 292 314 Q 160 338 28 314 Z" fill="url(#wn-zk-etiket)" />
          <path d="M30 170 Q 160 194 290 170 L 292 314 Q 160 338 28 314 Z" fill="url(#wn-zk-etiket-h)" />
          <path d="M30 181 Q 160 205 290 181" fill="none" stroke="#ffb547" strokeWidth="3.5" />
          <g transform="translate(126 196) scale(1.06)">
            <path d="M32 41 C 45 44, 46 52, 31 54.5 C 21 56.4, 17.5 59.5, 18 63" fill="none" stroke="#cfe6f6" strokeWidth="8.5" strokeLinecap="round" />
            <g fill="#ffb547">
              <circle cx="41.2" cy="46.6" r="2.2" />
              <circle cx="30.6" cy="54.6" r="2.4" />
              <circle cx="20" cy="60" r="2.6" />
            </g>
            <path d="M11.5 30.5 32 13l20.5 17.5" fill="none" stroke="#fff" strokeWidth="6.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M27.4 41.5v-9.2a4.6 4.6 0 0 1 9.2 0v9.2z" fill="#fff" />
          </g>
          <text x="160" y="296" textAnchor="middle" fontFamily="Geist, Arial, sans-serif" fontWeight="800" fontSize="27" letterSpacing="3.4" fill="#ffffff">
            STROOIZOUT
          </text>
          <rect x="20" y="40" width="280" height="370" fill="url(#wn-zk-v)" />
          <path d="M56 84 C 42 190, 40 290, 54 380 L 92 380 C 78 290, 80 190, 94 84 Z" fill="url(#wn-zk-glans)" />
        </g>
        <text x="160" y="368" textAnchor="middle" fontFamily="Geist, Arial, sans-serif" fontWeight="800" fontSize="30" letterSpacing="-0.5" fill="#0b2340">
          25 kg
        </text>
        <path d="M62 52 Q 160 62 258 52" fill="none" stroke="#8ea4b8" strokeWidth="2.4" strokeDasharray="7 5" opacity="0.85" />
      </symbol>
    </defs>
  );
}

// De gestrooide looproute op de grond (plat getekend, alsof je er schuin op kijkt).
const ROUTE_HERO = "M330 470 C 476 474, 516 496, 372 505 C 236 513, 178 528, 120 552";

// Plaats van elke zak in de stapel (viewBox 600 × 560). Zak 1 staat vooraan; 2–4 komen erachter te staan.
const STAPEL = [
  { n: 4, x: 208, y: 58, s: 0.56, r: 0 },
  { n: 2, x: 62, y: 104, s: 0.7, r: -5 },
  { n: 3, x: 316, y: 112, s: 0.68, r: 5 },
  { n: 1, x: 152, y: 76, s: 0.925, r: 0 },
];

// Losse zoutkorrels rond de zak: [x, y, straal, laag (diepte), vertraging, amber?]
const KORRELS: [number, number, number, 1 | 2 | 3, number, boolean][] = [
  [84, 96, 3.2, 3, 0, false],
  [522, 132, 2.6, 2, 0.6, false],
  [470, 60, 2, 3, 1.2, true],
  [58, 250, 2.4, 2, 0.3, false],
  [548, 300, 3.4, 3, 0.9, false],
  [120, 30, 1.8, 1, 1.5, false],
  [398, 22, 2.2, 2, 0.2, false],
  [28, 380, 2, 1, 1.1, true],
  [574, 430, 2.2, 1, 0.5, false],
  [246, 14, 1.6, 1, 0.8, false],
];

export function Scene({ aantal, className = "" }: { aantal: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useKantel(ref);
  const zichtbaar = Math.max(1, Math.min(4, aantal));
  return (
    <div ref={ref} className={`wn-scene ${className}`} data-aantal={zichtbaar} aria-hidden="true">
      <div className="wn-scene__gloed" />
      <svg className="wn-scene__svg" viewBox="0 0 600 560" focusable="false">
        <ZakSymbool />
        {/* ondergrond: glad ijs met de gestrooide route uit het logo */}
        <ellipse cx="300" cy="474" rx="290" ry="66" fill="url(#wn-grond)" />
        <g className="wn-route">
          <path d={ROUTE_HERO} fill="none" stroke="url(#wn-route)" strokeWidth="40" strokeLinecap="round" />
          <path d={ROUTE_HERO} fill="none" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" strokeDasharray="0.1 17" opacity="0.92" />
          <path d={ROUTE_HERO} fill="none" stroke="#ffb547" strokeWidth="6.5" strokeLinecap="round" strokeDasharray="0.1 51" strokeDashoffset="-8" />
        </g>
        <g className="wn-diepte wn-diepte--1">
          {KORRELS.filter((k) => k[3] === 1).map(([x, y, r, , d, amber]) => (
            <circle key={`${x}-${y}`} className="wn-korrel" cx={x} cy={y} r={r} fill={amber ? "#ffb547" : "#dceefa"} opacity="0.55" style={{ animationDelay: `${d}s` }} />
          ))}
        </g>
        <g className="wn-stapel">
          {STAPEL.map((z) => (
            <g key={z.n} transform={`translate(${z.x} ${z.y}) rotate(${z.r} ${160 * z.s} ${400 * z.s}) scale(${z.s})`}>
              <g className={`wn-zak wn-zak--${z.n}`} data-aan={zichtbaar >= z.n}>
                <ellipse cx="160" cy="396" rx="176" ry="30" fill="url(#wn-schaduw)" />
                <use href="#wn-zak" width="320" height="420" />
              </g>
            </g>
          ))}
        </g>
        {/* hoopje zout bij de voet */}
        <g className="wn-hoopje">
          <path d="M424 474 C 440 458, 462 452, 478 456 C 494 460, 506 468, 514 474 Z" fill="url(#wn-hoop)" />
          <g fill="#ffffff">
            <circle cx="412" cy="476" r="2.4" />
            <circle cx="524" cy="477" r="2" />
            <circle cx="536" cy="472" r="1.5" />
          </g>
          <circle cx="506" cy="462" r="2.2" fill="#ffb547" />
        </g>
        <g className="wn-diepte wn-diepte--2">
          {KORRELS.filter((k) => k[3] === 2).map(([x, y, r, , d, amber]) => (
            <circle key={`${x}-${y}`} className="wn-korrel" cx={x} cy={y} r={r} fill={amber ? "#ffb547" : "#eaf5fc"} opacity="0.8" style={{ animationDelay: `${d}s` }} />
          ))}
        </g>
        <g className="wn-diepte wn-diepte--3">
          {KORRELS.filter((k) => k[3] === 3).map(([x, y, r, , d, amber]) => (
            <circle key={`${x}-${y}`} className="wn-korrel" cx={x} cy={y} r={r} fill={amber ? "#ffb547" : "#ffffff"} style={{ animationDelay: `${d}s` }} />
          ))}
        </g>
      </svg>
    </div>
  );
}

// Huizen van de straat: [x, breedte, hoogte, verlichte ramen (0/1 per raam), kleur]
const HUIZEN: [number, number, number, number[], string][] = [
  [20, 150, 118, [1, 0, 0, 1], "#123461"],
  [170, 170, 146, [0, 1, 1, 0], "#0f2d52"],
  [340, 140, 110, [1, 1, 0, 0], "#143a66"],
  [480, 180, 150, [0, 0, 1, 1], "#0f2d52"],
  [660, 150, 122, [1, 0, 1, 0], "#123461"],
  [810, 140, 138, [0, 1, 0, 1], "#143a66"],
];
const GROND = 236;
const STOEP = 278;
const DEUREN = HUIZEN.map(([x, w]) => x + w / 2);
// De route over het trottoir, met bij elk huis een aftakking naar de voordeur. Op de telefoon komt de route van links
// het beeld in, op een breed scherm van rechts (waar de route langs de pagina omlaag komt).
const ROUTE = { links: `M-40 ${STOEP} H1000`, rechts: `M1000 ${STOEP} H-40` };
const zijpad = (x: number, kant: "links" | "rechts") => {
  const r = kant === "links" ? -1 : 1;
  return `M${x + r * 36} ${STOEP} C ${x + r * 10} ${STOEP}, ${x} ${STOEP - 8}, ${x} ${GROND + 7}`;
};
const bij = (x: number) => ({ "--x": x }) as React.CSSProperties;

/**
 * De straat bij de buurtboodschap: een rij huizen in de winternacht. De strooiroute loopt over het trottoir langs de
 * huizen; waar bij de voordeur is gestrooid, gaat binnen het licht aan. Alles hangt aan de CSS-variabele `--straat`
 * (0 … 1) op de ouder: tocht.tsx zet die tijdens het scrollen, zonder script staat hij op 1 (eindbeeld).
 */
export function Straat() {
  const route = (kant: "links" | "rechts") => (
    <g className={`wn-straat__route wn-straat__route--${kant}`} mask={`url(#wn-st-masker-${kant})`}>
      {/* de banen in één groep, zodat ze waar ze samenkomen niet lichter worden */}
      <g opacity="0.3">
        {[ROUTE[kant], ...DEUREN.map((x) => zijpad(x, kant))].map((d) => (
          <path key={d} d={d} fill="none" stroke="#eaf5fc" strokeWidth="24" strokeLinecap="round" />
        ))}
      </g>
      {[ROUTE[kant], ...DEUREN.map((x) => zijpad(x, kant))].map((d) => (
        <g key={d}>
          <path d={d} fill="none" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" strokeDasharray="0.1 15" />
          <path d={d} fill="none" stroke="#ffb547" strokeWidth="6.5" strokeLinecap="round" strokeDasharray="0.1 45" strokeDashoffset="-7" />
        </g>
      ))}
    </g>
  );
  const masker = (kant: "links" | "rechts") => (
    <mask id={`wn-st-masker-${kant}`} maskUnits="userSpaceOnUse" x="-40" y="200" width="1040" height="110">
      <path className={`wn-straat__teken wn-straat__teken--${kant}`} d={ROUTE[kant]} fill="none" stroke="#fff" strokeWidth="30" strokeLinecap="round" pathLength="1" />
      {DEUREN.map((x) => (
        <path key={x} className="wn-straat__teken wn-straat__teken--zij" style={bij(x)} d={zijpad(x, kant)} fill="none" stroke="#fff" strokeWidth="30" strokeLinecap="round" pathLength="1" />
      ))}
    </mask>
  );
  return (
    <svg className="wn-straat" viewBox="0 0 960 310" role="img" aria-label="Een straat in de winter: waar bij de voordeur is gestrooid, brandt binnen licht" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="wn-st-grond" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1b4877" />
          <stop offset="1" stopColor="#0d2a4d" />
        </linearGradient>
        <radialGradient id="wn-st-licht" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#ffb547" stopOpacity="0.6" />
          <stop offset="1" stopColor="#ffb547" stopOpacity="0" />
        </radialGradient>
        {masker("links")}
        {masker("rechts")}
      </defs>
      <g fill="#cfe6f6">
        {[
          [60, 40, 1.4],
          [210, 22, 1],
          [330, 64, 1.2],
          [470, 30, 1.5],
          [640, 52, 1],
          [760, 24, 1.3],
          [900, 60, 1.1],
          [120, 86, 0.9],
          [560, 84, 0.9],
        ].map(([x, y, r]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={r} opacity="0.6" />
        ))}
      </g>
      {HUIZEN.map(([x, w, h, aan, kleur], nr) => {
        const top = GROND - h;
        const nok = top - w * 0.28;
        const ramen = aan.map((licht, i) => ({ licht, x: x + 18 + (i % 2) * (w - 62), y: top + 16 + Math.floor(i / 2) * 40 }));
        return (
          <g key={x} className="wn-straat__huis" style={bij(DEUREN[nr])}>
            <path d={`M${x} ${GROND} V${top} L${x + w / 2} ${nok} L${x + w} ${top} V${GROND} Z`} fill={kleur} />
            <path d={`M${x - 4} ${top + 3} L${x + w / 2} ${nok - 2} L${x + w + 4} ${top + 3}`} fill="none" stroke="#eaf5fc" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            <rect x={x + w / 2 - 11} y={GROND - 40} width="22" height="40" rx="3" fill="#071a31" />
            <rect className="wn-straat__deur" x={x + w / 2 - 11} y={GROND - 40} width="22" height="40" rx="3" fill="#ffb547" />
            {ramen.map((r) => (
              <rect key={`${r.x}-${r.y}`} x={r.x} y={r.y} width="26" height="24" rx="3" fill="#1f4f86" opacity="0.7" />
            ))}
            {ramen
              .filter((r) => r.licht)
              .map((r, i) => (
                <rect key={`aan-${r.x}-${r.y}`} className="wn-straat__raam" x={r.x} y={r.y} width="26" height="24" rx="3" fill="#ffc266" style={{ "--i": i } as React.CSSProperties} />
              ))}
            {/* een klein hart boven de deur: de buren zijn er blij mee */}
            <g transform={`translate(${x + w / 2} ${GROND - 56})`}>
              <path className="wn-straat__hart" d="M0 6 C -9.5 -1.5, -6 -9.5, 0 -4.2 C 6 -9.5, 9.5 -1.5, 0 6 Z" fill="#ffb547" />
            </g>
          </g>
        );
      })}
      <rect x="-40" y={GROND} width="1040" height="80" fill="url(#wn-st-grond)" />
      <path d={`M-40 ${GROND + 1} H1000`} stroke="#9fc9e8" strokeOpacity="0.35" strokeWidth="2" />
      <g stroke="#cfe6f6" strokeOpacity="0.16" strokeWidth="3" strokeLinecap="round">
        <path d="M40 262 H180M640 296 H800M300 300 H420M700 258 H900" />
      </g>
      {/* warm licht bij elke voordeur waar gestrooid is */}
      {DEUREN.map((x) => (
        <g key={x} className="wn-straat__huis" style={bij(x)}>
          <ellipse className="wn-straat__gloed" cx={x} cy={GROND - 14} rx="52" ry="46" fill="url(#wn-st-licht)" />
        </g>
      ))}
      {route("links")}
      {route("rechts")}
    </svg>
  );
}
