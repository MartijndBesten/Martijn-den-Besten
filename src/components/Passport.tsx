// Het missiepaspoort: overzicht van missies en gevonden verrassingen.

import { useState } from "react";
import { EGGS, EGG_COUNT, MISSIONS, type EggId } from "../content/progress";
import { useGame } from "../state/GameState";
import { Link } from "../router";
import { Dialog } from "./Dialog";

export function Passport() {
  const [open, setOpen] = useState(false);
  const { missions, eggs, missionProgress, reset } = useGame();
  const done = missions.length;
  const pct = done / MISSIONS.length;
  const r = 14;
  const circ = 2 * Math.PI * r;

  return (
    <>
      <button type="button" className="passport-btn no-print" onClick={() => setOpen(true)} aria-haspopup="dialog">
        <svg className="passport-btn__ring" viewBox="0 0 36 36" aria-hidden="true">
          <circle cx="18" cy="18" r={r} fill="#fff4e0" stroke="#17153a" strokeWidth="3" />
          <circle cx="18" cy="18" r={r} fill="none" stroke="#2a3bdb" strokeWidth="5" strokeDasharray={`${circ * pct} ${circ}`} transform="rotate(-90 18 18)" />
          <text x="18" y="22" textAnchor="middle" fontSize="11" fontWeight="800" fill="#17153a">{done}</text>
        </svg>
        <span>Missies <span className="visually-hidden">({done} van {MISSIONS.length} voltooid)</span></span>
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Uw missiepaspoort">
        <p>
          Het instituut heeft {MISSIONS.length} missies voor bezoekers. Uw voortgang wordt alleen in deze browser bewaard.
        </p>
        <ul className="mission-list">
          {MISSIONS.map((mi) => {
            const p = missionProgress(mi.id);
            const isDone = missions.includes(mi.id);
            return (
              <li key={mi.id} className={`mission ${isDone ? "is-done" : ""}`}>
                <span className="mission__check" aria-hidden="true">{isDone ? "✓" : "?"}</span>
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
          <button type="button" className="btn btn--small btn--creme" onClick={reset}>
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
