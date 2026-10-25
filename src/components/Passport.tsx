// Het missiepaspoort: overzicht van missies en gevonden verrassingen.

import { useEffect, useRef, useState } from "react";
import { DISCOVERY_STEPS, EGGS, EGG_COUNT, MISSIONS, type EggId } from "../content/progress";
import { useGame } from "../state/GameState";
import { Link } from "../router";
import { Dialog } from "./Dialog";
import { RankBar } from "./StampCard";

export function Passport() {
  const [open, setOpen] = useState(false);
  const { missions, eggs, missionProgress, reset } = useGame();
  const done = missions.length;
  const pct = done / MISSIONS.length;
  const r = 13;
  const circ = 2 * Math.PI * r;
  // Even opveren als er een missie bijkomt, zodat de bezoeker ziet waar de voortgang staat.
  const [bumped, setBumped] = useState(false);
  const prev = useRef(done);
  useEffect(() => {
    if (done > prev.current) {
      setBumped(true);
      const t = window.setTimeout(() => setBumped(false), 800);
      prev.current = done;
      return () => window.clearTimeout(t);
    }
    prev.current = done;
  }, [done]);

  return (
    <>
      <button type="button" className={`passport-btn ${bumped ? "is-bumped" : ""}`} onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label={`Missies: ${done} van ${MISSIONS.length} voltooid`}>
        <svg className="passport-btn__ring" viewBox="0 0 36 36" aria-hidden="true">
          <circle cx="18" cy="18" r={r} fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
          <circle cx="18" cy="18" r={r} fill="none" stroke="#ee9aac" strokeWidth="3.5" strokeLinecap="round" strokeDasharray={`${Math.max(0.01, circ * pct)} ${circ}`} transform="rotate(-90 18 18)" />
          <path d="M13 18.5l3.2 3.2 6.5-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity={done === MISSIONS.length ? 1 : 0} />
          <circle cx="18" cy="18" r="3.4" fill="currentColor" opacity={done === MISSIONS.length ? 0 : 0.85} />
        </svg>
        <span className="passport-btn__count" aria-hidden="true">
          {done}/{MISSIONS.length}
        </span>
        <span className="passport-btn__label" aria-hidden="true">Missies</span>
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Uw missiepaspoort">
        <p>
          Het instituut heeft {MISSIONS.length} missies voor bezoekers. Uw voortgang wordt alleen in deze browser bewaard.
        </p>
        <RankBar />
        <ul className="mission-list">
          {MISSIONS.map((mi) => {
            const p = missionProgress(mi.id);
            const isDone = missions.includes(mi.id);
            return (
              <li key={mi.id} className={`mission ${isDone ? "is-done" : ""}`}>
                <span className="mission__check" aria-hidden="true">{isDone ? "✓" : "?"}</span>
                {isDone && (
                  <span className="mission__stamp stamp" aria-hidden="true">
                    Voltooid
                  </span>
                )}
                <div>
                  <strong>
                    {mi.title}
                    <span className="visually-hidden">{isDone ? " (voltooid)" : " (nog niet voltooid)"}</span>
                  </strong>
                  <small>{mi.hint}</small>
                  {mi.goal && !isDone && (
                    <div className="meter" role="progressbar" aria-label={`Voortgang ${mi.title}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(p * 100)}>
                      <span style={{ width: `${p * 100}%` }} />
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        <h3 style={{ fontSize: "1.4rem" }}>
          Verrassingen gevonden: {eggs.length} / {EGG_COUNT}
        </h3>
        <p className="label passport__next">
          {(() => {
            const next = DISCOVERY_STEPS.find((n) => eggs.length < n);
            return next ? `Bij ${next} ontdekkingen verandert er iets op de website.` : "Alle ontdekkingsniveaus bereikt. Kijk eens naar de zandloper onderaan.";
          })()}
        </p>
        <ul className="egg-grid">
          {(Object.keys(EGGS) as EggId[]).map((id) => (
            <li key={id} className={eggs.includes(id) ? "" : "is-unknown"}>
              {eggs.includes(id) ? EGGS[id].title : "???"}
            </li>
          ))}
        </ul>
        {done === MISSIONS.length && (
          <p className="form-message form-message--ok">
            Alle missies voltooid. U bent officieel Opperbezoeker.{" "}
            <Link to="/certificaat?prestatie=opper" onClick={() => setOpen(false)}>Haal uw certificaat op</Link>.
          </p>
        )}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
          <button type="button" className="btn btn--small btn--ivory" onClick={reset}>
            Voortgang wissen
          </button>
          <button type="button" className="btn btn--small" onClick={() => setOpen(false)}>
            Verder ontdekken
          </button>
        </div>
      </Dialog>
    </>
  );
}
