// Het mededelingenbulletin: wisselt automatisch, pauzeert bij hover/focus en is met knoppen te bedienen.
// Een dunne lijn toont wanneer de volgende mededeling komt.

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ANNOUNCEMENTS } from "../content/announcements";
import { shuffle } from "../lib/random";
import { useClickBurst, usePrefersReducedMotion } from "../lib/hooks";
import { useGame } from "../state/GameState";
import { sfx } from "../lib/sound";

const INTERVAL = 7000;

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
  const running = !(paused || userPaused || reduced);

  useEffect(() => {
    if (!running) return;
    const t = window.setTimeout(() => setI((x) => (x + 1) % list.length), INTERVAL);
    return () => window.clearTimeout(t);
  }, [i, running, list.length]);

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
      <div className="board__head label">
        <span>
          Mededeling {number}/{new Date().getFullYear()}
        </span>
        <span>Afd. {a.dept}</span>
      </div>
      <div className="board__screen" onClick={() => burst()} aria-live={manual ? "polite" : "off"} aria-atomic="true">
        <div key={i} className="board__msg">
          <p>{a.text}</p>
          <span className="stamp board__stamp">{a.stamp}</span>
        </div>
      </div>
      <div className="board__timer" aria-hidden="true">
        <i key={`${i}-${running}`} style={{ "--dur": `${INTERVAL}ms`, animationPlayState: running ? "running" : "paused" } as CSSProperties} />
      </div>
      <div className="board__controls">
        <button type="button" className="btn btn--small" onClick={() => go(-1)} aria-label="Vorige mededeling">
          ←
        </button>
        <button
          type="button"
          className="btn btn--small"
          aria-pressed={userPaused}
          onClick={() => {
            sfx.click();
            setUserPaused((p) => !p);
          }}
        >
          {userPaused ? "Hervatten" : "Pauzeren"}
        </button>
        <button type="button" className="btn btn--small" onClick={() => go(1)} aria-label="Volgende mededeling">
          →
        </button>
        <span className="board__progress label" aria-hidden="true">
          {String(i + 1).padStart(2, "0")} / {list.length}
        </span>
      </div>
    </div>
  );
}
