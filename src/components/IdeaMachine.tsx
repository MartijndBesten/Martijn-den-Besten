// FIG. 1 — De ideeënmachine. Half technisch, half absurd.
// Een tik zet een korte, mechanisch logische reeks in gang:
//   1. een ruwe gedachte valt uit de trechter en reist door de glazen buis;
//   2. de denkkamer draait bij, de tandwielen versnellen, de meter slaat uit;
//   3. er gebeurt iets onverwachts (lamp, vlag, stempel of veer);
//   4. een uitvinding rolt over de band naar buiten.
// Te vaak tikken laat de machine oververhitten en vastlopen; het vogeltje kent een geheime modus.
// Beweging loopt via één requestAnimationFrame-lus die alleen draait als de machine in beeld is en iets te doen heeft.

import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { generateInvention, type Invention } from "../content/inventions";
import { useGame } from "../state/GameState";
import { usePrefersReducedMotion } from "../lib/hooks";
import { sfx } from "../lib/sound";
import { InventionCard } from "./InventionCard";

const JAM_CLICKS = 12;
const JAM_WINDOW = 6000;
const MEGA_EVERY = 9;
const GOLD_RUNS = 5;
const T_INTAKE = 650;
const T_PROCESS = 1250;
const T_OUTPUT = 1700;
const T_DONE = 2300;

const TUBE = "M185 150C185 192 106 176 103 236C100 292 128 300 150 300";
const GEAR_A = { x: 478, y: 230, r: 44, n: 12 };
const GEAR_B = { x: 521, y: 281, r: 30, n: 8 };
const MESH = (Math.atan2(GEAR_B.y - GEAR_A.y, GEAR_B.x - GEAR_A.x) * 180) / Math.PI;
const ROLLERS = [458, 488, 518, 548, 578, 608];
const NEEDLE = { x: 372, y: 356 };
const EYES = { x: 290, y: 276 };

export const PARTS = [
  { id: "trechter", label: "Ideeëntrechter", text: "Ruwe gedachten erin. Er bestaat geen uit-stand.", x: 185, y: 98 },
  { id: "buis", label: "Glazen twijfelbuis", text: "Laat precies genoeg twijfel door om nooit af te ronden.", x: 100, y: 240 },
  { id: "lamp", label: "Inspiratielamp", text: "Gaat aan onder de douche, nooit achter het bureau.", x: 358, y: 96 },
  { id: "denkkamer", label: "Denkkamer", text: "Hier wordt nagedacht. De bewoner kijkt graag even terug.", x: 352, y: 214 },
  { id: "tandwielen", label: "Uitsteltandwielen", text: "Draaien harder naarmate er meer haast is. Dat helpt niet.", x: 520, y: 222 },
  { id: "meter", label: "Ideeënmeter", text: "Meet ideeën per minuut. De schaal eindigt bij ‘veel te veel’.", x: 404, y: 334 },
  { id: "band", label: "Lopende band", text: "Vervoert uitvindingen rechtstreeks naar het octrooibureau.", x: 560, y: 410 },
] as const;
type PartId = (typeof PARTS)[number]["id"];

function gearPath(cx: number, cy: number, r: number, n: number, depth = 7): string {
  const pts: string[] = [];
  const step = (Math.PI * 2) / n;
  for (let k = 0; k < n; k++) {
    const a = k * step;
    const tip = step * 0.22;
    const base = step * 0.32;
    const p = (ang: number, rad: number) => `${(cx + Math.cos(ang) * rad).toFixed(1)} ${(cy + Math.sin(ang) * rad).toFixed(1)}`;
    pts.push(`${k ? "L" : "M"}${p(a - base, r - depth)}`, `L${p(a - tip, r)}`, `L${p(a + tip, r)}`, `L${p(a + base, r - depth)}`, `L${p(a + step - base, r - depth)}`);
  }
  return pts.join("") + "Z";
}
const GEAR_A_D = gearPath(GEAR_A.x, GEAR_A.y, GEAR_A.r, GEAR_A.n);
const GEAR_B_D = gearPath(GEAR_B.x, GEAR_B.y, GEAR_B.r, GEAR_B.n, 6.5);

type Sim = {
  visible: boolean;
  loop: boolean;
  running: boolean;
  jammed: boolean;
  heat: number;
  speed: number;
  angle: number;
  needle: number;
  awakeUntil: number;
  ballStart: number;
  kick: () => void;
};

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export function IdeaMachine() {
  const { findEgg, completeMission } = useGame();
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const gearA = useRef<SVGGElement>(null);
  const gearB = useRef<SVGGElement>(null);
  const rollers = useRef<SVGGElement>(null);
  const belt = useRef<SVGLineElement>(null);
  const needle = useRef<SVGGElement>(null);
  const tube = useRef<SVGPathElement>(null);
  const ball = useRef<SVGCircleElement>(null);
  const pupils = useRef<SVGGElement>(null);

  const [phase, setPhase] = useState<"idle" | "intake" | "process" | "surprise">("idle");
  const [surprise, setSurprise] = useState<string | null>(null);
  const [jammed, setJammed] = useState(false);
  const [heat, setHeat] = useState(0);
  const [lit, setLit] = useState(false);
  const [last, setLast] = useState<Invention | null>(null);
  const [made, setMade] = useState(0);
  const [cards, setCards] = useState<{ id: number; big: boolean; tone: string }[]>([]);
  const [goldLeft, setGoldLeft] = useState(0);
  const [birdHop, setBirdHop] = useState(false);
  const [active, setActive] = useState<PartId | null>(null);
  const [report, setReport] = useState<string | null>(null);

  const clicks = useRef<number[]>([]);
  const counter = useRef(0);
  const cardId = useRef(1);
  const recent = useRef<string[]>([]);
  const pending = useRef<Invention | null>(null);
  const timers = useRef<number[]>([]);
  const goldRef = useRef(0);
  goldRef.current = goldLeft;

  const sim = useRef<Sim>({
    visible: false,
    loop: false,
    running: false,
    jammed: false,
    heat: 0,
    speed: 0,
    angle: 0,
    needle: -60,
    awakeUntil: 0,
    ballStart: 0,
    kick: () => {},
  });
  sim.current.jammed = jammed;
  sim.current.heat = heat;

  // ---------- De bewegingslus ----------
  useEffect(() => {
    if (reduced) return;
    const s = sim.current;
    let raf = 0;
    let prev = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.064, (now - (prev || now)) / 1000);
      prev = now;
      const target = s.jammed ? 0 : s.running ? 3.2 + s.heat * 3 : now < s.awakeUntil ? 0.45 + s.heat * 1.5 : 0;
      s.speed += (target - s.speed) * Math.min(1, dt * (s.jammed ? 9 : 2.6));
      s.angle = (s.angle + s.speed * dt * 60) % 2880;
      gearA.current?.setAttribute("transform", `rotate(${(s.angle + MESH + 15).toFixed(2)} ${GEAR_A.x} ${GEAR_A.y})`);
      gearB.current?.setAttribute("transform", `rotate(${(-s.angle * 1.5 + MESH + 180).toFixed(2)} ${GEAR_B.x} ${GEAR_B.y})`);
      if (belt.current) belt.current.style.strokeDashoffset = String((-s.angle * 0.9).toFixed(1));
      rollers.current?.querySelectorAll("g").forEach((g, i) => g.setAttribute("transform", `rotate(${(s.angle * 2.4).toFixed(1)} ${ROLLERS[i]} 441)`));

      const wobble = s.running ? Math.sin(now / 55) * 5 : 0;
      const nt = s.jammed ? 62 : -60 + Math.min(1, s.heat + (s.running ? 0.3 : 0)) * 120 + wobble;
      s.needle += (nt - s.needle) * Math.min(1, dt * 7);
      needle.current?.setAttribute("transform", `rotate(${s.needle.toFixed(2)} ${NEEDLE.x} ${NEEDLE.y})`);

      if (s.ballStart && tube.current && ball.current) {
        const p = (now - s.ballStart) / T_INTAKE;
        if (p >= 1) {
          s.ballStart = 0;
          ball.current.style.opacity = "0";
        } else {
          const len = tube.current.getTotalLength();
          const pt = tube.current.getPointAtLength(ease(Math.max(0, p)) * len);
          ball.current.setAttribute("cx", pt.x.toFixed(1));
          ball.current.setAttribute("cy", pt.y.toFixed(1));
          ball.current.style.opacity = "1";
        }
      }

      const busy = s.speed > 0.01 || target > 0 || s.ballStart > 0 || Math.abs(nt - s.needle) > 0.3;
      if (busy && s.visible) raf = requestAnimationFrame(tick);
      else s.loop = false;
    };
    s.kick = () => {
      if (s.loop || !s.visible) return;
      s.loop = true;
      prev = 0;
      raf = requestAnimationFrame(tick);
    };
    s.kick();
    return () => {
      cancelAnimationFrame(raf);
      s.loop = false;
      s.kick = () => {};
    };
  }, [reduced]);

  // Alleen bewegen als de machine in beeld is (ook CSS-animaties pauzeren buiten beeld).
  useEffect(() => {
    const el = root.current;
    if (!el || !("IntersectionObserver" in window)) {
      sim.current.visible = true;
      return;
    }
    const io = new IntersectionObserver(([e]) => {
      const s = sim.current;
      const wasVisible = s.visible;
      s.visible = e.isIntersecting;
      el.classList.toggle("is-offscreen", !e.isIntersecting);
      if (e.isIntersecting) {
        if (!wasVisible && s.awakeUntil === 0) s.awakeUntil = performance.now() + 5000;
        s.kick();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => sim.current.kick(), [heat, jammed]);

  // Hitte zakt langzaam terug.
  useEffect(() => {
    if (jammed || heat <= 0) return;
    const t = window.setTimeout(() => setHeat((h) => Math.max(0, +(h - 0.05).toFixed(2))), 400);
    return () => window.clearTimeout(t);
  }, [heat, jammed]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const wake = (ms: number) => {
    sim.current.awakeUntil = Math.max(sim.current.awakeUntil, performance.now() + ms);
    sim.current.kick();
  };

  // ---------- Productie ----------
  const deliver = useCallback(
    (inv: Invention) => {
      pending.current = null;
      sim.current.running = false;
      setLast(inv);
      recent.current = [inv.name, ...recent.current].slice(0, 8);
      setMade((m) => m + 1);
      const id = cardId.current++;
      setCards((c) => [...c.slice(-3), { id, big: !!inv.mega, tone: inv.tone }]);
      window.setTimeout(() => setCards((c) => c.filter((x) => x.id !== id)), 2400);
      setLit(true);
      window.setTimeout(() => setLit(false), 900);
      sfx.success();
      if (inv.mega) findEgg("mega-idee");
      if (inv.gold) setGoldLeft((g) => Math.max(0, g - 1));
      wake(3000);
    },
    [findEgg],
  );

  const flush = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    if (pending.current) deliver(pending.current);
    sim.current.ballStart = 0;
    if (ball.current) ball.current.style.opacity = "0";
  };

  const operate = () => {
    if (jammed) {
      setJammed(false);
      setReport(null);
      setHeat(0.3);
      clicks.current = [];
      sfx.clunk();
      wake(2500);
      return;
    }
    const now = Date.now();
    clicks.current = clicks.current.filter((t) => now - t < JAM_WINDOW).concat(now);
    const h = Math.min(1, clicks.current.length / JAM_CLICKS);
    setHeat(h);
    if (clicks.current.length >= JAM_CLICKS) {
      flush();
      clicks.current = [];
      setJammed(true);
      setPhase("idle");
      setSurprise(null);
      setReport(`S-${String(Math.floor(Math.random() * 9000) + 1000)}`);
      sfx.error();
      findEgg("machine-jam");
      completeMission("jam");
      return;
    }
    flush();
    sfx.blip();
    counter.current += 1;
    const inv = generateInvention(Math.random, {
      mega: counter.current % MEGA_EVERY === 0,
      gold: goldRef.current > 0,
      avoid: recent.current,
    });
    if (reduced) {
      deliver(inv);
      return;
    }
    pending.current = inv;
    const s = sim.current;
    s.running = true;
    s.ballStart = performance.now();
    s.kick();
    setPhase("intake");
    setSurprise(null);
    const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
    at(T_INTAKE, () => {
      setPhase("process");
      sfx.tick();
    });
    at(T_PROCESS, () => {
      setPhase("surprise");
      setSurprise(inv.mega ? "mega" : inv.gold ? "goud" : String(Math.floor(Math.random() * 4)));
    });
    at(T_OUTPUT, () => {
      if (pending.current === inv) deliver(inv);
    });
    at(T_DONE, () => {
      setPhase("idle");
      setSurprise(null);
    });
  };

  const tapBird = () => {
    setBirdHop(true);
    window.setTimeout(() => setBirdHop(false), 700);
    if (goldLeft > 0) {
      sfx.tick();
      return;
    }
    sfx.success();
    setGoldLeft(GOLD_RUNS);
    findEgg("vogeltje");
    wake(3000);
  };

  // De bewoner van de denkkamer kijkt mee met de aanwijzer.
  const look = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = pupils.current;
    const svg = el?.ownerSVGElement;
    if (!el || !svg || reduced) return;
    const r = svg.getBoundingClientRect();
    const sx = r.left + (EYES.x / 640) * r.width;
    const sy = r.top + (EYES.y / 520) * r.height;
    const dx = e.clientX - sx;
    const dy = e.clientY - sy;
    const d = Math.hypot(dx, dy) || 1;
    const k = Math.min(3.4, d / 30);
    el.setAttribute("transform", `translate(${((dx / d) * k).toFixed(2)} ${((dy / d) * k).toFixed(2)})`);
  };
  const unlook = () => pupils.current?.setAttribute("transform", "translate(0 0)");

  const hot = heat > 0.6 && !jammed;
  const status = jammed ? "Vastgelopen" : goldLeft > 0 ? "Gouden modus" : hot ? "Oververhit" : phase !== "idle" ? "Aan het uitvinden" : "In productie";
  const cls = [
    "machine",
    jammed && "is-jammed",
    hot && "is-hot",
    lit && "is-lit",
    goldLeft > 0 && "is-gold",
    phase !== "idle" && `is-${phase}`,
    surprise && `surprise-${surprise}`,
  ]
    .filter(Boolean)
    .join(" ");
  const activePart = PARTS.find((p) => p.id === active);

  return (
    <div ref={root} className={cls} style={{ "--heat": heat } as CSSProperties}>
      <div className="machine__stage" onPointerMove={look} onPointerLeave={unlook} onPointerEnter={() => wake(4000)}>
        <span className="machine__caption" aria-hidden="true">
          Fig. 1<span className="machine__caption-long"> — Ideeënmachine</span> <b>MdB-1</b>
        </span>
        <svg viewBox="0 0 640 520" className="machine__svg" aria-hidden="true">
          <defs>
            <radialGradient id="m-glow">
              <stop offset="0" stopColor="#f6d36b" stopOpacity="0.85" />
              <stop offset="1" stopColor="#f6d36b" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="m-heat">
              <stop offset="0" stopColor="#f2785c" stopOpacity="0.6" />
              <stop offset="1" stopColor="#f2785c" stopOpacity="0" />
            </radialGradient>
            <clipPath id="m-glass">
              <circle cx="290" cy="282" r="54" />
            </clipPath>
          </defs>

          <ellipse cx="350" cy="478" rx="270" ry="14" fill="#191b2e" opacity=".12" />
          <circle className="m-heatglow" cx="300" cy="290" r="250" fill="url(#m-heat)" />

          {/* tandwielen achter de romp */}
          <rect x="426" y="225" width="52" height="10" rx="5" fill="#3a3d55" />
          <g ref={gearA} transform={`rotate(${MESH + 15} ${GEAR_A.x} ${GEAR_A.y})`}>
            <path className="m-gear-a" d={GEAR_A_D} fill="#f6d36b" stroke="#191b2e" strokeWidth="2" strokeLinejoin="round" />
            <circle cx={GEAR_A.x} cy={GEAR_A.y} r="24" fill="none" stroke="#191b2e" strokeOpacity=".25" strokeWidth="2" strokeDasharray="4 5" />
            <circle cx={GEAR_A.x} cy={GEAR_A.y} r="9" fill="#191b2e" />
          </g>
          <g ref={gearB} transform={`rotate(${MESH + 180} ${GEAR_B.x} ${GEAR_B.y})`}>
            <path d={GEAR_B_D} fill="#f2785c" stroke="#191b2e" strokeWidth="2" strokeLinejoin="round" />
            <path d={`M${GEAR_B.x - 12} ${GEAR_B.y}h24M${GEAR_B.x} ${GEAR_B.y - 12}v24`} stroke="#191b2e" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx={GEAR_B.x} cy={GEAR_B.y} r="6" fill="#f5efe4" stroke="#191b2e" strokeWidth="2" />
          </g>

          {/* lopende band */}
          <g className="m-belt">
            <rect x="436" y="428" width="196" height="26" rx="13" fill="#191b2e" />
            <line ref={belt} x1="450" y1="429.5" x2="620" y2="429.5" stroke="#f6d36b" strokeWidth="3" strokeDasharray="10 12" strokeLinecap="round" />
            <g ref={rollers}>
              {ROLLERS.map((x) => (
                <g key={x}>
                  <circle cx={x} cy="441" r="8" fill="#3a3d55" />
                  <path d={`M${x - 6} 441h12`} stroke="#f5efe4" strokeOpacity=".7" strokeWidth="1.6" />
                </g>
              ))}
            </g>
            <path d="M452 454v22M612 454v22" stroke="#3a3d55" strokeWidth="8" strokeLinecap="round" />
          </g>

          {/* poten */}
          <path d="M198 400v66M392 400v66" stroke="#2a3fa0" strokeWidth="16" strokeLinecap="round" />
          <path d="M180 470h36M374 470h36" stroke="#191b2e" strokeWidth="6" strokeLinecap="round" />

          {/* glazen buis */}
          <path d={TUBE} fill="none" stroke="#191b2e" strokeWidth="29" strokeLinecap="round" />
          <path ref={tube} d={TUBE} fill="none" stroke="#f4f6ff" strokeWidth="25" strokeLinecap="round" />
          <path d={TUBE} fill="none" stroke="#c3b2f0" strokeOpacity=".35" strokeWidth="10" strokeLinecap="round" transform="translate(4 3)" />
          <path d={TUBE} fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="30 18 6 200" transform="translate(-6 -2)" opacity=".9" />
          <circle ref={ball} cx="185" cy="150" r="9" fill="#f2785c" stroke="#191b2e" strokeWidth="1.6" style={{ opacity: 0 }} />

          {/* trechter */}
          <g className="m-hopper">
            <path d="M120 70h130l-45 82h-40z" fill="#c3b2f0" stroke="#191b2e" strokeWidth="2" strokeLinejoin="round" />
            <path d="M148 84l18 50" stroke="#fff" strokeOpacity=".55" strokeWidth="5" strokeLinecap="round" />
            <ellipse cx="185" cy="70" rx="65" ry="12" fill="#dcd0f7" stroke="#191b2e" strokeWidth="2" />
            <g className="m-thoughts">
              <circle cx="160" cy="66" r="9" fill="#f2785c" stroke="#191b2e" strokeWidth="1.6" />
              <circle cx="186" cy="61" r="8" fill="#f6d36b" stroke="#191b2e" strokeWidth="1.6" />
              <circle cx="211" cy="67" r="8" fill="#9fc39a" stroke="#191b2e" strokeWidth="1.6" />
            </g>
            {/* verrassing: veer met ster */}
            <g className="m-spring">
              <path d="M185 64l-9-5 18-5-18-5 18-5-18-5 9-4" fill="none" stroke="#191b2e" strokeWidth="2.2" strokeLinejoin="round" />
              <path d="M185 18l5 10 11 1.5-8 7.5 2 11-10-5.5-10 5.5 2-11-8-7.5 11-1.5z" fill="#f6d36b" stroke="#191b2e" strokeWidth="2" strokeLinejoin="round" />
            </g>
          </g>

          {/* schoorsteen + rook + vlag */}
          <g className="m-chimney">
            <g className="m-flag">
              <path d="M407 104V44" stroke="#191b2e" strokeWidth="3" strokeLinecap="round" />
              <path d="M409 46h56l-10 12 10 12h-56z" fill="#9fc39a" stroke="#191b2e" strokeWidth="2" strokeLinejoin="round" />
              <text x="414" y="62" fontFamily="Geist Mono, monospace" fontSize="10" fontWeight="600" fill="#191b2e">
                EUREKA
              </text>
            </g>
            <rect x="393" y="112" width="28" height="60" fill="#f2785c" stroke="#191b2e" strokeWidth="2" />
            <rect x="386" y="102" width="42" height="14" rx="5" fill="#d4502f" stroke="#191b2e" strokeWidth="2" />
            <g className="m-smoke">
              <circle cx="410" cy="84" r="10" />
              <circle cx="420" cy="58" r="14" />
              <circle cx="404" cy="30" r="18" />
            </g>
          </g>

          {/* lamp */}
          <g className="m-lamp">
            <circle className="m-glow" cx="330" cy="104" r="78" fill="url(#m-glow)" />
            <rect x="326" y="128" width="8" height="44" fill="#3a3d55" />
            <g className="m-bulb">
              <rect x="317" y="122" width="26" height="14" rx="4" fill="#5b5e74" stroke="#191b2e" strokeWidth="2" />
              <circle cx="330" cy="102" r="24" fill="#f6d36b" stroke="#191b2e" strokeWidth="2" />
              <path d="M320 104q5-12 10 0t10 0" fill="none" stroke="#191b2e" strokeWidth="2" strokeLinecap="round" />
              <path d="M316 92a16 16 0 0 1 10-10" stroke="#fff" strokeOpacity=".8" strokeWidth="4" strokeLinecap="round" fill="none" />
            </g>
          </g>

          {/* romp */}
          <g className="m-body">
            <rect x="150" y="170" width="290" height="236" rx="44" className="m-body__shade" fill="#2a3fa0" />
            <rect x="150" y="170" width="262" height="236" rx="44" className="m-body__face" fill="#3c5bd6" />
            <path d="M174 252v-38a36 36 0 0 1 36-36h40" fill="none" stroke="#fff" strokeOpacity=".32" strokeWidth="7" strokeLinecap="round" />
            <rect x="174" y="384" width="78" height="1.5" fill="#fff" opacity=".25" />
            <rect x="176" y="194" width="70" height="20" rx="10" fill="#f5efe4" />
            <text x="211" y="208" textAnchor="middle" fontFamily="Geist Mono, monospace" fontSize="10" fontWeight="600" fill="#191b2e">
              MDB-1
            </text>

            {/* denkkamer met bewoner */}
            <circle cx="290" cy="282" r="70" fill="#f5efe4" stroke="#191b2e" strokeWidth="2" />
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i / 8) * Math.PI * 2 + 0.4;
              return <circle key={i} cx={290 + Math.cos(a) * 62} cy={282 + Math.sin(a) * 62} r="3" fill="#5b5e74" />;
            })}
            <circle cx="290" cy="282" r="54" fill="#dcd0f7" stroke="#191b2e" strokeWidth="2" />
            <g clipPath="url(#m-glass)">
              <g className="m-swirl">
                <path d="M248 300c-6-30 18-52 44-50 30 2 48 26 40 52-8 26-40 36-60 26-14-7-22-16-24-28z" fill="#c3b2f0" />
                <circle cx="316" cy="318" r="14" fill="#f2785c" opacity=".85" />
                <circle cx="258" cy="252" r="9" fill="#9fc39a" opacity=".9" />
              </g>
              <g className="m-eyes">
                <ellipse cx="278" cy="278" rx="10" ry="11" fill="#fffdf8" stroke="#191b2e" strokeWidth="1.6" />
                <ellipse cx="303" cy="278" rx="10" ry="11" fill="#fffdf8" stroke="#191b2e" strokeWidth="1.6" />
                <g ref={pupils}>
                  <circle cx="278" cy="279" r="4.2" fill="#191b2e" />
                  <circle cx="303" cy="279" r="4.2" fill="#191b2e" />
                </g>
                <path className="m-lids" d="M267 268h22M292 268h22" stroke="#c3b2f0" strokeWidth="0" />
              </g>
              <path d="M290 304q-8 6-14 2" fill="none" stroke="#191b2e" strokeWidth="2" strokeLinecap="round" className="m-mouth" />
            </g>
            <path d="M252 262a42 42 0 0 1 26-28" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".8" />

            {/* lampjes */}
            <circle className="m-led m-led--ok" cx="188" cy="372" r="7" fill="#9fc39a" stroke="#191b2e" strokeWidth="1.6" />
            <circle className="m-led m-led--busy" cx="210" cy="372" r="7" fill="#f6d36b" stroke="#191b2e" strokeWidth="1.6" />
            <circle className="m-led m-led--hot" cx="232" cy="372" r="7" fill="#f2785c" stroke="#191b2e" strokeWidth="1.6" />

            {/* ideeënmeter */}
            <circle cx={NEEDLE.x} cy={NEEDLE.y} r="30" fill="#f5efe4" stroke="#191b2e" strokeWidth="2" />
            <path d="M350 365a23 23 0 0 1 6-26" fill="none" stroke="#9fc39a" strokeWidth="5" />
            <path d="M358 336a23 23 0 0 1 26-2" fill="none" stroke="#f6d36b" strokeWidth="5" />
            <path d="M387 337a23 23 0 0 1 8 28" fill="none" stroke="#f2785c" strokeWidth="5" />
            <g ref={needle} transform={`rotate(-60 ${NEEDLE.x} ${NEEDLE.y})`}>
              <path d={`M${NEEDLE.x} ${NEEDLE.y}V${NEEDLE.y - 22}`} stroke="#191b2e" strokeWidth="2.6" strokeLinecap="round" />
            </g>
            <circle cx={NEEDLE.x} cy={NEEDLE.y} r="4" fill="#191b2e" />
            <text x={NEEDLE.x} y={NEEDLE.y + 22} textAnchor="middle" fontFamily="Geist Mono, monospace" fontSize="6.5" fontWeight="600" fill="#191b2e">
              VEEL TE VEEL
            </text>

            {/* uitvoergoot */}
            <path d="M412 362h34l26 66h-38z" fill="#f9cfc2" stroke="#191b2e" strokeWidth="2" strokeLinejoin="round" />

            {/* verrassing: stempel */}
            <g className="m-stamp">
              <rect x="226" y="236" width="128" height="34" rx="6" fill="none" stroke="#d4502f" strokeWidth="3" transform="rotate(-10 290 253)" />
              <text x="290" y="259" textAnchor="middle" fontFamily="Geist Mono, monospace" fontSize="13" fontWeight="700" fill="#d4502f" transform="rotate(-10 290 253)">
                GOEDGEKEURD
              </text>
            </g>
          </g>

          {/* uitvoer op de band */}
          <g className="belt-cards">
            {cards.map((c) => (
              <g key={c.id} className={`belt-card ${c.big ? "belt-card--big" : ""}`}>
                <rect x="-20" y="-15" width="40" height="28" rx="5" className={`belt-card__paper tone-${c.tone}`} stroke="#191b2e" strokeWidth="1.6" />
                <path d="M-12 -5h24M-12 2h15" stroke="#191b2e" strokeWidth="1.6" strokeLinecap="round" />
              </g>
            ))}
          </g>

          {/* maatvoering: de octrooisignatuur */}
          <g className="m-dim" stroke="#191b2e" strokeOpacity=".55">
            <path d="M150 500v-12M440 500v-12M150 494h290" strokeWidth="1" />
          </g>
          <text x="295" y="512" textAnchor="middle" fontFamily="Geist Mono, monospace" fontSize="9" fill="#191b2e" opacity=".7">
            BREEDTE: 1 IDEE
          </text>
        </svg>

        <button
          type="button"
          className="machine__hit"
          onClick={operate}
          aria-label={jammed ? "Herstart de vastgelopen ideeënmachine" : "Ideeënmachine: maak een nieuwe uitvinding"}
        />

        <button
          type="button"
          className={`machine__bird ${birdHop ? "is-hopping" : ""}`}
          onClick={tapBird}
          aria-label={goldLeft > 0 ? "Het vogeltje is tevreden" : "Een klein vogeltje op de machine"}
          style={{ left: `${(262 / 640) * 100}%`, top: `${(26 / 520) * 100}%` }}
        >
          <svg viewBox="0 0 48 40" aria-hidden="true">
            <path d="M8 30c0-12 8-20 20-20 7 0 12 5 12 11 0 9-9 13-18 13H10z" fill="#9fc39a" stroke="#191b2e" strokeWidth="2" strokeLinejoin="round" />
            <path d="M40 18l7 2-7 3z" fill="#f6d36b" stroke="#191b2e" strokeWidth="1.6" strokeLinejoin="round" />
            <circle cx="33" cy="17" r="2.4" fill="#191b2e" />
            <path d="M16 24c4 4 10 4 14 0" fill="none" stroke="#191b2e" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M20 34v5M26 34v5" stroke="#191b2e" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {PARTS.map((p, i) => (
          <button
            key={p.id}
            type="button"
            className={`hotspot ${active === p.id ? "is-active" : ""}`}
            style={{ left: `${(p.x / 640) * 100}%`, top: `${(p.y / 520) * 100}%` }}
            aria-expanded={active === p.id}
            aria-controls="machine-uitleg"
            aria-label={`Onderdeel ${i + 1}: ${p.label}`}
            onClick={() => {
              sfx.tick();
              setActive(active === p.id ? null : p.id);
            }}
          >
            {i + 1}
          </button>
        ))}
        <div id="machine-uitleg" className={`machine__bubble ${activePart ? "is-open" : ""}`} aria-live="polite">
          {activePart && (
            <>
              <strong>{activePart.label}</strong>
              <span>{activePart.text}</span>
            </>
          )}
        </div>
      </div>

      <div className="machine__panel">
        <div className="plate__foot">
          <div>
            Status
            <b className={`machine__state ${jammed ? "is-bad" : hot ? "is-warn" : ""}`}>{status}</b>
          </div>
          <div>
            Temperatuur
            <span className="heatbar" role="meter" aria-label="Temperatuur van de machine" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(heat * 100)}>
              <i style={{ width: `${Math.max(4, heat * 100)}%` }} />
            </span>
          </div>
          <div>
            Uitvindingen
            <b>{made}</b>
          </div>
          <div className="plate__last" aria-live="polite">
            Laatste uitvoer<b>{last ? last.name : "— (tik op de machine)"}</b>
          </div>
        </div>
        {report ? (
          <div className="jam-report" role="alert">
            <span className="label">Storingsrapport {report}</span>
            <strong>Machine vastgelopen</strong>
            <dl>
              <dt>Oorzaak</dt>
              <dd>Te veel ideeën per minuut</dd>
              <dt>Schade</dt>
              <dd>Eén tandwiel beledigd</dd>
              <dt>Advies</dt>
              <dd>Even niets doen (lukt nooit)</dd>
            </dl>
            <span className="jam-report__sign">Getekend: de machine</span>
            <span className="label">Tik op de machine om hem te herstarten.</span>
          </div>
        ) : (
          <InventionCard invention={last} />
        )}
      </div>
    </div>
  );
}
