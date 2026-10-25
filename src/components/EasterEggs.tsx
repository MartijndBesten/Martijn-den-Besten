// Globale verrassingen: geheime toetscombinaties, getypte woorden, een screensaver en het tabblad.

import { useEffect, useRef, useState } from "react";
import { useGame } from "../state/GameState";
import { sfx } from "../lib/sound";

const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
const IDLE_MS = 60_000;

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName);
}

export function EasterEggs() {
  const game = useGame();
  const gameRef = useRef(game);
  gameRef.current = game;
  const [coffee, setCoffee] = useState(0);
  const [rest, setRest] = useState<"" | "rust" | "afgebroken">("");
  const [idle, setIdle] = useState(false);

  // Toetsenbord: Konami-code en woorden.
  useEffect(() => {
    let keys: string[] = [];
    let typed = "";
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      keys = [...keys, k].slice(-KONAMI.length);
      const g = gameRef.current;
      if (keys.join() === KONAMI.join()) {
        keys = [];
        const night = document.documentElement.dataset.theme !== "nacht";
        g.setTheme(night ? "nacht" : "normaal");
        g.findEgg("konami");
        if (!night) g.notify("Dagdienst", "De directiemodus is uitgeschakeld.");
      }
      if (k.length === 1 && /[a-z]/.test(k)) {
        typed = (typed + k).slice(-12);
        if (typed.endsWith("koffie")) {
          typed = "";
          g.addCoffee();
          g.findEgg("koffie");
          setCoffee((c) => c + 1);
          sfx.blip();
        } else if (typed.endsWith("geheim")) {
          typed = "";
          g.unlockSecret();
          g.findEgg("geheim");
        } else if (typed.endsWith("rust")) {
          typed = "";
          setRest("rust");
          window.setTimeout(() => setRest("afgebroken"), 2600);
          window.setTimeout(() => setRest(""), 5200);
          g.findEgg("rust");
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Tabblad verlaten en terugkomen.
  useEffect(() => {
    let leftAt = 0;
    let original = document.title;
    const onVis = () => {
      if (document.hidden) {
        leftAt = Date.now();
        original = document.title;
        document.title = "Kom terug! Er is een nieuw idee.";
      } else {
        document.title = original;
        if (leftAt && Date.now() - leftAt > 2000) gameRef.current.findEgg("tab");
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Screensaver na een minuut niets doen (één keer per bezoek).
  useEffect(() => {
    let timer = 0;
    let shown = false;
    const arm = () => {
      window.clearTimeout(timer);
      if (shown) return;
      timer = window.setTimeout(() => {
        if (document.hidden || gameRef.current.serious) return arm();
        shown = true;
        setIdle(true);
        gameRef.current.findEgg("idle");
      }, IDLE_MS);
    };
    const events = ["pointermove", "pointerdown", "keydown", "scroll", "touchstart"] as const;
    events.forEach((ev) => window.addEventListener(ev, arm, { passive: true }));
    arm();
    return () => {
      window.clearTimeout(timer);
      events.forEach((ev) => window.removeEventListener(ev, arm));
    };
  }, []);

  useEffect(() => {
    if (!idle) return;
    const wake = () => setIdle(false);
    const events = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
    const t = window.setTimeout(() => events.forEach((ev) => window.addEventListener(ev, wake, { once: true })), 300);
    return () => {
      window.clearTimeout(t);
      events.forEach((ev) => window.removeEventListener(ev, wake));
    };
  }, [idle]);

  // Een bericht voor wie de ontwikkelaarstools opent.
  useEffect(() => {
    const w = window as Window & { __mdbConsole?: boolean };
    if (w.__mdbConsole) return;
    w.__mdbConsole = true;
    console.log(
      "%cInstituut Martijn den Besten%c\n\nVacature: iemand die projecten afmaakt.\nTip: typ eens ‘koffie’, ‘rust’ of ‘geheim’ op de pagina. Of probeer ↑ ↑ ↓ ↓ ← → ← → b a.",
      "font: italic 22px Georgia, serif; color: #c2913a; background: #1a2033; padding: 8px 14px",
      "font: 14px monospace; color: inherit",
    );
  }, []);

  return (
    <>
      {coffee > 0 && <CoffeeRain key={coffee} />}
      {rest && (
        <div className={`rest-overlay ${rest === "afgebroken" ? "is-broken" : ""}`} role="status" aria-live="assertive">
          <p>{rest === "rust" ? "Rustmoment gestart…" : "Fout 404: rustmoment niet gevonden. Er is een nieuw idee binnengekomen."}</p>
        </div>
      )}
      {idle && (
        <div className="screensaver" role="status" aria-live="polite" aria-label="Screensaver: even niets doen">
          <div className="screensaver__logo">
            Even niets doen…
            <small>Poging om niets te doen geregistreerd. Beweeg om te stoppen.</small>
          </div>
        </div>
      )}
    </>
  );
}

function CoffeeRain() {
  const cups = Array.from({ length: 16 }, (_, i) => i);
  return (
    <div className="coffee-rain" aria-hidden="true">
      {cups.map((i) => (
        <svg
          key={i}
          viewBox="0 0 60 60"
          style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 6) * 0.18}s`, animationDuration: `${2.2 + (i % 4) * 0.4}s` }}
        >
          <path d="M10 18h34v18a14 14 0 0 1-14 14h-6A14 14 0 0 1 10 36z" fill="var(--bg)" stroke="currentColor" strokeWidth="1.5" />
          <path d="M44 24h4a6 6 0 0 1 0 12h-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M14 23h26v5H14z" fill="#9a4529" />
          <path d="M22 4c-3 4 3 6 0 10M32 4c-3 4 3 6 0 10" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      ))}
    </div>
  );
}
