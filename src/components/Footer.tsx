import { useState } from "react";
import { Link } from "../router";
import { useGame } from "../state/GameState";
import { sfx } from "../lib/sound";

const SWATCHES = [
  ["creme", "#fff4e0"],
  ["kobalt", "#2a3bdb"],
  ["koraal", "#ff5c47"],
  ["lila", "#c6b3ff"],
  ["boter", "#ffd24d"],
  ["groen", "#34c77b"],
] as const;

export function Footer() {
  const { findEgg, setTheme } = useGame();
  const [touched, setTouched] = useState<string[]>([]);

  const touch = (name: string) => {
    sfx.tick();
    const next = touched.includes(name) ? touched : [...touched, name];
    setTouched(next);
    if (next.length === SWATCHES.length) {
      findEgg("colors");
      setTheme("explosie");
      window.setTimeout(() => {
        setTheme("normaal");
        setTouched([]);
      }, 6000);
    }
  };

  const words = ["Meer ideeën dan tijd", "Bijna af", "Nieuw plan in aantocht", "Officieel onafgemaakt", "Druk op alle knoppen"];

  return (
    <footer className="site-footer">
      <div className="marquee" aria-hidden="true">
        <div className="marquee__track">
          {[...words, ...words].map((w, i) => (
            <span key={i}>{w}</span>
          ))}
        </div>
      </div>
      <div className="wrap footer-grid">
        <div>
          <h2>Instituut Martijn den Besten</h2>
          <p>
            Het officiële instituut voor ideeën, plannen en projecten die bijna af zijn. Opgericht vandaag. Kantoortijden: wanneer er tijd is.
          </p>
          <p className="label">KvK: niet aangevraagd · BTW: ook niet</p>
        </div>
        <div>
          <h2>Afdelingen</h2>
          <ul>
            <li><Link to="/">Hoofdkwartier</Link></li>
            <li><Link to="/control-center">Control Center</Link></li>
            <li><Link to="/museum">Museum van Onafgemaakte Ideeën</Link></li>
            <li><Link to="/over">Over Martijn</Link></li>
          </ul>
        </div>
        <div>
          <h2>Loketten</h2>
          <ul>
            <li><Link to="/loket">Het officiële ideeënloket</Link></li>
            <li><Link to="/bureau">Bureau voor Onnodige Innovatie</Link></li>
            <li><Link to="/certificaat">Certificaatbureau</Link></li>
          </ul>
        </div>
      </div>
      <div className="wrap footer-legal">
        <p style={{ margin: 0 }}>
          © {new Date().getFullYear()} Martijn den Besten. Alle rechten voorbehouden, ook die op uitstel
          <button
            type="button"
            className="hidden-dot"
            aria-label="Verborgen knop"
            onClick={() => findEgg("hidden-1")}
          >
            .
          </button>
          {" "}Geen cookies, geen tracking.
        </p>
        <div className="swatches" role="group" aria-label="Huiskleuren">
          {SWATCHES.map(([name, hex]) => (
            <button
              key={name}
              type="button"
              className="swatch"
              style={{ background: hex }}
              aria-label={`Huiskleur ${name}`}
              aria-pressed={touched.includes(name)}
              onClick={() => touch(name)}
            />
          ))}
        </div>
        <Link to="/einde" className="the-end-link">
          Hier eindigt de website. ↓ toch verder
        </Link>
      </div>
    </footer>
  );
}
