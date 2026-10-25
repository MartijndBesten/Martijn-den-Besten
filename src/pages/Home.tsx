import { useEffect, useRef, useState } from "react";
import { STATS } from "../content/site";
import { MISSIONS } from "../content/progress";
import { Link } from "../router";
import { useGame } from "../state/GameState";
import { Announcements } from "../components/Announcements";
import { Counter } from "../components/Counter";
import { IdeaMachine } from "../components/IdeaMachine";
import { Arrow } from "../components/Icons";
import { MiniFig } from "../components/MiniFig";
import { sfx } from "../lib/sound";

const DEPARTMENTS = [
  { to: "/control-center", no: "02", title: "Control Center", text: "Knoppen, hendels, schakelaars en een officiële noodstop. Alles werkt. Bijna alles.", fig: "knop" },
  { to: "/museum", no: "03", title: "Museum van Onafgemaakte Ideeën", text: "Zes zalen vol plannen op 95%. Waarvan u er vijf kunt vinden.", fig: "sokkel" },
  { to: "/bureau", no: "04", title: "Bureau voor Onnodige Innovatie", text: "Oplossingen voor problemen die niet bestaan. Op afspraak.", fig: "lamp" },
  { to: "/loket", no: "05", title: "Het Ideeënloket", text: "Heeft u ook een idee? Het loket is open. De wachtrij ook.", fig: "ticket" },
] as const;

const MAX_STAT = Math.max(...STATS.map((s) => s.value));

/** Schuift de hero-typografie subtiel mee met scrollen. */
function useScrollVar(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => el.style.setProperty("--sy", String(Math.min(window.scrollY, 900))));
    };
    window.addEventListener("scroll", on, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", on);
    };
  }, [ref]);
}

export default function Home() {
  const { findEgg, missions } = useGame();
  const [timeGone, setTimeGone] = useState(false);
  const hero = useRef<HTMLElement>(null);
  useScrollVar(hero);

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
              <span>Opgericht: vandaag</span>
            </p>
            <h1 id="hero-title" className="hero__title">
              <span className="hero__l1">Martijn</span>
              <span className="hero__l2">
                <span className="hero__den">den</span>
                <span className="hero__note" aria-hidden="true">
                  tussenvoegsel —<br />
                  klein geschreven,
                  <br />
                  groot bedoeld
                </span>
              </span>
              <span className="hero__l3">
                Besten<span className="hero__dot">.</span>
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
              <svg className="hero__dim draw" viewBox="0 0 430 26" aria-hidden="true">
                <path d="M1 4v18M429 4v18M1 13h428" />
                <path className="fill" d="M1 13l8-4v8zM429 13l-8-4v8z" fill="currentColor" stroke="none" />
                <rect className="fill" x="170" y="5" width="90" height="16" fill="var(--bg)" stroke="none" />
                <text x="215" y="17" textAnchor="middle" fontFamily="Geist Mono" fontSize="10" fill="currentColor" stroke="none">
                  Δ ≈ ∞
                </text>
              </svg>
            </div>
            <div className="hero__ctas">
              <Link to="/control-center" className="btn btn--ink">
                Betreed het Control Center <Arrow />
              </Link>
              <Link to="/museum" className="btn">
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

      <section className="wrap report" aria-labelledby="stats-title">
        <header className="report__head">
          <div>
            <span className="dept-no">Afd. 01 — Bureau voor de Statistiek</span>
            <h2 id="stats-title" className="section-title">
              Jaarverslag, <em>ongeveer</em>
            </h2>
          </div>
          <p className="lede">Alle cijfers zijn fictief, maar voelen echt. Gecontroleerd door niemand, goedgekeurd door iedereen die ze niet heeft nagerekend.</p>
        </header>
        <ol className="report__grid">
          {STATS.map((s, i) => (
            <li key={s.label} className="report__item reveal" style={{ ["--d" as string]: i }}>
              <span className="report__idx label">
                {String(i + 1).padStart(2, "0")}
                {s.live && <span className="report__live"> · live</span>}
              </span>
              <span className="report__label">{s.label}</span>
              <span className="report__value">
                <Counter value={s.value} live={s.live} />
              </span>
              <span className="report__bar" aria-hidden="true">
                <i style={{ width: `${Math.max(0.6, (s.value / MAX_STAT) * 100)}%` }} />
              </span>
              <span className="report__note">
                <sup>{i + 1}</sup> {s.note}
              </span>
            </li>
          ))}
        </ol>
        <p className="report__foot label">Bron: het gevoel van de directie. Afwijkingen van ±100% zijn mogelijk.</p>
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
          <span className="dept-no">Inhoudsopgave</span>
          <h2 id="depts-title" className="section-title">
            De <em>afdelingen</em>
          </h2>
        </header>
        <ol className="toc__list">
          {DEPARTMENTS.map((d, i) => (
            <li key={d.to} className="reveal" style={{ ["--d" as string]: i }}>
              <Link to={d.to} className="toc__row">
                <span className="toc__no label">{d.no}</span>
                <span className="toc__title">{d.title}</span>
                <span className="toc__text">{d.text}</span>
                <span className="toc__fig" aria-hidden="true">
                  <MiniFig kind={d.fig} />
                </span>
                <span className="toc__go" aria-hidden="true">
                  <Arrow />
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="wrap duo" aria-labelledby="missions-title">
        <div className="panel bg-sage duo__card reveal">
          <span className="dept-no">Bezoekersmissies · formulier M-8</span>
          <h2 id="missions-title">
            Uw opdracht, <em>mocht u die aanvaarden</em>
          </h2>
          <p>
            Het instituut heeft {MISSIONS.length} missies verstopt. U heeft er {missions.length} voltooid. Uw missiepaspoort zit linksonder.
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
        <div className="panel bg-oker duo__card reveal" style={{ ["--d" as string]: 1 }}>
          <span className="dept-no">Certificaatbureau</span>
          <h2>
            Officieel <em>niets</em> opgelost?
          </h2>
          <p>Laat het instituut het vastleggen. Met stempel, handtekening en serienummer. Gratis te downloaden.</p>
          <MiniFig kind="certificaat" />
          <Link to="/certificaat" className="btn btn--ink">
            Vraag een certificaat aan <Arrow />
          </Link>
        </div>
      </section>
    </div>
  );
}
