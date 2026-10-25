// Leest Bijbelverwijzingen zoals ze in de inhoud staan en zet ze om naar hoofdstuk/vers-bereiken per boek.
// Gebruikt door app.js (de knop ‘Lees het zelf in de Bijbel’) en door tests/bijbelreis.test.ts.
// Voorbeelden: "Genesis 12:1–9" · "Genesis 37:28–36; 39:1" · "2 Koningen 17:1–6, 18–24" · "Jozua 23–24:28"
//              "Psalm 57:1 en 142:1" · "2 Koningen 23:29–30; 2 Kronieken 35:20–25" · "Numeri 22 – Deuteronomium 34"
window.BR = window.BR || { boeken: [], plaatsen: {}, W: {}, personen: {} };
BR.SLUGS = {
  genesis: "genesis", exodus: "exodus", leviticus: "leviticus", numeri: "numeri", deuteronomium: "deuteronomium", jozua: "jozua", richteren: "richteren", ruth: "ruth",
  "1samuel": "1samuel", "2samuel": "2samuel", "1koningen": "1koningen", "2koningen": "2koningen", "1kronieken": "1kronieken", "2kronieken": "2kronieken",
  ezra: "ezra", nehemia: "nehemia", esther: "esther", job: "job", psalm: "psalmen", psalmen: "psalmen", spreuken: "spreuken",
  jesaja: "jesaja", jeremia: "jeremia", ezechiel: "ezechiel", daniel: "daniel", hosea: "hosea", amos: "amos", jona: "jona", micha: "micha", nahum: "nahum", haggai: "haggai", maleachi: "maleachi",
  mattheus: "mattheus", markus: "markus", marcus: "markus", lukas: "lukas", lucas: "lukas", johannes: "johannes", handelingen: "handelingen", romeinen: "romeinen",
  "1korinthe": "1korinthe", "1korintiers": "1korinthe", galaten: "galaten", hebreeen: "hebreeen", jakobus: "jakobus", "1petrus": "1petrus", "2petrus": "2petrus", openbaring: "openbaring",
};
BR.parseRef = function parseRef(ref) {
  const norm = (b) => b.toLowerCase().replace(/\s/g, "").replace(/[ëéèïüö]/g, (c) => ({ ë: "e", é: "e", è: "e", ï: "i", ü: "u", ö: "o" })[c]);
  const BOOK = /^(\d?\s?[A-Za-zëéèïüöË]+)\s+(\d.*)$/;
  const ranges = [];
  let slug = null;
  // Bereik over twee boeken: "Numeri 22 – Deuteronomium 34" (spaties rond het streepje, boeknaam erachter).
  const cross = String(ref).match(/^(.+?\d)\s+[–-]\s+(\d?\s?[A-Za-zëéèïüöË]+\s+\d.*)$/);
  if (cross) {
    const a = parseRef(cross[1]), b = parseRef(cross[2]);
    if (!a || !b) return null;
    const last = a.ranges[a.ranges.length - 1], first = b.ranges[0];
    last.c2 = 999; last.v2 = 999; first.c1 = 1; first.v1 = 1;
    return { ranges: a.ranges.concat(b.ranges), slug: a.slug };
  }
  for (const seg of String(ref).split(/;|\sen\s/).map((x) => x.trim()).filter(Boolean)) {
    let spec = seg;
    const m = seg.match(BOOK);
    if (m && /[a-z]/i.test(m[1])) { slug = BR.SLUGS[norm(m[1])]; if (!slug) return null; spec = m[2]; }
    if (!slug) return null;
    let lastCh = null;
    for (const [n, item] of spec.split(",").map((x) => x.trim()).filter(Boolean).entries()) {
      let r;
      if ((r = item.match(/^(\d+):(\d+)[–-](\d+):(\d+)$/))) ranges.push({ slug, c1: +r[1], v1: +r[2], c2: +r[3], v2: +r[4] });
      else if ((r = item.match(/^(\d+):(\d+)[–-](\d+)$/))) ranges.push({ slug, c1: +r[1], v1: +r[2], c2: +r[1], v2: +r[3] });
      else if ((r = item.match(/^(\d+):(\d+)$/))) ranges.push({ slug, c1: +r[1], v1: +r[2], c2: +r[1], v2: +r[2] });
      else if ((r = item.match(/^(\d+)[–-](\d+):(\d+)$/))) ranges.push({ slug, c1: +r[1], v1: 1, c2: +r[2], v2: +r[3] });
      else if (n > 0 && lastCh !== null && (r = item.match(/^(\d+)(?:[–-](\d+))?$/))) ranges.push({ slug, c1: lastCh, v1: +r[1], c2: lastCh, v2: +(r[2] || r[1]) });
      else if ((r = item.match(/^(\d+)[–-](\d+)$/))) ranges.push({ slug, c1: +r[1], v1: 1, c2: +r[2], v2: 999 });
      else if ((r = item.match(/^(\d+)$/))) ranges.push({ slug, c1: +r[1], v1: 1, c2: +r[1], v2: 999 });
      else return null;
      lastCh = ranges[ranges.length - 1].c2;
    }
  }
  return ranges.length ? { ranges, slug: ranges[0].slug } : null;
};
