// Het mededelingenbord: wisselt automatisch, pauzeert bij hover/focus en is met knoppen te bedienen.

import { useEffect, useMemo, useRef, useState } from "react";
import { ANNOUNCEMENTS } from "../content/announcements";
import { shuffle } from "../lib/random";
import { useClickBurst, usePrefersReducedMotion } from "../lib/hooks";
import { useGame } from "../state/GameState";
import { sfx } from "../lib/sound";

const INTERVAL = 6500;

export function Announcements() {
  const list = useMemo(() => shuffle(ANNOUNCEMENTS), []);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [manual, setManual] = useState(false);
  const reduced = usePrefersReducedMotion();
  const { findEgg } = useGame();
  const boardRef = useRef<HTMLDivElement>(null);
  const burst = useClickBurst(10, 5000, () => findEgg("board"));

  useEffect(() => {
    if (paused || userPaused || reduced) return;
    const t = window.setTimeout(() => setI((x) => (x + 1) % list.length), INTERVAL);
    return () => window.clearTimeout(t);
  }, [i, paused, userPaused, reduced, list.length]);

  const go = (d: number) => {
    sfx.click();
    setManual(true);
    setI((x) => (x + d + list.length) % list.length);
  };

  const a = list[i];
  const number = String(((i * 7) % 97) + 3).padStart(3, "0");

  return (
    <div
      className="board"
      ref={boardRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!boardRef.current?.contains(e.relatedTarget as Node)) setPaused(false);
      }}
    >
      <div className="board__head">
        <span className="label">Mededeling {number}/{new Date().getFullYear()}</span>
        <span className="label board__dept">Afd. {a.dept}</span>
      </div>
      <div className="board__screen" onClick={() => burst()} aria-live={manual ? "polite" : "off"} aria-atomic="true">
        <div key={i} className="board__msg">
          <p>{a.text}</p>
          <span className="stamp board__stamp">{a.stamp}</span>
        </div>
      </div>
      <div className="board__controls">
        <button type="button" className="btn btn--small btn--creme" onClick={() => go(-1)} aria-label="Vorige mededeling">←</button>
        <button
          type="button"
          className="btn btn--small btn--creme"
          aria-pressed={userPaused}
          onClick={() => {
            sfx.click();
            setUserPaused((p) => !p);
          }}
        >
          {userPaused ? "Hervatten" : "Pauzeren"}
        </button>
        <button type="button" className="btn btn--small" onClick={() => go(1)} aria-label="Volgende mededeling">→</button>
        <span className="board__progress label" aria-hidden="true">
          {i + 1} / {list.length}
        </span>
      </div>
    </div>
  );
}
