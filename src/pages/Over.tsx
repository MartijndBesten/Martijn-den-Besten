import { TIMELINE } from "../content/site";
import { Link } from "../router";
import { useGame } from "../state/GameState";
import { Shapes } from "../components/Shapes";
import { Arrow } from "../components/Icons";
import "../styles/pages.css";

function Portrait() {
  return (
    <svg viewBox="0 0 320 380" className="portrait" role="img" aria-label="Officieel portret van Martijn, artistieke impressie in geometrische vormen">
      <rect x="10" y="10" width="300" height="360" rx="24" fill="#c6b3ff" stroke="#17153a" strokeWidth="5" />
      <circle cx="160" cy="360" r="120" fill="#2a3bdb" stroke="#17153a" strokeWidth="5" />
      <rect x="128" y="210" width="64" height="60" fill="#ffc9a8" stroke="#17153a" strokeWidth="5" />
      <ellipse cx="160" cy="170" rx="78" ry="90" fill="#ffc9a8" stroke="#17153a" strokeWidth="5" />
      <path d="M84 150c0-60 40-84 80-84s76 28 76 84c-20-26-56-34-80-30s-50 6-76 30z" fill="#17153a" />
      <circle cx="132" cy="172" r="9" fill="#17153a" />
      <circle cx="190" cy="172" r="9" fill="#17153a" />
      <path d="M138 214q24 18 48 0" fill="none" stroke="#17153a" strokeWidth="5" strokeLinecap="round" />
      <g className="portrait__bulb">
        <circle cx="250" cy="70" r="30" fill="#ffd24d" stroke="#17153a" strokeWidth="5" />
        <rect x="238" y="98" width="24" height="16" rx="3" fill="#fff4e0" stroke="#17153a" strokeWidth="4" />
        <path d="M250 22v-10M290 40l8-6M210 40l-8-6M298 74h10" stroke="#17153a" strokeWidth="5" strokeLinecap="round" />
      </g>
      <g className="portrait__bulb portrait__bulb--2">
        <circle cx="62" cy="96" r="18" fill="#34c77b" stroke="#17153a" strokeWidth="4" />
      </g>
      <rect x="30" y="300" width="96" height="30" rx="6" fill="#fff4e0" stroke="#17153a" strokeWidth="4" transform="rotate(-8 78 315)" />
      <text x="40" y="322" fontFamily="Space Mono, monospace" fontSize="13" fontWeight="700" fill="#17153a" transform="rotate(-8 78 315)">
        DIRECTEUR
      </text>
    </svg>
  );
}

export default function Over() {
  const { findEgg } = useGame();
  return (
    <div className="page over">
      <section className="page-hero" aria-labelledby="over-title">
        <Shapes items={[{ kind: "circle", color: "groen", size: 140, top: "12%", left: "86%" }, { kind: "squiggle", color: "kobalt", size: 160, top: "80%", left: "40%" }]} />
        <div className="wrap over__grid">
          <div>
            <span className="dept-no">Afd. 04 — Personeelsdossier · openbaar deel</span>
            <h1 id="over-title">Over Martijn</h1>
            <p className="lede">
              Martijn den Besten is oprichter, directeur, enige medewerker én grootste klant van het Instituut Martijn den Besten. Hij heeft meer ideeën dan tijd, en
              dat is precies het probleem waar dit instituut omheen is gebouwd.
            </p>
            <p>
              Hij is een denker en een doener, maar vooral een beginner — in de beste zin van het woord. Waar een ander één project start, ziet hij er drie. En een
              domeinnaam. Misschien twee
              <button type="button" className="hidden-dot" aria-label="Verborgen knop" onClick={() => findEgg("hidden-3")}>
                .
              </button>
            </p>
          </div>
          <Portrait />
        </div>
      </section>

      <section className="wrap dossier-wrap" aria-labelledby="dossier-title">
        <div className="dossier">
          <div className="dossier__tab label">Dossier MdB-001</div>
          <h2 id="dossier-title">Persoonskaart</h2>
          <dl className="dossier__list">
            <dt>Naam</dt>
            <dd>Martijn den Besten</dd>
            <dt>Functie</dt>
            <dd>Oprichter, directeur, enige medewerker, ideeënmachine</dd>
            <dt>Specialisme</dt>
            <dd>Beginnen. Met overtuiging.</dd>
            <dt>Werkt aan</dt>
            <dd>Ideeën, plannen, domeinen, de schuur en meestal iets nieuws</dd>
            <dt>Kenmerken</dt>
            <dd>Denkt in projecten, telt in domeinnamen, meet in kopjes koffie</dd>
            <dt>Status</dt>
            <dd>
              <span className="stamp stamp--green">Bezig</span>
            </dd>
          </dl>
        </div>
        <div className="values">
          <h2>Kernwaarden</h2>
          <ul>
            <li className="bg-boter"><strong>Nieuwsgierig.</strong> Elk idee verdient een kans. Of in ieder geval een notitie.</li>
            <li className="bg-lila"><strong>Praktisch.</strong> Als het kan, wordt het gebouwd. Als het niet kan, ook even geprobeerd.</li>
            <li className="bg-koraal"><strong>Eerlijk.</strong> Niet alles wordt af. Dat staat gewoon op de website.</li>
          </ul>
        </div>
      </section>

      <section className="wrap timeline-wrap" aria-labelledby="tijdlijn-title">
        <h2 id="tijdlijn-title" className="section-title">Een korte geschiedenis</h2>
        <ol className="timeline">
          {TIMELINE.map((t, i) => (
            <li key={t.year} style={{ ["--i" as string]: i }}>
              <span className="timeline__year">{t.year}</span>
              <p>{t.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="wrap colophon" aria-labelledby="colofon-title">
        <div className="panel">
          <h2 id="colofon-title">Over deze website</h2>
          <p>
            Deze website is met de hand gebouwd met React, TypeScript en een flinke hoeveelheid SVG, en draait op Cloudflare. Alle grapjes zijn lokaal gemaakt;
            er komt geen AI-dienst aan te pas om een idee te genereren.
          </p>
          <h3>Privacy, kort en eerlijk</h3>
          <ul>
            <li>Geen cookies, geen trackers, geen advertenties.</li>
            <li>Missies en verrassingen worden alleen in uw eigen browser bewaard (localStorage).</li>
            <li>Ingezonden ideeën worden opgeslagen zonder naam of e-mailadres en zijn pas zichtbaar na goedkeuring.</li>
            <li>Voor stemmen en spambescherming wordt een per dag wisselende, versleutelde code van uw verbinding gebruikt. Uw IP-adres zelf wordt niet opgeslagen.</li>
          </ul>
          <Link to="/loket" className="btn btn--kobalt">
            Naar het ideeënloket <Arrow />
          </Link>
        </div>
      </section>
    </div>
  );
}
