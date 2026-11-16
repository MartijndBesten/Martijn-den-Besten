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
// Gewicht: de hele reeks samen (de tekenbestanden zoals ze geladen worden, zonder de koppelingen) en één tafereel.
// De grens voor samen was 60 kB bij de eerste reeks (31 kB); met de tweede reeks van het Oude Testament (40 kB) is het
// 72 kB, en er komt een reeks voor het Nieuwe Testament bij. Het is tekst die goed samenpakt (gzip: ongeveer een derde).
// Voor de reeks Kerst (taferelen-kerst.js, twintig taferelen, ongeveer 31 kB) is de grens van 130 naar 175 kB gegaan.
const MAX_SAMEN = 175_000, MAX_TAFEREEL = 6_000;
// De tweede reeks van het Oude Testament (taferelen-ot-2.js) en haar koppelingen (taferelen-koppeling-ot-2.js).
const OT2 = ["kistje", "manna", "rots", "tabernakel", "slang", "jordaan", "twaalf-stenen", "gideon", "ruth-veld", "eikdal", "tempel", "karmel", "elia", "muur-puin", "muur-herbouw", "oven", "leeuwenkuil", "jona-storm", "jona-vis", "wonderboom"];
const ot2: { window: { BR: { beelden: Record<string, Koppeling> } } } = { window: { BR: { beelden: {} } } };
runInNewContext(readFileSync(join(PUB, "bijbelreis", "taferelen-koppeling-ot-2.js"), "utf8").replace(/\bBR\./g, "window.BR."), ot2);
const KOPPEL_OT2 = ot2.window.BR.beelden;
// De reeks van het Nieuwe Testament (taferelen-nt.js) en de stappen waar ze bij horen (taferelen-koppeling-nt.js).
const NT: Record<string, string[]> = {
  "herders-veld": ["jezus-1:nt-geboorte:6"], "ster-bethlehem": ["jezus-1:nt-geboorte:8"],
  "jordaan-woestijn": ["jezus-1:nt-begin:0", "jezus-1:nt-begin:1", "jezus-1:nt-begin:3"],
  jakobsput: ["jezus-1:nt-samaria-nain:1", "jezus-1:nt-samaria-nain:2", "jezus-1:nt-samaria-nain:3"],
  vissersboot: ["jezus-1:nt-galilea:1", "jezus-1:nt-galilea:7"], "storm-stil": ["jezus-1:nt-galilea:8"],
  "broden-vissen": ["jezus-2:nt-brood-en-berg:1"], vijgenboom: ["jezus-2:nt-reis-naar-jeruzalem:11"],
  "intocht-weg": ["jezus-3:nt-lijdensweek:0"], gethsemane: ["jezus-3:nt-lijdensweek:7", "jezus-3:nt-lijdensweek:8"],
  "graf-dicht": ["jezus-3:nt-lijden:8"], "graf-open": ["jezus-3:nt-opstanding:0", "jezus-3:nt-opstanding:1"],
  "net-vol": ["jezus-3:nt-opstanding:5", "jezus-3:nt-opstanding:6"], "olijfberg-wolk": ["jezus-3:nt-opstanding:8"],
  pinksterhuis: ["handelingen:nt-gemeente:0"], "damascus-licht": ["handelingen:nt-paulus:0"], "gevangenis-filippi": ["handelingen:nt-paulus:10"],
  "malta-schip": ["handelingen:nt-paulusrome:5"], "malta-vuur": ["handelingen:nt-paulusrome:6"], kandelaren: ["openbaring:nt-openbaring:0"],
};
// Het beeldverhaal bij Genesis 32 (taferelen-jakob.js): bij elke stap van het deel genesis:jakob-jabbok een eigen tafereel
// (taferelen-koppeling-jakob.js). Het deel wordt op een andere tak geschreven; zolang het er niet is, doen de sleutels niets.
const JAKOB = ["jabbok-mahanaim", "jabbok-boden", "jabbok-heiren", "jabbok-gebed", "jabbok-geschenk", "jabbok-veer", "jabbok-nacht", "jabbok-dageraad", "jabbok-pniel", "jabbok-ezau"];
const jk: { window: { BR: { beelden: Record<string, Koppeling> } } } = { window: { BR: { beelden: {} } } };
runInNewContext(readFileSync(join(PUB, "bijbelreis", "taferelen-koppeling-jakob.js"), "utf8").replace(/\bBR\./g, "window.BR."), jk);
const KOPPEL_JAKOB = jk.window.BR.beelden;
// De reeks Kerst (taferelen-kerst.js, ids met voorvoegsel kerst-) en haar koppelingen (taferelen-koppeling-kerst.js) aan het boek kerst.
const KERST = IDS.filter((id) => id.startsWith("kerst-"));
const kr: { window: { BR: { beelden: Record<string, Koppeling> } } } = { window: { BR: { beelden: {} } } };
runInNewContext(readFileSync(join(PUB, "bijbelreis", "taferelen-koppeling-kerst.js"), "utf8").replace(/\bBR\./g, "window.BR."), kr);
const KOPPEL_KERST = kr.window.BR.beelden;

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
  it("heeft de eigen taferelen van de tweede reeks bij het Oude Testament, elk aan minstens één stap", () => {
    const gebruikt = new Set(STAPPEN.map((s) => BR.tafereel.van(s)?.id));
    for (const id of OT2) { expect(T[id], id).toBeTruthy(); expect(gebruikt.has(id), `${id} hangt aan geen enkele stap`).toBe(true); }
    expect(html.indexOf("/bijbelreis/taferelen-ot-2.js")).toBeLessThan(html.indexOf("/bijbelreis/taferelen-koppeling-ot-2.js"));
    expect(html.indexOf("/bijbelreis/taferelen-koppeling-ot-2.js")).toBeLessThan(html.indexOf("/bijbelreis/app.js"));
  });
  it("heeft de eigen taferelen van het Nieuwe Testament", () => {
    for (const id of Object.keys(NT)) expect(T[id], id).toBeTruthy();
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
    const bestanden = readdirSync(join(PUB, "bijbelreis")).filter((f) => /^taferelen.*\.js$/.test(f) && !f.startsWith("taferelen-koppeling"));
    for (const f of bestanden) expect(scripts, `${f} staat niet in bijbelreis.html`).toContain(f);
    const samen = bestanden.reduce((a, f) => a + readFileSync(join(PUB, "bijbelreis", f)).length, 0);
    expect(samen).toBeLessThan(MAX_SAMEN);
    for (const id of IDS) expect(T[id].svg.length, id).toBeLessThan(MAX_TAFEREEL);
  });
});

describe("taferelen: koppeling", () => {
  // Het vervolg in Genesis 33 (twee stappen achteraan in genesis:jakob-jabbok) en de ladder bij Bethel (genesis:jakob:0).
  const JAKOB_33: Record<string, string> = { "genesis:jakob-jabbok:10": "jabbok-aangezicht", "genesis:jakob-jabbok:11": "jabbok-sukkoth" };
  const BETEL = "betel-nacht";
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
  it("tweede reeks OT: elke koppeling hoort bij een bestaande stap en een tafereel van die reeks, en overschrijft geen eerder tafereel", () => {
    const eerste: { window: { BR: { beelden: Record<string, Koppeling>; beeldSoort: object } } } = { window: { BR: { beelden: {}, beeldSoort: {} } } };
    runInNewContext(readFileSync(join(PUB, "bijbelreis", "taferelen-koppeling.js"), "utf8").replace(/\bBR\./g, "window.BR."), eerste);
    expect(Object.keys(KOPPEL_OT2).length).toBeGreaterThan(25);
    for (const [key, k] of Object.entries(KOPPEL_OT2)) {
      expect(STAP.has(key), `stap ${key} bestaat niet`).toBe(true);
      expect(OT2, `${key} → ${k.t}`).toContain(k.t);
      expect(BR.beelden[key], key).toEqual(k);
      // Een eerdere koppeling mag alleen vervangen worden als die bewust leeg was (t: "").
      expect(eerste.window.BR.beelden[key]?.t || "", `${key} had al een tafereel`).toBe("");
    }
    const wil: Record<string, string> = {
      "exodus:mozes:1": "kistje", "exodus:sinai:0": "manna", "exodus:sinai:1": "rots", "numeri:woestijn:5": "rots", "exodus:sinai:8": "tabernakel", "numeri:woestijn:7": "slang",
      "jozua:intocht:2": "jordaan", "jozua:intocht:3": "twaalf-stenen", "richteren:debora:8": "gideon", "ruth:ruth:3": "ruth-veld", "1samuel:saul-david:4": "eikdal",
      "1koningen:salomo:4": "tempel", "1koningen:elia:3": "karmel", "1koningen:elia:9": "elia", "ezra:nehemia:3": "muur-puin", "ezra:nehemia:4": "muur-herbouw",
      "daniel:daniel:4": "oven", "daniel:daniel:7": "leeuwenkuil", "jona:jona:2": "jona-storm", "jona:jona:3": "jona-vis", "jona:jona:6": "wonderboom",
    };
    for (const [key, id] of Object.entries(wil)) expect(BR.tafereel.van(STAP.get(key)!)?.id, key).toBe(id);
  });
  it("tweede reeks OT: aantallen die de Bijbel noemt, kloppen in de tekening", () => {
    const tel = (id: string, re: RegExp) => (T[id].svg.match(re) || []).length;
    const steen = /<path class="k-(?:zand|steen|duin) o" d="M-?[\d.]+ -?[\d.]+l/g; // een ruwe steen (st): een pad dat met l verdergaat
    expect(tel("twaalf-stenen", steen)).toBe(12); // Jozua 4:20
    expect(tel("jordaan", steen)).toBe(12); // Jozua 4:9
    expect(tel("karmel", steen)).toBe(12); // 1 Koningen 18:31
    expect(tel("karmel", /<path class="k-terra o" transform/g)).toBe(4); // vier kruiken (1 Koningen 18:33)
    expect(tel("eikdal", /<ellipse class="k-steen o2"/g)).toBe(5); // vijf gladde stenen (1 Samuël 17:40)
    expect(tel("leeuwenkuil", /<circle class="k-terra o2"/g)).toBe(2); // de ring van de koning en van zijn geweldigen (Daniël 6:18)
    // De voorhof: twintig pilaren aan de lange zijden, tien aan de korte; vijf aan de deur van de tent (Exodus 26:37; 27:9–16).
    const palen = [...T.tabernakel.svg.matchAll(/<path class="o2" d="((?:M[\d. ]+L[\d. ]+)+)"\/>/g)].map((m) => m[1].split("M").length - 1);
    expect(palen).toEqual([10, 20, 4, 20, 10]); // achter, rechts, de vier hoornen van het altaar, links, voor
    expect(T.tabernakel.svg.match(/<path class="l-oker" d="([^"]+)"/)![1].split("M").length - 1).toBe(5);
  });
  it("Nieuwe Testament: elke koppeling hoort bij een bestaande stap en elke afgesproken stap heeft zijn tafereel", () => {
    const nt = new Set(Object.keys(NT));
    for (const [key, k] of K) if (nt.has(k.t)) { expect(STAP.has(key), `stap ${key} bestaat niet`).toBe(true); expect(NT[k.t], `${key} → ${k.t}`).toContain(key); }
    for (const [id, keys] of Object.entries(NT)) for (const key of keys) {
      expect(BR.beelden[key]?.t, key).toBe(id);
      const b = BR.tafereel.van(STAP.get(key)!)!;
      expect(b.id, key).toBe(id); expect(b.algemeen, key).toBeUndefined(); expect(b.tekst, key).toMatch(/\)\.$/);
    }
  });
  it("Nieuwe Testament: bij de kruisiging staat geen tafereel, en geen label noemt een gestalte", () => {
    for (const key of ["jezus-3:nt-lijden:6", "jezus-3:nt-lijden:7"]) { expect(STAP.get(key)!.at, key).toContain("nt_golgotha"); expect(BR.tafereel.van(STAP.get(key)!), key).toBeNull(); }
    for (const id of Object.keys(NT)) expect(T[id].label, id).not.toMatch(/engel|Kind|gestalte|silhouet|duif|\bman\b|vrouw|herder\b|discipel/i);
  });
  it("Genesis 33: de twee stappen na de omhelzing krijgen hun tafereel zodra ze bestaan", () => {
    for (const [key, id] of Object.entries(JAKOB_33)) {
      expect(T[id], id).toBeTruthy();
      expect(KOPPEL_JAKOB[key].t, key).toBe(id);
      expect(BR.beelden[key], key).toEqual(KOPPEL_JAKOB[key]);
      expect(KOPPEL_JAKOB[key].tekst, key).toMatch(/\(Genesis 33:[\d–]+\)\.$/);
      // De stap wordt op een andere tak geschreven. Bestaat hij, dan hoort hij bij Genesis 33 en krijgt hij dit tafereel.
      const stap = STAP.get(key);
      if (stap) {
        expect(stap.ref, key).toMatch(/^Genesis 33:/);
        const b = BR.tafereel.van(stap)!;
        expect(b.id, key).toBe(id); expect(b.algemeen, key).toBeUndefined();
      }
    }
    for (const [key, k] of Object.entries(BR.beelden)) if (Object.values(JAKOB_33).includes(k.t)) expect(JAKOB_33[key], key).toBe(k.t);
    // 33:6–7: het gezin komt in drie groepen naderbij (de dienstmaagden met vier zonen, Lea met zes, Rachel met Jozef;
    // Genesis 29:31–30:24), samen twee vrouwen, twee dienstmaagden en elf kinderen.
    const svg = T["jabbok-aangezicht"].svg;
    const groepen = [...svg.matchAll(/<g class="tf-e-kom[^"]*">(.*?)<\/g>/g)].map((m) => m[1]);
    const tel = (s: string, k: string) => [...s.matchAll(new RegExp(`<path class="${k} o2" d="([^"]+)"`, "g"))].reduce((a, m) => a + m[1].split("M").length - 1, 0);
    expect(groepen.length).toBe(3);
    expect(groepen.map((g) => tel(g, "k-zand") + tel(g, "k-terra")).sort((a, b) => a - b)).toEqual([1, 4, 6]);
    expect(tel(svg, "k-oker"), "Lea en Rachel").toBe(4);
    expect(tel(svg, "k-salie"), "twee dienstmaagden").toBe(4);
    for (const id of Object.values(JAKOB_33)) expect(T[id].label, id).not.toMatch(/engel|\bman\b|\bGod|HEERE|Heere|gestalte|silhouet|worstel/i);
  });
  it("Bethel: de ladder bij genesis:jakob:0, zonder engel of gestalte, en alleen een rustige beweging", () => {
    const key = "genesis:jakob:0", stap = STAP.get(key)!;
    expect(stap.ref).toMatch(/^Genesis 28:1\d/);
    expect(KOPPEL_JAKOB[key]).toEqual(BR.beelden[key]);
    expect(BR.tafereel.van(stap)!.id).toBe(BETEL);
    expect(BR.tafereel.van(stap)!.algemeen).toBeUndefined();
    // Een eerdere koppeling bij deze stap was er niet (of bewust leeg): er wordt geen ander tafereel vervangen.
    const eerste: { window: { BR: { beelden: Record<string, Koppeling>; beeldSoort: object } } } = { window: { BR: { beelden: {}, beeldSoort: {} } } };
    runInNewContext(readFileSync(join(PUB, "bijbelreis", "taferelen-koppeling.js"), "utf8").replace(/\bBR\./g, "window.BR."), eerste);
    expect(eerste.window.BR.beelden[key]?.t || "").toBe("");
    for (const [k, v] of Object.entries(BR.beelden)) if (v.t === BETEL) expect(k).toBe(key);
    // Het label noemt geen engel, geen gestalte en niet de HEERE als iets wat er te zien is (28:12–13).
    expect(T[BETEL].label).not.toMatch(/engel|\bman\b|\bGod|HEERE|Heere|gestalte|silhouet|figuur|persoon|mensen|op en neer|klim/i);
    expect(T[BETEL].label).toMatch(/ladder/);
    // Precies één mens (Jakob, één hoofd), en alleen beweging die niet op en neer gaat: de ladder tekent zich, licht verschijnt
    // en ademt, sterren twinkelen. Geen lichtjes die over de ladder bewegen.
    expect(T[BETEL].svg.match(/<circle class="k-hout o2"[^>]*r="2.2"/g)?.length).toBe(1);
    const beweging = new Set([...T[BETEL].svg.matchAll(/\btf-[el]-[a-z-]+/g)].map((m) => m[0]));
    expect([...beweging].sort()).toEqual(["tf-e-in", "tf-e-teken", "tf-l-adem", "tf-l-gloed"]);
    expect(css).toMatch(/@keyframes tf-adem \{ from \{ opacity: [\d.]+; \} \}/);
    // Geen licht of schijf boven de ladder (28:13: daar stond de HEERE; Genesis 28 noemt geen licht): de enige cirkels zijn
    // het hoofd van Jakob en twee twinkelende sterren, de enige ellips is het schijnsel op de grond bij de voet. De ladder
    // lost bovenaan op in drie steeds vagere stukken.
    for (const m of T[BETEL].svg.matchAll(/<circle [^>]*>/g)) expect(m[0], "cirkel bij Bethel").toMatch(/r="(?:2\.2|1\.3)"/);
    expect([...T[BETEL].svg.matchAll(/<ellipse [^>]*cy="([\d.]+)"/g)].map((m) => Number(m[1]))).toEqual([114]);
    expect([...T[BETEL].svg.matchAll(/<g class="(vaag\d?)">/g)].map((m) => m[1])).toEqual(["vaag", "vaag2", "vaag3"]);
    const vaag = (k: string) => Number(css.match(new RegExp(`\\.tf-svg \\.${k} \\{ opacity: ([\\d.]+); \\}`))![1]);
    expect(vaag("vaag")).toBeGreaterThan(vaag("vaag2")); expect(vaag("vaag2")).toBeGreaterThan(vaag("vaag3"));
    expect(T[BETEL].label).not.toMatch(/open|opening|schijf/i);
  });
  it("Genesis 32: de tien stappen van genesis:jakob-jabbok hebben elk een eigen tafereel, in volgorde", () => {
    expect(Object.keys(KOPPEL_JAKOB).filter((k) => k.startsWith("genesis:jakob-jabbok:"))).toEqual([...JAKOB.map((_, i) => `genesis:jakob-jabbok:${i}`), ...Object.keys(JAKOB_33)]);
    expect(Object.keys(KOPPEL_JAKOB)).toEqual(["genesis:jakob:0", ...JAKOB.map((_, i) => `genesis:jakob-jabbok:${i}`), ...Object.keys(JAKOB_33)]);
    expect(new Set(Object.values(KOPPEL_JAKOB).map((k) => k.t)).size).toBe(13);
    const plek = (s: string) => html.indexOf(`/bijbelreis/${s}`);
    expect(plek("taferelen-jakob.js")).toBeLessThan(plek("taferelen-koppeling-jakob.js"));
    expect(plek("taferelen-koppeling-nt.js")).toBeLessThan(plek("taferelen-koppeling-jakob.js"));
    expect(plek("taferelen-koppeling-jakob.js")).toBeLessThan(plek("app.js"));
    // Bestaat het deel, dan heeft het minstens tien stappen (Genesis 33 komt er achteraan bij) en krijgt elke stap zijn eigen
    // tafereel. Bestaat het (nog) niet, dan hangen deze taferelen aan geen enkele stap en doen de sleutels niets.
    const deel = BR.boeken.find((b) => b.id === "genesis")?.delen.find((d) => d.id === "jakob-jabbok");
    if (deel) expect(deel.steps.length, "genesis:jakob-jabbok").toBe(12);
    JAKOB.forEach((id, i) => {
      const key = `genesis:jakob-jabbok:${i}`;
      expect(T[id], id).toBeTruthy();
      expect(KOPPEL_JAKOB[key].t, key).toBe(id);
      expect(BR.beelden[key], key).toEqual(KOPPEL_JAKOB[key]);
      if (deel) { const b = BR.tafereel.van(STAP.get(key)!)!; expect(b.id, key).toBe(id); expect(b.algemeen, key).toBeUndefined(); }
      else expect(STAP.has(key), key).toBe(false);
    });
    for (const [key, k] of Object.entries(BR.beelden)) if (JAKOB.includes(k.t)) expect(key.startsWith("genesis:jakob-jabbok:"), key).toBe(true);
  });
  it("Genesis 32: de Man en de engelen zijn nergens afgebeeld, en de aantallen kloppen", () => {
    // Het label zegt wat er te zien is; het noemt de Man, God, een engel of de worsteling dus niet als iets wat er staat.
    for (const id of [...JAKOB, ...Object.values(JAKOB_33), BETEL]) expect(T[id].label, id).not.toMatch(/engel|\bman\b|\bGod|gestalte|silhouet|worstel/i);
    expect(T["jabbok-nacht"].label).toMatch(/helemaal alleen/);
    expect(T["jabbok-dageraad"].label).toMatch(/niemand anders/);
    // Het gezin (32:22): twee vrouwen, twee dienstmaagden, elf kinderen. Een vrouw is een lijf met een doek (twee
    // deelpaden), een kind een lijf; de kinderen staan in twee kleuren (zand en terra).
    const delen = (id: string, k: string) => (T[id].svg.match(new RegExp(`<path class="${k} o2" d="([^"]+)"`)) || ["", ""])[1].split("M").length - 1;
    for (const id of ["jabbok-mahanaim", "jabbok-veer", "jabbok-ezau"]) {
      expect(delen(id, "k-oker"), `${id}: twee vrouwen`).toBe(4);
      expect(delen(id, "k-salie"), `${id}: twee dienstmaagden`).toBe(4);
      expect(delen(id, "k-zand") + delen(id, "k-terra"), `${id}: elf kinderen`).toBe(11);
    }
    // Twee heiren (32:7): twee groepen die uit elkaar wijken.
    expect(T["jabbok-heiren"].svg.match(/tf-e-wijk-[lr]/g)).toEqual(["tf-e-wijk-l", "tf-e-wijk-r"]);
    // Het geschenk (32:14–15): vijf soorten, elk een eigen kudde, in de volgorde van de tekst; geen label noemt een aantal dieren.
    const volgorde = ["geiten", "schapen", "kamelen", "runderen", "ezels"].map((d) => T["jabbok-geschenk"].label.indexOf(d));
    expect(volgorde.every((p, i) => p > 0 && (i === 0 || p > volgorde[i - 1])), "volgorde van de kudden").toBe(true);
    for (const id of JAKOB) expect(T[id].label, id).not.toMatch(/\b(?:tien|twintig|dertig|veertig|honderd|tweehonderd|vierhonderd)\b/i);
    // Zeven keer buigen (33:3).
    expect(css).toMatch(/\.tf-e-buig \{ animation: tf-buig [\d.]+s [a-z-]+ 7 both; \}/);
  });
  it("Kerst: elke koppeling hoort bij een bestaande Kerst-stap en een bestaand tafereel, en elk Kerst-tafereel hangt aan een stap", () => {
    const plek = (s: string) => html.indexOf(`/bijbelreis/${s}`);
    expect(plek("taferelen-koppeling-jakob.js")).toBeLessThan(plek("taferelen-kerst.js"));
    expect(plek("taferelen-kerst.js")).toBeLessThan(plek("taferelen-koppeling-kerst.js"));
    expect(plek("taferelen-koppeling-kerst.js")).toBeLessThan(plek("app.js"));
    expect(KERST.length).toBeGreaterThanOrEqual(15);
    expect(KERST.length).toBeLessThanOrEqual(22);
    expect(Object.keys(KOPPEL_KERST).length).toBeGreaterThan(30);
    for (const [key, k] of Object.entries(KOPPEL_KERST)) {
      expect(key.startsWith("kerst:kerst-"), key).toBe(true);
      expect(STAP.has(key), `stap ${key} bestaat niet`).toBe(true);
      expect(BR.beelden[key], key).toEqual(k);
      // Een Kerst-tafereel, of een bestaand tafereel dat hier klopt (het gersteveld van Ruth bij Bethlehem).
      if (k.t !== "") expect(k.t.startsWith("kerst-") || k.t === "ruth-veld", `${key} → ${k.t}`).toBe(true);
      if (k.t !== "") expect(T[k.t], `${key} → ${k.t}`).toBeTruthy();
    }
    const gebruikt = new Set(STAPPEN.map((s) => BR.tafereel.van(s)?.id));
    for (const id of KERST) expect(gebruikt.has(id), `${id} hangt aan geen enkele stap`).toBe(true);
    for (const [key, k] of Object.entries(BR.beelden)) if (k.t.startsWith("kerst-")) expect(key.startsWith("kerst:"), key).toBe(true);
  });
  it("Kerst: de geboorte (Lukas 2:6–7), de achtste dag en Rama hebben bewust geen beeld", () => {
    const kerst = BR.boeken.find((b) => b.id === "kerst")!;
    const sleutel = (deel: string, ref: RegExp) => {
      const d = kerst.delen.find((x) => x.id === deel)!, i = d.steps.findIndex((s) => ref.test(s.ref));
      expect(i, `${deel}: ${ref}`).toBeGreaterThanOrEqual(0);
      return `kerst:${deel}:${i}`;
    };
    for (const key of [sleutel("kerst-geboorte", /^Lukas 2:6–7$/), sleutel("kerst-geboorte", /^Lukas 2:21$/), sleutel("kerst-wijzen", /^Mattheüs 2:16–18$/)]) {
      expect(BR.beelden[key], key).toEqual({ t: "" });
      expect(BR.tafereel.van(STAP.get(key)!), key).toBeNull();
    }
  });
  it("Kerst: geen naam of label noemt het Kind, de Heere Jezus, God, een engel, os, ezel, koning of kroon", () => {
    for (const id of KERST) for (const tekst of [T[id].n, T[id].label])
      expect(tekst, id).not.toMatch(/\bkind(?:je|eke|eken)?\b|jezus|\bheere\b|\bgod\b|engel|\bos\b|\bossen\b|\bezels?\b|koning|kroon|kribbe|kerstboom|sneeuw|kameel|kamelen/i);
    // De wijzen: een groepje zonder vast aantal, niet drie (Mattheüs 2:1 noemt geen aantal).
    for (const id of ["kerst-poort", "kerst-ster-weg"]) expect(T[id].label, id).not.toMatch(/\bdrie\b/i);
  });
  it("Kerst: één ster, en de aantallen die de Bijbel noemt kloppen in de tekening", () => {
    const STER = 'class="k-okerz" d="M0-14l1 11.5';
    // De ster staat alleen bij Mattheüs 2:9–11, en daar alleen zij: geen andere sterren aan die hemel.
    for (const id of KERST) expect(T[id].svg.split(STER).length - 1, id).toBe(["kerst-ster-weg", "kerst-geschenken"].includes(id) ? 1 : 0);
    for (const id of ["kerst-ster-weg", "kerst-geschenken"]) expect(T[id].svg, id).not.toMatch(/class="l-licht(?: dik)?" d="M[\d.]+ [\d.]+h\.1/);
    // Driemaal veertien geslachten (Mattheüs 1:17): drie kolommen van veertien regels.
    const kolommen = [...T["kerst-geslacht"].svg.matchAll(/<path class="l-zand2 tf-e-teken[^"]*" pathLength="1" d="([^"]+)"/g)].map((m) => m[1].split("M").length - 1);
    expect(kolommen).toEqual([14, 14, 14]);
    // De kandelaar met zeven lampen (Exodus 25:37).
    const vlammen = [...T["kerst-reukaltaar"].svg.matchAll(/<path class="k-okerz tf-l-vlam[^"]*" d="([^"]+)"/g)].reduce((a, m) => a + m[1].split("M").length - 1, 0);
    expect(vlammen).toBe(7);
    // Een paar tortelduiven of twee jonge duiven (Lukas 2:24).
    expect(T["kerst-duiven"].svg.match(/<path class="k-wit o2" d="([^"]+)"/)![1].split("M").length - 1).toBe(2);
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
    expect(van("ezra:terugkeer:3")).toBeNull(); // de muur ligt in puin: geen ommuurde stad
    expect(van("ezra:nehemia:3")!.id).toBe("muur-puin"); // sinds de tweede reeks: een eigen tafereel in plaats van geen beeld
  });
  it("de meeste stappen zonder reis hebben een beeld", () => {
    const zonder = STAPPEN.filter((s) => !(s.r && s.r.length));
    expect(zonder.filter((s) => BR.tafereel.van(s)).length / zonder.length).toBeGreaterThan(0.75);
  });
});
