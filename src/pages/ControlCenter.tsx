// Het Martijn Control Center: één grote bedieningsinstallatie (MdB-2 ‘Altijd Aan’).
// De installatie is een 3D-scène (src/three/scenes/console.ts); alle bediening is gewone, toegankelijke HTML
// die precies op de geprojecteerde onderdelen ligt. Zonder WebGL blijft de poster staan en werkt alles hetzelfde.

import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { generateDomain, generateIdea, PLANS, STUCK_AT_99, type Domain } from "../content/generators";
import { pickFresh, shuffle } from "../lib/random";
import { sfx } from "../lib/sound";
import { useMediaQuery, usePrefersReducedMotion } from "../lib/hooks";
import { useGame } from "../state/GameState";
import { Link } from "../router";
import { CONSOLE_ANCHORS, CONSOLE_POSTER, quadToMatrix3d, type ConsoleAnchor, type ConsoleLayout } from "../three/consoleInfo";
import type { ConsoleController, Tone } from "../three/scenes/console";
import { quality, useLazy3D } from "../three/useLazy3D";
import "../styles/control.css";

type LogLine = { id: number; text: string; tone?: "ok" | "warn" | "err" };
type Capsule = { id: number; plan: string; color: string; open: boolean };
type Toggle = "koffie" | "ambitie" | "realisme";
const TOGGLES: Toggle[] = ["koffie", "ambitie", "realisme"];

const CAPSULE_COLORS = ["#f2b6c3", "#a8c6e8", "#b3e1cb", "#f6d781", "#d5c7f2", "#e58ea3"];
const LOAD_PER_ACTION = 9;
const pct = (n: number) => `${(n * 100).toFixed(2)}%`;
const hex = (c: string) => parseInt(c.slice(1), 16);
const later = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

/** Een knop op de installatie: een onzichtbaar maar focusbaar vlak precies over het 3D-onderdeel, met een naamplaatje. */
function Control({
  a,
  plate,
  side = "below",
  className = "",
  children,
  ...rest
}: { a: ConsoleAnchor; plate?: ReactNode; side?: "below" | "above" | "left" } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={`cc-ctl ${className}`} style={{ left: pct(a.x), top: pct(a.y), "--r": a.r } as CSSProperties} {...rest}>
      {children}
      {plate && <span className={`cc-plate cc-plate--${side}`}>{plate}</span>}
    </button>
  );
}

/** Een knop die wegloopt voor de muis. Met het toetsenbord lukt het meteen; op een touchscreen na twee pogingen. */
function RunawayButton({ onCaught, disabled, range }: { onCaught: () => void; disabled: boolean; range: number }) {
  const [x, setX] = useState(0);
  const [tries, setTries] = useState(0);
  const pointer = useRef<string>("");
  const reduced = usePrefersReducedMotion();
  const limit = 5;
  const dodge = () => {
    sfx.tick();
    setTries((t) => t + 1);
    setX((prev) => {
      let next = Math.round((Math.random() * 2 - 1) * range);
      if (Math.abs(next - prev) < range * 0.4) next = prev > 0 ? -Math.abs(next) - range * 0.3 : Math.abs(next) + range * 0.3;
      return Math.max(-range, Math.min(range, next));
    });
  };
  return (
    <button
      type="button"
      className={`runaway ${tries >= limit ? "is-tired" : ""}`}
      style={{ transform: `translateX(${x}px) rotate(${x / 30}deg)` }}
      disabled={disabled}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse" && tries < limit && !reduced) dodge();
      }}
      onPointerDown={(e) => (pointer.current = e.pointerType)}
      onClick={(e) => {
        const touch = pointer.current === "touch" || pointer.current === "pen";
        pointer.current = "";
        if (e.detail > 0 && touch && tries < 2 && !reduced) {
          dodge();
          return;
        }
        setX(0);
        onCaught();
      }}
    >
      {tries >= limit ? "Vooruit dan" : "Alles tegelijk afmaken"}
    </button>
  );
}

export default function ControlCenter() {
  const game = useGame();
  const { findEgg, completeMission, unlockSecret, setSerious, serious, sound, setSound } = game;
  const reduced = usePrefersReducedMotion();
  const layout: ConsoleLayout = useMediaQuery("(max-width: 759px)") ? "compact" : "wide";
  const poster = CONSOLE_POSTER[layout];
  const { anchors: A, screen: SR } = CONSOLE_ANCHORS[layout];

  const [output, setOutput] = useState<{ title: string; body: string; tone?: "err" | "ok" }>({
    title: "Systeem gereed.",
    body: "Druk op een knop. Alle knoppen werken. Bijna alle knoppen werken.",
  });
  const [log, setLog] = useState<LogLine[]>([{ id: 0, text: "Machine opgestart om " + new Date().toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }) }]);
  const logId = useRef(1);
  const [load, setLoad] = useState(0);
  const loadRef = useRef(0);
  const [jammed, setJammed] = useState(false);
  const [creativity, setCreativity] = useState(3);
  const [eleven, setEleven] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [progressText, setProgressText] = useState("");
  const [nothingCount, setNothingCount] = useState(0);
  const [resting, setResting] = useState(false);
  const [errorWin, setErrorWin] = useState(false);
  const [receipts, setReceipts] = useState<Domain[]>([]);
  const [cover, setCover] = useState(false);
  const [emergency, setEmergency] = useState(false);
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const capsuleId = useRef(1);
  const [pull, setPull] = useState(0);
  const [pulling, setPulling] = useState(false);
  const [switches, setSwitches] = useState<Record<Toggle, boolean>>({ koffie: false, ambitie: false, realisme: true });
  const lastIdea = useRef<string | undefined>(undefined);
  const lastStuck = useRef<string | undefined>(undefined);
  const errorOk = useRef<HTMLButtonElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = stageRef.current;
    if (!el || !("ResizeObserver" in window)) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const level = eleven ? 11 : creativity;
  const tone: Tone = output.tone ?? "normal";

  // ---------- De 3D-installatie ----------
  const state = useRef({ level, load, progress, serious, switches, cover, emergency, jammed, tone });
  state.current = { level, load, progress, serious, switches, cover, emergency, jammed, tone };
  const { mode, ctl: scene, activate } = useLazy3D<ConsoleController>({
    stageRef,
    canvasRef,
    layout,
    disabled: reduced,
    build: async (canvas, w, h) => {
      const { buildConsole } = await import("../three/scenes/console");
      return buildConsole(canvas, w, h, layout, quality(layout === "compact"));
    },
    onReady: (c) => {
      // de huidige toestand overzetten op de vers geladen installatie
      const s = state.current;
      c.setCreativity(s.level);
      c.setLoad(s.load / 100);
      if (s.progress !== null) c.setProgress(s.progress / 100);
      c.setSerious(s.serious);
      (Object.keys(s.switches) as Toggle[]).forEach((k) => c.setToggle(k, s.switches[k]));
      c.setCover(s.cover);
      if (s.emergency) c.emergency(true);
      if (s.jammed) c.jam(true);
      c.screen(s.tone);
      c.stage.render();
    },
  });
  const live = () => scene.current;

  useEffect(() => live()?.setCreativity(level), [level]);
  useEffect(() => live()?.setLoad(load / 100), [load]);
  useEffect(() => live()?.setProgress(progress === null ? null : progress / 100), [progress]);
  useEffect(() => live()?.setSerious(serious), [serious]);
  useEffect(() => live()?.setCover(cover), [cover]);
  useEffect(() => live()?.emergency(emergency), [emergency]);
  useEffect(() => live()?.jam(jammed), [jammed]);
  useEffect(() => live()?.screen(tone), [tone]);
  useEffect(() => live()?.setLever(pull), [pull]);

  const addLog = useCallback((text: string, t?: LogLine["tone"]) => {
    setLog((l) => [{ id: logId.current++, text, tone: t }, ...l].slice(0, 6));
  }, []);

  // Belasting zakt langzaam terug.
  useEffect(() => {
    if (jammed) return;
    const iv = window.setInterval(() => {
      if (loadRef.current === 0) return;
      loadRef.current = Math.max(0, loadRef.current - 2);
      setLoad(loadRef.current);
    }, 400);
    return () => window.clearInterval(iv);
  }, [jammed]);

  const act = useCallback(
    (amount = LOAD_PER_ACTION): boolean => {
      void activate();
      if (jammed || emergency) return false;
      const next = Math.min(100, loadRef.current + amount);
      loadRef.current = next;
      setLoad(next);
      if (next >= 100) {
        setJammed(true);
        sfx.error();
        addLog("STORING: machine vastgelopen door overbelasting", "err");
        setOutput({ title: "MACHINE VASTGELOPEN", body: "Te veel ideeën tegelijk. Tik tegen de machine om hem weer aan de praat te krijgen.", tone: "err" });
        completeMission("jam");
        return false;
      }
      return true;
    },
    [jammed, emergency, addLog, completeMission, activate],
  );

  // ---------- Bediening ----------

  const newIdea = () => {
    if (!act()) return;
    sfx.blip();
    live()?.press("idee");
    live()?.idea();
    let idea = generateIdea(Math.random, level);
    while (idea.title === lastIdea.current) idea = generateIdea(Math.random, level);
    lastIdea.current = idea.title;
    setOutput({ title: idea.title, body: idea.description });
    addLog(`Nieuw idee ${idea.serial} gestart`, "ok");
  };

  const finishProject = () => {
    if (progress !== null || !act(14)) return;
    sfx.click();
    live()?.press("afronden");
    addLog("Project ‘Afronden’ gestart");
    setOutput({ title: "Project wordt afgerond…", body: "Een ogenblik geduld. Het instituut rondt nooit iets af, maar probeert het graag." });
    if (reduced) {
      setProgress(99);
      setProgressText(STUCK_AT_99[0]);
    } else {
      setProgress(0);
    }
  };

  useEffect(() => {
    if (progress === null) return;
    if (progress < 99) {
      const step = progress < 60 ? 7 : progress < 90 ? 3 : 1;
      const t = window.setTimeout(() => {
        setProgress(Math.min(99, progress + step));
        sfx.tick();
      }, progress < 90 ? 90 : 260);
      return () => window.clearTimeout(t);
    }
    let n = 0;
    const iv = window.setInterval(() => {
      const msg = pickFresh(STUCK_AT_99, lastStuck.current);
      lastStuck.current = msg;
      setProgressText(msg);
      n++;
      if (n >= 4) {
        window.clearInterval(iv);
        const three = shuffle(PLANS).slice(0, 3);
        sfx.success();
        setOutput({
          title: "Gefeliciteerd. Dit project heeft drie nieuwe projecten opgeleverd.",
          body: three.map((p, i) => `${i + 1}. ${p}`).join("  ·  "),
          tone: "ok",
        });
        addLog("Project op 99% · 3 nieuwe projecten aangemaakt", "warn");
        completeMission("project-99");
        setProgress(null);
        setProgressText("");
      }
    }, 900);
    return () => window.clearInterval(iv);
  }, [progress, addLog, completeMission]);

  const doNothing = async () => {
    if (resting || !act(4)) return;
    live()?.press("niets");
    if (nothingCount >= 3) {
      sfx.success();
      setOutput({ title: "Goed bezig!", body: "U heeft iets gedaan: u heeft op een knop gedrukt. De knop ‘Even niets doen’ is hierdoor in de war geraakt.", tone: "ok" });
      addLog("Iets gedaan (onbedoeld)", "ok");
      findEgg("nothing-flip");
      setNothingCount(0);
      return;
    }
    setNothingCount((c) => c + 1);
    const c = live();
    if (c && !reduced) {
      // de machine probeert echt even niets te doen: lampjes uit, scherm uit… en start zichzelf weer op
      setResting(true);
      setOutput({ title: "Rustmodus…", body: "De machine probeert even helemaal niets te doen." });
      addLog("Rustmodus gestart");
      await Promise.race([c.sleep(), later(3200)]);
      setResting(false);
    }
    sfx.error();
    setOutput({ title: "Rustmodus mislukt.", body: "De machine heeft zichzelf direct weer opgestart. Er waren nog ideeën.", tone: "err" });
    setErrorWin(true);
    addLog("Fout 404: rustmoment niet gevonden", "err");
  };

  useEffect(() => {
    if (errorWin) errorOk.current?.focus();
  }, [errorWin]);

  const buyDomain = () => {
    if (!act()) return;
    sfx.clunk();
    live()?.press("domein");
    live()?.print();
    const d = generateDomain();
    setReceipts((r) => [d, ...r].slice(0, 3));
    setOutput({ title: `Domein ‘${d.name}’ (niet echt) gekocht`, body: `${d.reason} Prijs: € 0,00. Er is niets geregistreerd; deze extensie bestaat niet eens.` });
    addLog(`Domeinnaam bedacht: ${d.name}`);
  };

  const changeCreativity = (next: number) => {
    void activate();
    if (jammed || emergency) return;
    if (next > 10) {
      if (!eleven) {
        setEleven(true);
        findEgg("to-eleven");
        addLog("Creativiteit: 11 (!)", "warn");
        setOutput({ title: "Deze knop gaat tot 11.", body: "Waarom tot 11? Omdat 10 te weinig was.", tone: "ok" });
        window.setTimeout(() => setEleven(false), 4000);
      }
      return;
    }
    const v = Math.max(0, Math.min(10, next));
    if (v === creativity) return;
    setCreativity(v);
    sfx.tick();
    if (v === 10) {
      completeMission("creativity-10");
      addLog("Creativiteit op maximaal", "warn");
    }
  };

  const toggleSerious = () => {
    void activate();
    sfx.click();
    addLog("Serieuze modus geactiveerd");
    setSerious(true);
  };

  const pressEmergency = () => {
    void activate();
    if (!cover) {
      setCover(true);
      sfx.click();
      addLog("Kapje noodstop geopend", "warn");
      return;
    }
    if (emergency) return;
    setEmergency(true);
    setCover(false);
    sfx.alarm();
    addLog("NOODSTOP GEACTIVEERD", "err");
    setOutput({ title: "NOODSTOP GEACTIVEERD", body: "Alle ideeën worden veilig opgeborgen in een la. Er raakt niets kwijt. Behalve misschien de la.", tone: "err" });
    completeMission("emergency");
    window.setTimeout(
      () => {
        setEmergency(false);
        loadRef.current = 0;
        setLoad(0);
        setJammed(false);
        setOutput({ title: "Systeem hersteld.", body: "De noodstop is gereset. Er zijn tijdens de stilstand 4 nieuwe ideeën ontstaan.", tone: "ok" });
        addLog("Systeem hersteld na noodstop", "ok");
      },
      reduced ? 2500 : 5200,
    );
  };

  const triggerLever = () => {
    if (!act()) return;
    sfx.clunk();
    const plan = pickFresh(PLANS, capsules[capsules.length - 1]?.plan);
    const id = capsuleId.current++;
    const color = CAPSULE_COLORS[id % CAPSULE_COLORS.length];
    setCapsules((c) => [...c.slice(-5), { id, plan, color, open: false }]);
    live()?.capsule(hex(color));
    setOutput({ title: "Nieuw plan uit de machine gerold", body: `Open de capsule in de bak om het plan te bekijken. (Spoiler: ${plan.toLowerCase()}.)` });
    addLog("Hendel overgehaald: 1 nieuw plan");
  };

  // Hendel: slepen naar beneden of gewoon klikken.
  const leverStart = useRef<{ y: number; moved: boolean; span: number } | null>(null);
  const onLeverDown = (e: PointerEvent<HTMLButtonElement>) => {
    void activate();
    e.currentTarget.setPointerCapture(e.pointerId);
    const h = stageRef.current?.getBoundingClientRect().height ?? 600;
    leverStart.current = { y: e.clientY, moved: false, span: Math.max(40, Math.abs(A.leverEnd.y - A.lever.y) * h) };
    setPulling(true);
  };
  const onLeverMove = (e: PointerEvent<HTMLButtonElement>) => {
    const s = leverStart.current;
    if (!s) return;
    const dy = e.clientY - s.y;
    if (Math.abs(dy) > 6) s.moved = true;
    setPull(Math.max(0, Math.min(1, dy / s.span)));
  };
  const releaseLever = () => window.setTimeout(() => setPull(0), 260);
  const onLeverUp = () => {
    const s = leverStart.current;
    leverStart.current = null;
    setPulling(false);
    if (s && (!s.moved || pull > 0.55)) {
      setPull(1);
      triggerLever();
      releaseLever();
    } else setPull(0);
  };
  const onLeverKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setPull(1);
      triggerLever();
      releaseLever();
    }
  };

  const toggleSwitch = (key: Toggle) => {
    void activate();
    if (jammed || emergency) return;
    sfx.click();
    const next = { ...switches, [key]: !switches[key] };
    setSwitches(next);
    live()?.setToggle(key, next[key]);
    addLog(`Schakelaar ${key}: ${next[key] ? "aan" : "uit"}`);
    if (next.koffie && next.ambitie && !next.realisme) {
      unlockSecret();
      findEgg("switches");
      sfx.success();
      setOutput({ title: "Combinatie geaccepteerd.", body: "Koffie aan, ambitie aan, realisme uit. Er klinkt een klik in de verte: de geheime zaal in het museum is ontgrendeld.", tone: "ok" });
    }
  };

  const caught = () => {
    sfx.clunk();
    findEgg("wegloper");
    setOutput({ title: "Alles tegelijk afmaken…", body: "Technisch onmogelijk. De knop wist dat al, daarom liep hij weg. Er is een nieuw plan gemaakt om dit plan af te maken.", tone: "err" });
    addLog("Knop ‘alles afmaken’ gevangen (tegen zijn zin)", "warn");
  };

  const unjam = () => {
    sfx.clunk();
    live()?.thump();
    setJammed(false);
    loadRef.current = 30;
    setLoad(30);
    setOutput({ title: "Machine draait weer.", body: "Een stevige tik doet wonderen. Dat staat ook in de handleiding (hoofdstuk 1, nog niet geschreven).", tone: "ok" });
    addLog("Machine hersteld met een tik", "ok");
  };

  // ---------- Draaiknop ----------
  const knobRef = useRef<HTMLDivElement>(null);
  const knobDrag = useRef(false);
  const knobFromPointer = (e: PointerEvent<HTMLDivElement>) => {
    const el = knobRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const angle = (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI + 90;
    const a = ((angle + 540) % 360) - 180; // -180..180, 0 = boven
    if (a > 150 || a < -150) return;
    const raw = Math.round(((Math.max(-135, Math.min(135, a)) + 135) / 270) * 10);
    if (raw === 10 && a > 140) changeCreativity(11);
    else changeCreativity(raw);
  };
  const onKnobKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const map: Record<string, number> = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 2, PageDown: -2 };
    if (e.key in map) {
      e.preventDefault();
      changeCreativity(creativity + map[e.key]);
    } else if (e.key === "Home") {
      e.preventDefault();
      changeCreativity(0);
    } else if (e.key === "End") {
      e.preventDefault();
      changeCreativity(10);
    }
  };

  const disabled = jammed || emergency;
  const compact = layout === "compact";
  const finishLabel = progress !== null ? "Bezig met afronden…" : "Project afronden";
  const [drawer, setDrawer] = useState(false);
  const railPx = Math.round(A.rail.r * 0.8 * (size.w || (compact ? 360 : 1100)));
  // het display: een HTML-scherm dat met een perspectieftransformatie precies op het 3D-scherm ligt
  const screenStyle: CSSProperties = (() => {
    if (!size.w || !SR.quad) return { left: pct(SR.x), top: pct(SR.y), width: pct(SR.w), height: pct(SR.h) };
    const q = SR.quad.map((p) => ({ x: p.x * size.w, y: p.y * size.h }));
    const w = Math.hypot(q[1].x - q[0].x, q[1].y - q[0].y);
    const h = Math.hypot(q[2].x - q[0].x, q[2].y - q[0].y);
    return { left: 0, top: 0, width: w, height: h, transformOrigin: "0 0", transform: quadToMatrix3d(w, h, q) };
  })();

  // − en + naast de draaiknop (op mobiel in de bedieningslade, waar ze niets overlappen)
  const steps = (
    <span className="cc-knob__steps">
      <button type="button" onClick={() => changeCreativity(creativity - 1)} disabled={disabled} aria-label="Creativiteit omlaag">
        −
      </button>
      <button type="button" onClick={() => changeCreativity(creativity + 1)} disabled={disabled} aria-label="Creativiteit omhoog">
        +
      </button>
    </span>
  );

  const logList = (
    <ol className="screen__log" aria-label="Logboek">
      {log.map((l) => (
        <li key={l.id} className={l.tone ? `is-${l.tone}` : ""}>
          {"> "}
          {l.text}
        </li>
      ))}
    </ol>
  );

  return (
    <div className="page control">
      <section className="page-hero wrap control__hero" aria-labelledby="cc-title">
        <div>
          <span className="dept-no">Afd. 02 — Technische Dienst</span>
          <h1 id="cc-title">
            Martijn Control <em>Center</em>
          </h1>
          <p className="lede">Bedieningsinstructies: druk op alles. De installatie is getest door niemand en goedgekeurd door iedereen die hem niet heeft gebruikt.</p>
        </div>
        <dl className="spec">
          <dt>Model</dt>
          <dd>MdB-2 ‘Altijd Aan’</dd>
          <dt>Bouwjaar</dt>
          <dd>Vandaag</dd>
          <dt>Garantie</dt>
          <dd>Verlopen</dd>
          <dt>Handleiding</dt>
          <dd>Hoofdstuk 1 volgt</dd>
        </dl>
      </section>

      <div className="wrap">
        <section
          className={`console console--${layout} console--${mode} level-${level} ${jammed ? "is-jammed" : ""} ${emergency ? "is-emergency" : ""} ${resting ? "is-resting" : ""}`}
          aria-label="Bedieningsinstallatie MdB-2"
          data-lamps={Math.min(level, 11)}
          data-plant={Math.floor(Math.min(level, 10) / 2)}
          style={{ "--c": level / 10 } as CSSProperties}
        >
          <div ref={stageRef} className="cc-stage" style={{ aspectRatio: `${poster.w} / ${poster.h}` }}>
            <img
              key={`p-${layout}`}
              className="cc-poster"
              src={poster.src}
              srcSet={poster.srcset}
              sizes={compact ? "100vw" : "(min-width: 1240px) 1180px, 96vw"}
              width={poster.w}
              height={poster.h}
              alt=""
              decoding="async"
              fetchPriority="high"
            />
            <canvas key={`c-${layout}`} ref={canvasRef} className="cc-canvas" aria-hidden="true" />

            {/* Het centrale display */}
            <div className={`cc-screen cc-screen--${tone}`} style={screenStyle}>
              <div className="screen">
                <div className="screen__top">
                  <span className="label">Uitvoerscherm · MdB-2</span>
                  <button type="button" className="screen__sound" aria-pressed={sound} onClick={() => setSound(!sound)}>
                    Geluid: {sound ? "aan" : "uit"}
                  </button>
                </div>
                <div key={output.title} className={`screen__output ${output.tone ? `is-${output.tone}` : ""}`} aria-live="polite" aria-atomic="true">
                  <p className="screen__title">{output.title}</p>
                  <p className="screen__body">{output.body}</p>
                </div>
                {progress !== null && (
                  <div className="segbar" role="progressbar" aria-label="Voortgang project" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
                    <div className="segbar__track">
                      {Array.from({ length: 20 }, (_, i) => (
                        <span key={i} className={i < Math.floor(progress / 5) ? "is-on" : ""} />
                      ))}
                    </div>
                    <span className="segbar__pct">{progress}%</span>
                    {progress >= 99 && <span className="segbar__text">{progressText}</span>}
                  </div>
                )}
                {!compact && logList}
              </div>
            </div>

            {/* Meters */}
            <span className={`cc-readout ${compact ? "visually-hidden" : ""}`} role="img" aria-label={`Machinebelasting ${Math.round(load)} procent`} style={{ left: pct(A.gaugeLoad.x), top: pct(A.gaugeLoad.y) }}>
              Belasting {Math.round(load)}%
            </span>
            <span className={`cc-readout ${compact ? "visually-hidden" : ""}`} aria-hidden="true" style={{ left: pct(A.gaugeProgress.x), top: pct(A.gaugeProgress.y) }}>
              Voortgang {progress ?? 0}%
            </span>

            {/* Bediening op het dek */}
            <Control a={A.idee} className="cc-ctl--idee" plate="Nieuw idee starten" onClick={newIdea} disabled={disabled} />
            <Control a={A.niets} plate={nothingCount >= 3 ? "Toch maar iets doen" : "Even niets doen"} onClick={() => void doNothing()} disabled={disabled || resting} />
            {!compact && (
              <>
                <Control a={A.afronden} side="above" plate={finishLabel} onClick={finishProject} disabled={disabled || progress !== null} />
                <Control a={A.domein} plate="Nog een domeinnaam kopen" onClick={buyDomain} disabled={disabled} />
                <Control a={A.serious} role="switch" aria-checked={serious} aria-label="Serieuze modus" plate="Serieuze modus" onClick={toggleSerious} disabled={disabled} />
                {TOGGLES.map((k) => (
                  <Control key={k} a={A[k]} className={`cc-ctl--toggle ${switches[k] ? "is-on" : ""}`} role="switch" aria-checked={switches[k]} aria-label={k} onClick={() => toggleSwitch(k)} disabled={disabled}>
                    <span className="cc-dot" aria-hidden="true" />
                  </Control>
                ))}
                <span className="cc-plate cc-plate--free" aria-hidden="true" style={{ left: pct(A.ambitie.x), top: pct(A.ambitie.y - A.ambitie.r * 2.6) }}>
                  Koffie · Ambitie · Realisme
                </span>
              </>
            )}
            <Control
              a={A.stop}
              className={`cc-ctl--stop ${cover ? "is-open" : ""}`}
              plate={cover ? "Kapje open. Zeker weten?" : "Noodstop (eerst kapje)"}
              onClick={pressEmergency}
              disabled={emergency || jammed}
              aria-label={cover ? "Druk op de officiële noodstop" : "Open het beschermkapje van de noodstop"}
            />

            {/* Draaiknop */}
            <div className="cc-knob" style={{ left: pct(A.knob.x), top: pct(A.knob.y), "--r": A.knob.r } as CSSProperties}>
              <div
                ref={knobRef}
                className="cc-ctl cc-ctl--knob"
                role="slider"
                tabIndex={disabled ? -1 : 0}
                aria-labelledby="knob-label"
                aria-valuemin={0}
                aria-valuemax={10}
                aria-valuenow={creativity}
                aria-valuetext={eleven ? "11, buiten de schaal" : `Niveau ${creativity} van 10`}
                aria-disabled={disabled}
                onKeyDown={onKnobKey}
                onPointerDown={(e) => {
                  knobDrag.current = true;
                  e.currentTarget.setPointerCapture(e.pointerId);
                  knobFromPointer(e);
                }}
                onPointerMove={(e) => knobDrag.current && knobFromPointer(e)}
                onPointerUp={() => (knobDrag.current = false)}
                onPointerCancel={() => (knobDrag.current = false)}
              />
              <span className="cc-plate cc-plate--below">
                <span id="knob-label">Creativiteit</span> <b aria-hidden="true">{level}/10</b>
              </span>
              {!compact && steps}
            </div>

            {/* Hendel */}
            <Control
              a={A.lever}
              className={`cc-ctl--lever ${pulling ? "is-pulling" : ""}`}
              side={compact ? "below" : "left"}
              plate="Hendel: nieuw plan"
              onPointerDown={onLeverDown}
              onPointerMove={onLeverMove}
              onPointerUp={onLeverUp}
              onPointerCancel={onLeverUp}
              onKeyDown={onLeverKey}
              disabled={disabled}
              aria-label="Trek aan de hendel voor een nieuw plan"
              style={{ left: pct(A.lever.x + (A.leverEnd.x - A.lever.x) * pull), top: pct(A.lever.y + (A.leverEnd.y - A.lever.y) * pull), "--r": A.lever.r } as CSSProperties}
            />

            {/* Experimentele afdeling: de rail op de voorkant */}
            <div className="cc-rail" style={{ left: pct(A.rail.x), top: pct(A.rail.y) }}>
              <RunawayButton onCaught={caught} disabled={disabled} range={railPx} />
            </div>

            {jammed && (
              <div className="jam-overlay" role="alert">
                <p>MACHINE VASTGELOPEN</p>
                <button type="button" className="btn btn--terra" onClick={unjam} autoFocus>
                  Tik tegen de machine
                </button>
              </div>
            )}
            {emergency && (
              <div className="emergency-banner" role="alert">
                <strong>NOODSTOP</strong>
                <span>Ideeën worden veilig opgeborgen…</span>
              </div>
            )}
            {errorWin && (
              <div className="retro-window" role="alertdialog" aria-modal="false" aria-labelledby="err-title" aria-describedby="err-desc">
                <div className="retro-window__bar">
                  <span id="err-title">Rust.exe</span>
                  <span aria-hidden="true">✕</span>
                </div>
                <div className="retro-window__body">
                  <span className="retro-window__icon" aria-hidden="true">!</span>
                  <p id="err-desc">
                    <strong>Fout 404: rustmoment niet gevonden.</strong>
                    <br />
                    Het gevraagde rustmoment is verplaatst, verwijderd of heeft nooit bestaan.
                  </p>
                </div>
                <div className="retro-window__actions">
                  <button ref={errorOk} type="button" onClick={() => setErrorWin(false)}>
                    OK
                  </button>
                  <button type="button" onClick={() => setErrorWin(false)}>
                    Later opnieuw proberen
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobiel: de rest van de bediening in een uitklapbare lade onder de console */}
          {compact && (
            <div className={`cc-drawer ${drawer ? "is-open" : ""}`}>
              <button type="button" className="cc-drawer__toggle" aria-expanded={drawer} aria-controls="cc-lade" onClick={() => setDrawer(!drawer)}>
                <span>Bedieningslade</span>
                <span className="label">{drawer ? "Inklappen" : "Meer knoppen"}</span>
              </button>
              <div id="cc-lade" className="cc-drawer__body" hidden={!drawer}>
                <button type="button" className="cc-tile cc-tile--boter" onClick={finishProject} disabled={disabled || progress !== null}>
                  <span className="cc-tile__icon cc-tile__icon--key" aria-hidden="true" />
                  {finishLabel}
                </button>
                <button type="button" className="cc-tile cc-tile--blauw" onClick={buyDomain} disabled={disabled}>
                  <span className="cc-tile__icon cc-tile__icon--coin" aria-hidden="true" />
                  Nog een domeinnaam kopen
                </button>
                <button type="button" role="switch" aria-checked={serious} className="cc-tile cc-tile--nacht" onClick={toggleSerious} disabled={disabled}>
                  <span className="cc-tile__icon cc-tile__icon--switch" aria-hidden="true" />
                  Serieuze modus
                </button>
                <div className="cc-tile cc-tile--lila cc-tile--group" role="group" aria-label="Instellingen">
                  {TOGGLES.map((k) => (
                    <button key={k} type="button" role="switch" aria-checked={switches[k]} className="cc-toggle" onClick={() => toggleSwitch(k)} disabled={disabled}>
                      <span className="cc-toggle__track" aria-hidden="true" />
                      {k}
                    </button>
                  ))}
                </div>
                <div className="cc-tile cc-tile--creme cc-tile--wide">
                  <span>Creativiteit {level}/10</span>
                  {steps}
                </div>
                <p className="cc-drawer__meters">
                  Belasting {Math.round(load)}% · Voortgang {progress ?? 0}%
                </p>
              </div>
            </div>
          )}

          {/* Uitvoerstation: wat de installatie aflevert */}
          <div className="cc-out">
            <div className="cc-out__bay">
              <span className="label">Printer · bonnetjes</span>
              <div className="receipts" role="group" aria-label="Bonnetjes">
                {receipts.length === 0 && <span className="cc-out__empty">Nog geen domeinnamen gekocht. Dat verandert vast.</span>}
                {receipts.map((r, i) => (
                  <div key={r.name + i} className="receipt">
                    <span className="label">Bon · niet echt</span>
                    <strong>{r.name}</strong>
                    <span>€ 0,00</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="cc-out__bay">
              <span className="label">Capsulebak · plannen</span>
              <ul className="tray" aria-label="Uitgerolde plannen">
                {capsules.length === 0 && <li className="cc-out__empty">Trek aan de hendel voor een plan.</li>}
                {capsules.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      className={`capsule ${c.open ? "is-open" : ""}`}
                      style={{ "--cap": c.color } as CSSProperties}
                      onClick={() => setCapsules((cs) => cs.map((x) => (x.id === c.id ? { ...x, open: !x.open } : x)))}
                      aria-expanded={c.open}
                      aria-label={c.open ? `Plan: ${c.plan}` : "Gesloten capsule openen"}
                    >
                      {c.open ? <span className="capsule__plan">{c.plan}</span> : <span className="capsule__shell" />}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {compact && (
              <div className="cc-out__bay cc-out__bay--log">
                <span className="label">Logboek</span>
                {logList}
              </div>
            )}
            {game.secretUnlocked && (
              <Link to="/museum#zaal-6" className="label secret-link">
                → Naar de geheime zaal
              </Link>
            )}
          </div>
        </section>

        <p className="control__footnote label">
          Tip: de draaiknop werkt ook met de pijltjestoetsen, de hendel kunt u naar beneden slepen. Er is een geheime combinatie van schakelaars.
        </p>
      </div>
    </div>
  );
}
