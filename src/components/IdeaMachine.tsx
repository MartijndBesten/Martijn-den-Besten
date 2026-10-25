// FIG. 1 — De ideeënmachine, in drie dimensies.
// Een idee valt uit de trechter, rolt door de glazen buis naar de verwerker (tandwielen draaien, de meter
// slaat uit), gaat via de tweede buis naar de band, wordt door de sorteerarm gekeurd en daarna gestempeld
// of in de afkeurbak geveegd. Goedgekeurde ideeën rijden door de boog naar het uitvoerplatform.
//
// Opbouw:
//   - eerst een poster (WebP) die pixel voor pixel gelijk is aan het eerste 3D-beeld;
//   - three.js wordt pas geladen zodra de bezoeker iets doet (muis, toets, aanraking), zodat de pagina snel blijft;
//   - de knoppen, uitleg en meldingen zijn gewone HTML op de geprojecteerde ankerpunten van de 3D-onderdelen;
//   - zonder WebGL, met ‘minder beweging’ of met databesparing blijft de poster staan en werkt alles gewoon.

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { generateInvention, type Invention } from "../content/inventions";
import { useGame } from "../state/GameState";
import { useMediaQuery, usePrefersReducedMotion } from "../lib/hooks";
import { sfx } from "../lib/sound";
import { MACHINE_ANCHORS, MACHINE_POSTER, PART_TEXT, type MachineLayout } from "../three/machineInfo";
import type { MachineController } from "../three/scenes/ideaMachine";
import { quality, useLazy3D } from "../three/useLazy3D";
import { InventionCard } from "./InventionCard";

const JAM_CLICKS = 12;
const JAM_WINDOW = 6000;
const MEGA_EVERY = 9;
const GOLD_RUNS = 5;
const REJECT_CHANCE = 1 / 5;
const DOUBLE_CHANCE = 1 / 7;
const HICCUP_CHANCE = 1 / 25;
// Vangnet: als de 3D-reeks (nog) niet zover is, komt de uitvinding na deze tijd toch naar buiten.
const FALLBACK_MS = 3800;
const HICCUP_MS = 1300;

type Chip = { id: number; at: "uitvoer" | "afkeurbak"; text: string; big: boolean };

const pct = (n: number) => `${(n * 100).toFixed(2)}%`;

export function IdeaMachine() {
  const { findEgg, completeMission, eggs } = useGame();
  const discoverer = eggs.length >= 5;
  const reduced = usePrefersReducedMotion();
  const layout: MachineLayout = useMediaQuery("(max-width: 699px)") ? "compact" : "wide";
  const anchors = MACHINE_ANCHORS[layout];
  const poster = MACHINE_POSTER[layout];

  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [busy, setBusy] = useState(false);
  const [hiccup, setHiccup] = useState(false);
  const [jammed, setJammed] = useState(false);
  const [heat, setHeat] = useState(0);
  const [last, setLast] = useState<Invention | null>(null);
  const [extra, setExtra] = useState<Invention | null>(null);
  const [made, setMade] = useState(0);
  const [chips, setChips] = useState<Chip[]>([]);
  const [goldLeft, setGoldLeft] = useState(0);
  const [keyTurn, setKeyTurn] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);

  const clicks = useRef<number[]>([]);
  const counter = useRef(0);
  const chipId = useRef(1);
  const recent = useRef<string[]>([]);
  const pending = useRef<{ token: number; inv: Invention; extra: Invention | null } | null>(null);
  const token = useRef(0);
  const timers = useRef<number[]>([]);
  const goldRef = useRef(0);
  goldRef.current = goldLeft;
  const heatRef = useRef(0);
  heatRef.current = heat;

  // ---------- 3D: pas laden bij de eerste echte interactie ----------
  const { mode, ctl: machine, activate } = useLazy3D<MachineController>({
    stageRef,
    canvasRef,
    layout,
    disabled: reduced,
    build: async (canvas, w, h) => {
      const { buildIdeaMachine } = await import("../three/scenes/ideaMachine");
      return buildIdeaMachine(canvas, w, h, layout, quality(layout === "compact"));
    },
    onReady: (m) => {
      m.setHeat(heatRef.current);
      m.setGold(goldRef.current > 0);
      m.stage.render();
      if (!pending.current) m.nudge();
    },
  });
  const modeRef = useRef(mode);
  modeRef.current = mode;

  useEffect(() => machine.current?.setHeat(heat), [heat, machine]);
  useEffect(() => machine.current?.setGold(goldLeft > 0), [goldLeft, machine]);

  // Hitte zakt langzaam terug.
  useEffect(() => {
    if (jammed || heat <= 0) return;
    const t = window.setTimeout(() => setHeat((h) => Math.max(0, +(h - 0.05).toFixed(2))), 400);
    return () => window.clearTimeout(t);
  }, [heat, jammed]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  // ---------- Productie ----------
  const showChip = useCallback((chip: Omit<Chip, "id">) => {
    const id = chipId.current++;
    setChips((c) => [...c.slice(-2), { ...chip, id }]);
    window.setTimeout(() => setChips((c) => c.filter((x) => x.id !== id)), 2600);
  }, []);

  const deliver = useCallback(
    (inv: Invention, bonus: Invention | null) => {
      setLast(inv);
      setExtra(bonus);
      recent.current = [inv.name, ...(bonus ? [bonus.name] : []), ...recent.current].slice(0, 8);
      setMade((m) => m + 1 + (bonus ? 1 : 0));
      setHiccup(false);
      if (inv.rejected) {
        showChip({ at: "afkeurbak", text: "Afgekeurd", big: false });
        sfx.clunk();
      } else {
        showChip({ at: "uitvoer", text: `✓ ${inv.patent}`, big: !!inv.mega });
        sfx.success();
      }
      if (inv.mega) findEgg("mega-idee");
      if (inv.gold) setGoldLeft((g) => Math.max(0, g - 1));
    },
    [findEgg, showChip],
  );

  /** Levert de openstaande uitvinding af (één keer), bijvoorbeeld op het moment dat de pers neerkomt. */
  const settle = useCallback(
    (t?: number) => {
      const p = pending.current;
      if (!p || (t !== undefined && p.token !== t)) return;
      pending.current = null;
      deliver(p.inv, p.extra);
    },
    [deliver],
  );

  const operate = () => {
    if (jammed) {
      setJammed(false);
      setReport(null);
      setHeat(0.3);
      clicks.current = [];
      machine.current?.restart();
      sfx.clunk();
      return;
    }
    const now = Date.now();
    clicks.current = clicks.current.filter((t) => now - t < JAM_WINDOW).concat(now);
    setHeat(Math.min(1, clicks.current.length / JAM_CLICKS));
    // een nieuwe tik duwt het vorige idee meteen naar buiten
    settle();
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    if (clicks.current.length >= JAM_CLICKS) {
      clicks.current = [];
      machine.current?.jam();
      setJammed(true);
      setBusy(false);
      setHiccup(false);
      setReport(`S-${String(Math.floor(Math.random() * 9000) + 1000)}`);
      sfx.error();
      findEgg("machine-jam");
      completeMission("jam");
      return;
    }
    sfx.blip();
    counter.current += 1;
    const n = counter.current;
    const mega = n % MEGA_EVERY === 0;
    const gold = goldRef.current > 0;
    const plain = !mega && !gold && n > 1;
    const reject = plain && Math.random() < REJECT_CHANCE;
    const double = plain && !reject && Math.random() < DOUBLE_CHANCE;
    const stall = plain && n > 4 && Math.random() < HICCUP_CHANCE;
    const inv = generateInvention(Math.random, { mega, gold, rejected: reject, avoid: recent.current });
    const bonus = double ? generateInvention(Math.random, { avoid: [inv.name, ...recent.current] }) : null;
    const t = ++token.current;
    pending.current = { token: t, inv, extra: bonus };

    if (modeRef.current === "static" || reduced) {
      settle(t);
      return;
    }
    setBusy(true);
    if (stall) setHiccup(true);
    const go = (m: MachineController) => {
      void m.run({ reject, double, mega, gold, hiccup: stall, onVerdict: () => settle(t) }).then(() => {
        if (token.current === t) setBusy(false);
      });
    };
    void activate().then((m) => {
      if (m) go(m);
      else if (token.current === t) {
        // geen 3D beschikbaar: de uitvinding komt meteen naar buiten
        settle(t);
        setBusy(false);
        setHiccup(false);
      }
    });
    timers.current.push(
      window.setTimeout(() => settle(t), FALLBACK_MS + (stall ? HICCUP_MS : 0)),
    );
  };

  const turnKey = () => {
    void activate();
    setKeyTurn(true);
    window.setTimeout(() => setKeyTurn(false), 600);
    if (goldLeft > 0) {
      sfx.tick();
      return;
    }
    sfx.success();
    setGoldLeft(GOLD_RUNS);
    findEgg("vogeltje");
  };

  const hot = heat > 0.6 && !jammed;
  const status = jammed
    ? "Vastgelopen"
    : goldLeft > 0
      ? "Gouden modus"
      : hiccup
        ? "Kleine storing (lost zichzelf op)"
        : hot
          ? "Oververhit"
          : busy
            ? "Aan het uitvinden"
            : "In productie";
  const cls = ["machine", `machine--${mode}`, jammed && "is-jammed", hot && "is-hot", busy && "is-busy", goldLeft > 0 && "is-gold"].filter(Boolean).join(" ");
  const activePart = PART_TEXT.find((p) => p.id === active);
  const inlet = anchors.trechter;

  return (
    <div className={cls} style={{ "--heat": heat } as CSSProperties}>
      <div
        ref={stageRef}
        className="machine__stage"
        style={{ aspectRatio: `${poster.w} / ${poster.h}` }}
        onPointerEnter={() => {
          void activate();
          machine.current?.nudge();
        }}
      >
        <span className="machine__caption" aria-hidden="true">
          Fig. 1<span className="machine__caption-long"> — Ideeënmachine</span> <b className="machine__model">{discoverer ? "MDB-1 ★" : "MDB-1"}</b>
        </span>
        <img
          key={layout}
          className="machine__poster"
          src={poster.src}
          srcSet={poster.srcset}
          sizes={layout === "compact" ? "100vw" : "(min-width: 1000px) 58vw, 100vw"}
          width={poster.w}
          height={poster.h}
          alt=""
          decoding="async"
          fetchPriority="high"
        />
        <canvas key={layout} ref={canvasRef} className="machine__canvas" aria-hidden="true" />

        <button
          type="button"
          className="machine__hit"
          onClick={operate}
          aria-label={jammed ? "Herstart de vastgelopen ideeënmachine" : "Ideeënmachine: maak een nieuwe uitvinding"}
          aria-describedby="machine-hint"
        />
        <span
          id="machine-hint"
          className="machine__inlet"
          style={{ left: pct(inlet.x), top: pct(Math.max(0.09, inlet.y - 0.12)), "--shift": inlet.x < 0.3 ? "-24%" : "-50%" } as CSSProperties}
        >
          {jammed ? "Tik om te herstarten" : busy ? "Nog een idee erin" : "Gooi een idee in de trechter"}
        </span>

        <button
          type="button"
          className={`machine__key ${keyTurn ? "is-turning" : ""}`}
          onClick={turnKey}
          aria-label={goldLeft > 0 ? "De sleutelschakelaar staat op goud" : "Sleutelschakelaar op de machine"}
          style={{ left: pct(anchors.schakelaar.x), top: pct(anchors.schakelaar.y) }}
        >
          <span aria-hidden="true" />
        </button>

        {PART_TEXT.map((p, i) => (
          <button
            key={p.id}
            type="button"
            className={`hotspot ${active === p.id ? "is-active" : ""}`}
            style={{ left: pct(anchors[p.id].x), top: pct(anchors[p.id].y) }}
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

        <div className="belt-cards" aria-hidden="true">
          {chips.map((c) => (
            <span
              key={c.id}
              className={`belt-card belt-card--${c.at} ${c.big ? "belt-card--big" : ""}`}
              style={{ left: pct(anchors[c.at].x), top: pct(anchors[c.at].y) }}
            >
              {c.text}
            </span>
          ))}
        </div>

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
            <b className={`machine__state ${jammed ? "is-bad" : hot || hiccup ? "is-warn" : ""}`}>{status}</b>
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
              <dd>Eén tandwiel beledigd, sorteerarm in de wacht</dd>
              <dt>Advies</dt>
              <dd>Even niets doen (lukt nooit)</dd>
            </dl>
            <span className="jam-report__sign">Getekend: de machine</span>
            <span className="label">Tik op de machine om hem te herstarten.</span>
          </div>
        ) : (
          <>
            <InventionCard invention={last} />
            {extra && (
              <p className="machine__extra">
                <span className="label">Bijproduct</span> {extra.name}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
