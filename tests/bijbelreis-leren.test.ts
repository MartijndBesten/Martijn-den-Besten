// Speurtocht en personen (17-11-2026, docs/bijbelreis-audit/telefoon.md §4.11): vragen die buiten hun verhaal te weinig
// zeiden, zijn herschreven en tegen de Statenvertaling gecontroleerd; geen persoon staat twee keer in één familie.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

type Vraag = { q: string; a?: string[] };
type Mens = { n: string; v?: string; m?: string; p?: string[]; ook?: Record<string, string[]> };
type BR = {
  boeken: { id: string; delen: { quiz?: { tap?: Vraag[]; mc?: Vraag[]; ord?: Vraag[] } }[] }[];
  mensen: Record<string, Mens>;
  niveaus: { verhalen: Record<string, Record<string, { vragen?: Vraag[] }>> };
};

const ROOT = join(__dirname, "..");
const PUB = join(ROOT, "public");
const html = readFileSync(join(PUB, "bijbelreis.html"), "utf8");
const scripts = [...html.matchAll(/<script src="\/bijbelreis\/([^"?]+)"/g)].map((m) => m[1]).filter((s) => !/leaflet|app\.js/.test(s)).concat(["niveaus/a.js", "niveaus/b.js", "niveaus/c.js"]);
const ctx: { window: { BR?: BR } } = { window: {} };
for (const s of scripts) runInNewContext(readFileSync(join(PUB, "bijbelreis", s), "utf8").replace(/\bBR\./g, "window.BR."), ctx);
const BR = ctx.window.BR as BR;

const alleVragen = (): string[] => [
  ...BR.boeken.flatMap((b) => b.delen.flatMap((d) => [...(d.quiz?.tap || []), ...(d.quiz?.mc || []), ...(d.quiz?.ord || [])].map((x) => x.q))),
  ...Object.values(BR.niveaus.verhalen).flatMap((lv) => Object.values(lv || {}).flatMap((v) => (v?.vragen || []).map((x) => x.q))),
];

describe("bijbelreis: vragen met context", () => {
  const NIEUW = [
    "Tik op Berseba, waar Abraham en Abimelech een verbond sloten over een waterput.",
    "Jakob praat bij een put met herders. Wie komt er met de schapen?",
    "Jakob praat bij een put in het veld met herders. Waar komen die herders vandaan?",
    "Waar bidt de knecht van Abraham?",
    "Een vrouw die twaalf jaar ziek was, kwam van achteren bij de Heere Jezus. Wat raakte zij aan?",
    "Waaraan had de vrouw die twaalf jaar ziek was, al haar geld uitgegeven?",
    "Paulus leed als gevangene schipbreuk op weg naar Italië. Hoeveel mensen waren er in het schip?",
    "Waar stond de engel die Zacharias in de tempel zag?",
    "Hoe groot was het wolkje dat de knecht van Elia uit de zee zag opkomen?",
  ];
  const OUD = ["Tik op Berseba, de plaats van de put.", "Wie komt er met de schapen bij de put?", "Waar komen de herders bij de put vandaan?", "Waar bidt de knecht?", "Wat raakte de vrouw aan?", "Waaraan had de vrouw al haar geld uitgegeven?", "Hoeveel mensen waren er in het schip?", "Waar stond de engel?", "Hoe groot was het wolkje dat uit de zee opkwam?"];
  const vragen = alleVragen();
  it("de herschreven vragen staan erin, de oude niet meer", () => {
    for (const q of NIEUW) expect(vragen, q).toContain(q);
    for (const q of OUD) expect(vragen, q).not.toContain(q);
  });
  it("een vraag over een put zegt wiens put of waar (een naam)", () => {
    const kaal = vragen.filter((q) => /\bput\b/i.test(q) && !/\b(?!Tik\b|Wie\b|Wat\b|Waar\b|Tussen\b)[A-Z][a-zë]+/.test(q));
    expect(kaal).toEqual([]);
  });
  it("de feiten achter de herschreven vragen staan zo in de Statenvertaling (scripts/bijbel-controle/vragen-context.txt)", () => {
    const BOEK: Record<string, string> = { Genesis: "genesis", Lukas: "lukas", Handelingen: "handelingen", "1 Koningen": "1koningen" };
    const regels = readFileSync(join(ROOT, "scripts", "bijbel-controle", "vragen-context.txt"), "utf8").split("\n").filter((r) => r.trim() && !r.startsWith("#"));
    expect(regels.length).toBeGreaterThanOrEqual(14);
    for (const r of regels) {
      const [ref, re] = r.split(" | ");
      const m = ref.match(/^(.+) (\d+):(\d+)(?:-(\d+))?$/)!;
      expect(BOEK[m[1]], ref).toBeTruthy();
      const H = JSON.parse(readFileSync(join(ROOT, "data", "statenvertaling", BOEK[m[1]] + ".json"), "utf8")).hoofdstukken[m[2]] as string[];
      const tekst = H.slice(+m[3] - 1, +(m[4] || m[3])).join(" ");
      expect(tekst, r).toMatch(new RegExp(re, "i"));
    }
  });
});

describe("bijbelreis: familiebanden", () => {
  const M = BR.mensen, ids = Object.keys(M);
  it("niemand staat twee keer in de familie van een persoon (zoals de app ze toont)", () => {
    const dubbel: string[] = [];
    for (const id of ids) {
      const m = M[id];
      const partners = new Set((m.p || []).concat(ids.filter((k) => (M[k].p || []).includes(id))));
      const kids = ids.filter((k) => M[k].v === id || M[k].m === id);
      const sibs = m.v || m.m ? ids.filter((k) => k !== id && !partners.has(k) && ((m.v && M[k].v === m.v) || (m.m && M[k].m === m.m))) : [];
      const alle = [m.v, m.m, ...partners, ...kids, ...sibs].filter(Boolean) as string[];
      alle.forEach((k, i) => { if (alle.indexOf(k) !== i) dubbel.push(`${id}: ${k}`); });
      // Een partner die ook broer of zus is, heeft een uitleg met verwijzing.
      const beide = ids.filter((k) => partners.has(k) && k !== id && ((m.v && M[k].v === m.v) || (m.m && M[k].m === m.m)));
      for (const k of beide) expect(m.ook?.[k]?.[1], `${id} ↔ ${k}`).toMatch(/^[1-3]?\s?[A-Z][a-zë]+ \d+:\d+/);
    }
    expect(dubbel).toEqual([]);
    expect(M.abraham.ook?.sara?.[0]).toBe("ook zijn halfzuster");
    expect(M.sara.ook?.abraham?.[0]).toBe("ook haar halfbroer");
  });
  it("het controlescript voor personen vindt geen fouten", () => {
    const uit = execFileSync(process.execPath, [join(ROOT, "scripts", "bijbelreis-personen-check.mjs")], { encoding: "utf8" });
    expect(uit).toContain("Geen fouten.");
  });
});
