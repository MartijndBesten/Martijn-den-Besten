import { useState } from "react";
import { Link } from "../router";
import { useGame } from "../state/GameState";
import { sfx } from "../lib/sound";

const SWATCHES = [
  ["ivoor", "#f3ecdf"],
  ["inkt", "#1a2033"],
  ["indigo", "#4a4f8c"],
  ["terracotta", "#b65a3a"],
  ["salie", "#8a9a7b"],
  ["oker", "#c2913a"],
] as const;

/** Fig. 99: een zandloper waarin het zand weigert te vallen. */
function Hourglass() {
  return (
    <svg viewBox="0 0 220 160" className="draw" aria-hidden="true">
      <path d="M70 14h80M70 146h80" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <path d="M78 14c0 40 26 50 32 66c6-16 32-26 32-66" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <path d="M78 146c0-40 26-50 32-66c6 16 32 26 32 66" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <path className="fill" d="M88 30h44c-4 22-16 30-22 40c-6-10-18-18-22-40z" fill="#c2913a" />
      <path d="M110 80v4" stroke="#c2913a" strokeWidth="1.5" strokeDasharray="1 3" />
      <path d="M160 30h40M160 80h40" stroke="currentColor" strokeWidth="0.8" />
      <circle cx="160" cy="30" r="2" fill="currentColor" />
      <circle cx="160" cy="80" r="2" fill="currentColor" />
      <text x="164" y="24" fontFamily="Geist Mono" fontSize="7" fill="currentColor">TIJD</text>
      <text x="164" y="74" fontFamily="Geist Mono" fontSize="7" fill="currentColor">OP</text>
      <text x="20" y="156" fontFamily="Geist Mono" fontSize="7" fill="currentColor">FIG. 99 — ZANDLOPER (BIJNA LEEG)</text>
    </svg>
  );
}

export function Footer() {
  const { findEgg, setEffect } = useGame();
  const [touched, setTouched] = useState<string[]>([]);

  const touch = (name: string) => {
    sfx.tick();
    const next = touched.includes(name) ? touched : [...touched, name];
    setTouched(next);
    if (next.length === SWATCHES.length) {
      findEgg("colors");
      setEffect("explosie");
      window.setTimeout(() => {
        setEffect(null);
        setTouched([]);
      }, 6000);
    }
  };

  return (
    <footer className="site-footer">
      <div className="wrap footer-sign">
        <p>
          Meer ideeën
          <br />
          dan <em>tijd</em>.
        </p>
        <Hourglass />
      </div>
      <div className="wrap footer-grid">
        <div>
          <h2>Instituut Martijn den Besten</h2>
          <p>Het officiële instituut voor ideeën, plannen en projecten die bijna af zijn. Opgericht vandaag. Kantoortijden: wanneer er tijd is.</p>
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
          <button type="button" className="hidden-dot" aria-label="Verborgen knop" onClick={() => findEgg("hidden-1")}>
            .
          </button>{" "}
          Geen cookies, geen advertentietrackers.
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
