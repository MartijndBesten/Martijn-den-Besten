import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { ROOMS, SECRET_ROOM, type Exhibit, type Room } from "../../shared/museum";
import { generateDomain, REEL_WHAT, REEL_WHO, REEL_WHY, TOUR_LINES, type Domain } from "../content/generators";
import { pick, shuffle } from "../lib/random";
import { sfx } from "../lib/sound";
import { useInView, usePrefersReducedMotion } from "../lib/hooks";
import { api, type PublicIdea } from "../lib/api";
import { useGame } from "../state/GameState";
import { Artwork } from "../components/Artwork";
import { Dialog } from "../components/Dialog";
import { VoteButton } from "../components/VoteButton";
import { IdeaForm } from "../components/IdeaForm";
import { Shapes } from "../components/Shapes";
import "../styles/museum.css";

// ---------- Plattegrond ----------

function FloorPlan({ secret, onCrack }: { secret: boolean; onCrack: () => void }) {
  const rooms = [
    { n: 1, x: 10, y: 10, w: 120, h: 90, c: "#2a3bdb", t: "#fff4e0" },
    { n: 2, x: 140, y: 10, w: 100, h: 90, c: "#ffd24d", t: "#17153a" },
    { n: 3, x: 250, y: 10, w: 140, h: 90, c: "#c6b3ff", t: "#17153a" },
    { n: 4, x: 10, y: 110, w: 180, h: 80, c: "#34c77b", t: "#17153a" },
    { n: 5, x: 200, y: 110, w: 120, h: 80, c: "#ff5c47", t: "#17153a" },
  ];
  return (
    <nav className="floorplan" aria-label="Plattegrond van het museum">
      <svg viewBox="0 0 400 200">
        <rect x="2" y="2" width="396" height="196" rx="14" fill="#fff4e0" stroke="#17153a" strokeWidth="4" />
        {rooms.map((r) => (
          <a key={r.n} href={`#zaal-${r.n}`} aria-label={`Zaal ${r.n}: ${ROOMS[r.n - 1].title}`}>
            <rect className="floorplan__room" x={r.x} y={r.y} width={r.w} height={r.h} rx="10" fill={r.c} stroke="#17153a" strokeWidth="3.5" />
            <text x={r.x + 14} y={r.y + 34} fill={r.t} fontFamily="Bricolage, sans-serif" fontWeight="800" fontSize="28">
              {r.n}
            </text>
            <text x={r.x + 14} y={r.y + r.h - 12} fill={r.t} fontFamily="Space Mono, monospace" fontWeight="700" fontSize="9">
              {ROOMS[r.n - 1].title.toUpperCase().slice(0, 18)}
            </text>
          </a>
        ))}
        {secret ? (
          <a href="#zaal-6" aria-label="Zaal 6: De Geheime Zaal">
            <rect className="floorplan__room floorplan__room--secret" x="330" y="110" width="60" height="80" rx="10" fill="#17153a" stroke="#17153a" strokeWidth="3.5" />
            <text x="344" y="144" fill="#ffd24d" fontFamily="Bricolage, sans-serif" fontWeight="800" fontSize="28">
              6
            </text>
          </a>
        ) : (
          <g>
            <rect x="330" y="110" width="60" height="80" rx="10" fill="#efe1c6" stroke="#17153a" strokeWidth="3.5" strokeDasharray="6 6" />
            <text x="340" y="156" fill="#17153a" fontFamily="Space Mono, monospace" fontSize="9" opacity="0.7">
              MUUR
            </text>
          </g>
        )}
      </svg>
      {!secret && (
        <button type="button" className="crack" onClick={onCrack} aria-label="Een barstje in de muur">
          <svg viewBox="0 0 20 40" aria-hidden="true">
            <path d="M10 0l-4 10 6 6-5 9 5 6-3 9" fill="none" stroke="#17153a" strokeWidth="2" />
          </svg>
        </button>
      )}
    </nav>
  );
}

// ---------- Museumstuk ----------

function ExhibitCard({ e, room, highlighted, onOpen }: { e: Exhibit; room: Room; highlighted: boolean; onOpen: (e: Exhibit) => void }) {
  return (
    <article id={`stuk-${e.id}`} className={`exhibit ${highlighted ? "is-highlighted" : ""}`}>
      <button type="button" className="exhibit__frame" onClick={() => onOpen(e)} aria-label={`Bekijk ${e.title}`}>
        <Artwork seed={e.seed} label={e.title} />
      </button>
      <div className="plaque">
        <h3>{e.title}</h3>
        <dl>
          <dt>Datering</dt>
          <dd>{e.year}</dd>
          <dt>Materiaal</dt>
          <dd>{e.material}</dd>
          <dt>Status</dt>
          <dd>{e.status}</dd>
        </dl>
        <div className="plaque__actions">
          <VoteButton id={e.id} label={e.title} />
          <button type="button" className="linkish" onClick={() => onOpen(e)}>
            Lees het bordje
          </button>
        </div>
      </div>
      <span className="exhibit__room label" aria-hidden="true">
        Zaal {room.number}
      </span>
    </article>
  );
}

// ---------- Zaal 2: bijna af ----------

const FINISH_EXCUSES = ["Er kwam iets tussen.", "Er is een betere versie bedacht.", "Eerst even koffie.", "Morgen verder.", "Bijna! Nog één dingetje."];

function AlmostDone({ e, highlighted, onOpen }: { e: Exhibit; highlighted: boolean; onOpen: (e: Exhibit) => void }) {
  const base = e.progress ?? 95;
  const [p, setP] = useState(base);
  const [msg, setMsg] = useState("");
  const { findEgg } = useGame();
  const finish = () => {
    sfx.tick();
    setP(Math.min(99.9, base + 1 + Math.random()));
    window.setTimeout(() => {
      setP(base);
      setMsg(pick(FINISH_EXCUSES));
      sfx.error();
    }, 900);
  };
  return (
    <article id={`stuk-${e.id}`} className={`almost ${highlighted ? "is-highlighted" : ""}`}>
      <div className="almost__art">
        <Artwork seed={e.seed} label={e.title} />
      </div>
      <div className="almost__body">
        <h3>{e.title}</h3>
        <p className="label">{e.year} · {e.material}</p>
        <div className="almost__barwrap">
          <div className="almost__bar" role="progressbar" aria-label={`Voortgang ${e.title}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(p * 10) / 10}>
            <span style={{ width: `${p}%` }} />
            <b>{p.toFixed(1).replace(".", ",")}%</b>
          </div>
          {e.id === "handleiding" && (
            <button type="button" className="almost__hidden" aria-label="Verborgen knop in de laatste 0,1 procent" onClick={() => findEgg("hidden-2")} />
          )}
        </div>
        <p className="almost__status">{e.status}</p>
        <div className="plaque__actions">
          <button type="button" className="btn btn--small btn--creme" onClick={finish}>
            Afmaken
          </button>
          <VoteButton id={e.id} label={e.title} />
          <button type="button" className="linkish" onClick={() => onOpen(e)}>
            Lees het bordje
          </button>
        </div>
        <p className="almost__msg" aria-live="polite">{msg}</p>
      </div>
    </article>
  );
}

// ---------- Zaal 3: domeinen ----------

function DomainVitrine({ e, highlighted, onOpen }: { e: Exhibit; highlighted: boolean; onOpen: (e: Exhibit) => void }) {
  return (
    <article id={`stuk-${e.id}`} className={`vitrine ${highlighted ? "is-highlighted" : ""}`}>
      <div className="vitrine__glass">
        <span className="vitrine__domain">{e.title}</span>
      </div>
      <div className="vitrine__tag">
        <p className="label">{e.year}</p>
        <p>
          <strong>{e.status}</strong> · {e.material}
        </p>
        <div className="plaque__actions">
          <VoteButton id={e.id} label={e.title} />
          <button type="button" className="linkish" onClick={() => onOpen(e)}>
            Lees het bordje
          </button>
        </div>
      </div>
    </article>
  );
}

function DomainMill() {
  const [items, setItems] = useState<Domain[]>([]);
  return (
    <div className="mill">
      <button
        type="button"
        className="btn btn--kobalt"
        onClick={() => {
          sfx.clunk();
          setItems((x) => [generateDomain(), ...x].slice(0, 4));
        }}
      >
        Draai aan de domeinmolen
      </button>
      <ul className="mill__list" aria-live="polite">
        {items.map((d, i) => (
          <li key={d.name + i}>
            <strong>{d.name}</strong> <span>{d.reason}</span>
          </li>
        ))}
      </ul>
      <p className="label">Niets wordt echt geregistreerd. De extensies bestaan niet eens.</p>
    </div>
  );
}

// ---------- Zaal 4: generator ----------

function Generator({ onSubmit }: { onSubmit: (title: string) => void }) {
  const [vals, setVals] = useState<[string, string, string]>([REEL_WHAT[0], REEL_WHO[0], REEL_WHY[0]]);
  const [spinning, setSpinning] = useState(false);
  const [count, setCount] = useState(0);
  const reduced = usePrefersReducedMotion();

  const spin = () => {
    if (spinning) return;
    sfx.clunk();
    setSpinning(true);
    const final: [string, string, string] = [pick(REEL_WHAT), pick(REEL_WHO), pick(REEL_WHY)];
    if (reduced) {
      setVals(final);
      setSpinning(false);
      setCount((c) => c + 1);
      return;
    }
    let n = 0;
    const iv = window.setInterval(() => {
      n++;
      sfx.tick();
      setVals([n < 8 ? pick(REEL_WHAT) : final[0], n < 12 ? pick(REEL_WHO) : final[1], n < 16 ? pick(REEL_WHY) : final[2]]);
      if (n >= 16) {
        window.clearInterval(iv);
        setSpinning(false);
        setCount((c) => c + 1);
        sfx.success();
      }
    }, 70);
  };

  const title = `${vals[0]} ${vals[1]} ${vals[2]}`;

  return (
    <div className="slot">
      <div className="slot__machine">
        <div className="slot__top label">Ideeëngenerator · model ‘Altijd Aan’</div>
        <div className={`slot__reels ${spinning ? "is-spinning" : ""}`} aria-live={spinning ? "off" : "polite"} aria-atomic="true">
          <div className="reel"><span className="label">Wat</span><strong>{vals[0]}</strong></div>
          <div className="reel"><span className="label">Voor wie</span><strong>{vals[1]}</strong></div>
          <div className="reel"><span className="label">Waarom</span><strong>{vals[2]}</strong></div>
        </div>
        <div className="slot__actions">
          <button type="button" className="btn btn--koraal" onClick={spin} disabled={spinning}>
            {spinning ? "De machine denkt…" : "Genereer een idee"}
          </button>
          {count > 0 && !spinning && (
            <button type="button" className="btn btn--creme" onClick={() => onSubmit(title.slice(0, 80))}>
              Dien in bij het loket
            </button>
          )}
        </div>
        <p className="label slot__count">Gegenereerd tijdens dit bezoek: {count} · mogelijke combinaties: {REEL_WHAT.length * REEL_WHO.length * REEL_WHY.length}</p>
      </div>
    </div>
  );
}

// ---------- Zaal 5: mistige toekomst ----------

function FutureCard({ e, highlighted, onOpen }: { e: Exhibit; highlighted: boolean; onOpen: (e: Exhibit) => void }) {
  const [clear, setClear] = useState(false);
  return (
    <article id={`stuk-${e.id}`} className={`future ${clear ? "is-clear" : ""} ${highlighted ? "is-highlighted" : ""}`}>
      <div className="future__fog" aria-hidden="true" />
      <p className="label future__date">{e.year}</p>
      <h3>{e.title}</h3>
      <p>{e.status}</p>
      <div className="plaque__actions">
        <button type="button" className="btn btn--small btn--creme" aria-pressed={clear} onClick={() => setClear((c) => !c)}>
          {clear ? "Mist terug" : "Wrijf de mist weg"}
        </button>
        <VoteButton id={e.id} label={e.title} />
        <button type="button" className="linkish" onClick={() => onOpen(e)}>
          Lees het bordje
        </button>
      </div>
    </article>
  );
}

function Countdown() {
  const [s, setS] = useState(197);
  const [idea, setIdea] = useState("");
  useEffect(() => {
    const iv = window.setInterval(
      () =>
        setS((x) => {
          if (x <= 1) {
            setIdea(`${pick(REEL_WHAT)} ${pick(REEL_WHO)}`);
            return 197;
          }
          return x - 1;
        }),
      1000,
    );
    return () => window.clearInterval(iv);
  }, []);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return (
    <div className="countdown">
      <span className="label">Volgend idee verwacht over</span>
      <span className="countdown__time" aria-hidden="true">00:{mm}:{ss}</span>
      <span className="visually-hidden">ongeveer {Math.ceil(s / 60)} minuten</span>
      {idea && <span className="countdown__idea">Zojuist bedacht: {idea}</span>}
    </div>
  );
}

// ---------- Zaal 6: de geheime zaal ----------

function SecretRoom() {
  const { completeMission, findEgg } = useGame();
  const [ref, seen] = useInView<HTMLElement>("-20% 0px");
  const [lights, setLights] = useState(false);
  const [found, setFound] = useState(false);
  const roomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (seen) completeMission("secret-room");
  }, [seen, completeMission]);

  const move = (e: PointerEvent<HTMLDivElement>) => {
    const el = roomRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <section id="zaal-6" ref={ref} className="room room--secret" aria-labelledby="zaal-6-title">
      <div className="wrap">
        <header className="room__head">
          <span className="room__no" aria-hidden="true">6</span>
          <div>
            <span className="dept-no">Zaal {SECRET_ROOM.number} · niet op de officiële plattegrond</span>
            <h2 id="zaal-6-title">{SECRET_ROOM.title}</h2>
            <p className="lede">
              <strong>{SECRET_ROOM.subtitle}.</strong> {SECRET_ROOM.intro}
            </p>
            <button type="button" className="btn btn--small btn--creme" aria-pressed={lights} onClick={() => setLights((l) => !l)}>
              {lights ? "Licht weer uit" : "Licht aan (voor wie geen zaklamp heeft)"}
            </button>
          </div>
        </header>
        <div ref={roomRef} className={`darkroom ${lights ? "is-lit" : ""}`} onPointerMove={move}>
          <p className="darkroom__note" style={{ left: "6%", top: "10%" }}>Hier hing vroeger een afgemaakt project. Het is uitgeleend.</p>
          <p className="darkroom__note" style={{ left: "52%", top: "16%" }}>Let op: natte verf (sinds 2019).</p>
          <p className="darkroom__note" style={{ left: "12%", top: "62%" }}>Nooduitgang → leidt naar een nieuw idee.</p>
          <p className="darkroom__note" style={{ left: "58%", top: "70%" }}>Bewaker: ‘Ik bewaak hier niets. Dat gaat heel goed.’</p>
          <button
            type="button"
            className={`darkroom__object ${found ? "is-found" : ""}`}
            style={{ left: "70%", top: "38%" }}
            onClick={() => {
              setFound(true);
              findEgg("flashlight");
              sfx.success();
            }}
          >
            <span className="darkroom__pedestal" aria-hidden="true" />
            <span>Het enige afgemaakte object</span>
          </button>
          {found && (
            <div className="darkroom__reveal" role="status">
              <h3>Deze zaal.</h3>
              <p>Status: af. Het is het enige project van het instituut dat ooit is afgerond — omdat er niets in hoefde.</p>
              <VoteButton id="geheime-zaal" label="De Geheime Zaal" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ---------- Publieksvleugel ----------

function PublicWing() {
  const [ideas, setIdeas] = useState<PublicIdea[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    void api.ideas().then((r) => (r.ok ? setIdeas(r.data.ideas) : setError(r.error)));
  }, []);
  return (
    <div className="public-wing">
      {error && <p className="form-message form-message--error">De publieksvleugel is tijdelijk gesloten: {error}</p>}
      {!error && ideas === null && <p className="label">De publieksvleugel wordt geopend…</p>}
      {ideas && ideas.length === 0 && (
        <p className="public-wing__empty">Nog geen goedgekeurde inzendingen. De directie vergadert er nog over. Wees de eerste: het loket staat hiernaast.</p>
      )}
      {ideas && ideas.length > 0 && (
        <ul className="public-wing__list">
          {ideas.map((i) => (
            <li key={i.id} className="public-card">
              <span className="label">Inzending {10000 + i.id}</span>
              <h3>{i.title}</h3>
              {i.description && <p>{i.description}</p>}
              <VoteButton id={`inzending-${i.id}`} label={i.title} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------- Pagina ----------

export default function Museum() {
  const { secretUnlocked, unlockSecret, findEgg } = useGame();
  const [open, setOpen] = useState<Exhibit | null>(null);
  const [prefill, setPrefill] = useState("");
  const [tour, setTour] = useState<{ ids: string[]; i: number; line: string } | null>(null);
  const allExhibits = useMemo(() => ROOMS.flatMap((r) => r.exhibits), []);

  const crack = () => {
    sfx.clunk();
    unlockSecret();
    findEgg("geheim");
    window.setTimeout(() => document.getElementById("zaal-6")?.scrollIntoView({ behavior: "smooth" }), 120);
  };

  useEffect(() => {
    if (!tour) return;
    const id = tour.ids[tour.i];
    document.getElementById(`stuk-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [tour]);

  const startTour = () => {
    sfx.blip();
    setTour({ ids: shuffle(allExhibits).slice(0, 5).map((e) => e.id), i: 0, line: pick(TOUR_LINES) });
  };
  const nextStop = () => {
    if (!tour) return;
    if (tour.i + 1 >= tour.ids.length) {
      setTour(null);
      return;
    }
    sfx.click();
    setTour({ ...tour, i: tour.i + 1, line: pick(TOUR_LINES) });
  };
  const highlighted = tour?.ids[tour.i];
  const current = allExhibits.find((e) => e.id === highlighted);

  const submitFromGenerator = (title: string) => {
    setPrefill(title);
    window.setTimeout(() => document.getElementById("loket-balie")?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  return (
    <div className="page museum">
      <section className="page-hero museum-hero" aria-labelledby="museum-title">
        <Shapes
          items={[
            { kind: "half", color: "lila", size: 160, top: "10%", left: "78%" },
            { kind: "star", color: "boter", size: 70, top: "70%", left: "66%" },
            { kind: "blob", color: "groen", size: 110, top: "62%", left: "90%" },
          ]}
        />
        <div className="wrap museum-hero__grid">
          <div>
            <span className="dept-no">Afd. 03 — Museum · Toegang gratis · Uitgang onvindbaar</span>
            <h1 id="museum-title">Museum van Onafgemaakte Ideeën</h1>
            <p className="lede">
              Een permanente tentoonstelling van tijdelijke plannen. Stem op uw favoriete object, laat u rondleiden of dien zelf een idee in bij het loket.
            </p>
            <div className="hero__ctas">
              <button type="button" className="btn btn--koraal" onClick={startTour}>
                Start een willekeurige rondleiding
              </button>
              <a href="#loket-balie" className="btn btn--creme">
                Naar het loket
              </a>
            </div>
          </div>
          <FloorPlan secret={secretUnlocked} onCrack={crack} />
        </div>
      </section>

      {ROOMS.map((room) => (
        <section key={room.id} id={room.id} className={`room room--${room.color}`} aria-labelledby={`${room.id}-title`} style={{ "--room": room.number } as CSSProperties}>
          <div className="wrap">
            <header className="room__head">
              <span className="room__no" aria-hidden="true">{room.number}</span>
              <div>
                <span className="dept-no">Zaal {room.number} · {room.subtitle}</span>
                <h2 id={`${room.id}-title`}>{room.title}</h2>
                <p className="lede">{room.intro}</p>
              </div>
            </header>

            {room.number === 1 && (
              <div className="gallery">
                {room.exhibits.map((e) => (
                  <ExhibitCard key={e.id} e={e} room={room} highlighted={highlighted === e.id} onOpen={setOpen} />
                ))}
              </div>
            )}
            {room.number === 2 && (
              <div className="almost-list">
                {room.exhibits.map((e) => (
                  <AlmostDone key={e.id} e={e} highlighted={highlighted === e.id} onOpen={setOpen} />
                ))}
              </div>
            )}
            {room.number === 3 && (
              <>
                <div className="vitrines">
                  {room.exhibits.map((e) => (
                    <DomainVitrine key={e.id} e={e} highlighted={highlighted === e.id} onOpen={setOpen} />
                  ))}
                </div>
                <DomainMill />
              </>
            )}
            {room.number === 4 && <Generator onSubmit={submitFromGenerator} />}
            {room.number === 5 && (
              <>
                <Countdown />
                <div className="futures">
                  {room.exhibits.map((e) => (
                    <FutureCard key={e.id} e={e} highlighted={highlighted === e.id} onOpen={setOpen} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      ))}

      {secretUnlocked && <SecretRoom />}

      <section className="wrap wing" aria-labelledby="wing-title">
        <div className="wing__grid">
          <div>
            <span className="dept-no">Publieksvleugel · gemodereerd</span>
            <h2 id="wing-title" className="section-title">Ideeën van bezoekers</h2>
            <p>Inzendingen verschijnen hier pas nadat de directie ze heeft goedgekeurd. Stemmen zijn echt en worden per dag één keer per object geteld.</p>
            <PublicWing />
          </div>
          <div id="loket-balie" className="panel bg-boter loket-desk">
            <span className="dept-no">Loket · balie 1 van 1</span>
            <h2>Dien een idee in</h2>
            <IdeaForm initialTitle={prefill} />
          </div>
        </div>
      </section>

      {tour && current && (
        <div className="guide" role="dialog" aria-label="Rondleiding" aria-live="polite">
          <div className="guide__avatar" aria-hidden="true">
            <svg viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="27" fill="#ffd24d" stroke="#17153a" strokeWidth="4" />
              <circle cx="22" cy="26" r="4" fill="#17153a" />
              <circle cx="38" cy="26" r="4" fill="#17153a" />
              <path d="M20 38q10 8 20 0" fill="none" stroke="#17153a" strokeWidth="4" strokeLinecap="round" />
              <path d="M12 14l36 0-4-8H16z" fill="#2a3bdb" stroke="#17153a" strokeWidth="3" />
            </svg>
          </div>
          <div className="guide__text">
            <span className="label">Stop {tour.i + 1} van {tour.ids.length} · {current.title}</span>
            <p>{tour.line}</p>
          </div>
          <div className="guide__actions">
            <button type="button" className="btn btn--small" onClick={nextStop} autoFocus>
              {tour.i + 1 >= tour.ids.length ? "Einde rondleiding" : "Volgende"}
            </button>
            <button type="button" className="btn btn--small btn--creme" onClick={() => setTour(null)}>
              Stop
            </button>
          </div>
        </div>
      )}

      <Dialog open={open !== null} onClose={() => setOpen(null)} title={open?.title ?? ""}>
        {open && (
          <div className="label-dialog">
            <div className="label-dialog__art">
              <Artwork seed={open.seed} label={open.title} />
            </div>
            <p>{open.text}</p>
            <dl className="label-dialog__meta">
              <dt>Datering</dt>
              <dd>{open.year}</dd>
              <dt>Materiaal</dt>
              <dd>{open.material}</dd>
              <dt>Status</dt>
              <dd>{open.status}</dd>
            </dl>
            <VoteButton id={open.id} label={open.title} />
          </div>
        )}
      </Dialog>
    </div>
  );
}
