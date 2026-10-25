import { useState } from "react";
import { Link } from "../router";
import { useGame } from "../state/GameState";
import { sfx } from "../lib/sound";

const SWATCHES = [
  ["ivoor", "#f5efe4"],
  ["kobalt", "#3c5bd6"],
  ["koraal", "#f2785c"],
  ["salie", "#9fc39a"],
  ["lila", "#c3b2f0"],
  ["boter", "#f6d36b"],
] as const;

/** Fig. 99: een zandloper waarin het zand weigert te vallen. */
function Hourglass() {
  return (
    <svg viewBox="0 0 220 160" aria-hidden="true" className="hourglass">
      <ellipse cx="110" cy="150" rx="56" ry="6" fill="#000" opacity=".25" />
      <rect x="62" y="8" width="96" height="12" rx="6" fill="#c3b2f0" />
      <rect x="62" y="140" width="96" height="12" rx="6" fill="#c3b2f0" />
      <path d="M76 20c0 40 26 48 34 60c8-12 34-20 34-60z" fill="rgba(245,239,228,.14)" stroke="#f5efe4" strokeWidth="2" />
      <path d="M76 140c0-40 26-48 34-60c8 12 34 20 34 60z" fill="rgba(245,239,228,.14)" stroke="#f5efe4" strokeWidth="2" />
      <path className="hourglass__sand" d="M86 32h48c-4 20-16 28-24 38c-8-10-20-18-24-38z" fill="#f6d36b" />
      <path d="M110 80v6" stroke="#f6d36b" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 4" />
      <path d="M90 34q4 18 12 26" stroke="#fff" strokeOpacity=".5" strokeWidth="3" strokeLinecap="round" fill="none" />
      <text x="168" y="34" fontFamily="Geist Mono" fontSize="8" fill="#f5efe4" opacity=".7">TIJD: OP</text>
      <path d="M150 30h14" stroke="#f5efe4" strokeOpacity=".5" />
      <text x="20" y="158" fontFamily="Geist Mono" fontSize="7" fill="#f5efe4" opacity=".55">FIG. 99 — ZANDLOPER (BIJNA LEEG)</text>
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
