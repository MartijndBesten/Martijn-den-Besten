import { useState } from "react";
import { STATS } from "../content/site";
import { MISSIONS } from "../content/progress";
import { Link } from "../router";
import { useGame } from "../state/GameState";
import { Announcements } from "../components/Announcements";
import { Counter } from "../components/Counter";
import { IdeaMachine } from "../components/IdeaMachine";
import { Shapes, type ShapeSpec } from "../components/Shapes";
import { Arrow } from "../components/Icons";
import { sfx } from "../lib/sound";

const HERO_SHAPES: ShapeSpec[] = [
  { kind: "circle", color: "lila", size: 120, top: "8%", left: "-3%" },
  { kind: "star", color: "boter", size: 70, top: "70%", left: "40%", rot: 60 },
  { kind: "squiggle", color: "koraal", size: 140, top: "82%", left: "6%", dx: 40 },
  { kind: "half", color: "groen", size: 90, top: "4%", left: "52%", rot: -30 },
  { kind: "plus", color: "roze", size: 54, top: "56%", left: "92%" },
  { kind: "ring", color: "kobalt", size: 110, top: "88%", left: "78%" },
];

const DEPARTMENTS = [
  { to: "/control-center", no: "02", title: "Control Center", text: "Knoppen, hendels, schakelaars en een noodstop. Alles werkt. Bijna alles.", cls: "dept--kobalt", shape: "dept--circle" },
  { to: "/museum", no: "03", title: "Museum", text: "Zes zalen vol onafgemaakte ideeën. Waarvan u er vijf kunt vinden.", cls: "dept--lila", shape: "dept--arch" },
  { to: "/bureau", no: "04", title: "Bureau voor Onnodige Innovatie", text: "Oplossingen voor problemen die niet bestaan. Op afspraak.", cls: "dept--groen", shape: "dept--ticket" },
  { to: "/loket", no: "05", title: "Ideeënloket", text: "Heeft u ook een idee? Het loket is open. De wachtrij ook.", cls: "dept--boter", shape: "dept--blob" },
];

export default function Home() {
  const { findEgg, missions } = useGame();
  const [timeGone, setTimeGone] = useState(false);

  return (
    <div className="page home">
      <section className="hero" aria-labelledby="hero-title">
        <Shapes items={HERO_SHAPES} />
        <div className="wrap hero__grid">
          <div className="hero__text">
            <p className="kicker">Officieel kanaal · versie 1.0 (bèta, permanent)</p>
            <h1 id="hero-title" className="hero__title">
              <span className="hero__line hero__line--1">Martijn</span>
              <span className="hero__line hero__line--2">den</span>
              <span className="hero__line hero__line--3">
                Besten<span className="hero__dot" aria-hidden="true" />
              </span>
            </h1>
            <p className="hero__slogan">
              Officiële website van een man met meer ideeën dan{" "}
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
              {timeGone && <span className="time-gone" aria-hidden="true"> … ( tijd is even weg )</span>}.
            </p>
            <div className="hero__ctas">
              <Link to="/control-center" className="btn btn--kobalt">
                Betreed het Control Center <Arrow />
              </Link>
              <Link to="/museum" className="btn btn--creme">
                Bezoek het museum
              </Link>
            </div>
            <span className="stamp hero__stamp">Goedgekeurd door: zichzelf</span>
          </div>
          <div className="hero__machine">
            <IdeaMachine />
            <p className="hero__hint label">↑ Klik op de machine. Niet te vaak.</p>
          </div>
        </div>
      </section>

      <div className="statusbar" role="note" aria-label="Status van het instituut">
        <div className="wrap statusbar__inner">
          <span><i className="led led--groen" /> Instituut: open</span>
          <span><i className="led led--boter" /> Ideeën in de wachtrij: veel</span>
          <span><i className="led led--koraal" /> Koffievoorraad: kritiek</span>
          <span><i className="led led--lila" /> Vrije tijd: niet gevonden</span>
        </div>
      </div>

      <section className="wrap stats" aria-labelledby="stats-title">
        <header className="section-head">
          <span className="dept-no">Afd. 01 — Hoofdkwartier · Bureau voor de Statistiek</span>
          <h2 id="stats-title" className="section-title">Officiële statistieken</h2>
          <p className="lede">
            Peildatum: vandaag. Alle cijfers zijn fictief, maar voelen echt. Gecontroleerd door niemand.
          </p>
        </header>
        <ul className="stats__grid">
          {STATS.map((s, i) => (
            <li key={s.label} className={`stat stat--${s.color} stat--${i + 1}`}>
              <span className="stat__label label">{s.label}</span>
              <span className="stat__value">
                <Counter value={s.value} live={s.live} />
              </span>
              <span className="stat__note">{s.note}</span>
              {s.live && <span className="stat__live label"><i aria-hidden="true" /> Live</span>}
            </li>
          ))}
        </ul>
        <p className="stats__disclaimer label">* Bron: het gevoel van de directie. Afwijkingen van ±100% zijn mogelijk.</p>
      </section>

      <section className="announce bg-kobalt" aria-labelledby="announce-title">
        <Shapes
          items={[
            { kind: "ring", color: "boter", size: 160, top: "-6%", left: "84%" },
            { kind: "triangle", color: "koraal", size: 80, top: "76%", left: "3%", rot: 40 },
          ]}
        />
        <div className="wrap announce__grid">
          <div>
            <span className="dept-no">Afd. Communicatie · Uitgaand</span>
            <h2 id="announce-title" className="section-title">Officiële mededelingen</h2>
            <p className="lede">
              Het instituut informeert u graag over de laatste besluiten. Besluiten kunnen zonder aankondiging worden teruggedraaid.
            </p>
          </div>
          <Announcements />
        </div>
      </section>

      <section className="wrap depts" aria-labelledby="depts-title">
        <header className="section-head">
          <span className="dept-no">Plattegrond</span>
          <h2 id="depts-title" className="section-title">De afdelingen</h2>
        </header>
        <ul className="depts__grid">
          {DEPARTMENTS.map((d) => (
            <li key={d.to}>
              <Link to={d.to} className={`dept ${d.cls} ${d.shape}`}>
                <span className="dept__no">{d.no}</span>
                <span className="dept__title">{d.title}</span>
                <span className="dept__text">{d.text}</span>
                <span className="dept__go" aria-hidden="true">
                  <Arrow />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="wrap missions-teaser" aria-labelledby="missions-title">
        <div className="panel bg-lila missions-teaser__card">
          <span className="dept-no">Bezoekersmissies</span>
          <h2 id="missions-title">Uw opdracht, mocht u die aanvaarden</h2>
          <p>
            Het instituut heeft {MISSIONS.length} missies verstopt. U heeft er {missions.length} voltooid. Open uw missiepaspoort linksonder om te zien wat er nog te doen is.
          </p>
          <ul className="missions-teaser__list">
            {MISSIONS.slice(0, 4).map((mi) => (
              <li key={mi.id} className={missions.includes(mi.id) ? "is-done" : ""}>
                {mi.title}
              </li>
            ))}
          </ul>
        </div>
        <div className="panel bg-boter missions-teaser__card">
          <span className="dept-no">Certificaatbureau</span>
          <h2>Officieel niets opgelost?</h2>
          <p>Laat het instituut het vastleggen. Met stempel, handtekening en serienummer. Gratis te downloaden.</p>
          <Link to="/certificaat" className="btn btn--koraal">
            Vraag een certificaat aan <Arrow />
          </Link>
        </div>
      </section>
    </div>
  );
}
