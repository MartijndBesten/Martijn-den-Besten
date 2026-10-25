// De stempelkaart: elke voltooide missie krijgt een officiële, licht scheve stempel.
// Nieuw verdiende stempels worden één keer ‘gezet’ (animatie); welke al gezien zijn,
// staat alleen in deze browser (localStorage), net als de rest van de voortgang.

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { MISSIONS, type MissionId } from "../content/progress";
import { load, save } from "../lib/storage";
import { useGame } from "../state/GameState";

const SEEN_KEY = "mdb:gestempeld";
const TONES = ["koraal", "kobalt", "salie", "lila", "boter", "koraal", "kobalt", "salie"] as const;

export function rankFor(done: number): string {
  if (done >= MISSIONS.length) return "Opperbezoeker";
  if (done >= 5) return "Ere-uitvinder";
  if (done >= 3) return "Vaste gast";
  if (done >= 1) return "Bezoeker";
  return "Nieuwkomer";
}

/** Rang en voortgangsbalk; ook gebruikt in het missiepaspoort. */
export function RankBar() {
  const { missions } = useGame();
  const done = missions.length;
  return (
    <div className="stampcard__rank">
      <span className="label">Rang</span>
      <strong>{rankFor(done)}</strong>
      <span className="stampcard__meter" role="progressbar" aria-label="Voltooide missies" aria-valuemin={0} aria-valuemax={MISSIONS.length} aria-valuenow={done}>
        {MISSIONS.map((m, i) => (
          <i key={m.id} className={i < done ? "is-on" : ""} />
        ))}
      </span>
      <span className="label">
        {done}/{MISSIONS.length}
      </span>
    </div>
  );
}

export function StampCard({ compact = false }: { compact?: boolean }) {
  const { missions } = useGame();
  const [seen] = useState<MissionId[]>(() => load<MissionId[]>(SEEN_KEY, []));
  const fresh = useMemo(() => missions.filter((m) => !seen.includes(m)), [missions, seen]);

  // Na het zetten van de stempel onthouden dat hij gezien is.
  useEffect(() => {
    if (!fresh.length) return;
    const t = window.setTimeout(() => save(SEEN_KEY, Array.from(new Set([...seen, ...missions]))), 1600);
    return () => window.clearTimeout(t);
  }, [fresh, seen, missions]);

  return (
    <div className={`stampcard ${compact ? "stampcard--compact" : ""}`}>
      <RankBar />
      <ol className="stampcard__grid">
        {MISSIONS.map((m, i) => {
          const isDone = missions.includes(m.id);
          const tilt = ((i * 37) % 17) - 8;
          return (
            <li key={m.id} className={`stampcard__slot tone-${TONES[i]} ${isDone ? "is-done" : ""} ${fresh.includes(m.id) ? "is-fresh" : ""}`}>
              <span className="stampcard__no" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="stampcard__title">
                {m.title}
                <span className="visually-hidden">{isDone ? " (voltooid)" : " (nog niet voltooid)"}</span>
              </span>
              {isDone && (
                <span className="stampcard__stamp" aria-hidden="true" style={{ "--tilt": `${tilt}deg` } as CSSProperties}>
                  Voltooid
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
