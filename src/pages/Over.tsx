import { TIMELINE } from "../content/site";
import { Link } from "../router";
import { useGame } from "../state/GameState";
import { Arrow } from "../components/Icons";
import "../styles/pages.css";

/** Fig. 13: portret in zijaanzicht. Bewust abstract — het instituut publiceert geen pasfoto's. */
function Portrait() {
  return (
    <figure className="portrait">
      <div className="portrait__head-label">
        <span>Fig. 13 — Directeur, zijaanzicht</span>
        <span>Artistieke impressie</span>
      </div>
      <svg viewBox="0 0 320 340" className="draw portrait__svg" role="img" aria-label="Lijntekening van een hoofd in profiel met een gloeilamp, tandwiel en gedachtewolkjes">
        <defs>
          <pattern id="p-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="5" stroke="currentColor" strokeWidth="0.6" />
          </pattern>
        </defs>
        <path d="M60 330V250c0-18 10-30 26-36l30-10" />
        <path
          className="fill portrait__head"
          d="M116 204c-14-6-22-20-22-36 0-12 4-20 2-30-4-12-14-20-12-32 4-36 34-66 78-66 46 0 80 32 80 78 0 30-14 50-26 64-6 8-8 20-6 30l4 26c2 12-6 22-18 22h-26z"
          fill="#f8d9e0"
          stroke="none"
        />
        <path
          d="M116 204c-14-6-22-20-22-36 0-12 4-20 2-30-4-12-14-20-12-32 4-36 34-66 78-66 46 0 80 32 80 78 0 30-14 50-26 64-6 8-8 20-6 30l4 26c2 12-6 22-18 22h-26"
          strokeWidth="1.3"
        />
        <path d="M94 128l-14 18c-2 4 0 8 4 8h12" />
        <path d="M100 170c6 2 12 2 16 0" />
        <circle className="fill" cx="124" cy="112" r="3" fill="currentColor" stroke="none" />
        <path className="fill" d="M138 46c30-16 76-12 98 16 10 12 14 28 12 40-14-26-46-42-84-38-14 2-26-6-26-18z" fill="#cdbdf0" stroke="none" />
        {/* binnenwerk: tandwiel en lamp */}
        <circle cx="196" cy="118" r="26" strokeDasharray="3 3" />
        <circle className="fill" cx="196" cy="118" r="14" fill="#a9dcc4" stroke="none" />
        <circle cx="196" cy="118" r="14" />
        <circle className="fill" cx="268" cy="42" r="18" fill="#f6d781" stroke="none" />
        <circle cx="268" cy="42" r="18" />
        <path d="M262 42q3-7 6 0t6 0M268 14v-8M292 26l6-5M244 26l-6-5" />
        <path d="M218 98c18-10 30-30 40-40" strokeDasharray="2 3" />
        {/* gedachtewolkjes */}
        <circle cx="34" cy="70" r="8" />
        <circle cx="52" cy="44" r="12" />
        <circle className="fill" cx="80" cy="22" r="14" fill="#ee9aac" stroke="none" />
        <circle cx="80" cy="22" r="14" />
        {/* maatvoering */}
        <path d="M300 60v200M296 60h8M296 260h8" strokeWidth="0.6" />
        <text x="292" y="165" fontFamily="Geist Mono" fontSize="8" fill="currentColor" stroke="none" transform="rotate(-90 292 165)" textAnchor="middle">
          IDEEËNCAPACITEIT: ONBEPERKT
        </text>
      </svg>
    </figure>
  );
}

export default function Over() {
  const { findEgg } = useGame();
  return (
    <div className="page over">
      <section className="page-hero" aria-labelledby="over-title">
        <div className="wrap over__grid">
          <div>
            <span className="dept-no">Afd. 04 — Personeelsdossier · openbaar deel</span>
            <h1 id="over-title">
              Over <em>Martijn</em>
            </h1>
            <p className="over__lede">
              Martijn den Besten is oprichter, directeur, enige medewerker én grootste klant van het Instituut Martijn den Besten. Hij heeft meer ideeën dan tijd, en
              dat is precies het probleem waar dit instituut omheen is gebouwd.
            </p>
            <p className="over__body">
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
        <div className="dossier reveal">
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
        <div className="values reveal" style={{ ["--d" as string]: 1 }}>
          <h2>Kernwaarden</h2>
          <ol>
            <li>
              <span className="label">§ 1</span>
              <strong>Nieuwsgierig.</strong> Elk idee verdient een kans. Of in ieder geval een notitie.
            </li>
            <li>
              <span className="label">§ 2</span>
              <strong>Praktisch.</strong> Als het kan, wordt het gebouwd. Als het niet kan, ook even geprobeerd.
            </li>
            <li>
              <span className="label">§ 3</span>
              <strong>Eerlijk.</strong> Niet alles wordt af. Dat staat gewoon op de website.
            </li>
          </ol>
        </div>
      </section>

      <section className="wrap timeline-wrap" aria-labelledby="tijdlijn-title">
        <span className="dept-no">Archief</span>
        <h2 id="tijdlijn-title" className="section-title">
          Een korte <em>geschiedenis</em>
        </h2>
        <ol className="timeline">
          {TIMELINE.map((t, i) => (
            <li key={t.year} className="reveal" style={{ ["--d" as string]: i }}>
              <span className="timeline__year">{t.year}</span>
              <p>{t.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="wrap colophon" aria-labelledby="colofon-title">
        <div className="panel">
          <span className="dept-no">Colofon</span>
          <h2 id="colofon-title">Over deze website</h2>
          <p>
            Deze website is met de hand gebouwd met React, TypeScript en een flinke hoeveelheid SVG, en draait op Cloudflare. Alle grapjes zijn lokaal gemaakt;
            er komt geen AI-dienst aan te pas om een idee te genereren. Gezet in Instrument Serif, Geist en Geist Mono.
          </p>
          <h3>Privacy, kort en eerlijk</h3>
          <ul>
            <li>Geen cookies, geen advertenties en geen advertentietrackers.</li>
            <li>Cloudflare Web Analytics telt anoniem en zonder cookies hoeveel pagina’s er bekeken worden.</li>
            <li>Missies en verrassingen worden alleen in uw eigen browser bewaard (localStorage).</li>
            <li>Ingezonden ideeën worden opgeslagen zonder naam of e-mailadres en zijn pas zichtbaar na goedkeuring.</li>
            <li>Om dubbel stemmen te voorkomen krijgt uw browser een willekeurige, anonieme bezoekerscode. Die wordt per dag versleuteld opgeslagen en is niet naar u te herleiden.</li>
            <li>Voor spambescherming wordt een per dag wisselende, versleutelde code van uw verbinding gebruikt. Uw IP-adres zelf wordt niet opgeslagen.</li>
          </ul>
          <Link to="/loket" className="btn btn--ink">
            Naar het ideeënloket <Arrow />
          </Link>
        </div>
      </section>
    </div>
  );
}
