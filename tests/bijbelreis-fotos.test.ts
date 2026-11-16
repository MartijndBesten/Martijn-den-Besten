// Controle van de foto’s van de plaatsen (public/bijbelreis/fotos.js en public/bijbelreis/fotos/). Regels:
// docs/bijbelreis-fotos/README.md. Elke foto komt van Wikimedia Commons met een vrije licentie, hoort bij een plaats
// waarvan de ligging bekend is, en blijft binnen de grens voor het gewicht.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

type Foto = { f: string; t: string; alt: string; b: number; h: number; maker: string; licentie: string; licentieUrl: string; bron: string; opgehaald: string };
type Stap = { key: string; t: string; at: string[]; r?: unknown[] };
type BR = {
  boeken: { id: string; delen: { id: string; steps: Omit<Stap, "key">[] }[] }[];
  plaatsen: Record<string, { n: string; c?: string; nu?: string }>;
  beelden: Record<string, { t: string }>;
  fotos: Record<string, Foto>;
  foto: { van: (s: Stap | null) => (Foto & { id: string }) | null; ballon: (id: string) => string };
};

const PUB = join(__dirname, "..", "public");
const MAP = join(PUB, "bijbelreis", "fotos");
const html = readFileSync(join(PUB, "bijbelreis.html"), "utf8");
const scripts = [...html.matchAll(/<script src="\/bijbelreis\/([^"?]+)"/g)].map((m) => m[1]).filter((s) => !/leaflet|app\.js/.test(s));
const ctx: { window: { BR?: BR } } = { window: {} };
for (const s of scripts) runInNewContext(readFileSync(join(PUB, "bijbelreis", s), "utf8").replace(/\bBR\./g, "window.BR."), ctx);
const BR = ctx.window.BR as BR;
const F = BR.fotos, IDS = Object.keys(F);
const STAPPEN: Stap[] = BR.boeken.flatMap((b) => b.delen.flatMap((d) => d.steps.map((s, i) => ({ ...s, at: s.at || [], key: `${b.id}:${d.id}:${i}` }))));
const STAP = new Map(STAPPEN.map((s) => [s.key, s]));
// Toegestaan: publiek domein, CC0, CC BY en CC BY-SA vanaf 2.0. Niet: NC, ND, GFDL, onduidelijk.
const LICENTIE = /^(Publiek domein|CC0 1\.0|CC BY(-SA)? (2\.0|2\.5|3\.0|4\.0))$/;
const MAX_FOTO = 150_000, MAX_SAMEN = 3_000_000;

describe("foto’s: gegevens en licenties", () => {
  it("er zijn foto’s, en het is een bewuste selectie (25–40)", () => {
    expect(IDS.length).toBeGreaterThanOrEqual(25);
    expect(IDS.length).toBeLessThanOrEqual(40);
  });
  it("elke foto hoort bij een plaats waarvan de ligging bekend is", () => {
    for (const id of IDS) {
      const p = BR.plaatsen[id];
      expect(p, id).toBeTruthy();
      // v = identificeerbaar, r = gebied (meer, rivier); w = waarschijnlijk alleen met ‘aangewezen’ in het onderschrift.
      expect(["v", "r", "w"], id).toContain(p.c);
      if (p.c === "w") expect(F[id].t, `${id}: onderschrift bij een waarschijnlijke ligging`).toMatch(/aangewezen|gehouden/);
    }
  });
  it("maker, licentie, licentietekst en bron zijn ingevuld; de bron is een bestandspagina op Commons", () => {
    for (const [id, f] of Object.entries(F)) {
      expect(f.maker.trim().length, id).toBeGreaterThan(1);
      expect(f.licentie, id).toMatch(LICENTIE);
      expect(f.licentieUrl, id).toMatch(/^https:\/\/(creativecommons\.org\/(licenses|publicdomain)\/|commons\.wikimedia\.org\/wiki\/)/);
      expect(f.bron, id).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      expect(f.opgehaald, id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(f.t.length, id).toBeGreaterThan(8);
      expect(f.alt.length, id).toBeGreaterThan(8);
      expect(f.b, id).toBe(960);
      expect(f.h, id).toBeGreaterThan(300);
    }
  });
  it("beide bestanden bestaan, binnen de grens per foto en samen", () => {
    let samen = 0;
    for (const [id, f] of Object.entries(F)) {
      const groot = join(MAP, `${f.f}.webp`), klein = join(MAP, `${f.f}-480.webp`);
      expect(existsSync(groot), `${id}: ${f.f}.webp`).toBe(true);
      expect(existsSync(klein), `${id}: ${f.f}-480.webp`).toBe(true);
      const n = statSync(groot).size + statSync(klein).size;
      expect(n, id).toBeLessThanOrEqual(MAX_FOTO);
      samen += n;
    }
    // Geen losse bestanden in de map die niet gebruikt worden.
    const gebruikt = new Set(Object.values(F).flatMap((f) => [`${f.f}.webp`, `${f.f}-480.webp`]));
    expect(readdirSync(MAP).filter((n) => !gebruikt.has(n))).toEqual([]);
    expect(samen).toBeLessThanOrEqual(MAX_SAMEN);
  });
});

describe("foto’s: welke stap welke foto krijgt", () => {
  // Regel (16-11-2026): alleen een foto van een plaats die in de titel of de tekst van de stap staat. Martijn viel eerder
  // over een tekening die niets met de tekst te maken had; een foto van Rome bij ‘De mantel in Troas’ is dezelfde fout.
  const namen = (id: string) => BR.plaatsen[id].n.replace(/\(.*?\)/g, "").split(/\s*[·/]\s*/).map((x) => x.trim()).filter((x) => x.length > 2);
  const genoemd = (tekst: string | undefined, id: string) => !!tekst && namen(id).some((n) => new RegExp(`(^|[^\\p{L}])${n}($|[^\\p{L}])`, "iu").test(tekst));
  it("een stap krijgt alleen een foto van een plaats die in zijn titel of tekst genoemd wordt", () => {
    let n = 0;
    for (const s of STAPPEN) {
      const f = BR.foto.van(s);
      if (!f) continue;
      n++;
      expect(s.at, s.key).toContain(f.id);
      expect(genoemd(s.t, f.id) || genoemd((s as Stap & { txt?: string }).txt, f.id), `${s.key} ‘${s.t}’ → ${f.id}`).toBe(true);
    }
    expect(n).toBeGreaterThan(100);
    expect(BR.foto.van(null)).toBeNull();
  });
  it("bij een reis met twee genoemde plaatsen de bestemming; geen foto als de plaats niet genoemd wordt", () => {
    const bethlehem = STAPPEN.find((s) => s.t === "Van Nazareth naar Bethlehem")!;
    expect(BR.foto.van(bethlehem)!.id).toBe("efrath");
    const troas = STAPPEN.find((s) => s.t === "De mantel in Troas");
    if (troas) expect(BR.foto.van(troas)).toBeNull();
  });
  it("bewust geen beeld (t: \"\") betekent ook geen foto: de kribbe en de achtste dag", () => {
    for (const key of ["kerst:kerst-geboorte:2", "kerst:kerst-geboorte:6"]) {
      if (STAP.has(key)) expect(BR.foto.van(STAP.get(key)!), key).toBeNull();
    }
    for (const [key, k] of Object.entries(BR.beelden)) if (k.t === "" && STAP.has(key)) expect(BR.foto.van(STAP.get(key)!), key).toBeNull();
  });
  it("de ballon en de figuur zijn veilige HTML met bronregel, licentielink en luie, vaste maten", () => {
    const id = IDS[0], dom = new JSDOM(`<div>${BR.foto.ballon(id)}</div>`);
    const img = dom.window.document.querySelector("img")!;
    expect(img.getAttribute("src")).toBe(`/bijbelreis/fotos/${F[id].f}-480.webp`);
    expect(img.getAttribute("srcset")).toContain(`/bijbelreis/fotos/${F[id].f}.webp 960w`);
    expect(img.getAttribute("alt")).toBe(F[id].alt);
    expect(Number(img.getAttribute("width"))).toBe(960);
    const links = [...dom.window.document.querySelectorAll("a")].map((a) => a.getAttribute("href"));
    expect(links).toEqual([F[id].licentieUrl, F[id].bron]);
    expect(dom.window.document.body.textContent).toContain(`Foto: ${F[id].maker}`);
  });
  it("alles wordt zelf gehost: geen adres van buiten in fotos.js behalve de bron- en licentielinks", () => {
    const js = readFileSync(join(PUB, "bijbelreis", "fotos.js"), "utf8");
    expect(js).not.toMatch(/upload\.wikimedia\.org|thumb\.wikimedia\.org/);
  });
  it("de atlas en het boekje laden fotos.js vóór app.js en het boekje", () => {
    const boekje = readFileSync(join(PUB, "bijbelreis", "boekje.html"), "utf8");
    expect(html.indexOf("/bijbelreis/fotos.js")).toBeGreaterThan(0);
    expect(html.indexOf("/bijbelreis/fotos.js")).toBeLessThan(html.indexOf("/bijbelreis/app.js"));
    expect(boekje.indexOf("/bijbelreis/fotos.js")).toBeGreaterThan(0);
  });
});
