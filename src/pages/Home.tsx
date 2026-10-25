import { useEffect, useRef, useState } from "react";
import { STATS } from "../content/site";
import { MISSIONS } from "../content/progress";
import { Link } from "../router";
import { useGame } from "../state/GameState";
import { Announcements } from "../components/Announcements";
import { Counter } from "../components/Counter";
import { IdeaMachine } from "../components/IdeaMachine";
import { Arrow } from "../components/Icons";
import { DeptObject, Floaters, type ObjectKind } from "../components/Objects";
import { sfx } from "../lib/sound";
import { StampCard } from "../components/StampCard";
import { reducedMotion } from "../lib/hooks";

const DEPARTMENTS: { to: string; no: string; title: string; text: string; obj: ObjectKind; world: string }[] = [
  { to: "/control-center", no: "02", title: "Control Center", text: "Knoppen, hendels, schakelaars en een officiële noodstop. Alles werkt. Bijna alles.", obj: "knop", world: "boter" },
  { to: "/museum", no: "03", title: "Museum van Onafgemaakte Ideeën", text: "Zes zalen vol plannen op 95%. Waarvan u er vijf kunt vinden.", obj: "sokkel", world: "lila" },
  { to: "/bureau", no: "04", title: "Bureau voor Onnodige Innovatie", text: "Oplossingen voor problemen die niet bestaan. Op afspraak.", obj: "lamp", world: "kobalt" },
  { to: "/loket", no: "05", title: "Het Ideeënloket", text: "Heeft u ook een idee? Het loket is open. De wachtrij ook.", obj: "ticket", world: "salie" },
  { to: "/bijbelreis", no: "06", title: "Bijbelreis", text: "Het Oude Testament op de kaart, voor kinderen. Reis mee met Abraham, Jakob, Jozef en Mozes. Eén afdeling die wél af is.", obj: "planeet", world: "koraal" },
];


/** Zwevende vormen schuiven een fractie mee met de muis. Alleen bij een muis en zonder bewegingsbeperking. */
function useParallax(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;
    let raf = 0;
    const on = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--px", ((e.clientX / window.innerWidth - 0.5) * 2).toFixed(3));
        el.style.setProperty("--py", ((e.clientY / window.innerHeight - 0.5) * 2).toFixed(3));
      });
    };
    window.addEventListener("pointermove", on, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", on);
    };
  }, [ref]);
  // Zweven stopt zodra de hero uit beeld is.
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => el.classList.toggle("is-away", !e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
}

/** Een kopje koffie bijschenken telt echt mee (alleen in deze browser). */
function CoffeeCup({ base, label, note }: { base: number; label: string; note: string }) {
  const { coffee, addCoffee } = useGame();
  const [pouring, setPouring] = useState(0);
  const pour = () => {
    sfx.blip();
    addCoffee();
    setPouring((p) => p + 1);
  };
  return (
    <div className="coffee">
      <span className="label">{label}</span>
      <span className="stat__mid">
        <Counter value={base} />
      </span>
      <p className="stat__note">
        {note}
        {coffee > 0 && <span className="coffee__mine"> Waarvan {coffee} van u.</span>}
      </p>
      <button type="button" className="coffee__cup" onClick={pour} aria-label="Schenk een kopje koffie in">
        <svg viewBox="0 0 120 110" aria-hidden="true">
          <g className="coffee__steam" fill="none" stroke="#191b2e" strokeWidth="2" strokeLinecap="round" opacity=".55">
            <path d="M44 22c-6-8 6-10 0-18" />
            <path d="M60 24c-6-8 6-10 0-18" />
            <path d="M76 22c-6-8 6-10 0-18" />
          </g>
          <ellipse cx="60" cy="100" rx="46" ry="6" fill="#191b2e" opacity=".12" />
          <path d="M92 50h6a14 14 0 0 1 0 28h-8" fill="none" stroke="#191b2e" strokeWidth="5" />
          <path d="M22 36h76l-8 52a10 10 0 0 1-10 9H40a10 10 0 0 1-10-9z" fill="#fffdf8" stroke="#191b2e" strokeWidth="2.4" strokeLinejoin="round" />
          <clipPath id="koffie-in-kop">
            <path d="M22 36h76l-8 52a10 10 0 0 1-10 9H40a10 10 0 0 1-10-9z" />
          </clipPath>
          <g clipPath="url(#koffie-in-kop)">
            <rect key={pouring} className="coffee__fill" x="20" y="40" width="80" height="60" fill="#8a5a3c" />
          </g>
          <path d="M30 48h10" stroke="#fff" strokeOpacity=".7" strokeWidth="4" strokeLinecap="round" />
        </svg>
        <span className="coffee__label">Schenk bij</span>
      </button>
    </div>
  );
}

/** Kleine verbindende objecten op de naad tussen twee secties. Bewegen één keer als ze in beeld komen. */
function Seam({ kind }: { kind: "bal" | "stempel" | "ster" | "ring" }) {
  return (
    <div className={`seam seam--${kind} reveal`} aria-hidden="true">
      {kind === "bal" && (
        <svg viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="26" fill="#ee9aac" stroke="#191b2e" strokeWidth="2" />
          <path d="M14 22a18 18 0 0 1 12-10" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="4" strokeLinecap="round" />
          <path d="M30 4v52" stroke="#191b2e" strokeOpacity=".25" strokeWidth="2" />
        </svg>
      )}
      {kind === "stempel" && (
        <svg viewBox="0 0 120 120">
          <defs>
            <path id="naad-stempel" d="M60 60m-42 0a42 42 0 1 1 84 0a42 42 0 1 1-84 0" />
          </defs>
          <circle cx="60" cy="60" r="56" fill="#fffdf8" stroke="#c24d6b" strokeWidth="3" />
          <circle cx="60" cy="60" r="32" fill="none" stroke="#c24d6b" strokeWidth="1.5" />
          <text fontFamily="Geist Mono, monospace" fontSize="10" fontWeight="600" letterSpacing="2.4" fill="#c24d6b">
            <textPath href="#naad-stempel">GEZIEN · DOOR DE DIRECTIE · GEZIEN · </textPath>
          </text>
          <text x="60" y="70" textAnchor="middle" fontFamily="Instrument Serif, serif" fontStyle="italic" fontSize="30" fill="#c24d6b">
            Ok.
          </text>
        </svg>
      )}
      {kind === "ster" && (
        <svg viewBox="0 0 60 140">
          <path d="M30 0v92" stroke="#191b2e" strokeWidth="2" strokeDasharray="4 6" />
          <path d="M30 88l7 15 16 2-12 11 3 16-14-8-14 8 3-16-12-11 16-2z" fill="#f6d781" stroke="#191b2e" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      )}
      {kind === "ring" && (
        <svg viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="20" fill="none" stroke="#191b2e" strokeWidth="15" />
          <circle cx="30" cy="30" r="20" fill="none" stroke="#cdbdf0" strokeWidth="11" />
          <path d="M15 22a17 17 0 0 1 10-9" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
    </div>
  );
}

/** Het jaarverslag is altijd bijna af. */
function NeverDone() {
  const [p, setP] = useState(97.2);
  useEffect(() => {
    if (reducedMotion()) return;
    const iv = window.setInterval(() => setP((x) => (x >= 99.8 ? 96.4 : +(x + 0.4).toFixed(1))), 1400);
    return () => window.clearInterval(iv);
  }, []);
  return (
    <div className="neverdone" role="img" aria-label="Voortgang van dit jaarverslag: bijna klaar, al een tijdje">
      <span className="label">Jaarverslag afgerond</span>
      <span className="neverdone__bar" aria-hidden="true">
        <i style={{ width: `${p}%` }} />
      </span>
      <b aria-hidden="true">{p.toFixed(1).replace(".", ",")}%</b>
    </div>
  );
}

export default function Home() {
  const { findEgg, eggs } = useGame();
  const [timeGone, setTimeGone] = useState(false);
  const hero = useRef<HTMLElement>(null);
  useParallax(hero);

  return (
    <div className="page home">
      <section className="hero" aria-labelledby="hero-title" ref={hero}>
        <div className="wrap hero__grid">
          <div className="hero__text">
            <p className="kicker">
              <span>Instituut voor onafgemaakte zaken</span>
              <span>
                Dossier <b>Nº 0001</b>
              </span>
            </p>
            <h1 id="hero-title" className="hero__title">
              <Floaters />
              <span className="hero__l1">Martijn</span>
              <span className="hero__l2">
                <span className="hero__den">den</span>
                <span className="hero__besten">
                  Besten<span className="hero__dot" aria-hidden="true" />
                </span>
              </span>
              <span className="hero__note" aria-hidden="true">
                <svg viewBox="0 0 60 40">
                  <path d="M56 6C40 4 18 10 10 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  <path d="M4 26l6 8 7-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                tussenvoegsel: klein geschreven, groot bedoeld
              </span>
            </h1>
            {eggs.length >= 5 && (
              <button
                type="button"
                className="golden-key"
                aria-label="Een gouden sleutel"
                onClick={() => {
                  sfx.success();
                  findEgg("sleutel");
                }}
              >
                <svg viewBox="0 0 64 28" aria-hidden="true">
                  <circle cx="12" cy="14" r="9" fill="#f6d781" stroke="#191b2e" strokeWidth="2" />
                  <circle cx="12" cy="14" r="3.5" fill="#f7f1ec" stroke="#191b2e" strokeWidth="1.6" />
                  <path d="M21 12h38v5h-6v6h-5v-6h-5v4h-5v-4H21z" fill="#f6d781" stroke="#191b2e" strokeWidth="2" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            <div className="hero__slogan">
              <p>
                Officiële website van een man met meer <em>ideeën</em> dan{" "}
                <button
                  type="button"
                  className={`time-word ${timeGone ? "is-gone" : ""}`}
                  onClick={() => {
                    sfx.blip();
                    setTimeGone(true);
                    findEgg("tijd");
                    window.setTimeout(() => setTimeGone(false), 4000);
                  }}
                  aria-label={timeGone ? "tijd (is even weg)" : "tijd"}
                >
                  tijd
                </button>
                {timeGone && <span className="time-gone" aria-hidden="true"> (even weg)</span>}.
              </p>
            </div>
            <div className="hero__ctas">
              <Link to="/control-center" className="btn btn--ink">
                Betreed het Control Center <Arrow />
              </Link>
              <Link to="/museum" className="btn btn--boter">
                Bezoek het museum <Arrow />
              </Link>
            </div>
          </div>
          <div className="hero__fig">
            <IdeaMachine />
          </div>
        </div>
      </section>

      <div className="telex" role="note" aria-label="Status van het instituut">
        <div className="wrap telex__inner">
          <span><i className="telex__led telex__led--ok" /> Instituut: open</span>
          <span><i className="telex__led" /> Ideeën in de wachtrij: veel</span>
          <span><i className="telex__led telex__led--warn" /> Koffievoorraad: kritiek</span>
          <span><i className="telex__led" /> Vrije tijd: niet gevonden</span>
        </div>
      </div>

      <Seam kind="bal" />
      <section className="report-wrap bg-boter" aria-labelledby="stats-title">
        <div className="wrap report">
          <header className="report__head">
            <span className="dept-no">Afd. 01 — Bureau voor de Statistiek</span>
            <h2 id="stats-title" className="section-title">
              Jaarverslag, <em>ongeveer</em>
            </h2>
            <p className="lede">Gecontroleerd door niemand, goedgekeurd door iedereen die het niet heeft nagerekend.</p>
            <NeverDone />
          </header>
          <div className="report__bento">
            <div className="stat stat--hero reveal">
              <span className="label">
                {STATS[0].label} <span className="stat__live">live</span>
              </span>
              <span className="stat__big">
                <Counter value={STATS[0].value} live />
              </span>
              <p className="stat__note">{STATS[0].note}</p>
              <div className="ratio" role="img" aria-label="Verhouding afgeronde projecten tot bedachte ideeën: ongeveer 0,02 procent">
                <span className="ratio__bar" aria-hidden="true">
                  <i />
                </span>
                <span className="label" aria-hidden="true">
                  Afgerond t.o.v. bedacht: 0,02% (vergrootglas aanbevolen)
                </span>
              </div>
            </div>
            <div className="stat stat--done reveal" style={{ ["--d" as string]: 1 }}>
              <span className="stat__badge">
                <Counter value={STATS[2].value} />
              </span>
              <span className="stat__label">{STATS[2].label}</span>
              <span className="stamp stat__stamp">{STATS[2].note}</span>
            </div>
            <div className="stat stat--ledger reveal" style={{ ["--d" as string]: 2 }}>
              <span className="label">Verder in de boeken</span>
              <dl className="ledger">
                {[STATS[1], STATS[5], STATS[4]].map((s) => (
                  <div key={s.label} className="ledger__row">
                    <dt>{s.label}</dt>
                    <dd>
                      <Counter value={s.value} />
                    </dd>
                    <dd className="ledger__note">{s.note}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="stat stat--coffee reveal" style={{ ["--d" as string]: 3 }}>
              <CoffeeCup base={STATS[3].value} label={STATS[3].label} note={STATS[3].note} />
            </div>
          </div>
          <p className="report__foot label">Bron: het gevoel van de directie. Afwijkingen van ±100% zijn mogelijk.</p>
        </div>
      </section>
      <Seam kind="stempel" />

      <section className="bulletin bg-ink" aria-labelledby="announce-title">
        <div className="wrap bulletin__grid">
          <div className="bulletin__intro">
            <span className="dept-no">Afd. Communicatie · uitgaand</span>
            <h2 id="announce-title" className="section-title">
              Officiële <em>mededelingen</em>
            </h2>
            <p className="lede">Het instituut informeert u graag over de laatste besluiten. Besluiten kunnen zonder aankondiging worden teruggedraaid.</p>
          </div>
          <Announcements />
        </div>
      </section>

      <Seam kind="ster" />
      <section className="wrap toc" aria-labelledby="depts-title">
        <header className="toc__head">
          <span className="dept-no">Plattegrond van het instituut</span>
          <h2 id="depts-title" className="section-title">
            Vijf afdelingen, <em>nul</em> haast
          </h2>
        </header>
        <ol className="toc__list">
          {DEPARTMENTS.map((d, i) => (
            <li key={d.to} className={`toc__item toc__item--${i} reveal`} style={{ ["--d" as string]: i }}>
              <Link to={d.to} className={`toc__row world-${d.world}`}>
                <span className="toc__no label">Afd. {d.no}</span>
                <span className="toc__title">{d.title}</span>
                <span className="toc__text">{d.text}</span>
                <span className="toc__fig" aria-hidden="true">
                  <DeptObject kind={d.obj} />
                </span>
                <span className="toc__go" aria-hidden="true">
                  <Arrow />
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <Seam kind="ring" />
      <section className="statement" aria-labelledby="statement-title">
        <div className="wrap statement__inner">
          <h2 id="statement-title" className="statement__text reveal">
            Bijna af is ook <em>een soort</em> af.
          </h2>
          <span className="stamp statement__stamp" aria-hidden="true">
            Officieel standpunt
          </span>
          <p className="statement__by label">— Uit het huishoudelijk reglement, artikel 1 (concept)</p>
        </div>
      </section>

      <section className="wrap duo" aria-labelledby="missions-title">
        <div className="panel bg-lila duo__card reveal">
          <span className="dept-no">Bezoekersmissies · formulier M-8</span>
          <h2 id="missions-title">
            Uw opdracht, <em>mocht u die aanvaarden</em>
          </h2>
          <p>
            Het instituut heeft {MISSIONS.length} missies verstopt. Elke voltooide missie krijgt een officiële stempel. De hints staan in uw missiepaspoort, rechtsboven in de kop.
          </p>
          <StampCard />
        </div>
        <div className="panel bg-koraal duo__card duo__card--cert reveal" style={{ ["--d" as string]: 1 }}>
          <span className="dept-no">Certificaatbureau</span>
          <h2>
            Officieel <em>niets</em> opgelost?
          </h2>
          <p>Laat het instituut het vastleggen. Met stempel, handtekening en serienummer. Gratis te downloaden.</p>
          <DeptObject kind="certificaat" className="duo__obj" />
          <Link to="/certificaat" className="btn btn--ink">
            Vraag een certificaat aan <Arrow />
          </Link>
        </div>
      </section>
    </div>
  );
}
