// De ideeënmachine in de hero: tandwielen draaien mee met scrollen, lampogen volgen de muis,
// klikken produceert ideeën en te veel klikken laat de machine vastlopen.

import { useEffect, useRef, useState } from "react";
import { generateIdea } from "../content/generators";
import { useGame } from "../state/GameState";
import { sfx } from "../lib/sound";

type Bubble = { id: number; text: string; x: number };

const JAM_CLICKS = 12;
const JAM_WINDOW = 6000;

function Gear({ cx, cy, r, teeth, fill, cls }: { cx: number; cy: number; r: number; teeth: number; fill: string; cls: string }) {
  const pts: string[] = [];
  for (let i = 0; i < teeth * 2; i++) {
    const a = (i / (teeth * 2)) * Math.PI * 2;
    const rr = i % 2 === 0 ? r : r * 0.8;
    const a2 = a + Math.PI / (teeth * 2);
    pts.push(`${cx + Math.cos(a) * rr},${cy + Math.sin(a) * rr}`, `${cx + Math.cos(a2) * rr},${cy + Math.sin(a2) * rr}`);
  }
  return (
    <g className={cls} style={{ transformOrigin: `${cx}px ${cy}px` }}>
      <polygon points={pts.join(" ")} fill={fill} stroke="#17153a" strokeWidth="4" strokeLinejoin="round" />
      <circle cx={cx} cy={cy} r={r * 0.32} fill="#fff4e0" stroke="#17153a" strokeWidth="4" />
    </g>
  );
}

export function IdeaMachine() {
  const { findEgg, completeMission } = useGame();
  const ref = useRef<HTMLDivElement>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [jammed, setJammed] = useState(false);
  const [heat, setHeat] = useState(0);
  const clicks = useRef<number[]>([]);
  const nextId = useRef(1);
  const [announce, setAnnounce] = useState("");

  // Muis volgen met de lampogen en scroll koppelen aan de tandwielen (via CSS-variabelen, zonder re-render).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
        const dy = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
        el.style.setProperty("--eye-x", `${Math.max(-1, Math.min(1, dx * 2)) * 7}px`);
        el.style.setProperty("--eye-y", `${Math.max(-1, Math.min(1, dy * 2)) * 6}px`);
        el.style.setProperty("--tilt", `${dx * 4}deg`);
      });
    };
    const onScroll = () => el.style.setProperty("--scroll", `${window.scrollY * 0.6}deg`);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const produce = () => {
    if (jammed) {
      setJammed(false);
      setHeat(0);
      setAnnounce("De machine is opnieuw opgestart.");
      sfx.clunk();
      return;
    }
    const now = Date.now();
    clicks.current = clicks.current.filter((t) => now - t < JAM_WINDOW).concat(now);
    const h = clicks.current.length / JAM_CLICKS;
    setHeat(h);
    if (clicks.current.length >= JAM_CLICKS) {
      clicks.current = [];
      setJammed(true);
      setAnnounce("De machine is vastgelopen. Klik nogmaals om te herstarten.");
      sfx.error();
      findEgg("machine-jam");
      completeMission("jam");
      return;
    }
    sfx.blip();
    const idea = generateIdea();
    const id = nextId.current++;
    setBubbles((b) => [...b.slice(-3), { id, text: idea.title, x: (id % 3) - 1 }]);
    setAnnounce(`Nieuw idee: ${idea.title}`);
    window.setTimeout(() => setBubbles((b) => b.filter((x) => x.id !== id)), 3800);
  };

  return (
    <div ref={ref} className={`machine ${jammed ? "is-jammed" : ""}`} style={{ ["--heat" as string]: heat }}>
      <button type="button" className="machine__button" onClick={produce} aria-label={jammed ? "Herstart de vastgelopen ideeënmachine" : "Ideeënmachine: maak een nieuw idee"}>
        <svg viewBox="0 0 520 520" className="machine__svg" aria-hidden="true">
          {/* schaduw */}
          <ellipse cx="260" cy="492" rx="190" ry="18" fill="#17153a" opacity="0.18" />
          {/* trechter */}
          <path d="M150 40h220l-50 90H200z" fill="#2a3bdb" stroke="#17153a" strokeWidth="5" strokeLinejoin="round" />
          <path d="M175 52h170" stroke="#fff4e0" strokeWidth="5" strokeLinecap="round" strokeDasharray="2 16" />
          <text x="260" y="98" textAnchor="middle" fontFamily="Space Mono, monospace" fontWeight="700" fontSize="15" fill="#fff4e0" letterSpacing="2">
            KOFFIE IN
          </text>
          {/* lichaam */}
          <rect x="70" y="128" width="380" height="300" rx="46" fill="#ffd24d" stroke="#17153a" strokeWidth="5" />
          <rect x="70" y="360" width="380" height="68" rx="0" fill="#ff5c47" stroke="#17153a" strokeWidth="5" />
          <path d="M70 360h380v22a46 46 0 0 1-46 46H116a46 46 0 0 1-46-46z" fill="#ff5c47" stroke="#17153a" strokeWidth="5" />
          {/* ogen/lampen */}
          <g className="machine__eyes">
            <circle cx="190" cy="210" r="44" fill="#fff4e0" stroke="#17153a" strokeWidth="5" />
            <circle cx="330" cy="210" r="44" fill="#fff4e0" stroke="#17153a" strokeWidth="5" />
            <g className="machine__pupils">
              <circle cx="190" cy="210" r="17" fill="#17153a" />
              <circle cx="330" cy="210" r="17" fill="#17153a" />
              <circle cx="196" cy="203" r="5" fill="#fff4e0" />
              <circle cx="336" cy="203" r="5" fill="#fff4e0" />
            </g>
            <path className="machine__lid" d="M146 210a44 44 0 0 1 88 0zM286 210a44 44 0 0 1 88 0z" fill="#ffd24d" stroke="#17153a" strokeWidth="5" />
          </g>
          {/* meter */}
          <g transform="translate(260 300)">
            <path d="M-70 0a70 70 0 0 1 140 0" fill="#fff4e0" stroke="#17153a" strokeWidth="5" />
            <path d="M-56 -4a56 56 0 0 1 28 -44" fill="none" stroke="#34c77b" strokeWidth="10" />
            <path d="M-26 -50a56 56 0 0 1 52 0" fill="none" stroke="#ffd24d" strokeWidth="10" />
            <path d="M28 -48a56 56 0 0 1 28 44" fill="none" stroke="#ff5c47" strokeWidth="10" />
            <g className="machine__needle">
              <path d="M0 0L0 -58" stroke="#17153a" strokeWidth="6" strokeLinecap="round" />
            </g>
            <circle r="9" fill="#17153a" />
          </g>
          {/* tandwielen */}
          <Gear cx={86} cy={150} r={46} teeth={9} fill="#c6b3ff" cls="gear gear--a" />
          <Gear cx={450} cy={140} r={36} teeth={8} fill="#34c77b" cls="gear gear--b" />
          <Gear cx={462} cy={214} r={24} teeth={7} fill="#ff5c47" cls="gear gear--a" />
          {/* uitvoergoot */}
          <path d="M450 380h40a16 16 0 0 1 16 16v20h-56z" fill="#c6b3ff" stroke="#17153a" strokeWidth="5" strokeLinejoin="round" />
          {/* knoppen */}
          <circle cx="130" cy="396" r="13" fill="#34c77b" stroke="#17153a" strokeWidth="4" className="machine__led" />
          <circle cx="170" cy="396" r="13" fill="#ffd24d" stroke="#17153a" strokeWidth="4" className="machine__led machine__led--2" />
          <rect x="300" y="384" width="110" height="24" rx="12" fill="#fff4e0" stroke="#17153a" strokeWidth="4" />
          <text x="355" y="401" textAnchor="middle" fontFamily="Space Mono, monospace" fontSize="12" fontWeight="700" fill="#17153a">
            {jammed ? "STORING" : "KLIK HIER"}
          </text>
          {/* pootjes */}
          <path d="M120 428v40h40v-40M360 428v40h40v-40" fill="#2a3bdb" stroke="#17153a" strokeWidth="5" strokeLinejoin="round" />
          {/* rook bij storing */}
          <g className="machine__smoke">
            <circle cx="230" cy="40" r="26" fill="#fff4e0" stroke="#17153a" strokeWidth="4" />
            <circle cx="270" cy="24" r="32" fill="#fff4e0" stroke="#17153a" strokeWidth="4" />
            <circle cx="310" cy="44" r="22" fill="#fff4e0" stroke="#17153a" strokeWidth="4" />
          </g>
        </svg>
      </button>
      <div className="machine__bubbles" aria-hidden="true">
        {bubbles.map((b) => (
          <span key={b.id} className="idea-bubble" style={{ ["--x" as string]: b.x }}>
            <i className="bulb" />{b.text}
          </span>
        ))}
      </div>
      {jammed && (
        <p className="machine__jam" aria-hidden="true">
          VASTGELOPEN — er wordt een commissie opgericht
        </p>
      )}
      <p className="visually-hidden" aria-live="polite">
        {announce}
      </p>
    </div>
  );
}
