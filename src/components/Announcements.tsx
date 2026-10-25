// Het mededelingenbulletin: wisselt automatisch, pauzeert bij hover/focus en is met knoppen te bedienen.
// Een dunne lijn toont wanneer de volgende mededeling komt. Lange teksten blijven langer staan.

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ANNOUNCEMENTS } from "../content/announcements";
import { shuffle } from "../lib/random";
import { useClickBurst, usePrefersReducedMotion } from "../lib/hooks";
import { useGame } from "../state/GameState";
import { sfx } from "../lib/sound";

/** Leestijd: minimaal 7 seconden, plus ruim de tijd voor langere mededelingen. */
export const readTime = (text: string) => Math.max(7000, 3000 + text.length * 70);

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
    const t = window.setTimeout(() => setI((x) => (x + 1) % list.length), readTime(list[i].text));
    return () => window.clearTimeout(t);
  }, [i, running, list]);

  const go = (d: number) => {
    sfx.click();
    setManual(true);
    setI((x) => (x + d + list.length) % list.length);
  };

  const a = list[i];
  const number = String(((i * 7) % 97) + 3).padStart(3, "0");
  const tilt = ((i * 5) % 7) - 3;

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
        <div key={i} className={`board__msg ${a.text.length > 150 ? "is-long" : ""}`}>
          <p>{a.text}</p>
          <span className="stamp board__stamp" style={{ "--tilt": `${tilt - 4}deg` } as CSSProperties}>
            {a.stamp}
          </span>
        </div>
      </div>
      <div className="board__timer" aria-hidden="true">
        <i key={`${i}-${running}`} style={{ "--dur": `${readTime(a.text)}ms`, animationPlayState: running ? "running" : "paused" } as CSSProperties} />
      </div>
      <div className="board__controls">
        <button type="button" className="board__nav" onClick={() => go(-1)} aria-label="Vorige mededeling">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <button
          type="button"
          className="board__pause"
          aria-pressed={userPaused}
          onClick={() => {
            sfx.click();
            setUserPaused((p) => !p);
          }}
        >
          {userPaused ? "Hervatten" : "Pauzeren"}
        </button>
        <button type="button" className="board__nav" onClick={() => go(1)} aria-label="Volgende mededeling">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <span className="board__progress label" aria-hidden="true">
          {String(i + 1).padStart(2, "0")} / {list.length}
        </span>
      </div>
    </div>
  );
}
