// FIG. 1 — de ideeënmachine als octrooitekening.
// Interactie: tandwielen en band bewegen mee met scrollen, onderdelen lichten op bij hover/focus,
// een klik produceert een idee dat over de band rolt, en te veel klikken veroorzaakt een storing.

import { useEffect, useRef, useState } from "react";
import { generateIdea, type Idea } from "../content/generators";
import { useGame } from "../state/GameState";
import { sfx } from "../lib/sound";

const JAM_CLICKS = 12;
const JAM_WINDOW = 6000;

export const PARTS = [
  { id: "trechter", label: "Koffietrechter", text: "Koffie erin. Altijd. Er bestaat geen uit-stand.", at: [40, 40], to: [230, 92] },
  { id: "ventiel", label: "Twijfelventiel", text: "Laat precies genoeg twijfel door om nooit af te ronden.", at: [420, 34], to: [457, 228] },
  { id: "lamp", label: "Inspiratielamp", text: "Gaat aan onder de douche, nooit achter het bureau.", at: [566, 172], to: [552, 100] },
  { id: "tandwiel", label: "Uitsteltandwiel", text: "Draait mee als u scrolt. Verder niet.", at: [40, 300], to: [150, 176] },
  { id: "meter", label: "Ideeënmeter", text: "Meet ideeën per minuut. De wijzer staat standaard op ‘veel’.", at: [40, 380], to: [300, 276] },
  { id: "band", label: "Lopende band", text: "Vervoert halffabricaten rechtstreeks naar het museum.", at: [566, 500], to: [470, 457] },
] as const;

type PartId = (typeof PARTS)[number]["id"];

function gearPath(cx: number, cy: number, r: number, n: number): string {
  let d = "";
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2;
    const rr = i % 2 ? r * 0.82 : r;
    const a2 = a + Math.PI / (n * 2);
    d += `${i ? "L" : "M"}${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}L${(cx + Math.cos(a2) * rr).toFixed(1)} ${(cy + Math.sin(a2) * rr).toFixed(1)}`;
  }
  return d + "Z";
}

const GEAR_A = gearPath(150, 176, 48, 11);
const GEAR_B = gearPath(214, 128, 26, 8);
const TICKS = Array.from({ length: 21 }, (_, i) => {
  const a = Math.PI * (0.8 + i * 0.07);
  const r1 = i % 5 ? 64 : 57;
  return { x1: 300 + Math.cos(a) * r1, y1: 276 + Math.sin(a) * r1, x2: 300 + Math.cos(a) * 70, y2: 276 + Math.sin(a) * 70, major: i % 5 === 0 };
});

export function IdeaMachine({ onIdea }: { onIdea?: (idea: Idea) => void }) {
  const { findEgg, completeMission } = useGame();
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<PartId | null>(null);
  const [cards, setCards] = useState<{ id: number; tone: number }[]>([]);
  const [jammed, setJammed] = useState(false);
  const [heat, setHeat] = useState(0);
  const [lit, setLit] = useState(false);
  const [last, setLast] = useState<Idea | null>(null);
  const clicks = useRef<number[]>([]);
  const nextId = useRef(1);

  // Scroll aandrijving: tandwielen en band draaien mee (via CSS-variabele, geen re-render).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => el.style.setProperty("--scroll", String(window.scrollY)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Hitte zakt langzaam terug.
  useEffect(() => {
    if (jammed || heat <= 0) return;
    const t = window.setTimeout(() => setHeat((h) => Math.max(0, h - 0.05)), 400);
    return () => window.clearTimeout(t);
  }, [heat, jammed]);

  const operate = () => {
    if (jammed) {
      setJammed(false);
      setHeat(0);
      sfx.clunk();
      return;
    }
    const now = Date.now();
    clicks.current = clicks.current.filter((t) => now - t < JAM_WINDOW).concat(now);
    setHeat(Math.min(1, clicks.current.length / JAM_CLICKS));
    if (clicks.current.length >= JAM_CLICKS) {
      clicks.current = [];
      setJammed(true);
      sfx.error();
      findEgg("machine-jam");
      completeMission("jam");
      return;
    }
    sfx.blip();
    const idea = generateIdea();
    setLast(idea);
    onIdea?.(idea);
    const id = nextId.current++;
    setCards((c) => [...c.slice(-3), { id, tone: id % 3 }]);
    setLit(true);
    window.setTimeout(() => setLit(false), 700);
    window.setTimeout(() => setCards((c) => c.filter((x) => x.id !== id)), 2600);
  };

  const cls = (id: PartId) => `part part--${id} ${active === id ? "is-active" : ""}`;

  return (
    <div ref={ref} className={`machine ${jammed ? "is-jammed" : ""} ${lit ? "is-lit" : ""}`} style={{ ["--heat" as string]: heat }}>
      <div className="plate machine__plate grid-paper">
        <div className="plate__head">
          <span>Fig. 1 — Ideeënmachine, zijaanzicht</span>
          <span>Octrooi NL-2026/0001</span>
        </div>
        <button
          type="button"
          className="machine__button"
          onClick={operate}
          aria-label={jammed ? "Herstart de vastgelopen ideeënmachine" : "Ideeënmachine: maak een nieuw idee"}
        >
          <svg viewBox="0 0 600 540" className="machine__svg draw" aria-hidden="true">
            <defs>
              <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" strokeWidth="0.8" />
              </pattern>
              <radialGradient id="glow">
                <stop offset="0" stopColor="#c2913a" stopOpacity="0.55" />
                <stop offset="1" stopColor="#c2913a" stopOpacity="0" />
              </radialGradient>
            </defs>

            <g className={cls("trechter")}>
              <path className="fill" d="M200 70h200l-46 84h-108z" fill="url(#hatch)" />
              <path d="M200 70h200l-46 84h-108z" fill="none" />
              <path d="M188 70h224" />
            </g>

            <rect x="140" y="154" width="320" height="250" rx="26" className="machine__body" />
            <rect x="156" y="170" width="288" height="218" rx="16" fill="none" strokeWidth="0.8" strokeDasharray="3 4" />

            <g className={cls("meter")}>
              <circle cx="300" cy="276" r="74" className="machine__dial" />
              {TICKS.map((t, i) => (
                <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} strokeWidth={t.major ? 1.4 : 0.8} />
              ))}
              <g className="machine__needle">
                <path d="M300 276 L300 206" stroke="#b65a3a" strokeWidth="2.4" strokeLinecap="round" />
              </g>
              <circle className="fill" cx="300" cy="276" r="6" fill="currentColor" />
              <text x="300" y="322" textAnchor="middle" fontFamily="Geist Mono" fontSize="9" fill="currentColor" stroke="none">
                IDEEËN / MIN
              </text>
            </g>

            <g className={cls("ventiel")}>
              <rect className="fill" x="432" y="212" width="50" height="34" fill="#b65a3a" />
              <rect x="432" y="212" width="50" height="34" fill="none" />
              <path d="M482 229 C 530 229 520 140 548 120" fill="none" />
              <path d="M482 236 C 538 236 528 146 556 126" fill="none" />
            </g>

            <g className={cls("lamp")}>
              <circle className="machine__glow" cx="552" cy="92" r="70" fill="url(#glow)" stroke="none" />
              <circle className="fill machine__bulb" cx="552" cy="92" r="30" fill="#c2913a" />
              <circle cx="552" cy="92" r="30" fill="none" />
              <path d="M540 92 q6 -14 12 0 t12 0" fill="none" />
              <path d="M552 46v-10M588 62l8-6M516 62l-8-6M594 96l10 2" />
            </g>

            <g className={cls("tandwiel")}>
              <g className="gear gear--a">
                <path className="fill" d={GEAR_A} fill="#8a9a7b" />
                <path d={GEAR_A} fill="none" />
                <circle cx="150" cy="176" r="14" className="machine__hub" />
              </g>
              <g className="gear gear--b">
                <path d={GEAR_B} className="machine__hub" />
                <circle cx="214" cy="128" r="8" fill="none" />
              </g>
            </g>

            <g className={cls("band")}>
              <path d="M90 444h420M90 470h420" />
              <path d="M230 404v40M370 404v40" />
              {Array.from({ length: 10 }, (_, i) => (
                <g key={i} className="roller" style={{ transformOrigin: `${104 + i * 44}px 457px` }}>
                  <circle cx={104 + i * 44} cy="457" r="11" fill="none" />
                  <path d={`M${104 + i * 44 - 7} 457h14M${104 + i * 44} 450v14`} strokeWidth="0.8" />
                </g>
              ))}
            </g>

            {/* halffabricaten op de band */}
            <g className="belt-cards">
              {cards.map((c) => (
                <g key={c.id} className="belt-card">
                  <rect x="-18" y="-13" width="36" height="26" fill={c.tone === 1 ? "#4a4f8c" : c.tone === 2 ? "#b65a3a" : "var(--bg)"} />
                  <path d="M-11 -4h22M-11 3h14" stroke={c.tone ? "#f3ecdf" : "currentColor"} />
                </g>
              ))}
            </g>

            <path d="M140 516v-16M460 516v-16M140 508h320" strokeWidth="0.8" />
            <text x="300" y="530" textAnchor="middle" fontFamily="Geist Mono" fontSize="9" fill="currentColor" stroke="none">
              BREEDTE: 1 IDEE
            </text>

            {PARTS.map((p, i) => (
              <g key={p.id} className={`callout ${active === p.id ? "is-active" : ""}`}>
                <path d={`M${p.to[0]} ${p.to[1]}L${p.at[0]} ${p.at[1]}`} strokeWidth="0.7" />
                <circle cx={p.at[0]} cy={p.at[1]} r="11" className="callout__dot" />
                <text x={p.at[0]} y={p.at[1] + 3.5} textAnchor="middle" fontFamily="Geist Mono" fontSize="10" fill="currentColor" stroke="none">
                  {i + 1}
                </text>
              </g>
            ))}

            <g className="machine__smoke" fill="none" strokeWidth="1.2">
              <path d="M260 60c-14-14 10-22-4-36" />
              <path d="M300 56c-14-14 10-22-4-36" />
              <path d="M340 60c-14-14 10-22-4-36" />
            </g>
          </svg>
        </button>
        <svg className="machine__seal" viewBox="0 0 120 120" aria-hidden="true">
          <defs>
            <path id="okseal" d="M60 60m-45 0a45 45 0 1 1 90 0a45 45 0 1 1-90 0" />
          </defs>
          <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="60" cy="60" r="34" fill="none" stroke="currentColor" />
          <text fontFamily="Geist Mono" fontSize="9" letterSpacing="3" fill="currentColor">
            <textPath href="#okseal">GOEDGEKEURD · DOOR ZICHZELF · 2026 ·</textPath>
          </text>
          <text x="60" y="69" textAnchor="middle" fontFamily="Instrument Serif" fontStyle="italic" fontSize="28" fill="currentColor">
            Ok.
          </text>
        </svg>
        {jammed && (
          <span className="stamp machine__jam" aria-hidden="true">
            Storing — commissie opgericht
          </span>
        )}
        <div className="plate__foot">
          <div>
            Schaal<b>1 : ongeveer</b>
          </div>
          <div>
            Status<b>{jammed ? "Vastgelopen" : heat > 0.6 ? "Oververhit" : "In productie"}</b>
          </div>
          <div aria-live="polite">
            Laatste uitvoer<b>{last ? last.title : "— (klik op de machine)"}</b>
          </div>
        </div>
      </div>
      <ol className="legend" aria-label="Onderdelen van de ideeënmachine">
        {PARTS.map((p, i) => (
          <li key={p.id}>
            <button
              type="button"
              aria-pressed={active === p.id}
              onMouseEnter={() => setActive(p.id)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(p.id)}
              onBlur={() => setActive(null)}
              onClick={() => setActive(active === p.id ? null : p.id)}
            >
              <span className="legend__no">{i + 1}</span>
              <span className="legend__label">{p.label}</span>
              <span className="legend__text">{p.text}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
