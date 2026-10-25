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
import { reducedMotion } from "../lib/hooks";

const DEPARTMENTS: { to: string; no: string; title: string; text: string; obj: ObjectKind; world: string }[] = [
  { to: "/control-center", no: "02", title: "Control Center", text: "Knoppen, hendels, schakelaars en een officiële noodstop. Alles werkt. Bijna alles.", obj: "knop", world: "boter" },
  { to: "/museum", no: "03", title: "Museum van Onafgemaakte Ideeën", text: "Zes zalen vol plannen op 95%. Waarvan u er vijf kunt vinden.", obj: "sokkel", world: "lila" },
  { to: "/bureau", no: "04", title: "Bureau voor Onnodige Innovatie", text: "Oplossingen voor problemen die niet bestaan. Op afspraak.", obj: "lamp", world: "kobalt" },
  { to: "/loket", no: "05", title: "Het Ideeënloket", text: "Heeft u ook een idee? Het loket is open. De wachtrij ook.", obj: "ticket", world: "salie" },
];

const MAX_STAT = Math.max(...STATS.map((s) => s.value));

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
  const { findEgg, missions } = useGame();
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

      <section className="report-wrap bg-boter" aria-labelledby="stats-title">
        <div className="wrap report">
          <header className="report__head">
            <span className="dept-no">Afd. 01 — Bureau voor de Statistiek</span>
            <h2 id="stats-title" className="report__statement">
              14.892 ideeën. <em>Drie</em> afgerond.
            </h2>
            <p className="lede">Alle cijfers zijn fictief, maar voelen echt. Gecontroleerd door niemand, goedgekeurd door iedereen die ze niet heeft nagerekend.</p>
            <NeverDone />
          </header>
          <ol className="report__grid">
            {STATS.map((s, i) => (
              <li key={s.label} className={`report__item report__item--${i} reveal`} style={{ ["--d" as string]: i }}>
                <span className="report__idx label">
                  {String(i + 1).padStart(2, "0")}
                  {s.live && <span className="report__live"> · live</span>}
                </span>
                <span className="report__value">
                  <Counter value={s.value} live={s.live} />
                </span>
                <span className="report__label">{s.label}</span>
                <span className="report__bar" aria-hidden="true">
                  <i style={{ width: `${Math.max(1.2, (s.value / MAX_STAT) * 100)}%` }} />
                </span>
                <span className="report__note">{s.note}</span>
              </li>
            ))}
          </ol>
          <p className="report__foot label">Bron: het gevoel van de directie. Afwijkingen van ±100% zijn mogelijk.</p>
        </div>
      </section>

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

      <section className="wrap toc" aria-labelledby="depts-title">
        <header className="toc__head">
          <span className="dept-no">Plattegrond van het instituut</span>
          <h2 id="depts-title" className="section-title">
            Vier afdelingen, <em>nul</em> haast
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
            Het instituut heeft {MISSIONS.length} missies verstopt. U heeft er {missions.length} voltooid. Uw missiepaspoort zit rechtsboven in de kop.
          </p>
          <ul className="checklist">
            {MISSIONS.slice(0, 4).map((mi) => (
              <li key={mi.id} className={missions.includes(mi.id) ? "is-done" : ""}>
                <span aria-hidden="true" className="checklist__box" />
                {mi.title}
                <span className="visually-hidden">{missions.includes(mi.id) ? " (voltooid)" : ""}</span>
              </li>
            ))}
          </ul>
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
