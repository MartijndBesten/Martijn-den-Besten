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
            <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="1.4">
              <circle cx="40" cy="40" r="30" fill="#c2913a" stroke="none" />
              <circle cx="40" cy="40" r="30" />
              <circle cx="31" cy="36" r="2.5" fill="currentColor" stroke="none" />
              <circle cx="49" cy="36" r="2.5" fill="currentColor" stroke="none" />
              <path d="M30 50q10 7 20 0" strokeLinecap="round" />
            </svg>
          </div>
        )}
        {stage >= 2 && (
          <div className="einde__extra" role="status">
            <p>O, u bent er nog. Dat is doorzettingsvermogen. Daar heeft het instituut een certificaat voor.</p>
            <div className="hero__ctas">
              <Link to="/certificaat" className="btn btn--terra">Haal uw certificaat</Link>
              <Link to="/" className="btn btn--ivory">Terug naar het begin</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
