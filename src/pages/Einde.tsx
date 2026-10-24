import { useEffect, useState } from "react";
import { Link } from "../router";
import { useGame } from "../state/GameState";
import "../styles/pages.css";

export default function Einde() {
  const { findEgg } = useGame();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    findEgg("end");
    const a = window.setTimeout(() => setStage(1), 2800);
    const b = window.setTimeout(() => setStage(2), 5600);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [findEgg]);

  return (
    <div className="page einde">
      <div className="wrap einde__inner">
        <h1 className="einde__title">Het einde.</h1>
        <p className="einde__sub">U heeft het einde van de website bereikt. Er is hier niets. Dit was ook een idee.</p>
        {stage >= 1 && (
          <div className="einde__walker" aria-hidden="true">
            <svg viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="#ffd24d" stroke="#17153a" strokeWidth="5" />
              <circle cx="30" cy="34" r="5" fill="#17153a" />
              <circle cx="50" cy="34" r="5" fill="#17153a" />
              <path d="M28 52q12 8 24 0" fill="none" stroke="#17153a" strokeWidth="5" strokeLinecap="round" />
            </svg>
          </div>
        )}
        {stage >= 2 && (
          <div className="einde__extra" role="status">
            <p>O, u bent er nog. Dat is doorzettingsvermogen. Daar heeft het instituut een certificaat voor.</p>
            <div className="hero__ctas">
              <Link to="/certificaat" className="btn btn--koraal">Haal uw certificaat</Link>
              <Link to="/" className="btn btn--creme">Terug naar het begin</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
