// Seizoenen van de Bijbelreis: wanneer staat een thema extra in beeld? Nu alleen Kerst.
// Besluit (docs/bijbelreis-kerst/README.md): extra zichtbaar van de eerste adventszondag tot en met 6 januari; daarna
// niet weg, maar op de achtergrond (onder ‘Thema’s’ en via de diepe links). De datum is die van het apparaat van de
// bezoeker, in zijn eigen tijdzone. Dit bestand rekent alleen: geen opslag, geen netwerk, geen DOM, zodat een test
// het los kan laden.
(function (global) {
  "use strict";
  // De eerste adventszondag: de vierde zondag vóór 25 december. Valt 25 december zelf op een zondag, dan is de zondag
  // ervoor (18 december) de vierde advent. De uitkomst ligt altijd op 27 november tot en met 3 december.
  function eersteAdvent(jaar) {
    const weekdag = new Date(jaar, 11, 25).getDay(); // 0 = zondag
    return new Date(jaar, 11, 25 - (weekdag === 0 ? 7 : weekdag) - 21);
  }
  // Waar van de eerste adventszondag (vanaf middernacht) tot en met 6 januari (de hele dag).
  function kerstTijd(datum) {
    const d = datum instanceof Date ? datum : datum == null ? new Date() : new Date(datum);
    if (isNaN(d.getTime())) return false;
    if (d.getMonth() === 0) return d.getDate() <= 6;
    return d.getTime() >= eersteAdvent(d.getFullYear()).getTime();
  }
  // ---------- het weekritme van de kerstreis ----------
  // De kerstreis heeft zes delen; in het seizoen wijst de atlas elke week één deel aan (docs/bijbelreis-kerst/README.md).
  // Er zit niets op slot: het is een aanwijzing. De begindagen in een seizoen dat in `jaar` begint:
  //   deel 1–4: de vier adventszondagen; deel 4 (de geboorte) loopt door tot en met tweede kerstdag;
  //   deel 6:   de laatste zondag op of vóór 4 januari, zodat het elk jaar minstens drie dagen aan de beurt is;
  //   deel 5:   de zondag daarvoor, maar nooit vóór 27 december.
  // In 2026: 29 november, 6, 13 en 20 december, 27 december, 3 januari.
  const dagStart = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  function kerstBegindagen(jaar) {
    const a = eersteAdvent(jaar), plus = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
    const vier = new Date(jaar + 1, 0, 4), zes = plus(vier, -vier.getDay());
    const vijfZondag = plus(zes, -7), kerst3 = new Date(jaar, 11, 27), vijf = vijfZondag.getTime() < kerst3.getTime() ? kerst3 : vijfZondag;
    return [a, plus(a, 7), plus(a, 14), plus(a, 21), vijf, zes];
  }
  const leesDatum = (datum) => { const d = datum instanceof Date ? datum : datum == null ? new Date() : new Date(datum); return isNaN(d.getTime()) ? null : d; };
  const seizoenJaar = (d) => (d.getMonth() === 0 ? d.getFullYear() - 1 : d.getFullYear());
  // Welk deel is deze week aan de beurt? 0 tot en met 5, of -1 buiten het seizoen.
  function kerstWeek(datum) {
    const d = leesDatum(datum);
    if (!d || !kerstTijd(d)) return -1;
    const t = dagStart(d).getTime(), dagen = kerstBegindagen(seizoenJaar(d));
    let w = 0;
    dagen.forEach((b, i) => { if (b.getTime() <= t) w = i; });
    return w;
  }
  // De dag waarop het volgende deel aan de beurt komt, of null (laatste week, of buiten het seizoen).
  function kerstVolgende(datum) {
    const d = leesDatum(datum), w = kerstWeek(d);
    return w < 0 || w >= 5 ? null : kerstBegindagen(seizoenJaar(d))[w + 1];
  }
  const api = { eersteAdvent, kerstTijd, kerstBegindagen, kerstWeek, kerstVolgende };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  (global.BR = global.BR || { boeken: [], plaatsen: {}, W: {}, personen: {} }).seizoen = api;
})(typeof window !== "undefined" ? window : globalThis);
