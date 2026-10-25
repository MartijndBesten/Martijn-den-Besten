import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { generateDomain, generateIdea, PLANS, STUCK_AT_99, type Domain } from "../content/generators";
import { pickFresh, shuffle } from "../lib/random";
import { sfx } from "../lib/sound";
import { usePrefersReducedMotion } from "../lib/hooks";
import { useGame } from "../state/GameState";
import { Link } from "../router";
import "../styles/control.css";

type LogLine = { id: number; text: string; tone?: "ok" | "warn" | "err" };
type Capsule = { id: number; plan: string; color: string; open: boolean };

const CAPSULE_COLORS = ["#f2785c", "#3c5bd6", "#9fc39a", "#f6d36b", "#c3b2f0", "#191b2e"];
const LOAD_PER_ACTION = 9;

/** De creativiteitsplant groeit mee met de draaiknop. Bij 11 gaat de bloem draaien. */
function Plant({ level }: { level: number }) {
  const h = 14 + Math.min(level, 10) * 6.5;
  const leaves = Math.floor(Math.min(level, 10) / 2);
  return (
    <svg viewBox="0 0 80 110" className={`plant ${level >= 11 ? "is-eleven" : ""}`} aria-hidden="true">
      <path d={`M40 88V${88 - h}`} stroke="#35603b" strokeWidth="3" strokeLinecap="round" className="plant__stem" />
      {Array.from({ length: leaves }, (_, i) => {
        const y = 82 - i * 12;
        const left = i % 2 === 0;
        return (
          <path
            key={i}
            className="plant__leaf"
            d={left ? `M40 ${y}c-6-8-16-8-20-4 6 6 14 8 20 4z` : `M40 ${y}c6-8 16-8 20-4-6 6-14 8-20 4z`}
            fill="#9fc39a"
            stroke="#191b2e"
            strokeWidth="1.4"
          />
        );
      })}
      {level >= 8 && (
        <g className="plant__flower" style={{ transformOrigin: `40px ${88 - h}px` }}>
          {Array.from({ length: 6 }, (_, i) => (
            <ellipse key={i} cx="40" cy={88 - h - 7} rx="4" ry="7" fill="#f6d36b" stroke="#191b2e" strokeWidth="1.2" transform={`rotate(${i * 60} 40 ${88 - h})`} />
          ))}
          <circle cx="40" cy={88 - h} r="4.5" fill="#f2785c" stroke="#191b2e" strokeWidth="1.2" />
        </g>
      )}
      <path d="M24 88h32l-4 18H28z" fill="#f2785c" stroke="#191b2e" strokeWidth="1.6" strokeLinejoin="round" />
      <rect x="21" y="84" width="38" height="8" rx="3" fill="#d4502f" stroke="#191b2e" strokeWidth="1.6" />
    </svg>
  );
}

/** Een knop die wegloopt voor de muis. Met het toetsenbord lukt het meteen; op een touchscreen na twee pogingen. */
function RunawayButton({ onCaught, disabled }: { onCaught: () => void; disabled: boolean }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [tries, setTries] = useState(0);
  const pointer = useRef<string>("");
  const reduced = usePrefersReducedMotion();
  const limit = 5;
  const dodge = () => {
    sfx.tick();
    setTries((t) => t + 1);
    const ang = Math.random() * Math.PI * 2;
    setPos({ x: Math.round(Math.cos(ang) * 70), y: Math.round(Math.sin(ang) * 26) });
  };
  return (
    <button
      type="button"
      className={`runaway ${tries >= limit ? "is-tired" : ""}`}
      style={{ transform: `translate(${pos.x}px, ${pos.y}px) rotate(${pos.x / 12}deg)` }}
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
        setPos({ x: 0, y: 0 });
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
  const [errorWin, setErrorWin] = useState(false);
  const [receipts, setReceipts] = useState<Domain[]>([]);
  const [cover, setCover] = useState(false);
  const [emergency, setEmergency] = useState(false);
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const capsuleId = useRef(1);
  const [pull, setPull] = useState(0);
  const [pulling, setPulling] = useState(false);
  const [switches, setSwitches] = useState({ koffie: false, ambitie: false, realisme: true });
  const lastIdea = useRef<string | undefined>(undefined);
  const lastStuck = useRef<string | undefined>(undefined);
  const errorOk = useRef<HTMLButtonElement>(null);

  const addLog = useCallback((text: string, tone?: LogLine["tone"]) => {
    setLog((l) => [{ id: logId.current++, text, tone }, ...l].slice(0, 6));
  }, []);

  // Belasting zakt langzaam terug.
  useEffect(() => {
    if (jammed) return;
    const iv = window.setInterval(() => {
      loadRef.current = Math.max(0, loadRef.current - 2);
      setLoad(loadRef.current);
    }, 400);
    return () => window.clearInterval(iv);
  }, [jammed]);

  const act = useCallback(
    (amount = LOAD_PER_ACTION): boolean => {
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
    [jammed, emergency, addLog, completeMission],
  );

  // ---------- Knoppen ----------

  const newIdea = () => {
    if (!act()) return;
    sfx.blip();
    let idea = generateIdea();
    while (idea.title === lastIdea.current) idea = generateIdea();
    lastIdea.current = idea.title;
    setOutput({ title: idea.title, body: idea.description });
    addLog(`Nieuw idee ${idea.serial} gestart`, "ok");
  };

  const finishProject = () => {
    if (progress !== null || !act(14)) return;
    sfx.click();
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

  const doNothing = () => {
    if (!act(4)) return;
    if (nothingCount >= 3) {
      sfx.success();
      setOutput({ title: "Goed bezig!", body: "U heeft iets gedaan: u heeft op een knop gedrukt. De knop ‘Even niets doen’ is hierdoor in de war geraakt.", tone: "ok" });
      addLog("Iets gedaan (onbedoeld)", "ok");
      findEgg("nothing-flip");
      setNothingCount(0);
      return;
    }
    sfx.error();
    setErrorWin(true);
    setNothingCount((c) => c + 1);
    addLog("Fout 404: rustmoment niet gevonden", "err");
  };

  useEffect(() => {
    if (errorWin) errorOk.current?.focus();
  }, [errorWin]);

  const buyDomain = () => {
    if (!act()) return;
    sfx.clunk();
    const d = generateDomain();
    setReceipts((r) => [d, ...r].slice(0, 3));
    setOutput({ title: `Domein ‘${d.name}’ (niet echt) gekocht`, body: `${d.reason} Prijs: € 0,00. Er is niets geregistreerd; deze extensie bestaat niet eens.` });
    addLog(`Domeinnaam bedacht: ${d.name}`);
  };

  const changeCreativity = (next: number) => {
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
    sfx.click();
    addLog("Serieuze modus geactiveerd");
    setSerious(true);
  };

  const pressEmergency = () => {
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
    setCapsules((c) => [...c.slice(-5), { id, plan, color: CAPSULE_COLORS[id % CAPSULE_COLORS.length], open: false }]);
    setOutput({ title: "Nieuw plan uit de machine gerold", body: `Open de capsule om het plan te bekijken. (Spoiler: ${plan.toLowerCase()}.)` });
    addLog("Hendel overgehaald: 1 nieuw plan");
  };

  // Hendel: slepen naar beneden of gewoon klikken.
  const leverStart = useRef<{ y: number; moved: boolean } | null>(null);
  const onLeverDown = (e: PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    leverStart.current = { y: e.clientY, moved: false };
    setPulling(true);
  };
  const onLeverMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (!leverStart.current) return;
    const dy = e.clientY - leverStart.current.y;
    if (Math.abs(dy) > 6) leverStart.current.moved = true;
    setPull(Math.max(0, Math.min(1, dy / 90)));
  };
  const onLeverUp = () => {
    const s = leverStart.current;
    leverStart.current = null;
    setPulling(false);
    if (s && (!s.moved || pull > 0.55)) {
      setPull(1);
      triggerLever();
      window.setTimeout(() => setPull(0), 260);
    } else setPull(0);
  };
  const onLeverKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setPull(1);
      triggerLever();
      window.setTimeout(() => setPull(0), 260);
    }
  };

  const toggleSwitch = (key: keyof typeof switches) => {
    if (jammed || emergency) return;
    sfx.click();
    const next = { ...switches, [key]: !switches[key] };
    setSwitches(next);
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

  const knobAngle = eleven ? 150 : -135 + creativity * 27;
  const level = eleven ? 11 : creativity;
  const sparkles = reduced ? 0 : Math.max(0, level - 2) * 2;
  const disabled = jammed || emergency;

  return (
    <div className="page control">
      <section className="page-hero wrap control__hero" aria-labelledby="cc-title">
        <div>
          <span className="dept-no">Afd. 02 — Technische Dienst</span>
          <h1 id="cc-title">
            Martijn Control <em>Center</em>
          </h1>
          <p className="lede">Bedieningsinstructies: druk op alles. De machine is getest door niemand en goedgekeurd door iedereen die hem niet heeft gebruikt.</p>
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
        <div
          className={`console level-${Math.min(level, 11)} ${jammed ? "is-jammed" : ""} ${emergency ? "is-emergency" : ""}`}
          style={{ "--c": level / 10 } as CSSProperties}
        >
          {sparkles > 0 && (
            <div className="console__sparkles" aria-hidden="true">
              {Array.from({ length: sparkles }, (_, i) => (
                <span key={i} style={{ left: `${(i * 53) % 100}%`, top: `${(i * 37) % 100}%`, animationDelay: `${-i * 0.37}s`, background: CAPSULE_COLORS[i % 6] }} />
              ))}
            </div>
          )}
          {emergency && (
            <div className="beacon" aria-hidden="true">
              <span />
            </div>
          )}

          <div className="console__head" aria-hidden="true">
            <span>Instrumentenpaneel · model MdB-2</span>
            <span className="console__lamps">
              {Array.from({ length: 11 }, (_, i) => (
                <i key={i} className={i < level ? "is-on" : ""} />
              ))}
            </span>
            <span>Creativiteit {level}/10</span>
          </div>

          {/* Scherm */}
          <div className="console__screen module" style={{ "--i": 0 } as CSSProperties}>
            <div className="screen">
              <div className="screen__top">
                <span className="label">Uitvoerscherm · CRT-model 1987</span>
                <button type="button" className="screen__sound" aria-pressed={sound} onClick={() => setSound(!sound)}>
                  Geluid: {sound ? "aan" : "uit"}
                </button>
              </div>
              <div className={`screen__output ${output.tone ? `is-${output.tone}` : ""}`} aria-live="polite" aria-atomic="true">
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
              <ol className="screen__log" aria-label="Logboek">
                {log.map((l) => (
                  <li key={l.id} className={l.tone ? `is-${l.tone}` : ""}>
                    {"> "}
                    {l.text}
                  </li>
                ))}
              </ol>
            </div>
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

          {/* Belastingsmeter */}
          <div className="module module--gauge bg-ivory" style={{ "--i": 1 } as CSSProperties}>
            <span className="module__label">Machinebelasting</span>
            <svg viewBox="0 0 200 124" className="gauge" role="img" aria-label={`Machinebelasting ${Math.round(load)} procent`}>
              <path d="M20 110a80 80 0 0 1 56.6-76.5" fill="none" stroke="#9fc39a" strokeWidth="12" />
              <path d="M76.6 33.5a80 80 0 0 1 73.9 14.8" fill="none" stroke="#f6d36b" strokeWidth="12" />
              <path d="M150.6 48.4a80 80 0 0 1 29.4 61.6" fill="none" stroke="#f2785c" strokeWidth="12" />
              <text x="168" y="34" textAnchor="middle" fontFamily="Geist Mono" fontSize="7.5" fontWeight="600" fill="currentColor">VEEL TE VEEL</text>
              {Array.from({ length: 21 }, (_, i) => {
                const a = Math.PI + (i / 20) * Math.PI;
                const r1 = i % 5 ? 72 : 66;
                return <line key={i} x1={100 + Math.cos(a) * r1} y1={110 + Math.sin(a) * r1} x2={100 + Math.cos(a) * 78} y2={110 + Math.sin(a) * 78} stroke="currentColor" strokeWidth={i % 5 ? 0.8 : 1.4} />;
              })}
              {[0, 50, 100].map((v) => {
                const a = Math.PI + (v / 100) * Math.PI;
                return (
                  <text key={v} x={100 + Math.cos(a) * 54} y={110 + Math.sin(a) * 54 + 3} textAnchor="middle" fontFamily="Geist Mono" fontSize="8" fill="currentColor">
                    {v}
                  </text>
                );
              })}
              <g style={{ transform: `rotate(${-90 + load * 1.8}deg)`, transformOrigin: "100px 110px", transition: "transform .5s cubic-bezier(.34,1.4,.64,1)" }}>
                <path d="M100 116L100 40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </g>
              <circle cx="100" cy="110" r="8" fill="#f2785c" stroke="currentColor" strokeWidth="2" />
            </svg>
            <span className="label">{Math.round(load)}% {load > 75 ? "· rustig aan!" : ""}</span>
          </div>

          {/* Nieuw idee */}
          <div className="module module--idea bg-koraal" style={{ "--i": 2 } as CSSProperties}>
            <span className="module__label">Ideeënafdeling</span>
            <button type="button" className="arcade" onClick={newIdea} disabled={disabled}>
              <span className="arcade__cap">
                <span>Nieuw idee starten</span>
              </span>
            </button>
          </div>

          {/* Project afronden */}
          <div className="module module--finish bg-boter" style={{ "--i": 3 } as CSSProperties}>
            <span className="module__label">Afrondingsafdeling</span>
            <button type="button" className="keybtn" onClick={finishProject} disabled={disabled || progress !== null}>
              <span className="keybtn__key" aria-hidden="true">
                <svg viewBox="0 0 40 40">
                  <circle cx="14" cy="20" r="9" fill="none" stroke="currentColor" strokeWidth="4" />
                  <path d="M23 20h14M32 20v6M37 20v5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
              {progress !== null ? "Bezig met afronden…" : "Project afronden"}
            </button>
          </div>

          {/* Even niets doen */}
          <div className="module module--nothing bg-salie" style={{ "--i": 4 } as CSSProperties}>
            <span className="module__label">Rustafdeling</span>
            <button type="button" className={`pillow ${nothingCount >= 3 ? "is-flipped" : ""}`} onClick={doNothing} disabled={disabled}>
              {nothingCount >= 3 ? "Toch maar iets doen" : "Even niets doen"}
            </button>
            <span className="label">Pogingen vandaag: {nothingCount}</span>
          </div>

          {/* Domeinnaam */}
          <div className="module module--domain bg-kobalt-soft" style={{ "--i": 5 } as CSSProperties}>
            <span className="module__label">Domeinbeheer</span>
            <button type="button" className="coinslot" onClick={buyDomain} disabled={disabled}>
              <span className="coinslot__slot" aria-hidden="true" />
              Nog een domeinnaam kopen
            </button>
            <div className="receipts" role="group" aria-label="Bonnetjes">
              {receipts.map((r, i) => (
                <div key={r.name + i} className="receipt">
                  <span className="label">Bon · niet echt</span>
                  <strong>{r.name}</strong>
                  <span>€ 0,00</span>
                </div>
              ))}
            </div>
          </div>

          {/* Draaiknop */}
          <div className="module module--knob bg-ivory" style={{ "--i": 6 } as CSSProperties}>
            <span className="module__label" id="knob-label">Creativiteit</span>
            <div className="knob-wrap">
              <div className="knob-scale" aria-hidden="true">
                {Array.from({ length: 11 }, (_, i) => (
                  <span key={i} style={{ transform: `rotate(${-135 + i * 27}deg)` }}>
                    <b style={{ transform: `rotate(${135 - i * 27}deg)` }}>{i}</b>
                  </span>
                ))}
              </div>
              <div
                ref={knobRef}
                className="knob"
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
              >
                <div className="knob__cap" style={{ transform: `rotate(${knobAngle}deg)` }}>
                  <span className="knob__marker" />
                </div>
              </div>
            </div>
            <Plant level={level} />
            <div className="knob-buttons">
              <button type="button" className="btn btn--small btn--ivory" onClick={() => changeCreativity(creativity - 1)} disabled={disabled} aria-label="Creativiteit omlaag">
                −
              </button>
              <span className="knob-value" aria-hidden="true">{level}</span>
              <button type="button" className="btn btn--small" onClick={() => changeCreativity(creativity + 1)} disabled={disabled} aria-label="Creativiteit omhoog">
                +
              </button>
            </div>
          </div>

          {/* Serieuze modus */}
          <div className="module module--serious bg-indigo" style={{ "--i": 7 } as CSSProperties}>
            <span className="module__label">Serieuze modus</span>
            <button type="button" role="switch" aria-checked={serious} className="bigswitch" onClick={toggleSerious} disabled={disabled}>
              <span className="bigswitch__track">
                <span className="bigswitch__thumb" />
              </span>
              <span className="visually-hidden">Serieuze modus</span>
            </button>
            <span className="label">Houdbaarheid: 15 seconden</span>
          </div>

          {/* Hendel */}
          <div className="module module--lever bg-lila" style={{ "--i": 8 } as CSSProperties}>
            <span className="module__label">Nieuwe plannen</span>
            <div className="lever-wrap">
              <div className="lever-slot" aria-hidden="true" />
              <button
                type="button"
                className={`lever ${pulling ? "is-pulling" : ""}`}
                style={{ "--pull": pull } as CSSProperties}
                onPointerDown={onLeverDown}
                onPointerMove={onLeverMove}
                onPointerUp={onLeverUp}
                onPointerCancel={onLeverUp}
                onKeyDown={onLeverKey}
                disabled={disabled}
                aria-label="Trek aan de hendel voor een nieuw plan"
              >
                <span className="lever__arm" />
                <span className="lever__ball" />
              </button>
              <div className="chute" aria-hidden="true" />
            </div>
            <ul className="tray" aria-label="Uitgerolde plannen">
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

          {/* Geheime schakelaars */}
          <div className="module module--switches bg-ivory" style={{ "--i": 9 } as CSSProperties}>
            <span className="module__label">Instellingen</span>
            <div className="toggles">
              {(["koffie", "ambitie", "realisme"] as const).map((k) => (
                <button key={k} type="button" role="switch" aria-checked={switches[k]} className="toggle" onClick={() => toggleSwitch(k)} disabled={disabled}>
                  <span className="toggle__track">
                    <span className="toggle__thumb" />
                  </span>
                  <span className="toggle__label">{k}</span>
                </button>
              ))}
            </div>
            {game.secretUnlocked && (
              <Link to="/museum#zaal-6" className="label secret-link">
                → Naar de geheime zaal
              </Link>
            )}
          </div>

          {/* Weglopende knop */}
          <div className="module module--runaway bg-koraal" style={{ "--i": 10 } as CSSProperties}>
            <span className="module__label">Experimentele afdeling</span>
            <div className="runaway-track">
              <RunawayButton onCaught={caught} disabled={disabled} />
            </div>
            <span className="label">Let op: deze knop is schuw.</span>
          </div>

          {/* Noodstop */}
          <div className="module module--stop bg-ivory" style={{ "--i": 11 } as CSSProperties}>
            <span className="module__label">Officiële noodstop</span>
            <div className="stop-wrap">
              <button
                type="button"
                className={`stop ${cover ? "is-open" : ""}`}
                onClick={pressEmergency}
                disabled={emergency || jammed}
                aria-label={cover ? "Druk op de officiële noodstop" : "Open het beschermkapje van de noodstop"}
              >
                <span className="stop__ring" aria-hidden="true" />
                <span className="stop__button" aria-hidden="true">STOP</span>
                <span className="stop__cover" aria-hidden="true" />
              </button>
            </div>
            <span className="label">{cover ? "Kapje open. Weet u het zeker?" : "Eerst het kapje openen"}</span>
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
        </div>

        <p className="control__footnote label">
          Tip: de draaiknop werkt ook met de pijltjestoetsen, de hendel kunt u naar beneden slepen. Er is een geheime combinatie van schakelaars.
        </p>
      </div>
    </div>
  );
}
