import { useEffect, useState } from "react";
import { NAV } from "../content/site";
import { Link, useRouter } from "../router";
import { useGame } from "../state/GameState";
import { useClickBurst } from "../lib/hooks";
import { sfx } from "../lib/sound";
import { Seal } from "./Seal";
import { Passport } from "./Passport";
import { AppearanceOptions, ThemeSwitch } from "./ThemeSwitch";
import { IconClose, IconMenu } from "./Icons";

export function Header() {
  const { path, navigate } = useRouter();
  const { sound, setSound, findEgg } = useGame();
  const [menu, setMenu] = useState(false);
  const [spinning, setSpinning] = useState(false);

  const burst = useClickBurst(5, 2500, () => {
    setSpinning(true);
    findEgg("logo");
    window.setTimeout(() => setSpinning(false), 2400);
  });

  useEffect(() => setMenu(false), [path]);
  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  const isActive = (p: string) => (p === "/" ? path === "/" : path.startsWith(p));

  return (
    <header className="site-header">
      <div className="site-header__bar">
        <button
          type="button"
          className={`seal ${spinning ? "is-spinning" : ""}`}
          onClick={() => {
            sfx.tick();
            burst();
          }}
          aria-label="Officieel zegel van het instituut"
        >
          <Seal />
        </button>
        <Link to="/" className="brand" aria-label="Martijn den Besten, naar het hoofdkwartier">
          Martijn den Besten
          <small>Instituut voor onafgemaakte zaken</small>
        </Link>
        <nav className="nav" aria-label="Hoofdnavigatie">
          {NAV.map((r, i) => (
            <Link key={r.path} to={r.path} aria-current={isActive(r.path) ? "page" : undefined}>
              <span aria-hidden="true">0{i + 1}</span>
              {r.nav}
            </Link>
          ))}
        </nav>
        <ThemeSwitch />
        <Passport />
        <button type="button" className="sound-toggle" aria-pressed={sound} aria-label={sound ? "Geluid uitzetten" : "Geluid aanzetten"} onClick={() => setSound(!sound)}>
          <i aria-hidden="true" />
          <span>Geluid {sound ? "aan" : "uit"}</span>
        </button>
        <button type="button" className="icon-btn menu-toggle" aria-expanded={menu} aria-controls="mobiel-menu" aria-label="Menu openen" onClick={() => setMenu(true)}>
          <IconMenu />
        </button>
      </div>
      {menu && (
        <div className="mobile-menu" id="mobiel-menu" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="mobile-menu__top">
            <span className="label">Inhoudsopgave</span>
            <button type="button" className="icon-btn" aria-label="Menu sluiten" onClick={() => setMenu(false)} autoFocus>
              <IconClose />
            </button>
          </div>
          <nav aria-label="Mobiele navigatie">
            {NAV.map((r, i) => (
              <a
                key={r.path}
                href={r.path}
                aria-current={isActive(r.path) ? "page" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(r.path);
                }}
              >
                <span>0{i + 1}</span>
                {r.nav}
              </a>
            ))}
            <a href="/loket" onClick={(e) => { e.preventDefault(); navigate("/loket"); }}>
              <span>05</span>Ideeënloket
            </a>
            <a href="/bureau" onClick={(e) => { e.preventDefault(); navigate("/bureau"); }}>
              <span>06</span>Bureau
            </a>
          </nav>
          <div className="mobile-menu__settings">
            <span className="label">Uiterlijk</span>
            <AppearanceOptions />
            <button type="button" className="sound-toggle" aria-pressed={sound} onClick={() => setSound(!sound)}>
              <i aria-hidden="true" />
              Geluid {sound ? "aan" : "uit"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
