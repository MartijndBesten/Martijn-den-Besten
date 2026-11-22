// De strooiroute over de pagina: begint bij de korrels onder de zak in de hero, loopt bij het scrollen langs de drie
// stappen (die oplichten als de route ze bereikt) en gaat in de buurtsectie over in het trottoir naar de deur van de
// buur (scene.tsx › Straat, via de CSS-variabele --straat). Eén SVG-pad dat over de inhoud ligt: geen invloed op de
// opmaak, geen klikken onderscheppen, geen maskers of filters. De route loopt alleen vooruit en blijft daarna staan.
// Bij ‘minder beweging’ staat direct het eindbeeld er.

import { useEffect, useRef, useState } from "react";
import { minderBeweging } from "./beweging";

type Vorm = { d: string; w: number; h: number; grens: number; smal: boolean };

/** Plaats van een element op de pagina, zonder (tijdelijke) transformaties van animaties mee te tellen. */
function plek(el: HTMLElement): { x: number; y: number } {
  let x = 0;
  let y = 0;
  for (
    let e: HTMLElement | null = el;
    e;
    e = e.offsetParent as HTMLElement | null
  ) {
    x += e.offsetLeft;
    y += e.offsetTop;
  }
  return { x, y };
}

/** Bouwt het pad door de pictogrammen van de stappen, in coördinaten van de omhullende `.wn-tocht`. */
function bouw(doos: HTMLElement): Vorm | null {
  const iconen = [...doos.querySelectorAll<HTMLElement>(".wn-stappen__icoon")];
  const stappen = doos.querySelector<HTMLElement>(".wn-stappen");
  const inhoud = doos.querySelector<HTMLElement>(".wn-stappen .sz-wrap");
  const beeld = doos.querySelector<HTMLElement>(".wn-buur__beeld");
  const laatste = iconen[iconen.length - 1]?.closest<HTMLElement>("li");
  if (iconen.length < 2 || !stappen || !inhoud || !beeld || !laatste)
    return null;
  const nul = plek(doos);
  const rel = (el: HTMLElement) => {
    const p = plek(el);
    return {
      x: p.x - nul.x,
      y: p.y - nul.y,
      w: el.offsetWidth,
      h: el.offsetHeight,
    };
  };
  const ic = iconen.map((el) => {
    const r = rel(el);
    return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
  });
  const w = doos.offsetWidth;
  const h = doos.offsetHeight;
  const grens = rel(stappen).h; // tot hier is de achtergrond licht, daaronder donker
  const eind = rel(beeld).y - 10; // net boven de straat; daar neemt het trottoir het over
  const wrap = rel(inhoud);
  const marge = Number.parseFloat(getComputedStyle(inhoud).paddingLeft) || 16;
  const smal = Math.abs(ic[0].y - ic[1].y) > 8; // stappen onder elkaar (telefoon) of naast elkaar
  const n = (v: number) => v.toFixed(1);

  if (smal) {
    const x = ic[0].x;
    const goot = Math.max(7, marge / 2);
    // Naast de straat is links een smalle baan vrijgelaten (winter.css): de lijn loopt daar door tot het trottoir,
    // zodat hij aansluit op het laatste stuk naar de deur van de buur.
    const st = rel(beeld);
    const trottoirSmal = st.y + st.h - (310 - 278) * Math.max(st.w / 960, st.h / 310);
    const naastStraat = goot + 6 <= st.x;
    const onder = rel(laatste);
    const voet = onder.y + onder.h;
    // Vanuit de hero eerst langs de linkerrand omlaag (om de koptekst heen), dan de eerste stap in.
    const eerste = rel(iconen[0].closest<HTMLElement>("li") ?? iconen[0]);
    const bocht = Math.max(40, eerste.y - 34);
    let d = `M${n(x)} -26 C${n(x)} 0 ${n(goot)} -6 ${n(goot)} 22 L${n(goot)} ${n(bocht)} C${n(goot)} ${n(bocht + 30)} ${n(x)} ${n(bocht + 6)} ${n(x)} ${n(ic[0].y)}`;
    for (let i = 1; i < ic.length; i++) {
      const dy = (ic[i].y - ic[i - 1].y) / 3;
      const g = i % 2 ? 9 : -9;
      d += ` C${n(x + g)} ${n(ic[i - 1].y + dy)} ${n(x - g)} ${n(ic[i].y - dy)} ${n(x)} ${n(ic[i].y)}`;
    }
    d += ` L${n(x)} ${n(voet - 6)} C${n(x)} ${n(voet + 26)} ${n(goot)} ${n(voet + 10)} ${n(goot)} ${n(voet + 46)} L${n(goot)} ${n(naastStraat ? trottoirSmal : eind)}`;
    return { d, w, h, grens, smal };
  }

  // Breed scherm: via de linkermarge omlaag, dwars door de drie stappen, en langs de rechtermarge naar de straat.
  const y = ic[0].y;
  const links = Math.max(14, wrap.x + marge - 40);
  const rechts = Math.min(w - 14, wrap.x + wrap.w - marge + 40);
  const R = 34;
  // Begin: het einde van de gestrooide route onder de zak in de hero (als die er is).
  const scene = document.querySelector<HTMLElement>(".wn-hero__scene");
  let sx = links;
  let sy = -36;
  if (scene) {
    const s = plek(scene);
    sx = s.x - nul.x + scene.offsetWidth * 0.2;
    sy = Math.min(-24, s.y - nul.y + scene.offsetHeight * 0.985);
  }
  let d = `M${n(sx)} ${n(sy)} C${n(sx - 50)} ${n(sy + 46)} ${n(links)} ${n(Math.min(-8, sy + 70))} ${n(links)} 34`;
  d += ` L${n(links)} ${n(y - R)} Q${n(links)} ${n(y)} ${n(links + R)} ${n(y)} L${n(ic[0].x)} ${n(y)}`;
  for (let i = 1; i < ic.length; i++) {
    const dx = (ic[i].x - ic[i - 1].x) / 3;
    const g = i % 2 ? 12 : -12;
    d += ` C${n(ic[i - 1].x + dx)} ${n(y - g)} ${n(ic[i].x - dx)} ${n(y + g)} ${n(ic[i].x)} ${n(y)}`;
  }
  // Past de lijn naast de straat, dan loopt hij door tot het trottoir (daar neemt de straat het over).
  const straat = rel(beeld);
  const schaal = Math.max(straat.w / 960, straat.h / 310);
  const trottoir = straat.y + straat.h - (310 - 278) * schaal;
  const totTrottoir = rechts - 6 >= straat.x + straat.w;
  d += ` L${n(rechts - R)} ${n(y)} Q${n(rechts)} ${n(y)} ${n(rechts)} ${n(y + R)} L${n(rechts)} ${n(totTrottoir ? trottoir : eind)}`;
  return { d, w, h, grens, smal };
}

/** Streepjespatroon voor `aantal` korrels op gelijke afstand; na de laatste korrel volgt alleen nog leegte. */
const korrels = (aantal: number, afstand: number, groot: number) => (aantal < 1 ? `0 ${groot}` : `${`0.1 ${afstand - 0.1} `.repeat(aantal - 1)}0.1 ${groot}`);

/** Koppelt de route aan de scroll. Geeft een opruimfunctie terug. */
function begin(
  el: SVGSVGElement,
  lijn: SVGPathElement,
  doos: HTMLElement,
): (() => void) | undefined {
  const beeld = doos.querySelector<HTMLElement>(".wn-buur__beeld");
  const stappen = [
    ...doos.querySelectorAll<HTMLElement>(".wn-stappen__lijst li"),
  ];
  const lengte = lijn.getTotalLength();
  const top = plek(doos).y;

  // Tabel: bij welke lengte is de route hoe ver naar beneden (voor de koppeling aan de scroll), en waar ligt elke stap.
  const stap = 10;
  const diepte: number[] = [];
  const drempel = stappen.map(() => lengte);
  const iconen = stappen.map((li) => {
    const i = li.querySelector<HTMLElement>(".wn-stappen__icoon");
    if (!i) return null;
    const p = plek(i);
    return {
      x: p.x - plek(doos).x + i.offsetWidth / 2,
      y: p.y - top + i.offsetHeight / 2,
      beste: Number.POSITIVE_INFINITY,
    };
  });
  let laagst = Number.NEGATIVE_INFINITY;
  for (let l = 0; l <= lengte; l += stap) {
    const p = lijn.getPointAtLength(l);
    laagst = Math.max(laagst, p.y);
    diepte.push(top + laagst);
    iconen.forEach((ic, i) => {
      if (!ic) return;
      const a = (p.x - ic.x) ** 2 + (p.y - ic.y) ** 2;
      if (a < ic.beste) {
        ic.beste = a;
        drempel[i] = l;
      }
    });
  }

  let getoond = 0;
  let straat = 0;
  const teken = () => {
    const witten = Math.max(0, Math.floor(getoond / TUSSEN));
    const ambers =
      getoond > AMBER_START
        ? Math.floor((getoond - AMBER_START) / AMBER) + 1
        : 0;
    const groot = Math.ceil(lengte + 40);
    el.style.setProperty(
      "--tocht-spoor",
      `${getoond.toFixed(1)} ${Math.ceil(lengte + 40)}`,
    );
    el.style.setProperty("--tocht-wit", korrels(witten, TUSSEN, groot));
    el.style.setProperty("--tocht-amber", korrels(ambers, AMBER, groot));
    stappen.forEach((li, i) =>
      li.classList.toggle("is-bereikt", getoond >= drempel[i] - 2),
    );
    beeld?.style.setProperty("--straat", straat.toFixed(3));
  };

  // Welk deel van de straat is te zien (de tekening wordt bijgesneden): daar begint en eindigt de route over het trottoir.
  if (beeld && beeld.offsetWidth > 0) {
    const schaal = Math.max(beeld.offsetWidth / 960, beeld.offsetHeight / 310);
    beeld.style.setProperty("--straat-half", (beeld.offsetWidth / (2 * schaal)).toFixed(1));
  }

  if (minderBeweging()) {
    getoond = lengte;
    straat = 1;
    teken();
    return;
  }

  let doel = Math.min(lengte, 46); // een klein begin is er altijd, zodat de route uitnodigt om verder te kijken
  let doelStraat = 0;
  let raf = 0;
  const meet = () => {
    const grens = window.scrollY + window.innerHeight * 0.74;
    // grootste lengte waarvan de route nog boven de grens ligt
    let a = 0;
    let b = diepte.length - 1;
    while (a < b) {
      const m = (a + b + 1) >> 1;
      if (diepte[m] <= grens) a = m;
      else b = m - 1;
    }
    if (diepte[a] <= grens)
      doel = Math.max(doel, a === diepte.length - 1 ? lengte : a * stap);
    if (beeld && doel >= lengte - 1) {
      const y = plek(beeld).y;
      doelStraat = Math.max(
        doelStraat,
        Math.min(
          1,
          Math.max(
            0,
            (grens - y - beeld.offsetHeight * 0.25) /
              (beeld.offsetHeight * 0.8),
          ),
        ),
      );
    }
  };
  const tik = () => {
    raf = 0;
    getoond += (doel - getoond) * 0.14;
    straat += (doelStraat - straat) * 0.1;
    if (doel - getoond < 0.6) getoond = doel;
    if (doelStraat - straat < 0.004) straat = doelStraat;
    teken();
    if (getoond < doel || straat < doelStraat) raf = requestAnimationFrame(tik);
    else if (straat >= 1) window.removeEventListener("scroll", scroll); // klaar: de route blijft staan
  };
  const scroll = () => {
    meet();
    if (!raf && (getoond < doel || straat < doelStraat))
      raf = requestAnimationFrame(tik);
  };
  beeld?.style.setProperty("--straat", "0");
  teken();
  scroll();
  window.addEventListener("scroll", scroll, { passive: true });
  return () => {
    window.removeEventListener("scroll", scroll);
    if (raf) cancelAnimationFrame(raf);
    stappen.forEach((li) => li.classList.remove("is-bereikt"));
    beeld?.style.removeProperty("--straat");
    beeld?.style.removeProperty("--straat-half");
  };
}

const TUSSEN = 18; // afstand tussen de witte korrels
const AMBER = 54; // afstand tussen de amberkleurige korrels
const AMBER_START = 27;

export function Tocht() {
  const svg = useRef<SVGSVGElement>(null);
  const pad = useRef<SVGPathElement>(null);
  const [vorm, setVorm] = useState<Vorm | null>(null);

  // Vorm van de route: opnieuw bepalen als de pagina van grootte verandert.
  useEffect(() => {
    const doos = svg.current?.parentElement;
    if (!doos) return;
    let raf = 0;
    const meet = () => {
      raf = 0;
      const v = bouw(doos);
      setVorm((oud) =>
        oud && v && oud.d === v.d && oud.w === v.w && oud.h === v.h ? oud : v,
      );
    };
    const plan = () => {
      if (!raf) raf = requestAnimationFrame(meet);
    };
    meet();
    const ro =
      typeof ResizeObserver === "function" ? new ResizeObserver(plan) : null;
    ro?.observe(doos);
    window.addEventListener("resize", plan, { passive: true });
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", plan);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // De route volgt de scroll: de punt blijft op ongeveer driekwart van de schermhoogte.
  useEffect(() => {
    const el = svg.current;
    const lijn = pad.current;
    const doos = el?.parentElement;
    if (!vorm || !el || !lijn || !doos) return;
    // Het meten van het pad mag het laden niet ophouden: pas beginnen als de browser even niets te doen heeft.
    let opruimen: (() => void) | undefined;
    const start = () => {
      opruimen = begin(el, lijn, doos);
    };
    const wacht =
      typeof requestIdleCallback === "function"
        ? requestIdleCallback(start, { timeout: 600 })
        : window.setTimeout(start, 120);
    return () => {
      if (typeof cancelIdleCallback === "function") cancelIdleCallback(wacht);
      else window.clearTimeout(wacht);
      opruimen?.();
    };
  }, [vorm]);

  const lagen = vorm && (
    <>
      <path className="wn-tocht__spoor" d={vorm.d} />
      <path className="wn-tocht__wit" d={vorm.d} />
      <path className="wn-tocht__amber" d={vorm.d} />
    </>
  );
  return (
    <svg
      ref={svg}
      className="wn-tocht__svg"
      data-smal={vorm?.smal}
      width={vorm?.w}
      height={vorm?.h}
      aria-hidden="true"
      focusable="false"
    >
      {vorm && (
        <>
          <defs>
            <clipPath id="wn-tocht-licht">
              <rect x="-20" y="0" width={vorm.w + 40} height={vorm.grens} />
            </clipPath>
            <clipPath id="wn-tocht-donker">
              <rect x="-20" y="-400" width={vorm.w + 40} height="400" />
              <rect
                x="-20"
                y={vorm.grens}
                width={vorm.w + 40}
                height={Math.max(0, vorm.h - vorm.grens)}
              />
            </clipPath>
          </defs>
          <path ref={pad} d={vorm.d} fill="none" stroke="none" />
          <g className="wn-tocht__licht" clipPath="url(#wn-tocht-licht)">
            {lagen}
          </g>
          <g className="wn-tocht__donker" clipPath="url(#wn-tocht-donker)">
            {lagen}
          </g>
        </>
      )}
    </svg>
  );
}
