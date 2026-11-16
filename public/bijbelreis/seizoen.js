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
  const api = { eersteAdvent, kerstTijd };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  (global.BR = global.BR || { boeken: [], plaatsen: {}, W: {}, personen: {} }).seizoen = api;
})(typeof window !== "undefined" ? window : globalThis);
