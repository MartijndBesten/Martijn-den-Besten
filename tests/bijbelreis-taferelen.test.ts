// Controle van de taferelen van de Bijbelreis (public/bijbelreis/taferelen*.js): het register, de koppeling aan stappen,
// de tekenafspraken en het gewicht. Regels: docs/bijbelreis-taferelen/README.md.
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

type Tafereel = { n: string; label: string; svg: string; bij?: string };
type Koppeling = { t: string; tekst?: string };
type Stap = { key: string; ref: string; t: string; at: string[]; r?: unknown[] };
type Beeld = { id: string; tf: Tafereel; tekst?: string; plaats?: string; algemeen?: boolean };
type BR = {
  boeken: { id: string; delen: { id: string; steps: Omit<Stap, "key">[] }[] }[];
  plaatsen: Record<string, { n: string; t?: string; c?: string }>;
  taferelen: Record<string, Tafereel>; beelden: Record<string, Koppeling>; beeldSoort: Record<string, string | [string, string]>;
  tafereel: { van: (s: Stap | null) => Beeld | null };
  parseRef: (r: string) => { ranges: { slug: string; c1: number; v1: number; c2: number; v2: number }[] } | null;
};

const PUB = join(__dirname, "..", "public");
const SVDIR = join(__dirname, "..", "data", "statenvertaling");
const html = readFileSync(join(PUB, "bijbelreis.html"), "utf8");
const css = readFileSync(join(PUB, "bijbelreis", "bijbelreis.css"), "utf8");
const scripts = [...html.matchAll(/<script src="\/bijbelreis\/([^"?]+)"/g)].map((m) => m[1]).filter((s) => !/leaflet|app\.js/.test(s));
const ctx: { window: { BR?: BR } } = { window: {} };
for (const s of scripts) runInNewContext(readFileSync(join(PUB, "bijbelreis", s), "utf8").replace(/\bBR\./g, "window.BR."), ctx);
const BR = ctx.window.BR as BR;
const T = BR.taferelen, IDS = Object.keys(T);
const STAPPEN: Stap[] = BR.boeken.flatMap((b) => b.delen.flatMap((d) => d.steps.map((s, i) => ({ ...s, at: s.at || [], key: `${b.id}:${d.id}:${i}` }))));
const STAP = new Map(STAPPEN.map((s) => [s.key, s]));
const SOORTEN = ["stad", "berg", "water", "put", "kamp", "altaar", "tent", "gebied", "rivier"];
// Gewicht: de hele reeks samen (de tekenbestanden zoals ze geladen worden) en één tafereel.
const MAX_SAMEN = 60_000, MAX_TAFEREEL = 6_000;

// Bestaat de verwijzing in de Statenvertaling (data/statenvertaling, alleen voor controle)?
const bijbel: Record<string, { hoofdstukken: Record<string, string[]> }> = {};
function verwijzing(ref: string): string {
  const q = BR.parseRef(ref);
  if (!q || !q.ranges.length) return "onleesbaar";
  for (const rg of q.ranges) {
    const file = join(SVDIR, rg.slug + ".json");
    if (!existsSync(file)) return `boek ${rg.slug} ontbreekt`;
    bijbel[rg.slug] ??= JSON.parse(readFileSync(file, "utf8"));
    const H = bijbel[rg.slug].hoofdstukken, c2 = rg.c2 === 999 ? Object.keys(H).length : rg.c2;
    if (!H[rg.c1] || !H[c2]) return "hoofdstuk bestaat niet";
    if (rg.v1 > H[rg.c1].length) return `${rg.c1}:${rg.v1} bestaat niet`;
    if (rg.v2 !== 999 && rg.v2 > H[c2].length) return `${c2}:${rg.v2} bestaat niet`;
  }
  return "ok";
}

describe("taferelen: register", () => {
  it("laadt de bestanden vóór app.js, de koppeling na de tekeningen", () => {
    const plek = (s: string) => html.indexOf(`/bijbelreis/${s}`);
    expect(plek("taferelen.js")).toBeGreaterThan(0);
    expect(plek("taferelen.js")).toBeLessThan(plek("taferelen-koppeling.js"));
    expect(plek("taferelen-koppeling.js")).toBeLessThan(plek("app.js"));
  });
  it("heeft een standaardbeeld voor elke soort plaats", () => {
    for (const s of SOORTEN) { expect(T[s], s).toBeTruthy(); expect((T[s].bij || "").length, s).toBeGreaterThan(10); }
  });
  it("heeft de eigen taferelen van de eerste reeks", () => {
    for (const id of ["ararat-ark", "ararat-boog", "babel", "braamstruik", "schelfzee", "sinai", "jericho", "moab", "stad-rivier"]) expect(T[id], id).toBeTruthy();
  });
  it("elk tafereel heeft een naam en een label dat zegt wat er te zien is", () => {
    for (const id of IDS) {
      expect(T[id].n && T[id].n.length > 3, id).toBe(true);
      expect(T[id].label && T[id].label.length >= 40 && /\.$/.test(T[id].label), `${id}: label`).toBe(true);
    }
  });
});

describe("taferelen: tekening", () => {
  const TAGS = new Set(["g", "path", "circle", "ellipse", "rect"]);
  const ATTRS = new Set(["class", "d", "transform", "cx", "cy", "r", "rx", "ry", "x", "y", "width", "height", "pathLength"]);
  // Klassen die bijbelreis.css onder .tf-svg kent (kleuren, lijnen, beweging).
  const bekend = new Set([...css.matchAll(/\.tf-svg ((?:\.[a-z0-9-]+)+)/g)].flatMap((m) => m[1].split(".").filter(Boolean)));
  it("is geldige SVG met alleen eenvoudige vormen, zonder script, afbeelding, verwijzing naar buiten of inline stijl", () => {
    for (const id of IDS) {
      const svg = T[id].svg;
      expect(svg, id).not.toMatch(/<script|<image|<foreignObject|<use|<style|<a[\s>]|href|url\(|\son[a-z]+\s*=|style\s*=|\sid\s*=|javascript:/i);
      let doc: Document;
      try { doc = new JSDOM(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 140">${svg}</svg>`, { contentType: "image/svg+xml" }).window.document; }
      catch (e) { throw new Error(`${id}: geen geldige SVG (${(e as Error).message})`); }
      const els = [...doc.documentElement.querySelectorAll("*")];
      expect(els.length, id).toBeGreaterThan(3);
      for (const el of els) {
        expect(TAGS.has(el.tagName), `${id}: <${el.tagName}>`).toBe(true);
        for (const a of el.getAttributeNames()) expect(ATTRS.has(a), `${id}: attribuut ${a}`).toBe(true);
      }
    }
  });
  it("gebruikt alleen klassen die in bijbelreis.css staan", () => {
    for (const id of IDS) for (const m of T[id].svg.matchAll(/class="([^"]*)"/g)) for (const k of m[1].split(/\s+/).filter(Boolean)) expect(bekend.has(k), `${id}: klasse ${k}`).toBe(true);
  });
  it("een onderdeel dat beweegt, heeft zelf geen transform-attribuut (de beweging zou het overschrijven)", () => {
    for (const id of IDS) for (const m of T[id].svg.matchAll(/<[a-z]+ [^>]*>/g)) if (/class="[^"]*\btf-[el]-/.test(m[0])) expect(m[0], id).not.toMatch(/transform=/);
  });
  it("noemt geen kleuren buiten de variabelen van de atlas", () => {
    for (const id of IDS) expect(T[id].svg, id).not.toMatch(/fill=|stroke=|#[0-9a-f]{3,8}\b|rgb\(/i);
  });
  it("css: beweging pauzeert buiten beeld en staat stil bij ‘minder beweging’", () => {
    expect(css).toMatch(/\.tf-svg \[class\*="tf-l-"\], \.tf-svg \[class\*="tf-e-"\] \{[^}]*animation-play-state: paused/);
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\) \{\s*\.tf-svg \[class\*="tf-l-"\], \.tf-svg \[class\*="tf-e-"\] \{ animation: none !important; \}/);
  });
});

describe("taferelen: gewicht", () => {
  it(`de tekenbestanden blijven samen onder ${MAX_SAMEN} bytes en één tafereel onder ${MAX_TAFEREEL} tekens`, () => {
    const bestanden = readdirSync(join(PUB, "bijbelreis")).filter((f) => /^taferelen.*\.js$/.test(f) && f !== "taferelen-koppeling.js");
    for (const f of bestanden) expect(scripts, `${f} staat niet in bijbelreis.html`).toContain(f);
    const samen = bestanden.reduce((a, f) => a + readFileSync(join(PUB, "bijbelreis", f)).length, 0);
    expect(samen).toBeLessThan(MAX_SAMEN);
    for (const id of IDS) expect(T[id].svg.length, id).toBeLessThan(MAX_TAFEREEL);
  });
});

describe("taferelen: koppeling", () => {
  const K = Object.entries(BR.beelden);
  it("elke koppeling verwijst naar een bestaand tafereel (of is bewust leeg)", () => {
    expect(K.length).toBeGreaterThan(20);
    for (const [key, k] of K) {
      expect(/^[a-z0-9-]+:[a-z0-9-]+:\d+$/.test(key), `sleutel ${key}`).toBe(true);
      if (k.t === "") { expect(k.tekst, key).toBeUndefined(); continue; }
      expect(T[k.t], `${key} → ${k.t}`).toBeTruthy();
    }
  });
  it("elke tekst is één korte zin met een verwijzing die bestaat", () => {
    for (const [key, k] of K) {
      if (k.t === "") continue;
      const m = (k.tekst || "").match(/\(([^()]+)\)\.$/);
      expect(m, `${key}: geen verwijzing aan het eind van ‘${k.tekst}’`).toBeTruthy();
      expect(verwijzing(m![1]), `${key}: ${m![1]}`).toBe("ok");
      expect(k.tekst!.length, key).toBeLessThan(140);
    }
  });
  it("de afgesproken stappen hebben hun eigen tafereel", () => {
    const wil: Record<string, string> = {
      "genesis:begin:3": "ararat-ark", "genesis:begin:4": "ararat-boog", "genesis:begin:5": "babel", "exodus:mozes:4": "braamstruik", "exodus:uittocht:5": "schelfzee",
      "exodus:sinai:4": "sinai", "jozua:intocht:4": "jericho",
      ...Object.fromEntries([0, 1, 3, 4, 5, 6].map((i) => [`genesis:ur-kanaan:${i}`, "stad-rivier"])),
      ...Object.fromEntries([0, 1, 2, 3, 4, 5].map((i) => [`numeri:kies-het-leven:${i}`, "moab"])),
    };
    for (const [key, id] of Object.entries(wil)) expect(BR.beelden[key]?.t, key).toBe(id);
  });
  it("de afwijkende soorten per plaats kloppen met plaatsen en register", () => {
    for (const [id, v] of Object.entries(BR.beeldSoort)) {
      expect(BR.plaatsen[id], `plaats ${id}`).toBeTruthy();
      const [soort, als] = ([] as string[]).concat(v);
      if (soort !== "") expect(SOORTEN, `${id}: ${soort}`).toContain(soort);
      if (als) expect(BR.plaatsen[als], `${id}: naam van ${als}`).toBeTruthy();
    }
  });
});

describe("taferelen: welke stap krijgt welk beeld", () => {
  const van = (key: string) => BR.tafereel.van(STAP.get(key)!);
  it("een stap zonder reis krijgt het standaardbeeld van de soort van zijn eerste plaats, met de plaatsnaam", () => {
    const b = van("esther:esther:0")!;
    expect(b.id).toBe("stad"); expect(b.algemeen).toBe(true); expect(b.plaats).toBe("Susan");
    expect(van("exodus:sinai:6")!.id).toBe("berg");
    expect(van("exodus:uittocht:6")!.id).toBe("water");
  });
  it("een eigen koppeling gaat vóór het standaardbeeld, ook bij een stap met reis", () => {
    expect(STAP.get("jozua:intocht:4")!.r).toBeUndefined();
    expect(van("jozua:intocht:4")!.id).toBe("jericho");
    expect(van("jozua:intocht:4")!.algemeen).toBeUndefined();
    expect((STAP.get("exodus:uittocht:5")!.r || []).length).toBeGreaterThan(0);
    expect(van("exodus:uittocht:5")!.id).toBe("schelfzee");
  });
  it("een stap met reis en zonder koppeling krijgt geen beeld; een stap zonder plaats ook niet", () => {
    for (const s of STAPPEN) if (s.r && s.r.length && !BR.beelden[s.key]) expect(BR.tafereel.van(s), s.key).toBeNull();
    expect(van("genesis:begin:0")).toBeNull();
    expect(BR.tafereel.van(null)).toBeNull();
  });
  it("afwijkende soort, andere naam en ‘bewust geen beeld’ werken", () => {
    expect(van("2samuel:david:5")!.id).toBe("stad"); // Jeruzalem staat in plaatsen.js als altaar
    const tempel = van("jezus-1:nt-geboorte:0")!;
    expect(tempel.id).toBe("stad"); expect(tempel.plaats).toBe("Jeruzalem");
    expect(van("genesis:jozef:4")!.id).toBe("rivier");
    expect(van("genesis:begin:1")).toBeNull(); // Eden: geen standaardbeeld
    expect(van("ezra:nehemia:3")).toBeNull(); // de muur ligt in puin: geen ommuurde stad
  });
  it("de meeste stappen zonder reis hebben een beeld", () => {
    const zonder = STAPPEN.filter((s) => !(s.r && s.r.length));
    expect(zonder.filter((s) => BR.tafereel.van(s)).length / zonder.length).toBeGreaterThan(0.75);
  });
});
