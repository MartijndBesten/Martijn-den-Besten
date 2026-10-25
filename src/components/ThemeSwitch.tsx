// Kiezer voor het uiterlijk van de site: ivoor (dag), blauwdruk (tekenkamer) of nachtdienst.
// De keuze wordt alleen in de browser van de bezoeker onthouden.

import { useEffect, useId, useRef, useState } from "react";
import { APPEARANCES, useGame, type Appearance } from "../state/GameState";
import { sfx } from "../lib/sound";

export const APPEARANCE_INFO: Record<Appearance, { name: string; note: string; colors: [string, string, string] }> = {
  ivoor: { name: "Ivoor", note: "Dagdienst, op papier", colors: ["#f3ecdf", "#1a2033", "#b65a3a"] },
  blauwdruk: { name: "Blauwdruk", note: "De tekenkamer", colors: ["#1d3b74", "#f1f4fb", "#ffcf70"] },
  nacht: { name: "Nachtdienst", note: "Na sluitingstijd", colors: ["#141a2b", "#efe7d8", "#d9a24a"] },
};

function Swatch({ colors }: { colors: [string, string, string] }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" className="swatch-mini">
      <circle cx="12" cy="12" r="11" fill={colors[0]} stroke="currentColor" strokeWidth="1" />
      <path d="M12 1a11 11 0 0 1 0 22z" fill={colors[1]} />
      <circle cx="12" cy="12" r="4" fill={colors[2]} />
    </svg>
  );
}

/** Lijst met de drie uiterlijken; ook gebruikt in het mobiele menu. */
export function AppearanceOptions({ onChoose }: { onChoose?: () => void }) {
  const { appearance, setAppearance } = useGame();
  return (
    <div role="radiogroup" aria-label="Uiterlijk van de website" className="appearance-options">
      {APPEARANCES.map((a) => (
        <button
          key={a}
          type="button"
          role="radio"
          aria-checked={appearance === a}
          className="appearance-option"
          onClick={() => {
            sfx.click();
            setAppearance(a);
            onChoose?.();
          }}
        >
          <Swatch colors={APPEARANCE_INFO[a].colors} />
          <span>
            <strong>{APPEARANCE_INFO[a].name}</strong>
            <small>{APPEARANCE_INFO[a].note}</small>
          </span>
        </button>
      ))}
    </div>
  );
}

export function ThemeSwitch() {
  const { appearance } = useGame();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="theme-switch" ref={ref}>
      <button
        type="button"
        className="theme-switch__toggle"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`Uiterlijk kiezen, nu: ${APPEARANCE_INFO[appearance].name}`}
        onClick={() => setOpen((o) => !o)}
      >
        <Swatch colors={APPEARANCE_INFO[appearance].colors} />
        <span className="theme-switch__label">{APPEARANCE_INFO[appearance].name}</span>
      </button>
      {open && (
        <div className="theme-switch__panel" id={panelId}>
          <span className="label">Uiterlijk</span>
          <AppearanceOptions onChoose={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
