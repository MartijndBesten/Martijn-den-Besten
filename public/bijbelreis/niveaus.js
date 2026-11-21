// Reisniveaus: één geschiedenis, drie versies. De namen zeggen hoe je leest, niet hoe oud je bent (besluit 21-11-2026,
// docs/BIJBELREIS.md § Niveaunamen): de Bijbelreis is voor jong en oud.
//
//   a  Voorlezen:  korte verhaalstappen, één gedachte per scherm, om samen te lezen.
//   b  Zelf lezen: een zelfstandig leesbare vertelling in een paar onderdelen.
//   c  Verdiepen:  de bestaande vertelling (geschiedenissen/*.js) met verdieping.
//
// De teksten staan per niveau in niveaus/a.js, niveaus/b.js en niveaus/c.js. De pagina laadt alleen het niveau dat
// gekozen is; bij wisselen komt het andere bestand erbij. De basis blijft de bestaande geschiedenis (uitleg, quiz,
// cross, tijdNoot, stappen): een versie voegt toe en vervangt niets.
//
// status: "concept"       = nieuw geschreven, nog niet inhoudelijk gecontroleerd (zichtbaar gemarkeerd);
//         "gecontroleerd" = vormregels automatisch gecontroleerd en inhoudelijk nagelezen tegen de Statenvertaling
//                           (zie docs/bijbelreis-niveaus/README.md voor wie en hoe);
//         "goedgekeurd"   = daarna goedgekeurd door de redactie (Martijn).
// Citaten tussen ‘ ’ zijn letterlijk Statenvertaling; een unittest controleert dat tegen bijbel/*.json.
// Vragen: het eerste antwoord is het goede. Niveau a heeft precies twee antwoorden, b en c drie.
window.BR = window.BR || { boeken: [], plaatsen: {}, W: {}, personen: {} };
BR.niveaus = {
  soorten: {
    a: { n: "Voorlezen", uitleg: "Korte stukjes om samen te lezen, met eenvoudige vragen." },
    b: { n: "Zelf lezen", uitleg: "Verhalen om zelf te lezen, met de kaart en afwisselende vragen." },
    c: { n: "Verdiepen", uitleg: "De volledige vertelling met achtergrond, verbanden en verwijzingen." },
  },
  verhalen: {},
  geladen: {},
  // Aangeroepen door niveaus/<n>.js.
  voegToe(n, verhalen) {
    for (const [nr, v] of Object.entries(verhalen)) (this.verhalen[nr] = this.verhalen[nr] || {})[n] = v;
    this.geladen[n] = true;
  },
  // Met welk niveau de pagina opent. Dat is het gekozen niveau. Wie al onderweg was zonder te kiezen, krijgt
  // Verdiepen: zo bleef de reis voor hen hetzelfde. Een nieuwe bezoeker krijgt voorlopig Zelf lezen.
  // app.js gebruikt deze regel ook.
  beginNiveau() {
    const lees = (k, d) => { try { const v = localStorage.getItem("bijbelreis:" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
    const n = lees("niveau", null);
    if (n === "a" || n === "b" || n === "c") return n;
    return this.eerderOnderweg(lees) ? "c" : "b";
  },
  eerderOnderweg(lees) {
    return (lees("gezien", []) || []).length > 0 || Object.keys(lees("verhalen", {}) || {}).length > 0 || lees("laatst", null) != null;
  },
  _bezig: {},
  laad(n) {
    if (this.geladen[n]) return Promise.resolve();
    if (this._bezig[n]) return this._bezig[n];
    return (this._bezig[n] = new Promise((klaar, fout) => {
      const s = document.createElement("script");
      // Met de inhoudshash uit de meta-tag (scripts/bijbelreis-pwa.mjs), zodat de tekst altijd bij deze versie hoort.
      // In een andere taal staan de teksten in taal/<code>/niveaus/ (taal/taal.js); in het Nederlands in niveaus/.
      const pad = ((window.BR.taal && window.BR.taal.niveaus) || "niveaus/") + n + ".js";
      let v = "";
      try { v = JSON.parse(document.querySelector('meta[name="bijbelreis-data"]').content)[pad] || ""; } catch (e) { v = ""; }
      s.src = "/bijbelreis/" + pad + (v ? "?v=" + v : "");
      s.onload = () => (this.geladen[n] ? klaar() : fout(new Error("niveau " + n + " niet geladen")));
      // Mislukt het (geen verbinding), dan probeert de volgende aanroep het opnieuw.
      s.onerror = () => { delete this._bezig[n]; s.remove(); fout(new Error("niveau " + n + " niet bereikbaar")); };
      document.head.appendChild(s);
    }));
  },
};
// Het beginniveau meteen ophalen, tegelijk met de rest van de pagina.
if (typeof document !== "undefined" && document.head) BR.niveaus.laad(BR.niveaus.beginNiveau()).catch(() => {});
