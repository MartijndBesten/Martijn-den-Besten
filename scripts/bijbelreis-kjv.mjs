// De King James Version (KJV) als controletekst voor de Engelse Bijbelreis, zoals data/statenvertaling/ dat is voor het
// Nederlands. De tekst staat alleen in data/kjv/ (scripts/bijbelreis-kjv.py); hij zit niet in de app.
// Gebruik als module (tests/bijbelreis-talen.test.ts) of los:
//   node scripts/bijbelreis-kjv.mjs "Exodus 14:13–14" ["Jonah 1:17" …]     toont de verzen
//   node scripts/bijbelreis-kjv.mjs --controle                                controleert alle Engelse verwijzingen en citaten
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(ROOT, "data", "kjv");

// Engelse boeknaam (zonder spaties, kleine letters) → bestand in data/kjv/. ‘Psalm’ en ‘Psalms’ zijn hetzelfde boek.
const BOEK = { psalm: "psalms", song: "songofsolomon", songofsongs: "songofsolomon", revelations: "revelation" };
const norm = (b) => b.toLowerCase().replace(/\s/g, "");
const boeken = {};
function boek(naam) {
  const slug = BOEK[norm(naam)] || norm(naam);
  if (!(slug in boeken)) boeken[slug] = existsSync(join(DIR, slug + ".json")) ? JSON.parse(readFileSync(join(DIR, slug + ".json"), "utf8")).hoofdstukken : null;
  return boeken[slug];
}

/** ‘Exodus 14:1–15:21’ · ‘Genesis 1:4, 10, 12’ · ‘Mark 10:13–31’ · ‘Psalm 77:19–20’ · ‘Daniel 6’ → [{ boek, c1, v1, c2, v2 }] of null. */
export function leesRef(ref) {
  const uit = [];
  let naam = null;
  for (const seg of String(ref).split(";").map((x) => x.trim()).filter(Boolean)) {
    let spec = seg;
    const m = /^(\d?\s?[A-Za-z][A-Za-z ]*?)\s+(\d.*)$/.exec(seg);
    if (m) { naam = m[1]; spec = m[2]; }
    if (!naam || !boek(naam)) return null;
    let laatst = null;
    for (const [i, item] of spec.split(",").map((x) => x.trim()).filter(Boolean).entries()) {
      let r;
      if ((r = /^(\d+):(\d+)[–-](\d+):(\d+)$/.exec(item))) uit.push({ boek: naam, c1: +r[1], v1: +r[2], c2: +r[3], v2: +r[4] });
      else if ((r = /^(\d+):(\d+)[–-](\d+)$/.exec(item))) uit.push({ boek: naam, c1: +r[1], v1: +r[2], c2: +r[1], v2: +r[3] });
      else if ((r = /^(\d+):(\d+)$/.exec(item))) uit.push({ boek: naam, c1: +r[1], v1: +r[2], c2: +r[1], v2: +r[2] });
      else if ((r = /^(\d+)[–-](\d+):(\d+)$/.exec(item))) uit.push({ boek: naam, c1: +r[1], v1: 1, c2: +r[2], v2: +r[3] });
      else if (i > 0 && laatst !== null && (r = /^(\d+)(?:[–-](\d+))?$/.exec(item))) uit.push({ boek: naam, c1: laatst, v1: +r[1], c2: laatst, v2: +(r[2] || r[1]) });
      else if ((r = /^(\d+)[–-](\d+)$/.exec(item))) uit.push({ boek: naam, c1: +r[1], v1: 1, c2: +r[2], v2: 999 });
      else if ((r = /^(\d+)$/.exec(item))) uit.push({ boek: naam, c1: +r[1], v1: 1, c2: +r[1], v2: 999 });
      else return null;
      laatst = uit[uit.length - 1].c2;
    }
  }
  return uit.length ? uit : null;
}

/** Bestaat elke verwijzing (hoofdstuk en vers) in de KJV? Geeft een foutmelding of null. */
export function refFout(ref) {
  const q = leesRef(ref);
  if (!q) return `onleesbare verwijzing of onbekend boek: ${ref}`;
  for (const r of q) {
    const H = boek(r.boek);
    for (const [c, v] of [[r.c1, r.v1], [r.c2, r.v2]]) {
      if (!H[c]) return `${ref}: hoofdstuk ${c} bestaat niet in de KJV`;
      if (v !== 999 && (v < 1 || v > H[c].length)) return `${ref}: ${r.boek} ${c} heeft ${H[c].length} verzen in de KJV`;
    }
  }
  return null;
}

/** De tekst van een verwijzing (verzen achter elkaar). */
export function kjvTekst(ref) {
  const q = leesRef(ref);
  if (!q) return "";
  const uit = [];
  for (const r of q) {
    const H = boek(r.boek), n = Object.keys(H).length;
    for (let c = r.c1; c <= Math.min(r.c2, n); c++) {
      const vs = H[c] || [], a = c === r.c1 ? r.v1 : 1, b = c === r.c2 && r.v2 !== 999 ? r.v2 : vs.length;
      for (let v = a; v <= b; v++) if (vs[v - 1]) uit.push(vs[v - 1]);
    }
  }
  return uit.join(" ");
}

// ---------- citaten ----------
// Een citaat staat tussen ‘ en ’. Een ’ midden in een woord (Pharaoh’s) is een apostrof en sluit het citaat niet af.
const CITAAT = /‘((?:[^‘’]|’(?=\p{L}))+)’(?!\p{L})/gu;
export const citaten = (tekst) => [...String(tekst || "").matchAll(CITAAT)].map((m) => m[1]);
// Verwijzingen in een tekst: ‘Exodus 14:2’, ‘1 Kings 9:26’, ook ‘(14:14)’ (dan in het boek van de eigen verwijzing).
const BOEKNAAM = "(?:[1-3] )?(?:Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|Samuel|Kings|Chronicles|Ezra|Nehemiah|Esther|Job|Psalms?|Proverbs|Ecclesiastes|Song of Solomon|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|Corinthians|Galatians|Ephesians|Philippians|Colossians|Thessalonians|Timothy|Titus|Philemon|Hebrews|James|Peter|Jude|Revelation)";
const INLINE = new RegExp(`(${BOEKNAAM}) (\\d+(?::\\d+(?:[–-]\\d+(?::\\d+)?)?)?(?:, \\d+(?:[–-]\\d+)?)*)`, "g");
export function refsIn(tekst, eigenBoek) {
  const uit = [...String(tekst || "").matchAll(INLINE)].map((m) => `${m[1]} ${m[2]}`);
  if (eigenBoek) for (const m of String(tekst || "").matchAll(/\((\d+:\d+(?:[–-]\d+)?)\)/g)) uit.push(`${eigenBoek} ${m[1]}`);
  return uit.filter((r) => leesRef(r));
}
const glad = (s) => s.replace(/\s+/g, " ").trim();
/** Staat het citaat letterlijk in de tekst van een van de verwijzingen? (Hoofdletter aan het begin en leestekens aan het eind tellen niet mee; ‘…’ is een weglating.) */
export function citaatKlopt(citaat, refs) {
  const delen = glad(citaat).replace(/[.,;:!?]+$/, "").split(/\s*…\s*/).filter(Boolean);
  for (const ref of refs) {
    const t = glad(kjvTekst(ref));
    let vanaf = 0, ok = true;
    for (const [i, d] of delen.entries()) {
      const a = t.indexOf(d, vanaf), b = i === 0 ? t.indexOf(d[0] === d[0].toUpperCase() ? d[0].toLowerCase() + d.slice(1) : d[0].toUpperCase() + d.slice(1), vanaf) : -1;
      const j = a >= 0 && (b < 0 || a <= b) ? a : b;
      if (j < 0) { ok = false; break; }
      vanaf = j + d.length;
    }
    if (ok) return true;
  }
  return false;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  for (const ref of process.argv.slice(2)) console.log(`### ${ref}\n${kjvTekst(ref) || "(niet gevonden)"}\n`);
}
