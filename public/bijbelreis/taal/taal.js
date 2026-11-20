// Talen van de Bijbelreis: de kleine helper t() en, op een pagina in een andere taal dan het Nederlands, de vertaling van
// de vaste bediening. Uitleg: docs/bijbelreis-talen/README.md.
//
// - De sleutel van een bedieningstekst is de Nederlandse tekst zelf (zoals bij gettext). Zo blijft app.js leesbaar, staat
//   de Nederlandse site byte voor byte zoals hij was, en kunnen andere wijzigingen aan app.js gewoon doorgaan.
// - Het woordenboek per taal staat in taal/<code>.js (BR.taalBoek[code]): vaste teksten (woorden) en teksten met een getal
//   of naam erin (patronen). De pagina in die taal (bijv. /en/) wordt bij de build al vertaald (scripts/bijbelreis-talen.mjs);
//   wat app.js en de andere scripts daarna tekenen, vertaalt deze helper meteen, nog vóór de browser het laat zien
//   (MutationObserver: tekst, aria-label, title, placeholder, alt).
// - De inhoud (geschiedenissen, stappen, personen, plaatsen) heeft taalonafhankelijke sleutels en een eigen laag per taal:
//   taal/<code>/inhoud.js, toegepast door taal/laag.js. Wat niet vertaald is, toont de pagina niet.
// - Op de Nederlandse pagina wordt dit bestand niet geladen; BR.taal bestaat daar niet en app.js valt terug op ‘nl’.
window.BR = window.BR || { boeken: [], plaatsen: {}, W: {}, personen: {} };
(function () {
  "use strict";
  var doc = typeof document !== "undefined" ? document : null;
  var code = (doc && doc.documentElement.lang) || "nl";
  var boek = (BR.taalBoek && BR.taalBoek[code]) || { woorden: {}, patronen: [] };
  var W = boek.woorden || {}, P = boek.patronen || [], BINNEN = boek.binnen || [];
  // De atlas van deze taal: op bijbelreis.nl ‘/’ (nl) of ‘/en/’; lokaal en in de tests ‘/bijbelreis’ of ‘/bijbelreis/en/’.
  var lokaal = !!(doc && /^\/bijbelreis(\/|\.html|$)/.test(location.pathname));
  var pad = function (c) { return c === "nl" ? (lokaal ? "/bijbelreis" : "/") : (lokaal ? "/bijbelreis/" : "/") + c + "/"; };

  // Vertaal één tekst: eerst de vaste woorden, dan de patronen; een tekst met ‘ · ’ (zoals ‘berg · waarschijnlijk · 3 keer
  // in de reis’) stuk voor stuk. Witruimte eromheen blijft staan. Onbekend: ongewijzigd. ‘eigen’: woorden die alleen
  // binnen een bepaald element gelden (BR.taalBoek[code].binnen), bijvoorbeeld ‘Deel’ als knop om te delen.
  function een(k, eigen) {
    if (eigen && Object.prototype.hasOwnProperty.call(eigen, k)) return eigen[k];
    if (Object.prototype.hasOwnProperty.call(W, k)) return W[k];
    for (var i = 0; i < P.length; i++) { if (P[i][0].test(k)) return k.replace(P[i][0], P[i][1]); }
    return null;
  }
  function vertaal(s, eigen) {
    if (code === "nl" || s == null) return s;
    var tekst = String(s), k = tekst.trim();
    if (!k) return tekst;
    var u = een(k, eigen);
    if (u == null && k.indexOf(" · ") > 0) {
      var stukken = k.split(" · "), ander = false;
      stukken = stukken.map(function (x) { var v = een(x, eigen); if (v != null) { ander = true; return v; } return x; });
      if (ander) u = stukken.join(" · ");
    }
    return u == null ? tekst : tekst.replace(k, function () { return u; });
  }
  BR.taalVertaal = vertaal;
  // t("Verder ▶") of t("Stap {n} van {m}", { n: 2, m: 7 }): de vertaalde tekst met de waarden ingevuld.
  function t(sleutel, waarden) {
    var u = vertaal(sleutel);
    if (waarden) u = String(u).replace(/\{(\w+)\}/g, function (m, k) { return k in waarden ? String(waarden[k]) : m; });
    return u;
  }
  BR.taal = {
    code: code,
    locale: boek.locale || "nl-NL",
    // Het adres van de atlas in een taal, en het vaste adres om te delen.
    pad: pad,
    site: "https://bijbelreis.nl" + (code === "nl" ? "/" : "/" + code + "/"),
    t: t,
    // Groepen in ‘wie’ (Volk, Leger …) heten in een andere taal anders; app.js voegt deze namen toe aan zijn lijst.
    groepen: boek.groepen || [],
    // Waar de teksten per reisniveau staan (niveaus.js): taal/<code>/niveaus/a.js.
    niveaus: code === "nl" ? "niveaus/" : "taal/" + code + "/niveaus/",
    // Het eerste deel van de reis bij ‘Begin de reis’ (app.js valt terug op Abraham of het eerste deel).
    startDeel: boek.startDeel || null,
  };
  if (!doc) return;
  // ---------- de taalkeuze: naar dezelfde plek in de andere taal ----------
  // De voortgang (localStorage bijbelreis:*) is voor alle talen dezelfde. De link neemt het adres binnen de atlas mee
  // (#v26, #uittocht/5): die adressen zijn in elke taal gelijk.
  function taalLinks() {
    var links = doc.querySelectorAll("a[data-taal]");
    for (var i = 0; i < links.length; i++) links[i].setAttribute("href", pad(links[i].getAttribute("data-taal")) + (/^#[\w\/=&-]{1,80}$/.test(location.hash) ? location.hash : ""));
  }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", taalLinks); else taalLinks();
  window.addEventListener("hashchange", taalLinks);
  doc.addEventListener("click", function (e) { if (e.target && e.target.closest && e.target.closest("a[data-taal]")) taalLinks(); }, true);
  if (code === "nl") return;


  // ---------- de bediening vertalen ----------
  var ATTR = ["aria-label", "title", "placeholder", "alt", "data-tip", "label", "data-av-tekst"];
  function eigenVan(el) {
    for (var i = 0; el && el.closest && i < BINNEN.length; i++) if (el.closest(BINNEN[i][0])) return BINNEN[i][1];
    return null;
  }
  function element(el) {
    for (var i = 0; i < ATTR.length; i++) {
      var a = ATTR[i], v = el.getAttribute(a);
      if (v != null) { var u = vertaal(v, eigenVan(el)); if (u !== v) el.setAttribute(a, u); }
    }
  }
  function tekstNode(n) {
    var v = n.nodeValue, u = vertaal(v, eigenVan(n.parentElement));
    if (u !== v) n.nodeValue = u;
  }
  function boom(root) {
    if (root.nodeType === 3) { tekstNode(root); return; }
    if (root.nodeType !== 1) return;
    if (root.tagName === "SCRIPT" || root.tagName === "STYLE") return;
    element(root);
    var w = doc.createTreeWalker(root, 5 /* element + tekst */), n;
    while ((n = w.nextNode())) {
      if (n.nodeType === 3) { var p = n.parentNode; if (p && p.tagName !== "SCRIPT" && p.tagName !== "STYLE" && p.tagName !== "TEXTAREA") tekstNode(n); }
      else element(n);
    }
  }
  var waarnemer = new MutationObserver(function (lijst) {
    for (var i = 0; i < lijst.length; i++) {
      var m = lijst[i];
      if (m.type === "childList") for (var j = 0; j < m.addedNodes.length; j++) boom(m.addedNodes[j]);
      else if (m.type === "characterData") tekstNode(m.target);
      else if (m.type === "attributes") element(m.target);
    }
  });
  function start() {
    boom(doc.body);
    waarnemer.observe(doc.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTR });
  }
  if (doc.body) start(); else doc.addEventListener("DOMContentLoaded", start);
  // Voor de tests: alles wat nu op de pagina staat nog eens langs (bijvoorbeeld na het laden van een venster).
  BR.taal.vertaalPagina = function () { if (doc.body) boom(doc.body); };

})();
