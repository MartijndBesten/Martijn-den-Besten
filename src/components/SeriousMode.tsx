// De serieuze modus: een overdreven zakelijke website die het niet lang volhoudt.

import { useEffect, useRef, useState } from "react";
import { useGame } from "../state/GameState";

const SECONDS = 15;

export function SeriousMode() {
  const { serious, setSerious, findEgg } = useGame();
  const [left, setLeft] = useState(SECONDS);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!serious) return;
    setLeft(SECONDS);
    closeRef.current?.focus();
    const iv = window.setInterval(() => setLeft((s) => s - 1), 1000);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSerious(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.clearInterval(iv);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [serious, setSerious]);

  useEffect(() => {
    if (serious && left <= 0) {
      setSerious(false);
      findEgg("serious");
    }
  }, [left, serious, setSerious, findEgg]);

  if (!serious) return null;

  return (
    <div className="serious" role="dialog" aria-modal="true" aria-label="Serieuze modus">
      <div className="serious__bar">
        <span className="serious__logo">Martijn den Besten B.V. | Holding Group International</span>
        <nav className="serious__nav" aria-label="Zakelijk menu">
          <span>Oplossingen</span>
          <span>Synergie</span>
          <span>Stakeholders</span>
          <span>Investor Relations</span>
          <span>Contact</span>
        </nav>
      </div>
      <div className="serious__hero">
        <div className="serious__inner">
          <p style={{ margin: "0 0 8px", opacity: 0.8, fontSize: 14 }}>CORPORATE · SINDS 2026</p>
          <h2>Wij leveren schaalbare, toekomstbestendige en klantgerichte oplossingen in een dynamisch speelveld.</h2>
          <p style={{ maxWidth: 640, opacity: 0.85 }}>
            Door een holistische benadering van kernwaarden creëren wij duurzame meerwaarde voor alle stakeholders in de keten, end-to-end.
          </p>
          <button ref={closeRef} className="serious__btn" type="button" onClick={() => setSerious(false)}>
            Neem contact op met een accountmanager
          </button>
          <p className="serious__timer" aria-live="polite">
            Serieuze modus houdt het nog {Math.max(left, 0)} seconden vol. Druk op Escape om eerder te ontsnappen.
          </p>
        </div>
      </div>
      <div className="serious__inner serious__cols">
        {[
          ["Agile", "Wij werken in sprints van twee weken die drie maanden duren."],
          ["Lean", "Wij elimineren verspilling, behalve in vergaderingen."],
          ["Data-driven", "Al onze besluiten zijn gebaseerd op een gevoel dat in Excel staat."],
          ["Innovatie", "Wij denken buiten de box, maar binnen de kaders van de box."],
        ].map(([t, d]) => (
          <div className="serious__card" key={t}>
            <div className="serious__photo">Stockfoto van een handdruk</div>
            <h3>{t}</h3>
            <p style={{ fontSize: 14, margin: 0 }}>{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
